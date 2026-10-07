#!/usr/bin/env node
// Offline reader for the Markdown forms used by publisher-managed READMEs.
// It is not a renderer or a full CommonMark/GFM parser.
import fs from 'node:fs';
import path from 'node:path';

const blank = text => text.replace(/[^\n\r]/g, ' ');
export function markdownView(content) {
  const uncommented = content.replace(/<!--[\s\S]*?-->/g, blank);
  const lines = uncommented.split(/\r?\n/), visible = [], blocks = [];
  let fence = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (fence) {
      const close = line.match(/^ {0,3}(`+|~+)\s*$/);
      visible.push('');
      if (close && close[1][0] === fence.marker && close[1].length >= fence.length) {
        blocks.push({ ...fence, text: fence.lines.join('\n'), endLine: i + 1 }); fence = null;
      } else fence.lines.push(line);
      continue;
    }
    const open = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (open && !(open[1][0] === '`' && open[2].includes('`'))) {
      fence = { marker: open[1][0], length: open[1].length, info: open[2].trim(), startLine: i + 1, lines: [] };
      visible.push(''); continue;
    }
    visible.push(/^(?: {4}|\t)/.test(line) ? '' : line);
  }
  if (fence) blocks.push({ ...fence, text: fence.lines.join('\n'), endLine: lines.length, unclosed: true });
  const visibleText = visible.join('\n');
  // Match equal-length backtick spans; fenced blocks have already been removed.
  const prose = visibleText.replace(/(`+)([^\n]*?)\1(?!`)/g, blank);
  const headings = [];
  for (let i = 0; i < visible.length; i++) {
    const m = visible[i].match(/^ {0,3}(#{1,6})\s+(.+?)\s*$/);
    if (m) headings.push({ level: m[1].length, title: m[2].replace(/\s+#+\s*$/, '').replace(/[*`]/g, '').trim(), line: i + 1 });
  }
  const sections = headings.filter(h => h.level === 2).map((h, i, all) => {
    const endLine = all[i + 1]?.line ?? lines.length + 1;
    return { ...h, endLine, body: visible.slice(h.line, endLine - 1).join('\n'),
      rawBody: lines.slice(h.line, endLine - 1).join('\n'),
      blocks: blocks.filter(b => b.startLine > h.line && b.startLine < endLine),
      subheadings: headings.filter(s => s.level === 3 && s.line > h.line && s.line < endLine) };
  });
  return { visible: visibleText, prose, headings, sections, blocks };
}

export function tableRows(body) {
  const lines = markdownView(body).visible.split('\n');
  for (let i = 0; i < lines.length - 1; i++) {
    if (!/^\s*\|.*\|\s*$/.test(lines[i])) continue;
    const cells = line => line.trim().slice(1, -1).split(/(?<!\\)\|/).map(s => s.replace(/\\\|/g, '|').trim());
    if (!cells(lines[i + 1]).every(s => /^:?-{3,}:?$/.test(s))) continue;
    const rows = [];
    for (let j = i; j < lines.length && /^\s*\|.*\|\s*$/.test(lines[j]); j++) rows.push({ line: j + 1, cells: cells(lines[j]) });
    return { line: i + 1, rows };
  }
  return { rows: [] };
}

const refKey = s => s.trim().replace(/\s+/g, ' ').toLowerCase();
export function markdownLinks(content) {
  const text = markdownView(content).prose;
  const definitions = new Map();
  for (const m of text.matchAll(/^ {0,3}\[([^\]]+)\]:\s*(?:<([^>]+)>|(\S+))/gm)) definitions.set(refKey(m[1]), m[2] || m[3]);
  const links = [];
  const labels = /(!?)\[([^\]\n]+)\]/g;
  for (const m of text.matchAll(labels)) {
    if (m[1] || text[m.index - 1] === '!' || text[m.index - 1] === ']') continue; // Images and the second label of a reference link are not separate links.
    const end = m.index + m[0].length;
    if (text[end] === ':' || text[m.index - 1] === '\\') continue;
    let target = null, unresolved = '';
    if (text[end] === '(') {
      let i = end + 1;
      while (/\s/.test(text[i] || '') && i < text.length) i++;
      if (text[i] === '<') {
        const finish = text.indexOf('>', i + 1);
        if (finish !== -1) target = text.slice(i + 1, finish);
      } else {
        const start = i; let depth = 0;
        for (; i < text.length; i++) {
          if (text[i] === '\\') { i++; continue; }
          if (text[i] === '(') depth++;
          if (text[i] === ')') { if (!depth) break; depth--; }
          if (/\s/.test(text[i]) && !depth) break;
        }
        target = text.slice(start, i).replace(/\\([() ])/g, '$1');
      }
    } else if (text[end] === '[') {
      const finish = text.indexOf(']', end + 1);
      if (finish !== -1) { const key = refKey(text.slice(end + 1, finish) || m[2]); target = definitions.get(key) ?? ''; unresolved = target ? '' : key; }
    } else if (definitions.has(refKey(m[2]))) target = definitions.get(refKey(m[2]));
    if (target !== null) links.push({ target, unresolved, line: text.slice(0, m.index).split('\n').length });
  }
  for (const m of text.matchAll(/<a\b[^>]*\bhref\s*=\s*["']([^"']*)["'][^>]*>/gi)) links.push({ target: m[1], line: text.slice(0, m.index).split('\n').length });
  return links;
}

export function markdownAnchors(content) {
  const anchors = new Set(), seen = new Map();
  for (const h of markdownView(content).headings) {
    const slug = h.title.toLowerCase().replace(/<[^>]*>/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .replace(/[^\p{L}\p{N}\p{M}_\-\s]/gu, '').replace(/\s/g, '-');
    const n = seen.get(slug) || 0; seen.set(slug, n + 1); anchors.add(n ? `${slug}-${n}` : slug);
  }
  for (const m of markdownView(content).visible.matchAll(/\b(?:id|name)\s*=\s*["']([^"']+)["']/gi)) anchors.add(m[1]);
  return anchors;
}

export function inspectLocalLinks(content, root, filename) {
  root = fs.realpathSync(root);
  const broken = [], external = [];
  for (const link of markdownLinks(content)) {
    let target = link.target;
    if (/^https?:\/\//i.test(target)) { external.push(link); continue; }
    if (/^mailto:/i.test(target)) continue;
    try {
      if (!target || link.unresolved || /^(?:[a-z][a-z0-9+.-]*:|\/\/|[\\/])/i.test(target) || target.includes('\\')) throw Error('invalid local target');
      const hash = target.indexOf('#'); const fragment = hash < 0 ? '' : decodeURIComponent(target.slice(hash + 1));
      const pathname = decodeURIComponent((hash < 0 ? target : target.slice(0, hash)).split('?')[0]);
      if (pathname.includes('\0')) throw Error('invalid path');
      const resolved = fs.realpathSync(path.resolve(root, path.dirname(filename), pathname || path.basename(filename)));
      const relative = path.relative(root, resolved);
      if (relative === '..' || relative.startsWith('..' + path.sep) || path.isAbsolute(relative)) throw Error('outside repository');
      if (fragment && (!fs.statSync(resolved).isFile() || !markdownAnchors(fs.readFileSync(resolved, 'utf8')).has(fragment))) throw Error('missing anchor');
    } catch (error) { broken.push({ ...link, reason: error.message }); }
  }
  return { broken, external };
}
