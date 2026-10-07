#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { markdownView } from './readme-document.mjs';

// A small reader for the image forms used by GitHub READMEs, not a renderer.
export function inspectReadmeVisuals(content, root, { previewOnly = false } = {}) {
  root = fs.realpathSync(root);
  const visible = markdownView(content).prose;
  const sections = markdownView(content).sections;
  const preview = sections.find(s => /^(Preview|效果预览)$/i.test(s.title));
  const overview = sections.find(s => /^(Overview|项目简介)$/i.test(s.title));
  const features = sections.find(s => /^(Features|核心功能)$/i.test(s.title));
  const previewText = preview ? markdownView(preview.rawBody).prose : '';
  const definitions = new Map([...visible.matchAll(/^ {0,3}\[([^\]]+)\]:\s*(?:<([^>]+)>|(\S+))/gm)]
    .map(m => [m[1].trim().toLowerCase(), m[2] || m[3]]));
  const images = [...visible.matchAll(/!\[([^\]]*)\]\(\s*(?:<([^>]+)>|([^\s)]+))(?:\s+["'][^\n]*?["'])?\s*\)/g)]
    .map(m => ({ alt: m[1], src: m[2] || m[3], index: m.index }));
  for (const m of visible.matchAll(/!\[([^\]]*)\](?:\[([^\]]*)\]|(?![\[(]))/g)) {
    const key = (m[2] || m[1]).trim().toLowerCase();
    images.push({ alt: m[1], src: definitions.get(key) || "", unresolved: key, index: m.index });
  }
  for (const m of visible.matchAll(/<img\b[^>]*>/gi)) {
    const src = m[0].match(/\bsrc\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const alt = m[0].match(/\balt\s*=\s*["']([^"']*)["']/i);
    images.push({ alt: alt?.[1] || "", src: src ? src[1] || src[2] || src[3] || "" : "", index: m.index });
  }
  const candidates = images.filter(i => !/badge|shields\.io|\/workflows\/|\/actions\/workflows\/|徽章/i.test(i.src + " " + i.alt));
  const valid = [], invalid = [], external = [];
  for (const item of candidates) {
    const src = item.src;
    if (!src || /\{\{|\}\}|<[^>]*>/.test(src)) { invalid.push(src || `unresolved image: ${item.unresolved || item.alt}`); continue; }
    if (/^https?:\/\//i.test(src)) { external.push(src); continue; }
    if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|[\\/])/i.test(src)) { invalid.push(src); continue; }
    try {
      const resolved = path.resolve(root, decodeURIComponent(src.split(/[?#]/)[0]));
      const relative = path.relative(root, fs.realpathSync(resolved));
      if (relative.startsWith(".." + path.sep) || relative === ".." || path.isAbsolute(relative) ||
          !/\.(png|jpe?g|gif|webp|svg|avif)$/i.test(resolved) ||
          !fs.statSync(resolved).isFile() || fs.statSync(resolved).size === 0) throw new Error("invalid image");
      valid.push(src);
    } catch { invalid.push(src); }
  }
  // Check every image path. A labelled illustration in Overview can fold the
  // visual duty into that section when Preview is absent; images elsewhere
  // cannot bypass the placement rule. Labels are declarations, not pixel proof.
  const offset = line => visible.split('\n').slice(0, line - 1).reduce((n, s) => n + s.length + 1, 0);
  const inside = (item, section) => section && item.index >= offset(section.line + 1) && item.index < offset(section.endLine);
  const headinglessCandidates = !preview && overview && features && overview.line < features.line
    ? candidates.filter(i => inside(i, overview) && /\billustration\b|示意图/i.test(i.alt)) : [];
  const headinglessSources = new Set(headinglessCandidates.map(i => i.src));
  const inVisualArea = src => candidates.some(i => i.src === src && inside(i, preview)) || headinglessSources.has(src);
  const scopedValid = previewOnly ? valid.filter(inVisualArea) : valid;
  const scopedExternal = previewOnly ? external.filter(inVisualArea) : external;
  const headinglessIllustration = headinglessCandidates.some(i => valid.includes(i.src) || external.includes(i.src));
  const reasonMatch = !previewOnly && visible.match(/^##\s+(?:Why No Preview Image|暂无配图的原因|未配图原因)\s*\r?\n([\s\S]*?)(?=^##\s|$(?![\s\S]))/im);
  const previewReason = previewText.replace(/^\s*#{1,6}\s+.+$/gm, '')
    .replace(/!\[[^\]]*\](?:\([^)]*\)|\[[^\]]*\])?/g, '')
    .replace(/<img\b[^>]*>/gi, '').replace(/^ {0,3}\[[^\]]+\]:.*$/gm, '').trim();
  const reason = reasonMatch?.[1]?.trim() || previewReason;
  const concreteReason = [...reason].length >= 24 && !/\{\{|\b(?:TODO|TBD|N\/A)\b|待补充/i.test(reason) &&
    !/^(?:This skill (?:has no|does not have) (?:a )?(?:UI|user interface)|No (?:UI|user interface)|没有(?:独立)?(?:程序)?界面|无界面)[.。!！\s]*$/i.test(reason);
  return { images: scopedValid, externalImages: external, invalidImages: invalid,
    omissionReason: concreteReason ? reason : "",
    headinglessIllustration: Boolean(headinglessIllustration),
    scope: previewOnly ? headinglessIllustration ? 'labelled illustration in Overview' : 'Preview section' : 'whole README (legacy/direct inspection)',
    status: invalid.length ? "invalid" : scopedValid.length ? "illustrated" : scopedExternal.length ? "external_review" : concreteReason ? "omitted_with_reason" : "missing" };
}
