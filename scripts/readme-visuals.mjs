#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

// A small reader for the image forms used by GitHub READMEs, not a renderer.
export function inspectReadmeVisuals(content, root) {
  root = fs.realpathSync(root);
  const visible = content.replace(/<!--[\s\S]*?-->/g, "")
    .replace(/^([ \t]*)(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1\2[^\n]*$/gm, "")
    .replace(/`[^`\n]*`/g, "");
  const definitions = new Map([...visible.matchAll(/^ {0,3}\[([^\]]+)\]:\s*(?:<([^>]+)>|(\S+))/gm)]
    .map(m => [m[1].trim().toLowerCase(), m[2] || m[3]]));
  const images = [...visible.matchAll(/!\[([^\]]*)\]\(\s*(?:<([^>]+)>|([^\s)]+))(?:\s+["'][^\n]*?["'])?\s*\)/g)]
    .map(m => ({ alt: m[1], src: m[2] || m[3] }));
  for (const m of visible.matchAll(/!\[([^\]]*)\](?:\[([^\]]*)\]|(?![\[(]))/g)) {
    const key = (m[2] || m[1]).trim().toLowerCase();
    images.push({ alt: m[1], src: definitions.get(key) || "", unresolved: key });
  }
  for (const m of visible.matchAll(/<img\b[^>]*>/gi)) {
    const src = m[0].match(/\bsrc\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const alt = m[0].match(/\balt\s*=\s*["']([^"']*)["']/i);
    images.push({ alt: alt?.[1] || "", src: src ? src[1] || src[2] || src[3] || "" : "" });
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
  const reasonMatch = visible.match(/^##\s+(?:Why No Preview Image|暂无配图的原因|未配图原因)\s*\r?\n([\s\S]*?)(?=^##\s|$(?![\s\S]))/im);
  const reason = reasonMatch?.[1].trim() || "";
  const concreteReason = [...reason].length >= 24 && !/\{\{|\b(?:TODO|TBD|N\/A)\b|待补充/i.test(reason) &&
    !/^(?:This skill (?:has no|does not have) (?:a )?(?:UI|user interface)|No (?:UI|user interface)|没有(?:独立)?(?:程序)?界面|无界面)[.。!！\s]*$/i.test(reason);
  return { images: valid, externalImages: external, invalidImages: invalid,
    omissionReason: concreteReason ? reason : "",
    status: invalid.length ? "invalid" : valid.length ? "illustrated" : external.length ? "external_review" : concreteReason ? "omitted_with_reason" : "missing" };
}
