#!/usr/bin/env node
// Frozen synthetic README contracts, not product or reader testing.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import assert from 'node:assert/strict';
const checker=fileURLToPath(new URL('./publish-check.mjs',import.meta.url));
const corpus=JSON.parse(fs.readFileSync(new URL('../evals/readme-check-cases.json',import.meta.url),'utf8'));
for(const c of corpus.cases) test(`${c.id}: ${c.label}`, () => {
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'publisher-d-case-'));const files={...corpus.base,...(c.files||{})};
 try{
  if(c.replace){const [f,old,next]=c.replace;if(!files[f].includes(old))throw Error('Missing mutation '+c.id);files[f]=files[f].replace(old,next);if(c.swap)files[f]=files[f].replace('## Preview','## Overview').replace('## TEMP','## Preview');}
  for(const [f,s] of Object.entries(c.append||{}))files[f]+=s;
  files['SKILL.md']='---\nname: fixture\ndescription: Use this skill when authors want to turn notes into useful content.\nmetadata:\n  version: "1.0.0"\n---\n\n# Fixture\n';files['LICENSE']='MIT License\n';files['.gitignore']='node_modules/\n.DS_Store\n';
  for(const [f,s] of Object.entries(files)){const p=path.join(root,f);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,s);}
  fs.mkdirSync(path.join(root,'assets'),{recursive:true});fs.writeFileSync(path.join(root,'assets/result.png'),Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jv1sAAAAASUVORK5CYII=','base64'));
  const reportPath=path.join(root,'publish-check-report.json');const run=spawnSync(process.execPath,[checker,'--json',`--report=${reportPath}`,...(c.args||[])],{cwd:root,encoding:'utf8',timeout:20000});
  let report;try{report=JSON.parse(run.stdout);}catch{throw Error(c.id+' invalid JSON '+run.stderr);}
  const e=c.expected;let passed=false;
  if(e.type==='issue')passed=report.results.some(r=>r.level===e.level&&new RegExp(e.pattern,'i').test(r.title)&&(!e.file||r.detail.startsWith(e.file)));
  if(e.type==='no_readme_fail')passed=!report.results.some(r=>r.level==='FAIL'&&/README/i.test(r.title));
  if(e.type==='visual_status')passed=report.readmeVisuals?.[e.file]?.status===e.status&&(!e.warning||report.results.some(r=>r.level==='WARNING'&&r.detail.startsWith(e.file)&&/preview/i.test(r.title)));
  if(e.type==='honest_blocked_report')passed=report.summary.status==='FAIL'&&report.summary.readiness==='blocked'&&!/release.ready/i.test(report.summary.band);
  if(e.type==='manual_review_required')passed=report.manualReview?.status==='required'&&report.manualReview?.automated===false&&report.summary.readiness==='review_required';
  if(e.type==='legacy_warning')passed=report.results.some(r=>r.level==='WARNING'&&/preserved|pass-through|legacy/i.test(r.title))&&!report.results.some(r=>r.level==='FAIL'&&/section|structure|capabilit|install requires rewrite/i.test(r.title));
  assert.ok(passed, JSON.stringify({ expected:c.expected, summary:report.summary, diagnostics:report.results }));
  assert.equal(run.status, report.summary.status === "FAIL" ? 1 : 0);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
