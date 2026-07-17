#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const jsonOnly = args.includes("--json");
const reportPathArg = args.find((arg) => arg.startsWith("--report="))?.split("=")[1] ?? "smoke-test-report.json";

const skillRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const reportPath = path.resolve(skillRoot, reportPathArg);
const results = [];

function add(name, status, detail = "") {
  results.push({ name, status, detail });
}

function rel(abs) {
  return path.relative(skillRoot, abs).replaceAll(path.sep, "/");
}

function exists(relativePath) {
  return fs.existsSync(path.join(skillRoot, relativePath));
}

function read(relativePath) {
  return fs.readFileSync(path.join(skillRoot, relativePath), "utf8");
}

function pass(name, detail = "") {
  add(name, "passed", detail);
}

function fail(name, detail = "") {
  add(name, "failed", detail);
}

function expectFile(relativePath) {
  if (exists(relativePath)) pass(`file exists: ${relativePath}`);
  else fail(`file exists: ${relativePath}`, "Missing required file.");
}

for (const relativePath of [
  "SKILL.md",
  "README.md",
  "README.zh.md",
  "LICENSE",
  ".gitignore",
  "references/pre-publish-flow.md",
  "references/publish-checklist.md",
  "references/readme-style.md",
  "references/security-checklist.md",
  "references/update-workflow.md",
  "references/github-workflow.md",
  "templates/README.md",
  "templates/README.zh.md",
  "templates/README.hero.md",
  "templates/README.hero.zh.md",
  "templates/LICENSE-MIT",
  "templates/gitignore",
  "scripts/publish-check.mjs",
  "scripts/smoke-test.mjs",
]) {
  expectFile(relativePath);
}

if (exists("SKILL.md")) {
  const skill = read("SKILL.md");
  const frontmatter = skill.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatter) {
    fail("SKILL.md frontmatter", "Missing YAML frontmatter.");
  } else {
    let ok = true;
    for (const key of ["name", "description"]) {
      if (!new RegExp(`^${key}:\\s*\\S`, "m").test(frontmatter[1])) {
        ok = false;
        fail("SKILL.md frontmatter", `Missing ${key}.`);
      }
    }
    if (/^version:\s*\S/m.test(frontmatter[1])) {
      ok = false;
      fail("SKILL.md frontmatter", "Move top-level version to metadata.version.");
    }
    if (ok) pass("SKILL.md frontmatter");
  }

  const referenced = new Set(skill.match(/\b(?:references|templates|scripts|assets)\/[A-Za-z0-9._/-]+/g) || []);
  let allReferencesExist = true;
  for (const relativePath of referenced) {
    if (!exists(relativePath)) {
      allReferencesExist = false;
      fail("referenced file exists", relativePath);
    }
  }
  if (allReferencesExist) pass("referenced files exist", `${referenced.size} references checked.`);
}

const languageSwitchFiles = [
  "README.md",
  "README.zh.md",
  "templates/README.md",
  "templates/README.zh.md",
  "templates/README.hero.md",
  "templates/README.hero.zh.md",
];

let languageSwitchOk = true;
for (const relativePath of languageSwitchFiles) {
  if (!exists(relativePath)) continue;
  const firstLines = read(relativePath).split(/\r?\n/).slice(0, 12).join("\n");
  if (/\[(中文|English) README\]|中文 README|English README/.test(firstLines)) {
    languageSwitchOk = false;
    fail("language switch labels", `${relativePath} contains redundant README label near the top.`);
  }
}
if (languageSwitchOk) pass("language switch labels", "Use language names only.");

if (exists("references/pre-publish-flow.md")) {
  const flow = read("references/pre-publish-flow.md");
  const hasSummary = flow.includes("Final Pre-publish Summary");
  const hasConfirm = flow.includes("Publish to GitHub");
  if (hasSummary && hasConfirm) pass("final publish confirmation documented");
  else fail("final publish confirmation documented", "Missing final summary or publish confirmation wording.");
}

if (exists("references/publish-checklist.md")) {
  const checklist = read("references/publish-checklist.md");
  const requiredItems = [
    "Final publish confirmation",
    "程序或页面截图",
    "Screenshot was shown to the user before publishing",
    "node scripts/smoke-test.mjs",
    "node scripts/publish-check.mjs",
    ".env.example",
    "Explicit publish authorization exists",
    "edit-plus-publish wording",
  ];
  const missing = requiredItems.filter((item) => !checklist.includes(item));
  if (missing.length === 0) pass("publish checklist contains release gates");
  else fail("publish checklist contains release gates", `Missing: ${missing.join(", ")}`);
}

if (exists("references/readme-style.md")) {
  const style = read("references/readme-style.md");
  const requiredItems = [
    "Program or Page Screenshot",
    "for a web page, open the page in a browser",
    "for a desktop/app program, launch the real program",
    "show the screenshot to the user",
  ];
  const missing = requiredItems.filter((item) => !style.includes(item));
  if (missing.length === 0) pass("README style contains screenshot workflow");
  else fail("README style contains screenshot workflow", `Missing: ${missing.join(", ")}`);
}

if (exists("templates/LICENSE-MIT")) {
  const license = read("templates/LICENSE-MIT");
  if (/MIT License/.test(license)) pass("MIT license template");
  else fail("MIT license template", "Template does not look like MIT.");
}

if (exists("scripts/publish-check.mjs")) {
  try {
    execFileSync("node", ["scripts/publish-check.mjs", "--readme-no-impact"], {
      cwd: skillRoot,
      encoding: "utf8",
      stdio: "pipe",
      timeout: 15000,
    });
    pass("publish-check script runs");
  } catch (error) {
    const output = `${error.stdout?.toString() ?? ""}${error.stderr?.toString() ?? ""}`.slice(-1200);
    fail("publish-check script runs", output);
  }
}

const summary = {
  passed: results.filter((result) => result.status === "passed").length,
  failed: results.filter((result) => result.status === "failed").length,
  checkedAt: new Date().toISOString(),
};

const report = {
  summary,
  results: results.map((result) => ({
    ...result,
    detail: result.detail.startsWith(skillRoot) ? rel(result.detail) : result.detail,
  })),
};

fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

if (jsonOnly) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log("Smoke test report");
  console.log(`- passed: ${summary.passed}`);
  console.log(`- failed: ${summary.failed}`);
  console.log(`- report: ${rel(reportPath)}`);

  for (const result of results) {
    const prefix = result.status === "passed" ? "PASS" : "FAIL";
    console.log(`- ${prefix} ${result.name}${result.detail ? `: ${result.detail}` : ""}`);
  }
}

if (summary.failed > 0) {
  process.exit(1);
}
