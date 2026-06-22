#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const args = process.argv.slice(2);
const jsonOnly = args.includes("--json");
const allowLegacyReadme = args.includes("--allow-legacy-readme") || args.includes("--pass-through-readme");
const reportPathArg = args.find((arg) => arg.startsWith("--report="))?.split("=")[1] ?? "publish-check-report.json";
const root = process.cwd();
const reportPath = path.resolve(root, reportPathArg);
const results = [];

function add(level, title, detail) {
  results.push({ level, title, detail });
}

function exists(rel) {
  return fs.existsSync(path.join(root, rel));
}

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

function git(args) {
  try {
    return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
  } catch {
    return "";
  }
}

function listFiles() {
  const gitVisible = git(["ls-files", "--cached", "--others", "--exclude-standard"]).split("\n").filter(Boolean);
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
const hasModernEnglishReadme = exists("README.en.md");
const hasLegacyChineseReadme = exists("README.zh.md");

if (hasReadme) {
  const readme = read("README.md");
  const readmeTop = readme.split(/\r?\n/).slice(0, 30).join("\n");
  const readmeLinksLegacyChinese = /README\.zh\.md/.test(readmeTop);
  const readmeLinksModernEnglish = /README\.en\.md/.test(readmeTop);
  const looksChinese = /[\u4e00-\u9fff]/.test(readmeTop);
  const looksLegacy = hasLegacyChineseReadme || readmeLinksLegacyChinese || (!hasModernEnglishReadme && !looksChinese);
  const modernProblems = [];

  if (!looksChinese) modernProblems.push(["README.md must be Chinese by default", "Migrate Chinese documentation into README.md."]);
  if (!hasModernEnglishReadme) modernProblems.push(["Missing README.en.md", "Move English documentation to README.en.md."]);
  if (hasLegacyChineseReadme) modernProblems.push(["Legacy README.zh.md remains", "Use README.md for Chinese and README.en.md for English."]);
  if (!readmeLinksModernEnglish) modernProblems.push(["README language switch is not modern", "README.md should link to README.en.md near the top."]);

  if (modernProblems.length > 0) {
    if (allowLegacyReadme && looksLegacy) {
      add("WARNING", "Legacy README structure allowed by explicit pass-through", "README.md English + README.zh.md Chinese was kept because --allow-legacy-readme was used.");
    } else {
      for (const [title, detail] of modernProblems) add("FAIL", title, detail);
    }
  }

  const structureChecks = [
    ["README missing audience/value opening", /(?:面向|适合谁|谁适合|适用人群|目标用户|for .{0,40}(?:users|teams|authors))/i],
    ["README missing install path", /(?:^##\s*(?:怎么安装|安装|Install)(?:\s|$)|git clone)/im],
    ["README missing quick start or first-use path", /(?:^##\s*(?:快速开始|使用方式|怎么使用|Quick Start|Usage)(?:\s|$)|验证|verification prompt|first successful)/im],
    ["README missing core capabilities", /(?:^##\s*(?:核心能力|功能|Capabilities|Core Capabilities)(?:\s|$))/im],
    ["README missing usage examples", /(?:^##\s*(?:使用示例|Usage Examples)(?:\s|$))/im],
    ["README missing how-it-works section", /(?:^##\s*(?:工作原理|How It Works)(?:\s|$))/im],
    ["README missing requirements or configuration", /(?:^##\s*(?:运行要求|依赖|配置|Requirements|Configuration)(?:\s|$)|\.env|环境变量)/im],
    ["README missing platform compatibility", /(?:^##\s*(?:平台兼容性|Platform Compatibility)(?:\s|$)|Codex|Claude Code|OpenClaw)/im],
    ["README missing repository or file structure", /(?:^##\s*(?:仓库结构|目录结构|文件结构|Repository Structure|File Guide)(?:\s|$))/im],
    ["README missing license", /(?:^##\s*(?:License|协议|许可证)(?:\s|$)|MIT)/im],
  ];

  for (const [title, pattern] of structureChecks) {
    if (pattern.test(readme)) continue;
    if (allowLegacyReadme) {
      add("WARNING", title, "Current README structure was preserved by explicit pass-through; it does not fully match the default release template.");
    } else {
      add("FAIL", title, "Upgrade README.md to the current default structure before publishing, or use --allow-legacy-readme only for an explicit pass-through release.");
    }
  }
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
  const frontmatter = skill.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatter) {
    add("FAIL", "Invalid SKILL.md", "Missing YAML frontmatter.");
  } else {
    for (const key of ["name", "description", "version"]) {
      if (!new RegExp(`^${key}:\\s*\\S`, "m").test(frontmatter[1])) {
        add("FAIL", "Incomplete SKILL.md frontmatter", `Missing ${key}.`);
      }
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
  if (rel === "LICENSE" || rel.endsWith("/LICENSE")) return false;
  if (/^(?:smoke-test-report|publish-check-report)\.json$/i.test(path.basename(rel))) return false;
  // The checker itself contains the detection keywords in its own regex source;
  // scanning it would always self-match. Skip it.
  if (rel === "scripts/publish-check.mjs" || rel.endsWith("/scripts/publish-check.mjs")) return false;
  // templates/ holds {{placeholder}} scaffolding meant to be filled per-skill;
  // flagging its built-in attribution boilerplate is not actionable.
  if (/^templates\//.test(rel) || rel.includes("/templates/")) return false;
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

// High-signal only. A bare platform/product mention (GitHub, Claude, Codex...) is
// expected in a publishing skill and is NOT an attribution duty, so it does not
// trigger a warning by itself. We flag the actual signals that a human must decide
// on before redistributing someone else's content: explicit reuse/attribution
// verbs, foreign copyright/trademark notices, and external license terms.
const thirdPartyReviewPatterns = [
  ["external attribution / reuse statement", /\b(?:adapted from|derived from|forked from|ported from|originally (?:from|by|written by)|copied from)\b|(?:改编自|衍生自|移植自|源自|fork\s*自)/i],
  ["copyright or trademark notice", /(?:©|\(c\)\s*\d{4}|all rights reserved|registered trademark|™|®|版权所有|著作权|保留所有权利)/i],
  ["external license terms", /(?:original (?:license|terms)|under (?:its|their|the original) license|subject to .{0,30}license|原始(?:协议|许可|条款)|第三方.{0,8}(?:协议|许可|条款))/i],
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
    pattern.lastIndex = 0;
    if (pattern.test(content)) matches.push(label);
  }
  if (matches.length > 0) {
    add(
      "WARNING",
      "Third-party/copyright review needs user decision",
      `${rel}: ${[...new Set(matches)].join(", ")}. Ask the user whether to keep, rewrite, attribute, or remove before publishing.`
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
  fmName = (block.match(/^name:\s*(.+)$/m)?.[1] ?? "").trim();
  fmDescription = (block.match(/^description:\s*(.+(?:\n\s+.+)*)$/m)?.[1] ?? "").replace(/\s+/g, " ").trim();
  fmVersion = (block.match(/^version:\s*(.+)$/m)?.[1] ?? "").trim();
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
const semverOk = /^\d+\.\d+\.\d+(?:[-+.][0-9A-Za-z.-]+)?$/.test(fmVersion);
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
const readmeMissingCount = results.filter((r) => r.title.startsWith("README missing")).length;
const structureFrac = Math.max(0, 10 - readmeMissingCount) / 10;
const readmeModernOk =
  !hasResult("must be Chinese") &&
  !hasResult("Missing README.en.md") &&
  !hasResult("language switch is not modern") &&
  !hasResult("Legacy README.zh.md");

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
    ["README.md Chinese-default + en switch", readmeModernOk, 4],
    ["README.en.md present", exists("README.en.md"), 4],
    ["README structure modules", structureFrac, 4],
    ["LICENSE present", exists("LICENSE"), 4],
  ]],
  ["Structure & hygiene", [
    ["SKILL.md within size budget", skillWeightOk, 5],
    ["no orphan files", orphanFiles.length === 0, 5],
    ["no broken references", !hasResult("Broken referenced file"), 5],
    [".gitignore present", exists(".gitignore"), 3],
    ["no tracked junk", !hasResult("Tracked generated"), 2],
  ]],
  ["Security & portability", [
    ["no secrets", !hasResult("Possible secret"), 8],
    ["no local absolute paths", !hasResult("Local absolute path"), 6],
    ["env hygiene", !hasResult("environment file") && !hasResult(".env.example contains"), 3],
    ["third-party content reviewed", !hasResult("Third-party/copyright review"), 3],
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
  engineeringScore >= 90 ? "A · Release-ready" :
  engineeringScore >= 75 ? "B · Good" :
  engineeringScore >= 60 ? "C · Needs work" :
  "D · Not ready";

const report = {
  summary: {
    status,
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
    console.log("- No blocking issues found.");
  }

  console.log(`\nEngineering score: ${engineeringScore}/100  (${band})`);
  for (const cat of scorecard) {
    console.log(`- ${cat.category}: ${cat.earned}/${cat.max}`);
    for (const it of cat.items) {
      if (!it.ok) console.log(`    ✗ ${it.label} (${it.earned}/${it.pts})`);
    }
  }
}

process.exit(fail.length > 0 ? 1 : 0);
