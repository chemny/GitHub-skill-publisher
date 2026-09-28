# README Visual Evidence

Both README.md and README.zh.md need an embedded visual by default, near the opening value proposition. This applies to new releases and updates, including private repositories. A lack of UI does not exempt an output-producing Skill.

## Choose Evidence

- UI tools: capture the actual running page or program using safe data.
- Image, course, design or document tools: reuse an approved real output. Keep its aspect ratio and explain whether it is a sample, reference or final deliverable.
- Workflow and CLI tools: prefer a real report/result preview if available. Never fabricate a screenshot or turn test results into an invented product UI.
- Use existing authorized assets before generating more. New generated illustrations must not be presented as screenshots or proof of tested functionality.
- Confirm rights, privacy and visual quality. Approval of unchanged existing samples can be reused; new images need review.

## Missing Images

If a suitable visual cannot be included, both READMEs must include a visible `## Why No Preview Image` / `## 暂无配图的原因` section with a specific constraint. Repeat the reason in the final publish summary. For example, explain that available outputs contain restricted client data and no sanitized sample is currently available. Do not use placeholders or only say "no UI". Do not invent a privacy constraint when approved assets are already available.

Missing both image and reason is FAIL, including with legacy/no-impact options. A concrete omission is WARNING requiring human review, not a claim of full visual acceptance. The checker cannot establish truth, aesthetic quality or authorization from text alone.

## Automated Checks

`scripts/readme-visuals.mjs` reads inline/reference-style Markdown images and HTML img tags, ignoring fenced code, inline code and HTML comments. Badges are not visual evidence. Local images must be nonempty supported image files inside the package; broken paths block even when another valid image exists. External URLs require manual rendering/access verification and remain WARNING; the checker makes no network requests.

The JSON report's `readmeVisuals` exposes per-language images, external images, invalid paths and omission reasons for the final summary. File checks do not certify successful rendering; inspect the actual preview before release. Run `node --test scripts/readme-visuals.test.mjs` to cover the gate and bypass cases.
