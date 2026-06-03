#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const args = process.argv.slice(2);
const jsonOnly = args.includes("--json");
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

for (const rel of ["SKILL.md", "README.md", "README.en.md", "LICENSE"]) {
  if (!exists(rel)) add("FAIL", "Missing required file", rel);
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
    const placeholder = value === "" || /^<[^>]+>$/.test(value) || /^(your_|example|placeholder|changeme|todo|xxx|dummy|null)$/i.test(value);
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
  ["Password assignment", /\bpassword\s*=\s*[^<\s][^\s]+/gi],
  ["Token assignment", /\btoken\s*=\s*[^<\s][^\s]+/gi],
  ["API key assignment", /\bapi[_-]?key\s*=\s*[^<\s][^\s]+/gi],
];

function shouldScanContent(rel) {
  return !rel.startsWith(".git/") && !rel.startsWith("node_modules/") && !/\.(png|jpg|jpeg|gif|webp|pdf|zip|tar|gz)$/i.test(rel);
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

for (const rel of trackedFiles) {
  if (/(\.DS_Store|\.log$|^dist\/|^build\/|^tmp\/|^cache\/|^\.cache\/|^node_modules\/|session|history)/i.test(rel)) {
    add("WARNING", "Tracked generated or local-output file", rel);
  }
}

const fail = results.filter((r) => r.level === "FAIL");
const warning = results.filter((r) => r.level === "WARNING");

const status = fail.length > 0 ? "FAIL" : warning.length > 0 ? "WARNING" : "PASS";
const report = {
  summary: {
    status,
    failed: fail.length,
    warnings: warning.length,
    checkedAt: new Date().toISOString(),
  },
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
}

process.exit(fail.length > 0 ? 1 : 0);
