#!/usr/bin/env node
import { markdownView, tableRows, inspectLocalLinks, markdownLinks } from './readme-document.mjs';
import { inspectReadmeVisuals } from './readme-visuals.mjs';

export const README_SECTIONS = {
  en: ['Overview','Preview','Features','Installation','Quick Start','Usage Examples','How It Works','Repository Structure','License','About Me'],
  zh: ['项目简介','效果预览','核心功能','安装','快速开始','使用示例','工作原理','目录结构','许可','关于我'],
};

export function inspectReadme(content, root, filename, { audience = 'agent', legacy = false, template = false } = {}) {
  const cn = filename === 'README.zh.md' || filename.includes('.zh.');
  const expected = README_SECTIONS[cn ? 'zh' : 'en'];
  const view = markdownView(content); const findings = [];
  const styleLevel = legacy ? 'WARNING' : 'FAIL';
  const add = (title, detail, line = 1, level = styleLevel) => findings.push({ level, title, detail: `${filename}:${line}: ${detail}` });
  const sections = view.sections; const titles = sections.map(s => s.title);
  const headinglessIllustration = !titles.includes(expected[1]) && inspectReadmeVisuals(content, root, { previewOnly: true }).headinglessIllustration;
  const required = headinglessIllustration ? expected.filter((_, i) => i !== 1) : expected;
  for (const block of view.blocks) if (block.unclosed) add('README unclosed code fence', 'Close the example fence; later sections otherwise remain inside code.', block.startLine, 'FAIL');
  for (const name of required) {
    const matching = sections.filter(s => s.title === name);
    if (!matching.length) add(`README missing section: ${name}`, 'Use the agreed ten-section framework.');
    if (matching.length > 1) add('README duplicate section', name, matching[1].line);
  }
  for (const section of sections) {
    if (!expected.includes(section.title)) add('README unexpected section', section.title, section.line);
    const body = markdownView(section.rawBody);
    if (!body.prose.replace(/^\s*#{1,6} .+$/gm, '').trim() && !body.blocks.some(b => b.text.trim())) add('README empty section', section.title, section.line);
  }
  const present = titles.filter(t => required.includes(t));
  if (present.length === required.length && new Set(present).size === required.length && present.some((t,i) => t !== required[i])) add('README section order is incorrect', 'Follow the agreed reading order.');
  const features = sections.find(s => s.title === expected[2]);
  if (features) {
    const table = tableRows(features.rawBody);
    if (!table.rows.length || table.rows.length < 3 || table.rows.some(r => r.cells.length !== 2) || table.rows.slice(2).some(r => r.cells.some(c => !c))) add('README Features table is not two-column', 'Use capability + what it helps you do, with populated capability rows.', features.line);
    if (table.rows[0]?.cells.some(c => /^(Input|Output|What it handles|处理内容|输出结果)$/i.test(c))) add('README Features table uses implementation-oriented columns', 'Describe the useful task/result instead of internal Input/Output fields.', features.line);
  }
  const install = sections.find(s => s.title === expected[3]);
  if (install) {
    const sub = cn ? ['配置要求','快速安装'] : ['Requirements','Quick Installation'];
    if (install.subheadings.map(h => h.title).join('|') !== sub.join('|')) add('README installation subsections are incorrect', 'Use Requirements followed by Quick Installation.', install.line);
    const requirementHeading = install.subheadings.find(h => h.title === sub[0]);
    const actionHeading = install.subheadings.find(h => h.title === sub[1]);
    if (requirementHeading) {
      const lines = view.visible.split('\n');
      const end = install.subheadings.find(h => h.line > requirementHeading.line)?.line ?? install.endLine;
      const req = lines.slice(requirementHeading.line, end - 1).join('\n');
      const table = tableRows(req);
      if (!table.rows.length || table.rows.length < 3 || table.rows.some(r => r.cells.length !== 2) || table.rows.slice(2).some(r => r.cells.some(c => !c))) add('README requirements table is not two-column', 'Use Item / Requirement with populated requirements.', requirementHeading.line);
      if (!table.rows.length || !req.split('\n').slice(0, (table.line || 1) - 1).join('\n').trim()) add('README requirements explanation is missing', 'Briefly explain what is needed before the table.', requirementHeading.line);
      const header = cn ? ['项目','要求'] : ['Item','Requirement'];
      if (table.rows.length && (table.rows[0].cells.join('|') !== header.join('|') || table.rows.slice(2).some(r => /^(Basic|基本|基础)$/i.test(r.cells[0])))) add('README named requirement rows are missing', 'Name actual requirements instead of repeating Basic labels.', requirementHeading.line);
    }
    if (actionHeading && !template) {
      const rawLines = content.split(/\r?\n/);
      const action = rawLines.slice(actionHeading.line, install.endLine - 1).join('\n');
      if (audience === 'agent') {
        const hasUrl = /https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+/i.test(action);
        const hasIntent = /\binstall\b|安装/i.test(action);
        const manual = /\bgit\s+clone\b|\.[a-z][a-z0-9._-]*\/skills|手动安装|manual\s+install|pip(?:3)?\s+install|npm\s+install/i.test(action);
        if (!hasUrl || !hasIntent || manual) add('README install requires rewrite', 'Give one natural Agent installation request with the public repository URL.', actionHeading.line);
      } else if (!markdownView(action).prose.trim() && !markdownView(action).blocks.some(b => b.text.trim())) add('README installation action is empty', 'Use the supported install command or action for this audience.', actionHeading.line);
    }
  }
  const switchTarget = cn ? 'README.md' : 'README.zh.md';
  const opening = view.visible.split('\n').slice(0, sections[0]?.line - 1 || 30).join('\n');
  if (!markdownLinks(opening).some(link => link.target.replace(/^\.\//, '') === switchTarget)) add('README language switch is missing', `Link to ${switchTarget} before the sections.`);
  if (!template) {
    const placeholders = [...view.prose.matchAll(/\{\{[^\n{}]+\}\}|^\s*(?:TODO|TBD|待补充)\s*[.!。]?\s*$/gm)];
    for (const m of placeholders) add('README unresolved placeholder', m[0].trim(), view.prose.slice(0,m.index).split('\n').length, 'FAIL');
    for (const s of sections.filter(s => [expected[3],expected[4],expected[5],expected[7]].includes(s.title))) {
      for (const b of s.blocks) if (/\{\{[^\n{}]+\}\}/.test(b.text)) add('README unresolved placeholder', 'Resolve template values in user actions or the repository tree.', b.startLine, audience === 'developer' ? 'WARNING' : 'FAIL');
    }
    if (/<!--\s*(?:Writer guidance|写作指引|Internal semantic gates|内部语义门槛)/i.test(content)) add('README writer guidance remains', 'Remove template authoring comments before publication.', 1, 'FAIL');
  }
  const links = template ? {broken:[],external:[]} : inspectLocalLinks(content, root, filename);
  for (const link of links.broken) add('README broken local link', `${link.target || link.unresolved}: ${link.reason}`, link.line, 'FAIL');
  return { sections: titles, expectedSections: required, visualPresentation: headinglessIllustration ? 'illustration_in_overview' : 'preview_section', findings, links, audience, mode: legacy ? 'explicit_pass_through' : 'standard',
    scope: 'Static Markdown/document checks only. Product meaning, bilingual facts, visual type/scope and quality require manual review.' };
}

export function manualReadmeReview() {
  return { status: 'required', automated: false, checks: [
    'Product brief and principal versus supporting capabilities are source-grounded.',
    'Quick Start represents a principal result; examples cover main tasks in priority order.',
    'Overview, Features, Quick Start and examples agree with the product brief.',
    'Both languages state the same verified facts, conditions and components.',
    'Prompts are natural; current-use conditions remain; maintenance history is excluded by meaning.',
    'Preview uses a representative actual screenshot/case, or a grounded generated workflow/pain-point illustration when no suitable material is available; it is labelled, readable, approved and accurately scoped, not mistaken for execution evidence; omission/external images are reviewed.',
    'Approved author identity and intended public contact route are usable.',
  ] };
}
