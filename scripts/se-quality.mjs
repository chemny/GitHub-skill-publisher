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
  const visible = git(["ls-files", "--cached", "--others", "--exclude-standard"]).split("\n").filter(Boolean);
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
const onlyOpenFormats = files.every((rel) =>
  /\.(md|markdown|txt|json|ya?ml|mjs|cjs|js|ts|sh|toml|csv)$/i.test(rel) ||
  /(?:^|\/)(LICENSE|LICENSE-[A-Z]+|\.gitignore|gitignore|\.editorconfig)$/.test(rel)
);
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
const readmeHasInstall = /(?:^##\s*(?:安装|怎么安装|Install)|git clone)/im.test(readSafe("README.md"));
const readmeHasUsage = /(?:^##\s*(?:使用|快速开始|怎么使用|Quick Start|Usage))/im.test(readSafe("README.md"));
const extensionDocs = templateFiles.length > 0 && /(starting point|template|起点|模板|扩展|customi[sz]e)/i.test(allText);
const depsDeclared = /(?:\bgit\b)/.test(allText) && /\bnode(?:\.js)?\b/i.test(allText);
const drySplit = (skillBody.split(/\r?\n/).filter((l) => l.trim()).length <= 400) && refFiles.length >= 3;

// ---- rubric --------------------------------------------------------------
// [det] deterministic · [proxy] heuristic signal
const spec = [
  ["完整性 Completeness", [
    ["required artifacts (SKILL/README/LICENSE/.gitignore)", "det", ["SKILL.md", "README.md", "LICENSE", ".gitignore"].filter(exists).length / 4, 4],
    ["no broken references", "det", brokenRefCount === 0, 4],
    ["no orphan files", "det", orphanCount === 0, 4],
    ["self-test / evals present", "det", exists("scripts/smoke-test.mjs") || files.some((r) => /^evals\//.test(r)), 3],
    ["install + usage documented", "det", (readmeHasInstall ? 0.5 : 0) + (readmeHasUsage ? 0.5 : 0), 3],
  ]],
  ["开放性 Openness / Extensibility", [
    ["permissive open license", "det", permissiveLicense, 5],
    ["standard/open formats only", "det", onlyOpenFormats, 3],
    ["documented extension points", "proxy", extensionDocs, 4],
    ["bilingual docs", "det", exists("README.md") && exists("README.en.md"), 2],
    ["external deps standard & declared", "proxy", depsDeclared && !hardDepPhrase, 2],
  ]],
  ["复用性 Reusability", [
    ["reusable templates provided", "det", templateFiles.length > 0, 4],
    ["scripts parameterized (CLI/env)", "proxy", scriptsTakeArgs, 4],
    ["self-contained (no hard skill/private dep)", "proxy", !hardDepPhrase, 4],
    ["DRY: detail pushed to references", "proxy", drySplit, 4],
  ]],
  ["高内聚 Cohesion", [
    ["single responsibility (one skill = one repo)", "det", !nestedSkillWrapper, 4],
    ["references split into focused files", "proxy", refFiles.length >= 4 && avgRefLines <= 250, 4],
    ["scripts single-responsibility (split by role)", "proxy", scriptFiles.length >= 2, 4],
    ["SKILL.md sectioned by concern (>=5 sections)", "det", skillSections >= 5, 4],
  ]],
  ["低耦合 Coupling", [
    ["no hard cross-skill dependency", "proxy", !hardDepPhrase, 5],
    ["scripts don't import each other", "det", !crossScriptImports(), 5],
    ["references independently readable", "proxy", /read only what (?:is|you) need/i.test(skill) || refFiles.length >= 3, 4],
    ["no required network/service at runtime", "proxy", !networkCall, 4],
  ]],
  ["健壮性 Robustness", [
    ["scripts parse (node --check)", "det", allScriptsParse, 4],
    ["error handling present (try/catch)", "det", scriptsHaveTryCatch, 4],
    ["graceful on missing inputs (guards)", "det", scriptsGuardInputs, 4],
    ["meaningful failure signaling", "det", scriptsSignalFailure, 4],
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

const report = {
  summary: { score, band, deterministicPoints: `${detEarned}/${detMax}`, proxySignals: `${proxyPositive}/${proxyTotal}`, checkedAt: new Date().toISOString() },
  scorecard,
};
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

if (jsonOnly) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(`SE quality score: ${score}/100  (${band})  — deterministic core only`);
  console.log(`- proxy signals (advisory, not scored): ${proxyPositive}/${proxyTotal} positive`);
  console.log(`- report: ${path.relative(root, reportPath)}`);
  for (const cat of scorecard) {
    console.log(`\n[${cat.category}] ${cat.detEarned}/${cat.detMax}`);
    for (const it of cat.items) {
      const tag = it.counted ? `[det]  ${it.earned}/${it.pts}` : "[proxy · advisory]";
      console.log(`   ${it.ok ? "✓" : "✗"} ${it.label} ${tag}`);
    }
  }
}
