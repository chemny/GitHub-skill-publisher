#!/usr/bin/env node
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { markdownView, markdownLinks, markdownAnchors, inspectLocalLinks, tableRows } from './readme-document.mjs';
import { inspectReadmeVisuals } from './readme-visuals.mjs';
import { inspectReadme, README_SECTIONS } from './readme-check.mjs';
import { spawnSync, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

function fixture(fn) {
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'readme-reader-'));
  try { fs.mkdirSync(path.join(root,'assets')); fs.writeFileSync(path.join(root,'assets/result.png'),'path check fixture, not a real visual'); return fn(root); }
  finally { fs.rmSync(root,{recursive:true,force:true}); }
}
test('fences use matching character and at least opening length, including CRLF',()=>{
  const input='# Real\r\n````md\r\n## Fake\r\n```\r\n## Still fake\r\n`````\r\n## Actual\r\nBody\r\n';
  const view=markdownView(input);assert.deepEqual(view.headings.map(h=>h.title),['Real','Actual']);assert.equal(view.blocks.length,1);
  assert.equal(markdownLinks('````\n[a](missing.md)\n```\n[b](also-missing.md)\n````').length,0);
});
test('comments and inline code do not expose links; escaped pipes remain a cell',()=>{
  assert.deepEqual(markdownLinks('<!-- [a](missing.md) -->\n`[b](missing.md)`'),[]);
  assert.deepEqual(tableRows('| Item | Requirement |\n|---|---|\n| A | X \\| Y |').rows[2].cells,['A','X | Y']);
});
test('inline, reference, HTML and nested-parenthesis links are read',()=>{
  const links=markdownLinks('[a](docs/a(b).md)\n[b][guide]\n[c](<docs/c d.md>)\n[guide]: docs/g.md\n<a href="docs/h.md">HTML</a>');
  assert.deepEqual(links.map(l=>l.target),['docs/a(b).md','docs/g.md','docs/c d.md','docs/h.md']);
});
test('duplicate, Unicode and explicit anchors resolve, fake code headings do not',()=>{
  const anchors=markdownAnchors('# Title\n## 快速开始\n## Repeat\n## Repeat\n<a id="custom"></a>\n```md\n## Fake\n```');
  assert.ok(anchors.has('快速开始')&&anchors.has('repeat-1')&&anchors.has('custom'));assert.equal(anchors.has('fake'),false);
});
test('local links stay inside package, external HTTP remains unverified',()=>fixture(root=>{
  fs.writeFileSync(path.join(root,'README.md'),'# Title\n## Start\n');
  const result=inspectLocalLinks('[ok](#start)\n[bad](#absent)\n[out](../outside.md)\n[remote](https://example.com/guide)',root,'README.md');
  assert.equal(result.broken.length,2);assert.equal(result.external.length,1);
}));
test('only actual image location counts even when another image shares its alt',()=>fixture(root=>{
  const input='# Tool\n## Preview\n![Same](https://example.com/result.png)\n## Features\n![Same](assets/result.png)';
  assert.equal(inspectReadmeVisuals(input,root,{previewOnly:true}).status,'external_review');
}));
test('Preview reference images may use definitions after the section',()=>fixture(root=>{
  const input='# Tool\n## Preview\n![Result][shot]\n## Features\nSome text.\n[shot]: assets/result.png';
  assert.equal(inspectReadmeVisuals(input,root,{previewOnly:true}).status,'illustrated');
}));
test('labelled Overview illustrations can omit Preview in either language, while false placements remain blocked',()=>fixture(root=>{
  const corpus=JSON.parse(fs.readFileSync(new URL('../evals/readme-check-cases.json',import.meta.url)));
  fs.writeFileSync(path.join(root,'LICENSE'),'MIT License\n');
  for(const [name,text] of Object.entries(corpus.base))fs.writeFileSync(path.join(root,name),text);
  for(const [name,text] of Object.entries(corpus.base)) {
    const zh=name==='README.zh.md';
    const input=text.replace(`## ${zh?'效果预览':'Preview'}\n\n`,'').replace(zh?'![文章成果]':'![Article result]',zh?'![能力示意图]':'![Capability illustration]');
    const report=inspectReadme(input,root,name);
    assert.deepEqual(report.findings,[],name);
    assert.equal(report.expectedSections.length,9);
    assert.equal(inspectReadmeVisuals(input,root,{previewOnly:true}).status,'illustrated');
    for(const bad of [input.replace(zh?'能力示意图':'Capability illustration','Result'),input.replace('assets/result.png','assets/missing.png'),input.replace('![','<!-- ![').replace('](./assets/result.png)','](./assets/result.png) -->')]) {
      assert.ok(inspectReadme(bad,root,name).findings.some(f=>/missing section/.test(f.title)),name);
      assert.notEqual(inspectReadmeVisuals(bad,root,{previewOnly:true}).status,'illustrated');
    }
    const moved=input.replace(/!\[[^\]]*\]\(\.\/assets\/result.png\)/,'')+'\n![Capability illustration](./assets/result.png)\n';
    assert.equal(inspectReadmeVisuals(moved,root,{previewOnly:true}).status,'missing');
    assert.ok(inspectReadme(moved,root,name).findings.some(f=>/missing section/.test(f.title)));
  }
}));
test('bad image outside Preview is still a blocker; fenced fake preview is ignored',()=>fixture(root=>{
  assert.equal(inspectReadmeVisuals('# Tool\n## Preview\n![Result](assets/result.png)\n## Features\n![Bad](missing.png)',root,{previewOnly:true}).status,'invalid');
  assert.equal(inspectReadmeVisuals('````md\n## Preview\n![Result](assets/result.png)\n```\n````',root,{previewOnly:true}).status,'missing');
}));
test('in-section omission remains a candidate for manual review, hidden/no-UI cannot qualify',()=>fixture(root=>{
  for(const body of ['No UI.','<!-- Available client results cannot be shared until their owners approve. -->']) assert.equal(inspectReadmeVisuals('## Preview\n'+body,root,{previewOnly:true}).status,'missing');
  assert.equal(inspectReadmeVisuals('## Preview\nCurrent results contain restricted client data and a sanitized public example is awaiting approval.',root,{previewOnly:true}).status,'omitted_with_reason');
}));
test('all six templates follow the single authority and paired subsection names',()=>fixture(root=>{
  const standard=fs.readFileSync(new URL('../references/readme-style.md',import.meta.url),'utf8');
  const rows=[...standard.matchAll(/^\| (\d+) \| ([^|]+) \| ([^|]+) \|/gm)].slice(0,10);
  assert.deepEqual(rows.map(m=>m[2].trim()),README_SECTIONS.en);assert.deepEqual(rows.map(m=>m[3].trim()),README_SECTIONS.zh);
  for(const name of ['README.md','README.zh.md','README.hero.md','README.hero.zh.md','README.practical-tool.md','README.practical-tool.zh.md']) {
    const content=fs.readFileSync(new URL('../templates/'+name,import.meta.url),'utf8');
    const report=inspectReadme(content,root,name,{template:true});assert.deepEqual(report.findings,[],name);
  }
}));
test('unclosed code fence and empty feature cells cannot certify documentation',()=>fixture(root=>{
  const base=JSON.parse(fs.readFileSync(new URL('../evals/readme-check-cases.json',import.meta.url))).base['README.md'];
  assert.ok(inspectReadme(base+'\n```md\nHidden',root,'README.md').findings.some(f=>/unclosed code fence/.test(f.title)));
  assert.ok(inspectReadme(base.replace('| Writing | Turn notes into an article. |','| Writing | |'),root,'README.md').findings.some(f=>/two-column/.test(f.title)));
  assert.ok(inspectReadme(base.replace('| Capability | What it helps you do |','| Input | Output |'),root,'README.md').findings.some(f=>/implementation-oriented/.test(f.title)));
}));
test('developer template-like code needs review rather than an ordinary-user scaffold failure',()=>fixture(root=>{
  const base=JSON.parse(fs.readFileSync(new URL('../evals/readme-check-cases.json',import.meta.url))).base['README.md'];
  const report=inspectReadme(base.replace('Write a short social post based on this article.','render "{{name}}"'),root,'README.md',{audience:'developer'});
  assert.ok(report.findings.some(f=>f.level==='WARNING'&&/placeholder/.test(f.title)));
  assert.equal(report.findings.some(f=>f.level==='FAIL'&&/placeholder/.test(f.title)),false);
}));
test('source changes require both modern READMEs; no-impact cannot hide a broken link',()=>fixture(root=>{
  const corpus=JSON.parse(fs.readFileSync(new URL('../evals/readme-check-cases.json',import.meta.url)));
  for(const [name,text] of Object.entries(corpus.base))fs.writeFileSync(path.join(root,name),text);
  fs.writeFileSync(path.join(root,'SKILL.md'),'---\nname: fixture\ndescription: Use this skill when testing current documentation requirements.\n---\n');
  fs.writeFileSync(path.join(root,'LICENSE'),'MIT License\n');
  const git=(...args)=>execFileSync('git',args,{cwd:root,stdio:'pipe'});
  git('init');git('add','.');git('-c','user.name=Fixture','-c','user.email=fixture@example.com','-c','commit.gpgsign=false','commit','-m','isolated test baseline');
  fs.appendFileSync(path.join(root,'SKILL.md'),'\nChanged behavior.\n');fs.appendFileSync(path.join(root,'README.md'),'\n');
  const scan=(...args)=>JSON.parse(spawnSync(process.execPath,[fileURLToPath(new URL('./publish-check.mjs',import.meta.url)),'--json',...args],{cwd:root,encoding:'utf8'}).stdout);
  assert.ok(scan().results.some(r=>r.level==='FAIL'&&r.title==='README sync review required'));
  fs.appendFileSync(path.join(root,'README.zh.md'),'\n');assert.equal(scan().results.some(r=>r.title==='README sync review required'),false);
  fs.appendFileSync(path.join(root,'README.md'),'\n[Broken](missing.md)\n');assert.ok(scan('--readme-no-impact').results.some(r=>r.level==='FAIL'&&/broken local link/.test(r.title)));
}));
