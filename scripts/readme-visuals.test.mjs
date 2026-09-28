#!/usr/bin/env node
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { inspectReadmeVisuals } from "./readme-visuals.mjs";

const checker = fileURLToPath(new URL("./publish-check.mjs", import.meta.url));
const reason = "## Why No Preview Image\nAvailable outputs contain restricted client data and no sanitized sample has been approved yet.";

test("all README template variants include preview and omission guidance", () => {
  for (const name of ["README.md", "README.zh.md", "README.hero.md", "README.hero.zh.md", "README.practical-tool.md", "README.practical-tool.zh.md"]) {
    const text = fs.readFileSync(new URL(`../templates/${name}`, import.meta.url), "utf8");
    assert.match(text, /!\[.*\]\(\.\/assets\/\{\{preview-file\}\}\)/, name);
    assert.match(text, /Why No Preview Image|暂无配图的原因/, name);
  }
});

function fixture(fn) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "readme-visuals-"));
  try {
    fs.mkdirSync(path.join(root, "assets"));
    // A real one-pixel PNG is enough for path checks, not visual acceptance.
    fs.writeFileSync(path.join(root, "assets", "result.png"), Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jv1sAAAAASUVORK5CYII=", "base64"));
    return fn(root);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
}

test("real output images count without a UI keyword or special section", () => fixture(root => {
  const result = inspectReadmeVisuals("# Course\n![Course output](assets/result.png)", root);
  assert.equal(result.status, "illustrated");
  assert.equal(result.images.length, 1);
}));

test("reference Markdown and HTML images are supported", () => fixture(root => {
  for (const input of [
    "![Output][sample]\n[sample]: assets/result.png",
    "![sample][]\n[sample]: assets/result.png",
    "![sample]\n[sample]: assets/result.png",
    '<img src="assets/result.png" alt="Output" width="400">',
    "![Output](<assets/result.png> \"Result\")",
  ]) assert.equal(inspectReadmeVisuals(input, root).status, "illustrated", input);
}));

test("badges and hidden/example images do not satisfy the requirement", () => fixture(root => {
  for (const input of ["No UI", "![Build badge](https://img.shields.io/badge/pass-green)",
    "```md\n![Output](assets/result.png)\n```", "~~~md\n![Output](assets/result.png)\n~~~",
    "<!-- ![Output](assets/result.png) -->", "`![Output](assets/result.png)`"])
    assert.equal(inspectReadmeVisuals(input, root).status, "missing", input);
}));

test("broken images cannot be excused by another image or a reason", () => fixture(root => {
  for (const src of ["assets/missing.png", "assets", "assets/%invalid.png", "{{preview}}.png", "file:///tmp/p.png"])
    assert.equal(inspectReadmeVisuals(`![Good](assets/result.png)\n![Bad](${src})\n${reason}`, root).status, "invalid");
  assert.equal(inspectReadmeVisuals("![Output][missing]", root).status, "invalid");
  fs.writeFileSync(path.join(root, "assets/empty.png"), "");
  assert.equal(inspectReadmeVisuals("![Output](assets/empty.png)", root).status, "invalid");
}));

test("only visible concrete omission reasons qualify for manual review", () => fixture(root => {
  assert.equal(inspectReadmeVisuals(reason, root).status, "omitted_with_reason");
  assert.equal(inspectReadmeVisuals("## 暂无配图的原因\n现有案例包含客户限制传播的资料，目前尚无获准展示的脱敏成果图，因此暂用文字说明交付范围。", root).status, "omitted_with_reason");
  for (const input of ["## Why No Preview Image\nThis skill has no user interface.",
    "<!-- " + reason + " -->", "## Why No Preview Image\n{{Reason must go here after review}}"])
    assert.equal(inspectReadmeVisuals(input, root).status, "missing");
}));

test("remote images are reported for verification, not certified offline", () => fixture(root => {
  const result = inspectReadmeVisuals("![Output](https://example.com/output.png)", root);
  assert.equal(result.status, "external_review");
  assert.equal(result.externalImages.length, 1);
}));

test("release gate checks both languages and cannot be bypassed by legacy/no-impact flags", () => fixture(root => {
  fs.writeFileSync(path.join(root, "SKILL.md"), "---\nname: fixture\ndescription: Use this skill when testing a release.\n---\n");
  fs.writeFileSync(path.join(root, "LICENSE"), "MIT License\n");
  fs.writeFileSync(path.join(root, "README.md"), "# Fixture\nEnglish | [中文](README.zh.md)\n![Output](assets/result.png)");
  fs.writeFileSync(path.join(root, "README.zh.md"), "# 示例\n无配图");
  const scan = () => {
    const run = spawnSync(process.execPath, [checker, "--json", "--allow-legacy-readme", "--readme-no-impact"], { cwd: root, encoding: "utf8" });
    assert.ok(run.stdout, run.stderr);
    return JSON.parse(run.stdout);
  };
  let report = scan();
  assert.ok(report.results.some(r => r.level === "FAIL" && r.title === "README missing preview image or omission reason" && r.detail.startsWith("README.zh.md")));
  fs.writeFileSync(path.join(root, "README.zh.md"), reason);
  report = scan();
  assert.equal(report.readmeVisuals["README.zh.md"].status, "omitted_with_reason");
  assert.ok(report.results.some(r => r.level === "WARNING" && r.title === "README preview omitted with reason"));
  fs.writeFileSync(path.join(root, "README.zh.md"), "![Output](assets/result.png)");
  report = scan();
  assert.ok(Object.values(report.readmeVisuals).every(r => r.status === "illustrated"));
  assert.equal(report.results.some(r => /README.*(?:preview|image)/.test(r.title)), false);
}));
