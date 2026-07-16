#!/usr/bin/env node

// Software-engineering quality scorecard for an agent-skill repository.
//
// This is a DIFFERENT lens from publish-check.mjs. publish-check answers
// "is this package release-safe and hygienic?". This module answers
// "as a piece of software, is it well engineered?" along the classic
// attributes: completeness, openness/extensibility, reusability, cohesion,
// coupling, robustness.
//
// Every sub-metric is traceable to concrete evidence. Markdown-dominant skills
// cannot be measured the way a code library can, so some metrics are proxies.
// Each item is tagged [det] (deterministic) or [proxy] (heuristic signal). The
// headline score is normalized from the [det] items ONLY, so the number rests on
// hard facts; [proxy] items are reported as advisory pass/fail but not scored.
//
// Usage: node scripts/se-quality.mjs [--json] [--report=PATH]

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const args = process.argv.slice(2);
const jsonOnly = args.includes("--json");
const reportPathArg = args.find((a) => a.startsWith("--report="))?.split("=")[1] ?? "se-quality-report.json";
const root = process.cwd();
const reportPath = path.resolve(root, reportPathArg);

const exists = (rel) => fs.existsSync(path.join(root, rel));
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const readSafe = (rel) => {
  try {
    return read(rel);
  } catch {
    return "";
  }
};
function git(a) {
  try {
    return execFileSync("git", a, { cwd: root, encoding: "utf8" }).trim();
  } catch {
    return "";
  }
}
function listFiles() {
  const visible = git(["ls-files", "--cached", "--others", "--exclude-standard"])
    .split("\n")
    .filter(Boolean)
    .filter((rel) => exists(rel));
  if (visible.length) return [...new Set(visible)];
  const out = [];
  (function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.name === ".git" || e.name === "node_modules") continue;
      const abs = path.join(dir, e.name);
      const rel = path.relative(root, abs).replaceAll(path.sep, "/");
      if (e.isDirectory()) walk(abs);
      else out.push(rel);
    }
  })(root);
  return out;
}

const files = listFiles().filter((rel) => !/(?:^|\/)(?:se-quality-report|publish-check-report|smoke-test-report)\.json$/.test(rel));
const allText = files
  .filter((rel) => !/\.(png|jpg|jpeg|gif|webp|pdf|zip|tar|gz)$/i.test(rel))
  .map((rel) => readSafe(rel))
  .join("\n");

const skill = exists("SKILL.md") ? read("SKILL.md") : "";
const fm = skill.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
const skillBody = skill.replace(/^---\n[\s\S]*?\n---/, "");

const refFiles = files.filter((r) => /^references\//.test(r));
const templateFiles = files.filter((r) => /^templates\//.test(r));
const scriptFiles = files.filter((r) => /^scripts\/.*\.(mjs|js|cjs)$/.test(r));
const referencedPaths = new Set(allText.match(/\b(?:references|templates|scripts|assets)\/[A-Za-z0-9._/-]+/g) || []);

// A repo is either a single-skill repo (root SKILL.md) or a marketplace/collection
// repo (.claude-plugin/marketplace.json). Single-skill-only metrics are marked N/A
// (excluded from the denominator) when they do not apply.
const isMarketplace = exists(".claude-plugin/marketplace.json");
let marketplace = null;
if (isMarketplace) {
  try {
    marketplace = JSON.parse(read(".claude-plugin/marketplace.json"));
  } catch {
    marketplace = null;
  }
}
const hasJsScripts = scriptFiles.length > 0; // JS helper scripts we can statically assess

// ---- helpers for individual signals -------------------------------------

function nodeChecks(rel) {
  try {
    execFileSync(process.execPath, ["--check", path.join(root, rel)], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

// Import graph among local scripts: does a script import/require another repo file?
function crossScriptImports() {
  for (const rel of scriptFiles) {
    const src = readSafe(rel);
    const specs = [...src.matchAll(/(?:import[^'"]*from\s*|require\(\s*)['"]([^'"]+)['"]/g)].map((m) => m[1]);
    for (const spec of specs) {
      if (spec.startsWith("./") || spec.startsWith("../")) {
        const resolved = path.normalize(path.join(path.dirname(rel), spec)).replaceAll(path.sep, "/");
        if (files.some((f) => f === resolved || f === `${resolved}.mjs` || f === `${resolved}.js`)) return true;
      }
    }
  }
  return false;
}

const permissiveLicense = /\b(MIT License|Apache License|BSD \d-Clause|ISC License|Mozilla Public License)\b/i.test(readSafe("LICENSE"));
// Openness about formats means "no proprietary / editor-locked / binary blobs",
// captured better by a denylist than by trying to enumerate every open extension
// (markdown, source, images, html, etc. are all fine).
const proprietaryFormat = /\.(docx?|xlsx?|pptx?|key|pages|numbers|sketch|fig|psd|ai|indd|cdr|exe|dll|so|dylib|class|jar|bin)$/i;
const onlyOpenFormats = files.every((rel) => !proprietaryFormat.test(rel));
const hardDepPhrase = /\b(?:requires? the [A-Za-z0-9_-]+ skill|depends on the [A-Za-z0-9_-]+ skill|必须(?:先)?安装[^\n]{0,20}skill|依赖[^\n]{0,20}skill)\b/i.test(allText);
// Exclude this checker from pattern-literal scans: its own source contains every
// detection regex, so scanning it would always self-match (false positive).
const isSelf = (rel) => /(?:^|\/)se-quality\.mjs$/.test(rel);
const networkCall = scriptFiles.filter((rel) => !isSelf(rel)).some((rel) => /\b(?:fetch\(|https?\.request|node-fetch|axios|got\()/.test(readSafe(rel)));
const scriptsTakeArgs = scriptFiles.length > 0 && scriptFiles.every((rel) => /process\.argv|process\.env/.test(readSafe(rel)));
const scriptsHaveTryCatch = scriptFiles.length > 0 && scriptFiles.every((rel) => /try\s*{/.test(readSafe(rel)));
const scriptsGuardInputs = scriptFiles.length > 0 && scriptFiles.every((rel) => /existsSync|exists\(|try\s*{/.test(readSafe(rel)));
const scriptsSignalFailure = scriptFiles.some((rel) => /process\.exit\(\s*(?![0-9]*0\s*\))/.test(readSafe(rel)) || /\bfailed\b/i.test(readSafe(rel)));
const allScriptsParse = scriptFiles.length > 0 && scriptFiles.every((rel) => nodeChecks(rel));

const skillSections = (skillBody.match(/^##\s+/gm) || []).length;
const nestedSkillWrapper = files.some((rel) => /^skills\/.+\/SKILL\.md$/.test(rel));
const refSizes = refFiles.map((rel) => readSafe(rel).split(/\r?\n/).length);
const avgRefLines = refSizes.length ? refSizes.reduce((a, b) => a + b, 0) / refSizes.length : 0;
const orphanCount = [...refFiles, ...templateFiles, ...files.filter((r) => /^assets\//.test(r))].filter(
  (rel) => ![...referencedPaths].some((r) => r === rel || rel.startsWith(`${r}/`))
).length;
const brokenRefCount = [...new Set(skill.match(/\b(?:references|templates|scripts|assets)\/[A-Za-z0-9._/-]+/g) || [])].filter(
  (rel) => !exists(rel.replace(/[.,;:]$/, ""))
).length;
const readmeHasInstall = /(?:^##\s*(?:安装|怎么安装|Install|Installation))/im.test(readSafe("README.md"));
const readmeHasUsage = /(?:^##\s*(?:使用|快速开始|怎么使用|Quick Start|Usage))/im.test(readSafe("README.md"));
const extensionDocs = templateFiles.length > 0 && /(starting point|template|起点|模板|扩展|customi[sz]e)/i.test(allText);
const depsDeclared = /(?:\bgit\b)/.test(allText) && /\bnode(?:\.js)?\b/i.test(allText);
const drySplit = (skillBody.split(/\r?\n/).filter((l) => l.trim()).length <= 400) && refFiles.length >= 3;

// ---- content-craftsmanship signals (borrowed from skill-validator-style
// content metrics) ---------------------------------------------------------
// These measure how the SKILL.md reads, not just whether sections exist —
// catching thin/placeholder sections, narrative-not-instructional prose, and
// vague-not-specific guidance. Reported as advisory (proxy), per the earlier
// "proxy out of total score" decision; flip to [det] to make them count.
function sectionWordCounts(body) {
  const sections = [];
  let cur = null;
  for (const ln of body.split(/\r?\n/)) {
    const h = ln.match(/^#{2,3}\s+(.+)/);
    if (h) {
      cur = { title: h[1].trim(), words: 0 };
      sections.push(cur);
    } else if (cur) {
      cur.words += (ln.trim().match(/\S+/g) || []).length;
    }
  }
  return sections;
}
const skillSections2 = exists("SKILL.md") ? sectionWordCounts(skillBody) : [];
// A section with almost no body is a placeholder — exactly the gap a
// "section exists" structure check would wave through.
const noThinSections = exists("SKILL.md") ? skillSections2.every((s) => s.words >= 8) : null;

const bulletLines = skillBody.split(/\r?\n/).filter((l) => /^\s*(?:[-*]|\d+\.)\s+\S/.test(l));
const imperativeLed = /^\s*(?:[-*]|\d+\.)\s+(?:use|run|check|add|remove|avoid|do|don'?t|ensure|read|write|create|set|keep|prefer|treat|validate|generate|report|ask|confirm|skip|stop|normalize|migrate|never|always|call|pass|return|include|exclude|verify|review|update|fix|build|test|follow|apply)\b/i;
const imperativeRatio = bulletLines.length ? bulletLines.filter((l) => imperativeLed.test(l)).length / bulletLines.length : 0;
const instructional = exists("SKILL.md") ? bulletLines.length >= 5 && imperativeRatio >= 0.3 : null;

const codeBlocks = (skillBody.match(/```/g) || []).length / 2;
const pathTokens = (skillBody.match(/[\w.-]+\/[\w./-]+\.\w+/g) || []).length;
const exampleMarkers = (skillBody.match(/\b(?:example|e\.g\.)\b|例如|示例/gi) || []).length;
const hasSpecifics = exists("SKILL.md") ? codeBlocks + pathTokens + exampleMarkers >= 3 : null;

// Content-craftsmanship signals — how the SKILL.md reads, not just whether
// sections exist.
// Actionable specificity — vague hedging ("视情况而定 / as appropriate")
// dilutes instructions; >=3 occurrences reads as too soft.
const hedgePhrase = /建议|可以考虑|酌情|视情况(?:而定)?|根据情况|灵活(?:把握|应用|运用)|看情况|尽量|\bas appropriate\b|\bas needed\b|\bif appropriate\b|\buse (?:your )?judg?ment\b|\byou (?:might|may) (?:want|consider)\b|\bfeel free\b|\bwhere possible\b/gi;
const hedgeCount = exists("SKILL.md") ? (skillBody.match(hedgePhrase) || []).length : 0;
const lowHedging = exists("SKILL.md") ? hedgeCount < 3 : null;

// Failure-mode encoding — a skill should encode "if X fails -> Y" branches,
// not only the happy path.
const encodesFailureModes = exists("SKILL.md")
  ? /如果[^\n]{0,40}(?:失败|不行|没有|无法|出错)|否则|回滚|fall ?back|on failure|if [^\n]{0,40}\bfails?\b|when [^\n]{0,40}\bfails?\b|hard stop|stop and ask|退化为/i.test(skillBody)
  : null;

// Anti-examples / blacklist — a skill should say what NOT to do, not only
// what to do.
const hasAntiExamples = exists("SKILL.md")
  ? /不要|避免|禁止|反例|黑名单|\bdo not\b|\bdon'?t\b|\bnever\b|\bavoid\b|安全边界|safety boundar/i.test(skillBody)
  : null;

// Runtime-neutrality red-flag — phrasing that locks the skill to one runtime
// makes other agents reject it. Platform LISTS and install paths are fine;
// only single-runtime EXCLUSIVITY is flagged.
const runtimeLockText = [skill, readSafe("README.md"), readSafe("README.zh.md")].join("\n");
const runtimeNeutral = !/在\s*Claude Code\s*(?:里|中)|Claude Code skill\b|仅(?:适用于?|支持)\s*(?:Claude Code|Cursor|Codex)|(?:Cursor|Codex|Claude Code)\s+only\b|only works (?:in|with)\s+(?:Claude Code|Cursor|Codex)|只能在\s*(?:Claude Code|Cursor|Codex)/i.test(runtimeLockText);

// ---- rubric --------------------------------------------------------------
// [det] deterministic · [proxy] heuristic signal
const spec = [
  ["完整性 Completeness", [
    ["required artifacts present", "det", (isMarketplace
      ? [".claude-plugin/marketplace.json", "README.md", "LICENSE", ".gitignore"]
      : ["SKILL.md", "README.md", "LICENSE", ".gitignore"]).filter(exists).length / 4, 4],
    ["no broken references", "det", brokenRefCount === 0, 4],
    ["no orphan files", "det", orphanCount === 0, 4],
    ["self-test / evals present", "det", exists("scripts/smoke-test.mjs") || files.some((r) => /^evals\//.test(r)) || files.some((r) => /(?:^|\/)validate[^/]*\.(py|mjs|js)$/i.test(r)), 3],
    ["install + usage documented", "det", (readmeHasInstall ? 0.5 : 0) + (readmeHasUsage ? 0.5 : 0), 3],
  ]],
  ["开放性 Openness / Extensibility", [
    ["permissive open license", "det", permissiveLicense, 5],
    ["standard/open formats only", "det", onlyOpenFormats, 3],
    ["documented extension points", "proxy", extensionDocs, 4],
    ["bilingual docs", "det", exists("README.md") && exists("README.zh.md"), 2],
    ["external deps standard & declared", "proxy", depsDeclared && !hardDepPhrase, 2],
    ["runtime-neutral phrasing (cross-agent portable)", "proxy", runtimeNeutral, 0],
  ]],
  ["复用性 Reusability", [
    ["reusable units provided (templates/skills)", "det", isMarketplace ? files.some((r) => /skills\/.+\/SKILL\.md$/.test(r) || /commands\/.+\.md$/.test(r)) : templateFiles.length > 0, 4],
    ["scripts parameterized (CLI/env)", "proxy", scriptsTakeArgs, 4],
    ["self-contained (no hard skill/private dep)", "proxy", !hardDepPhrase, 4],
    ["DRY: detail pushed to references", "proxy", drySplit, 4],
  ]],
  ["高内聚 Cohesion", [
    ["single responsibility (one skill = one repo)", "det", !nestedSkillWrapper, 4],
    ["references split into focused files", "proxy", refFiles.length >= 4 && avgRefLines <= 250, 4],
    ["scripts single-responsibility (split by role)", "proxy", scriptFiles.length >= 2, 4],
    ["SKILL.md sectioned by concern (>=5 sections)", "det", exists("SKILL.md") ? skillSections >= 5 : null, 4],
  ]],
  ["低耦合 Coupling", [
    ["no hard cross-skill dependency", "proxy", !hardDepPhrase, 5],
    ["scripts don't import each other", "det", !crossScriptImports(), 5],
    ["references independently readable", "proxy", /read only what (?:is|you) need/i.test(skill) || refFiles.length >= 3, 4],
    ["no required network/service at runtime", "proxy", !networkCall, 4],
  ]],
  ["健壮性 Robustness", [
    // N/A when there are no JS helper scripts to assess (e.g. a pure-markdown
    // skill, or a marketplace repo whose tooling is non-JS) — excluded, not failed.
    ["scripts parse (node --check)", "det", hasJsScripts ? allScriptsParse : null, 4],
    ["error handling present (try/catch)", "det", hasJsScripts ? scriptsHaveTryCatch : null, 4],
    ["graceful on missing inputs (guards)", "det", hasJsScripts ? scriptsGuardInputs : null, 4],
    ["meaningful failure signaling", "det", hasJsScripts ? scriptsSignalFailure : null, 4],
  ]],
  // Borrowed content-quality signals. Advisory (proxy): they enrich the readout
  // with how the docs READ, without moving the deterministic score. N/A for a
  // marketplace repo (no root SKILL.md to assess).
  ["文档质量 Doc craftsmanship (advisory)", [
    ["no thin/placeholder sections", "proxy", noThinSections, 0],
    ["instructional (imperative-led steps)", "proxy", instructional, 0],
    ["concrete specifics (code/paths/examples)", "proxy", hasSpecifics, 0],
    ["low hedging language (actionable, not vague)", "proxy", lowHedging, 0],
    ["encodes failure modes (if X fails -> Y)", "proxy", encodesFailureModes, 0],
    ["lists anti-examples / what not to do", "proxy", hasAntiExamples, 0],
  ]],
];

// The headline score is built from the deterministic [det] items only, so the
// number rests on hard facts. The [proxy] items are heuristic signals: shown as
// advisory pass/fail but NOT folded into the score (they would otherwise inflate
// confidence). The det points are normalized to 0-100.
let detEarned = 0;
let detMax = 0;
let proxyPositive = 0;
let proxyTotal = 0;
const scorecard = spec.map(([category, items]) => {
  let cDetEarned = 0;
  let cDetMax = 0;
  const detailed = items.map(([label, kind, val, pts]) => {
    if (val === null) {
      // N/A — does not apply to this repo; excluded from score and proxy counts.
      return { label, kind, counted: false, na: true, earned: null, pts, ok: true };
    }
    const frac = typeof val === "number" ? Math.max(0, Math.min(1, val)) : val ? 1 : 0;
    const ok = frac >= 1;
    if (kind === "det") {
      const got = Math.round(frac * pts * 10) / 10;
      cDetEarned += got;
      cDetMax += pts;
      return { label, kind, counted: true, earned: got, pts, ok };
    }
    proxyTotal += 1;
    if (ok) proxyPositive += 1;
    return { label, kind, counted: false, earned: null, pts, ok };
  });
  cDetEarned = Math.round(cDetEarned * 10) / 10;
  detEarned += cDetEarned;
  detMax += cDetMax;
  return { category, detEarned: cDetEarned, detMax: cDetMax, items: detailed };
});
const score = Math.round((detEarned / detMax) * 100);
const band =
  score >= 90 ? "A · 工程优秀" :
  score >= 75 ? "B · 工程良好" :
  score >= 60 ? "C · 有待加固" :
  "D · 工程薄弱";

const mode = isMarketplace ? "marketplace" : "single-skill";
const report = {
  summary: { score, band, mode, deterministicPoints: `${detEarned}/${detMax}`, proxySignals: `${proxyPositive}/${proxyTotal}`, checkedAt: new Date().toISOString() },
  scorecard,
};
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

if (jsonOnly) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(`SE quality score: ${score}/100  (${band})  — deterministic core only · ${mode} repo`);
  console.log(`- proxy signals (advisory, not scored): ${proxyPositive}/${proxyTotal} positive`);
  console.log(`- report: ${path.relative(root, reportPath)}`);
  for (const cat of scorecard) {
    console.log(`\n[${cat.category}] ${cat.detEarned}/${cat.detMax}`);
    for (const it of cat.items) {
      if (it.na) {
        console.log(`   – ${it.label} [n/a]`);
        continue;
      }
      const tag = it.counted ? `[det]  ${it.earned}/${it.pts}` : "[proxy · advisory]";
      console.log(`   ${it.ok ? "✓" : "✗"} ${it.label} ${tag}`);
    }
  }
}
