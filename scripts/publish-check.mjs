#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { inspectReadmeVisuals } from "./readme-visuals.mjs";
import { inspectReadme, manualReadmeReview } from "./readme-check.mjs";

const args = process.argv.slice(2);
const jsonOnly = args.includes("--json");
const allowLegacyReadme = args.includes("--allow-legacy-readme") || args.includes("--pass-through-readme");
const allowReadmeUnchanged = args.includes("--readme-no-impact") || args.includes("--allow-readme-unchanged");
const reportPathArg = args.find((arg) => arg.startsWith("--report="))?.split("=")[1] ?? "publish-check-report.json";
const root = process.cwd();
const reportPath = path.resolve(root, reportPathArg);
const results = [];
const readmeVisuals = {};
const readmeChecks = {};
const readmeAudience = args.find(arg => arg.startsWith("--readme-audience="))?.split("=")[1] ?? "agent";
if (!["agent", "developer"].includes(readmeAudience)) {
  results.push({ level: "FAIL", title: "Invalid README audience", detail: "Use --readme-audience=agent or --readme-audience=developer." });
}

const visibility = args.find((arg) => arg.startsWith("--visibility="))?.slice(13);
const digest = (value) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const commonDir = git(["rev-parse", "--git-common-dir"]);
const approvalFile = commonDir ? path.resolve(root, commonDir, "publisher-review-decisions.json") : null;
const reviewScope = digest([fs.realpathSync(root), git(["remote", "get-url", "origin"]), visibility ?? "unknown"]);
let approvals = [];
try {
  if (approvalFile && fs.existsSync(approvalFile)) {
    const record = JSON.parse(fs.readFileSync(approvalFile, "utf8"));
    if (record.schemaVersion === 1 && record.scope === reviewScope && Array.isArray(record.decisions)) approvals = record.decisions;
  }
} catch {
  results.push({ level: "WARNING", title: "Invalid review decision record", detail: "Approval reuse disabled; repair the local record before relying on it." });
}

function add(level, title, detail, evidence) {
  if (level === "WARNING" && evidence && /review needs user decision/.test(title)) {
    const reviewId = digest([title, evidence]);
    const approved = ["private", "public"].includes(visibility) && approvals.some((entry) =>
      entry.reviewId === reviewId && entry.decision === "keep" && !entry.revoked &&
      typeof entry.userQuote === "string" && entry.userQuote.trim() &&
      typeof entry.evidenceRef === "string" && entry.evidenceRef.trim() &&
      Number.isFinite(Date.parse(entry.confirmedAt)));
    results.push({ level: approved ? "INFO" : level, title: approved ? `Reused user decision: ${title}` : title, detail, reviewId, decisionReused: approved });
    return;
  }
  results.push({ level, title, detail });
}

function reviewEvidence(rel, content, patterns) {
  return [rel, content.split(/\r?\n/).filter((line) => patterns.some(([, re]) => re.test(line))).map((line) => line.trim()).sort()];
}

function exists(rel) {
  return fs.existsSync(path.join(root, rel));
}

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8").replace(/\r\n/g, "\n");
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function cleanYamlScalar(value) {
  return String(value ?? "").trim().replace(/^['"]|['"]$/g, "");
}

function yamlTopLevelValue(block, key) {
  return cleanYamlScalar(block.match(new RegExp(`^${escapeRegExp(key)}:\\s*(.+)$`, "m"))?.[1] ?? "");
}

function yamlMetadataVersion(block) {
  const inlineMetadata = block.match(/^metadata:\s*\{([^}]*)\}\s*$/m)?.[1] ?? "";
  if (inlineMetadata) {
    const inlineVersion = inlineMetadata.match(/(?:^|,)\s*version\s*:\s*([^,]+)\s*(?:,|$)/)?.[1] ?? "";
    if (inlineVersion) return cleanYamlScalar(inlineVersion);
  }

  const lines = block.split(/\r?\n/);
  const start = lines.findIndex((line) => /^metadata:\s*$/.test(line));
  if (start === -1) return "";
  for (let i = start + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (/^\S/.test(line)) break;
    const version = line.match(/^\s+version:\s*(.+)\s*$/)?.[1] ?? "";
    if (version) return cleanYamlScalar(version);
  }
  return "";
}

function skillVersionFromFrontmatter(block) {
  return yamlMetadataVersion(block) || yamlTopLevelValue(block, "version");
}

function git(args) {
  try {
    return execFileSync("git", args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
  } catch {
    return "";
  }
}

function listFiles() {
  const gitVisible = git(["ls-files", "--cached", "--others", "--exclude-standard"])
    .split("\n")
    .filter(Boolean)
    .filter((rel) => exists(rel));
  if (gitVisible.length > 0) return [...new Set(gitVisible)];

  const out = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === ".git" || entry.name === "node_modules") continue;
      const abs = path.join(dir, entry.name);
      const rel = path.relative(root, abs).replaceAll(path.sep, "/");
      if (entry.isDirectory()) walk(abs);
      else out.push(rel);
    }
  }
  walk(root);
  return out;
}

const trackedFiles = git(["ls-files"]).split("\n").filter(Boolean);
const files = listFiles();
const changedFiles = [
  ...git(["diff", "--name-only", "HEAD", "--"]).split("\n").filter(Boolean),
  ...git(["ls-files", "--others", "--exclude-standard"]).split("\n").filter(Boolean),
]
  .filter((rel) => exists(rel) || trackedFiles.includes(rel))
  .filter((rel) => !/(?:^|\/)(?:publish-check-report|smoke-test-report|se-quality-report)\.json$/i.test(rel));
const changedFileSet = new Set(changedFiles);
const readmeChanged = changedFileSet.has("README.md") || changedFileSet.has("README.zh.md") || changedFileSet.has("README.en.md");
const readmeImpactRules = [
  [/^SKILL\.md$/, "skill behavior, triggers, or public value may have changed"],
  [/^scripts\//, "scripts, commands, checks, or runtime requirements may have changed"],
  [/^templates\//, "generated README/output structure may have changed"],
  [/^references\/(?:install-section|platform-compatibility|readme-style|readme-review|readme-checks|readme-visuals|pre-publish-flow|repo-structure|skill-completeness|security-checklist|publish-checklist|update-workflow|github-workflow)\.md$/, "public workflow, install, compatibility, or release rules may have changed"],
  [/^(?:package|pnpm-lock|package-lock|yarn\.lock|requirements|pyproject|uv\.lock|Cargo|go\.mod|deno)\b/, "dependencies or runtime requirements may have changed"],
  [/^(?:adapters|assets|evals)\//, "platform support, examples, visuals, or verification assets may have changed"],
  [/^\.env\.example$/, "configuration requirements may have changed"],
  [/^LICENSE$/, "license or copyright terms may have changed"],
];
const readmeImpactFiles = changedFiles.filter((rel) => readmeImpactRules.some(([pattern]) => pattern.test(rel)));
const readmePairUpdated = changedFileSet.has("README.md") && changedFileSet.has("README.zh.md");
if (readmeImpactFiles.length > 0 && !(allowLegacyReadme ? readmeChanged : readmePairUpdated)) {
  const detail = `Changed files that may affect README content: ${readmeImpactFiles.slice(0, 12).join(", ")}${readmeImpactFiles.length > 12 ? ", ..." : ""}. Update README.md and README.zh.md, or rerun with --readme-no-impact only after reviewing the diff and documenting why README does not need to change.`;
  if (allowReadmeUnchanged) {
    add("WARNING", "README unchanged after explicit no-impact review", detail);
  } else {
    add("FAIL", "README sync review required", detail);
  }
}

// A repository can be a single-skill repo (root SKILL.md) or a marketplace /
// collection repo (.claude-plugin/marketplace.json declaring one or more
// plugins). Requiring a root SKILL.md in the marketplace case is a structural
// false positive — those repos correctly have no root SKILL.md.
const isMarketplace = exists(".claude-plugin/marketplace.json");
let marketplace = null;
const requiredFiles = isMarketplace
  ? [".claude-plugin/marketplace.json", "README.md", "LICENSE"]
  : ["SKILL.md", "README.md", "LICENSE"];
for (const rel of requiredFiles) {
  if (!exists(rel)) add("FAIL", "Missing required file", rel);
}

if (isMarketplace) {
  try {
    marketplace = JSON.parse(read(".claude-plugin/marketplace.json"));
  } catch {
    add("FAIL", "marketplace.json is not valid JSON", ".claude-plugin/marketplace.json");
  }
  const plugins = Array.isArray(marketplace?.plugins) ? marketplace.plugins : [];
  if (marketplace && plugins.length === 0) {
    add("FAIL", "marketplace.json declares no plugins", ".claude-plugin/marketplace.json");
  }
  for (const p of plugins) {
    const src = (p?.source ? String(p.source) : "").replace(/^\.\//, "").replace(/\/$/, "");
    if (!src) {
      add("FAIL", "Plugin missing source", `${p?.name ?? "(unnamed)"}`);
    } else if (!exists(src)) {
      add("FAIL", "Plugin source directory missing", `${p?.name ?? src}: ${src}`);
    }
  }
}

const hasReadme = exists("README.md");
const hasChineseReadme = exists("README.zh.md");
const hasLegacyEnglishReadme = exists("README.en.md");

if (hasReadme) {
  const readme = read("README.md");
  const readmeTopLines = readme.split(/\r?\n/).slice(0, 30);
  const readmeTop = readmeTopLines.join("\n");
  const readmeLinksModernChinese = /README\.zh\.md/.test(readmeTop);
  const readmeLinksLegacyEnglish = /README\.en\.md/.test(readmeTop);
  const readmeTopWithoutLanguageSwitch = readmeTopLines
    .filter((line) => !/(?:README\.zh\.md|README\.en\.md|^\s*(?:English|中文)\s*[|·])/.test(line))
    .join("\n");
  const looksChinese = /[\u4e00-\u9fff]/.test(readmeTopWithoutLanguageSwitch);
  const looksLegacy = hasLegacyEnglishReadme || readmeLinksLegacyEnglish || (!hasChineseReadme && looksChinese);
  const modernProblems = [];

  if (looksChinese) modernProblems.push(["README.md must be English by default", "Move English documentation into README.md and Chinese documentation into README.zh.md."]);
  if (!hasChineseReadme) modernProblems.push(["Missing README.zh.md", "Move Chinese documentation to README.zh.md."]);
  if (hasLegacyEnglishReadme) modernProblems.push(["Legacy README.en.md remains", "Use README.md for English and README.zh.md for Chinese."]);
  if (!readmeLinksModernChinese) modernProblems.push(["README language switch is not modern", "README.md should link to README.zh.md near the top."]);

  if (modernProblems.length > 0) {
    if (allowLegacyReadme && looksLegacy) {
      add("WARNING", "Legacy README structure allowed by explicit pass-through", "README.md Chinese + README.en.md English was kept because --allow-legacy-readme was used.");
    } else {
      for (const [title, detail] of modernProblems) add("FAIL", title, detail);
    }
  }


}

for (const rel of ["README.md", "README.zh.md"]) {
  if (!exists(rel)) continue;
  const content = read(rel);

  const internalReadmePhrases = [
    ["internal consent wording", /(?:征得你同意|征得.*同意|with your consent|after asking)/i],
    ["prompt/instruction chore exposed", /(?:加进(?:你的)?(?:Agent\s*)?(?:提示词|指令)|add (?:this )?rule to (?:your )?(?:prompt|instructions))/i],
    ["setup internals exposed as user chore", /(?:重跑\s*(?:setup|\.\/setup)|重新运行\s*setup|rerun\s+\.\/setup|re-run\s+\.\/setup)/i],
  ];
  for (const [label, pattern] of internalReadmePhrases) {
    if (pattern.test(content)) add("FAIL", `README contains ${label}`, `${rel}: rewrite as product-facing install/result copy.`);
  }

  const document = inspectReadme(content, root, rel, { audience: readmeAudience, legacy: allowLegacyReadme });
  readmeChecks[rel] = document;
  for (const finding of document.findings) add(finding.level, finding.title, finding.detail);
  if (allowLegacyReadme) add("WARNING", "README preserved by explicit pass-through", `${rel}: structural/format departures are warnings; this does not certify the current framework or waive broken links, placeholders, visuals or safety gates.`);

  const visuals = inspectReadmeVisuals(content, root, { previewOnly: !allowLegacyReadme });
  readmeVisuals[rel] = visuals;
  if (visuals.invalidImages.length) add("FAIL", "README preview image is invalid or missing", `${rel}: ${visuals.invalidImages.join(", ")}`);
  if (visuals.status === "missing") add("FAIL", "README missing preview image or omission reason", `${rel}: embed a real output/UI image, or explain the specific constraint within Preview / 效果预览. No UI alone is not an exemption; badges do not count.`);
  if (visuals.status === "omitted_with_reason") add("WARNING", "README preview omitted with reason", `${rel}: ${visuals.omissionReason} Repeat this reason in the final publish summary; review whether an existing output could be shown.`);
  if (visuals.externalImages.length) add("WARNING", "README external preview requires verification", `${rel}: ${visuals.externalImages.join(", ")}. Verify rendering and access before release; this offline check does not fetch URLs.`);
}

if (!exists(".gitignore")) {
  add("WARNING", "Missing .gitignore", "Add .gitignore when generated files or local caches may appear.");
} else {
  const ignore = read(".gitignore");
  for (const pattern of ["node_modules/", ".DS_Store"]) {
    if (!ignore.includes(pattern)) add("WARNING", ".gitignore may be incomplete", `Missing ${pattern}`);
  }
}

if (exists("SKILL.md")) {
  const skill = read("SKILL.md");
  const frontmatter = skill.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!frontmatter) {
    add("FAIL", "Invalid SKILL.md", "Missing YAML frontmatter.");
  } else {
    for (const key of ["name", "description"]) {
      if (!new RegExp(`^${key}:\\s*\\S`, "m").test(frontmatter[1])) {
        add("FAIL", "Incomplete SKILL.md frontmatter", `Missing ${key}.`);
      }
    }
    if (yamlTopLevelValue(frontmatter[1], "version")) {
      add(
        "FAIL",
        "Legacy top-level version field",
        "Move version to metadata.version; the current Skill schema does not allow a top-level version key."
      );
    }
  }

  const referenced = new Set(skill.match(/\b(?:references|templates|scripts|assets)\/[A-Za-z0-9._/-]+/g) || []);
  for (const rel of referenced) {
    if (!exists(rel)) add("FAIL", "Broken referenced file", rel);
  }
}

for (const rel of trackedFiles) {
  const base = path.basename(rel);
  if (base === ".env" || (base !== ".env.example" && /^\.env\.[^.]+$/.test(base))) {
    add("FAIL", "Tracked environment file", rel);
  }
}

for (const rel of files) {
  if (path.basename(rel) !== ".env.example") continue;
  const lines = read(rel).split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const [key, ...rest] = trimmed.split("=");
    const value = rest.join("=").trim().replace(/^['"]|['"]$/g, "");
    const sensitiveEnvKey = /(KEY|TOKEN|SECRET|PASSWORD|COOKIE|CREDENTIAL)/i.test(key);
    if (!sensitiveEnvKey) continue;
    const placeholder = value === "" || /^<[^>]+>$/.test(value) || /^(your|example|placeholder|changeme|todo|xxx|dummy|null)([_-].*)?$/i.test(value);
    if (!placeholder) add("FAIL", ".env.example contains non-placeholder value", `${rel}: ${key}`);
  }
}

const secretPatterns = [
  ["GitHub token", /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{20,}\b/g],
  ["GitHub fine-grained token", /\bgithub_pat_[A-Za-z0-9_]{20,}\b/g],
  ["OpenAI-style API key", /\bsk-[A-Za-z0-9_-]{20,}\b/g],
  ["AWS access key", /\bAKIA[0-9A-Z]{16}\b/g],
  ["Slack token", /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/g],
  ["Private key", /-----BEGIN [A-Z ]*PRIVATE KEY-----/g],
  ["Credential env assignment", /\b[A-Z0-9_]*(?:API_KEY|TOKEN|SECRET|PASSWORD|COOKIE|CREDENTIAL)[A-Z0-9_]*\s*=\s*["']?(?!$|<|your_|example|placeholder|changeme|todo|xxx|dummy|null)[^"'\s]+/g],
];

function shouldScanContent(rel) {
  return !rel.startsWith(".git/") && !rel.startsWith("node_modules/") && !/\.(png|jpg|jpeg|gif|webp|pdf|zip|tar|gz)$/i.test(rel);
}

function shouldScanThirdPartyReview(rel) {
  if (!shouldScanContent(rel)) return false;
  if (/^(?:smoke-test-report|publish-check-report)\.json$/i.test(path.basename(rel))) return false;
  // The checker itself contains the detection keywords in its own regex source;
  // scanning it would always self-match. Skip it.
  if (rel === "scripts/publish-check.mjs" || rel.endsWith("/scripts/publish-check.mjs")) return false;
  // templates/ holds {{placeholder}} scaffolding meant to be filled per-skill;
  // flagging its built-in attribution boilerplate is not actionable.
  if (/^templates\//.test(rel) || rel.includes("/templates/")) return false;
  if (/^references\/(?:security-checklist|publish-checklist|readme-style|pre-publish-flow|readme-review|readme-checks)\.md$/.test(rel)) return false;
  return true;
}

function isHighPriorityThirdPartySurface(rel) {
  return /(?:^|\/)(?:README(?:\.[A-Za-z-]+)?\.md|LICENSE|NOTICE|COPYRIGHT|CITATION\.cff)$/i.test(rel);
}

function shouldScanIdentityReview(rel) {
  if (!shouldScanContent(rel)) return false;
  if (/^(?:smoke-test-report|publish-check-report|se-quality-report)\.json$/i.test(path.basename(rel))) return false;
  if (rel === "scripts/publish-check.mjs" || rel.endsWith("/scripts/publish-check.mjs")) return false;
  if (/^templates\//.test(rel) || rel.includes("/templates/")) return false;
  if (/^references\/(?:security-checklist|publish-checklist|readme-style|pre-publish-flow|readme-review|readme-checks)\.md$/.test(rel)) return false;
  return true;
}

// The generic "third-party names ... remain subject to their original terms"
// disclaimer is boilerplate this skill itself tells authors to write, and it
// names no specific party. Strip it before scanning so the tool does not warn on
// the very sentence it recommends. Real attribution (named party, ©, forked from)
// still trips the patterns.
const boilerplateDisclaimerLine = [
  /第三方名称[\s\S]{0,40}受其原始[\s\S]{0,20}约束/,
  /third-?party names[\s\S]{0,120}remain subject to their original[\s\S]{0,40}terms/i,
];
function stripBoilerplateDisclaimer(content) {
  return content
    .split(/\r?\n/)
    .filter((line) => !boilerplateDisclaimerLine.some((re) => re.test(line)))
    .join("\n");
}

for (const rel of files) {
  if (!shouldScanContent(rel)) continue;
  let content = "";
  try {
    content = read(rel);
  } catch {
    continue;
  }

  for (const [label, pattern] of secretPatterns) {
    pattern.lastIndex = 0;
    if (pattern.test(content)) add("FAIL", `Possible secret: ${label}`, rel);
  }

  const localPathMatches = content.match(/(?:\/Users\/(?!\.\.\.)[A-Za-z0-9._-]+|\/home\/(?!\.\.\.)[A-Za-z0-9._-]+|\/Volumes\/(?!\.\.\.)[A-Za-z0-9._-]+|[A-Za-z]:\\Users\\(?!\.\.\.)[A-Za-z0-9._-]+)/g) || [];
  if (localPathMatches.length > 0) add("FAIL", "Local absolute path found", rel);
}

// High-signal only. A bare platform/product mention (GitHub, Claude, Codex,
// Apple, Anthropic, Meta...) is expected in skill docs and is NOT an attribution
// duty. Design style / design language references are also allowed when they do
// not imply copied assets, endorsement, ownership, or relicensing. We flag the
// actual signals that a human must decide on before redistributing someone
// else's content: explicit reuse/attribution verbs, foreign copyright/trademark
// notices, external license terms, and generated-by / ownership language.
const thirdPartyReviewPatterns = [
  ["external attribution / reuse statement", /\b(?:adapted from|derived from|forked from|ported from|originally (?:from|by|written by)|copied from)\b|(?:改编自|衍生自|移植自|源自|fork\s*自)/i],
  ["copyright or trademark notice", /(?:©|\(c\)\s*\d{4}|all rights reserved|registered trademark|™|®|版权所有|著作权|保留所有权利)/i],
  ["external license terms", /(?:original (?:license|terms)|under (?:its|their|the original) license|subject to .{0,30}license|原始(?:协议|许可|条款)|第三方.{0,8}(?:协议|许可|条款))/i],
  ["generated-by or third-party ownership language", /\b(?:generated by|created by|made by|owned by|property of|courtesy of)\b|(?:归.{0,8}所有|版权所有者)|(?:^|\n)\s*由(?!生图工具|专业生图|图像生成工具).{1,24}(?:生成|创建|制作)/i],
];

for (const rel of files) {
  if (!shouldScanThirdPartyReview(rel)) continue;
  let content = "";
  try {
    content = stripBoilerplateDisclaimer(read(rel));
  } catch {
    continue;
  }

  const matches = [];
  for (const [label, pattern] of thirdPartyReviewPatterns) {
    if (/^(?:LICENSE|[^/]+\/LICENSE)$/i.test(rel) && label === "copyright or trademark notice") continue;
    pattern.lastIndex = 0;
    if (pattern.test(content)) matches.push(label);
  }
  if (matches.length > 0) {
    const highPriority = isHighPriorityThirdPartySurface(rel);
    add(
      "WARNING",
      highPriority ? "High-priority README/LICENSE third-party review needs user decision" : "Third-party/copyright review needs user decision",
      `${rel}: ${[...new Set(matches)].join(", ")}. Neutral design-language/company references such as Apple, Anthropic, or Meta are allowed when they do not imply ownership, endorsement, copied assets, or relicensing. Ask only if no matching prior decision exists.`,
      reviewEvidence(rel, content, thirdPartyReviewPatterns)
    );
  }
}

const placeholderIdentity = "(?:<[^>]+>|\\{\\{[^}]+\\}\\}|\\[[^\\]]*(?:author|name|email|username|handle)[^\\]]*\\]|your[-_ ]?(?:name|email|username)|example|placeholder|todo|tbd|n/?a|none|unknown)";
const identityReviewPatterns = [
  ["author or maintainer field", new RegExp(`(?:^|\\n)\\s*(?:author|authors|maintainers?|creator|created by|written by|owner|contact|作者|维护者|创建者|联系人)\\s*[:=]\\s*(?!\\s*${placeholderIdentity})\\S`, "i")],
  ["copyright holder identity", new RegExp(`(?:copyright\\s*(?:\\(c\\)|©)?|版权所有)\\s*\\d{4}(?:-\\d{4})?\\s+(?!\\s*${placeholderIdentity})\\S`, "i")],
  ["email address", /\b[A-Z0-9._%+-]+@(?!users\.noreply\.github\.com\b|noreply\.github\.com\b|example\.(?:com|org|net)\b|email\b)[A-Z0-9.-]+\.[A-Z]{2,}\b/i],
  ["personal username or social handle", /(?:^|\n)\s*(?:github|twitter|x|weibo|bilibili|handle|username|user|用户名|账号|社交账号)\s*[:=]\s*@?[A-Za-z0-9_.-]{3,}/i],
  ["generator or tool watermark", /\b(?:generated by|generated with|created with|made with|built with|scaffolded by|powered by|ai-generated by|written with)\b|(?:^|\n)\s*(?:生成工具|制作工具|生成者|制作方)\s*[:：]|(?:^|\n)\s*由(?!生图工具|专业生图|图像生成工具).{1,24}(?:生成|创建|制作|驱动)/i],
];

for (const rel of files) {
  if (!shouldScanIdentityReview(rel)) continue;
  let content = "";
  try {
    content = read(rel);
  } catch {
    continue;
  }

  const matches = [];
  for (const [label, pattern] of identityReviewPatterns) {
    pattern.lastIndex = 0;
    if (pattern.test(content)) matches.push(label);
  }
  if (matches.length > 0) {
    add(
      "WARNING",
      "Identity/attribution metadata review needs user decision",
      `${rel}: ${[...new Set(matches)].join(", ")}. Ask only if no matching prior decision exists.`,
      reviewEvidence(rel, content, identityReviewPatterns)
    );
  }
}

const gitIdentityRows = git(["log", "--format=%H%x09%an%x09%ae%x09%G?", "-n", "100"])
  .split("\n")
  .filter(Boolean)
  .map((line) => {
    const [hash, name, email, signature] = line.split("\t");
    return { hash, name, email, signature };
  });

if (gitIdentityRows.length > 0) {
  const identities = [...new Map(gitIdentityRows.map((row) => [`${row.name} <${row.email}>`, row])).values()];
  const visibleIdentities = identities
    .filter((row) => !/@users\.noreply\.github\.com$/i.test(row.email || ""))
    .slice(0, 8)
    .map((row) => `${row.name} <${row.email}>`);
  const signedCount = gitIdentityRows.filter((row) => row.signature && row.signature !== "N").length;
  const unsignedCount = gitIdentityRows.filter((row) => row.signature === "N").length;
  const details = [];
  if (visibleIdentities.length > 0) details.push(`commit authors/emails: ${visibleIdentities.join("; ")}`);
  if (signedCount > 0) details.push(`signed commit metadata present: ${signedCount}`);
  if (unsignedCount > 0) details.push(`unsigned commits in scanned history: ${unsignedCount}`);
  if (details.length > 0) {
    add(
      "WARNING",
      "Git history identity/signature metadata review needs user decision",
      `${details.join(". ")}. Ask only if no matching prior decision exists.`,
      [...new Set(gitIdentityRows.map(({ name, email, signature }) => `${name}\t${email}\t${signature}`))].sort()
    );
  }
}

for (const rel of trackedFiles) {
  if (/(\.DS_Store|\.log$|^dist\/|^build\/|^tmp\/|^cache\/|^\.cache\/|^node_modules\/|session|history)/i.test(rel)) {
    add("WARNING", "Tracked generated or local-output file", rel);
  }
}

// ---------------------------------------------------------------------------
// Engineering-quality checks (feed both the release gate and the scorecard).
// ---------------------------------------------------------------------------

// Identity facts. For a single-skill repo they come from SKILL.md frontmatter;
// for a marketplace repo they come from the marketplace manifest.
let fmName = "";
let fmDescription = "";
let fmVersion = "";
let skillBodyLines = 0;
if (isMarketplace && marketplace) {
  fmName = String(marketplace.name ?? "").trim();
  fmDescription = String(marketplace.description ?? "").replace(/\s+/g, " ").trim();
  fmVersion = String(marketplace.version ?? "").trim();
} else if (exists("SKILL.md")) {
  const skill = read("SKILL.md");
  const fm = skill.match(/^---\n([\s\S]*?)\n---/);
  const block = fm ? fm[1] : "";
  fmName = yamlTopLevelValue(block, "name");
  fmDescription = (block.match(/^description:\s*(.+(?:\n\s+.+)*)$/m)?.[1] ?? "").replace(/\s+/g, " ").trim();
  fmVersion = skillVersionFromFrontmatter(block);
  skillBodyLines = (fm ? skill.slice(fm[0].length) : skill).split(/\r?\n/).filter((l) => l.trim()).length;
}

// 1. description quality — the single most important field for triggering.
const descTriggerRe = /(use this skill when|use this when|use when|use this to|when the user|当用户|使用此|触发|use it to)/i;
const descLenOk = fmDescription.length >= 40 && fmDescription.length <= 1024;
// Trigger phrasing matters for a skill's own description; a marketplace manifest
// describes a collection, so it is N/A there.
const descTriggerOk = isMarketplace ? true : descTriggerRe.test(fmDescription);
if (fmDescription && !descLenOk) {
  add("WARNING", "description length is off", `${fmDescription.length} chars; aim for 40-1024 with concrete trigger conditions.`);
}
if (fmDescription && !descTriggerOk) {
  add("WARNING", "description lacks trigger phrasing", "Add when-to-use cues (e.g. \"Use when ...\", \"当用户 ...\") so the skill triggers reliably.");
}

// 2. version is valid semver.
const semverOk = !fmVersion || /^\d+\.\d+\.\d+(?:[-+.][0-9A-Za-z.-]+)?$/.test(fmVersion);
if (fmVersion && !semverOk) {
  add("WARNING", "version is not semver", `Found "${fmVersion}"; use MAJOR.MINOR.PATCH.`);
}

// 3. SKILL.md body weight — bloated SKILL.md hurts load and triggering.
// N/A for a marketplace repo (no root SKILL.md), so treat as satisfied there.
const SKILL_BODY_BUDGET = 400;
const skillWeightOk = isMarketplace ? true : skillBodyLines > 0 && skillBodyLines <= SKILL_BODY_BUDGET;
if (!isMarketplace && skillBodyLines > SKILL_BODY_BUDGET) {
  add("WARNING", "SKILL.md is heavy", `${skillBodyLines} non-empty body lines (budget ${SKILL_BODY_BUDGET}); push detail into references/.`);
}

// 4. orphan files — exist under references/templates/assets but referenced nowhere.
// Scan every text file (not just SKILL.md/README) so a file linked from another
// reference still counts as reachable; only truly dead files get flagged.
const docRefText = files
  .filter(shouldScanContent)
  .map((rel) => {
    try {
      return read(rel);
    } catch {
      return "";
    }
  })
  .join("\n");
const referencedPaths = new Set(docRefText.match(/\b(?:references|templates|scripts|assets)\/[A-Za-z0-9._/-]+/g) || []);
const orphanFiles = files.filter((rel) => /^(?:references|templates|assets)\//.test(rel) && ![...referencedPaths].some((r) => r === rel || rel.startsWith(`${r}/`)));
for (const rel of orphanFiles) {
  add("WARNING", "Orphan reference/template file", `${rel} is never mentioned in SKILL.md or README; reference it or remove it.`);
}

// 5. script health — shippable scripts must parse and declare an interpreter.
const scriptFiles = files.filter((rel) => /\.(mjs|js|cjs)$/.test(rel) && !rel.startsWith("node_modules/"));
let scriptsParseOk = true;
let scriptsShebangOk = true;
for (const rel of scriptFiles) {
  try {
    execFileSync(process.execPath, ["--check", path.join(root, rel)], { stdio: "ignore" });
  } catch {
    scriptsParseOk = false;
    add("FAIL", "Script does not parse", rel);
  }
}
const shellAndNodeScripts = files.filter((rel) => /^scripts\/.*\.(mjs|js|cjs|sh)$/.test(rel));
for (const rel of shellAndNodeScripts) {
  let head = "";
  try {
    head = read(rel).slice(0, 64);
  } catch {
    continue;
  }
  if (!head.startsWith("#!")) {
    scriptsShebangOk = false;
    add("WARNING", "Script missing shebang", rel);
  }
}
const evalsPresent =
  files.some((rel) => /^evals\//.test(rel)) ||
  exists("scripts/smoke-test.mjs") ||
  files.some((rel) => /(?:^|\/)validate[^/]*\.(py|mjs|js)$/i.test(rel));

const fail = results.filter((r) => r.level === "FAIL");
const warning = results.filter((r) => r.level === "WARNING");

const status = fail.length > 0 ? "FAIL" : warning.length > 0 ? "WARNING" : "PASS";

// ---------------------------------------------------------------------------
// Engineering scorecard. The release gate above answers "can I publish?";
// this answers "how good is it, from an engineering standpoint?". Every point
// is traceable to one concrete sub-check, so the number is an honest aggregate,
// not a guess. 5 categories x 20 = 100.
// ---------------------------------------------------------------------------
const hasResult = (substr) => results.some((r) => r.title.includes(substr));
const sectionCount = Object.values(readmeChecks).reduce((n, doc) => n + doc.expectedSections.filter(s => doc.sections.includes(s)).length, 0);
const structureProblems = Object.values(readmeChecks).some(doc => doc.findings.some(r => /section|two-column|subsections|requirements|requirement rows/.test(r.title)));
const structureFrac = structureProblems ? Math.min(0.9, sectionCount / 20) : sectionCount / 20;
const readmeModernOk =
  !hasResult("must be English") &&
  !hasResult("Missing README.zh.md") &&
  !hasResult("language switch is not modern") &&
  !hasResult("Legacy README.en.md");

const scorecardSpec = [
  ["Metadata & discoverability", [
    ["name present", !!fmName, 4],
    ["description present", !!fmDescription, 4],
    ["description length healthy", descLenOk, 4],
    ["description has trigger phrasing", descTriggerOk, 4],
    ["version is semver", semverOk, 4],
  ]],
  ["Documentation", [
    ["README.md present", exists("README.md"), 4],
    ["README.md English-default + zh switch", readmeModernOk, 4],
    ["README.zh.md present", exists("README.zh.md"), 4],
    ["README structure modules", structureFrac, 4],
    ["LICENSE present", exists("LICENSE"), 4],
  ]],
  ["Structure & hygiene", [
    ["SKILL.md within size budget", skillWeightOk, 5],
    ["no orphan files", orphanFiles.length === 0, 5],
    ["no broken references", !hasResult("Broken referenced file") && !hasResult("broken local link"), 5],
    [".gitignore present", exists(".gitignore"), 3],
    ["no tracked junk", !hasResult("Tracked generated"), 2],
  ]],
  ["Security & portability", [
    ["no secrets", !hasResult("Possible secret"), 8],
    ["no local absolute paths", !hasResult("Local absolute path"), 6],
    ["env hygiene", !hasResult("environment file") && !hasResult(".env.example contains"), 3],
    ["third-party content reviewed", !hasResult("Third-party/copyright review") && !hasResult("High-priority README/LICENSE third-party review"), 2],
    ["identity metadata reviewed", !hasResult("Identity/attribution metadata") && !hasResult("Git history identity"), 1],
  ]],
  ["Tooling & verifiability", [
    ["scripts parse", scriptsParseOk, 8],
    ["scripts have shebang", scriptsShebangOk, 4],
    ["evals or smoke-test present", evalsPresent, 4],
    ["release gate not failing", fail.length === 0, 4],
  ]],
];

let scoreTotal = 0;
let scoreMax = 0;
const scorecard = scorecardSpec.map(([category, items]) => {
  let earned = 0;
  let max = 0;
  const detailed = items.map(([label, val, pts]) => {
    const frac = typeof val === "number" ? Math.max(0, Math.min(1, val)) : val ? 1 : 0;
    const got = Math.round(frac * pts * 10) / 10;
    earned += got;
    max += pts;
    return { label, earned: got, pts, ok: frac >= 1 };
  });
  earned = Math.round(earned * 10) / 10;
  scoreTotal += earned;
  scoreMax += max;
  return { category, earned, max, items: detailed };
});
const engineeringScore = Math.round((scoreTotal / scoreMax) * 100);
const band =
  engineeringScore >= 90 ? "A · Strong engineering" :
  engineeringScore >= 75 ? "B · Good" :
  engineeringScore >= 60 ? "C · Needs work" :
  "D · Weak engineering";

const manualReview = manualReadmeReview();
const report = {
  readmeVisuals,
  readmeChecks,
  manualReview,
  reviewDecisions: { schemaVersion: 1, scope: reviewScope, visibility: visibility ?? "unknown", storage: approvalFile ? "git-common-dir/publisher-review-decisions.json" : null },
  summary: {
    status,
    readiness: fail.length ? "blocked" : "review_required",
    readmeAudience,
    failed: fail.length,
    warnings: warning.length,
    engineeringScore,
    band,
    checkedAt: new Date().toISOString(),
  },
  scorecard,
  results,
};

fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

if (jsonOnly) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(`Publish check: ${status}`);
  console.log(`- report: ${path.relative(root, reportPath)}`);

  for (const level of ["FAIL", "WARNING"]) {
    const items = results.filter((r) => r.level === level);
    if (items.length === 0) continue;
    console.log(`\n${level}`);
    for (const item of items) console.log(`- ${item.title}: ${item.detail}`);
  }

  if (status === "PASS") {
    console.log("- No automated blocking issues found; manual README review remains required.");
  }

  console.log(`\nREADME review: ${report.summary.readiness}; product meaning and visual authenticity are not certified automatically.`);
  console.log(`\nEngineering score: ${engineeringScore}/100  (${band})`);
  for (const cat of scorecard) {
    console.log(`- ${cat.category}: ${cat.earned}/${cat.max}`);
    for (const it of cat.items) {
      if (!it.ok) console.log(`    ✗ ${it.label} (${it.earned}/${it.pts})`);
    }
  }
}

process.exit(fail.length > 0 ? 1 : 0);
