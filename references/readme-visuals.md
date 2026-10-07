# README Visual Evidence

Follow the framework in [readme-style.md](readme-style.md). Both README.md and README.zh.md need an embedded visual. Use Preview / 效果预览 for actual screenshots/cases. For a generated capability/workflow illustration, it may instead be embedded in Overview before Features without a separate heading; identify it as an illustration / 示意图 in alt text. This avoids labelling an explanation as an effect preview. Choose between the two forms below, including for private repositories. A suitable generated workflow illustration can satisfy Preview on its own; a real screenshot is not additionally required in that case.

## Choose between two visual forms

1. **Actual screenshots or cases, preferred.** Use screenshots from the Skill's actual work or a relevant real case/output. Choose material that represents its principal capabilities and the reader's problem, not merely an available image of a small supporting feature. For UI tools capture the actual running page/program; for content, design or workflow tools use a real deliverable, case or report. Inspect scope, rights, privacy and normal-size readability. If available material is unsuitable, incomplete, private or rejected by the owner, record why it is not selected rather than using it just because it exists.
2. **Generated workflow and pain-point illustration, fallback.** When no suitable actual screenshots/cases are available, generate a clear image from the verified product brief, the Skill's workflow and the problems it solves. Communicate the core task and useful outcome at a glance. Group supporting steps or review areas instead of listing every internal stage. Avoid turning the image into a dense rulebook; typography and colour should help the actual audience recognize the purpose. A landscape 16:9 image is acceptable; choose another ratio when it communicates better. Label it accurately as a workflow/capability illustration in the image or alt text, with at most one short scope line if needed. This is a valid primary Preview, not a requirement to create a fake UI or run the product solely to obtain screenshots.

A generated illustration explains capabilities and process. It does not prove execution, passing reviews, runtime compatibility or actual publication. Never invent audit scores, success receipts or interfaces. Use a real case when claiming results; do not present generated pictures as actual screenshots. A screenshot of one component does not prove the entire product either.

Use approved relevant existing assets first. Record internally the selected form, source or generation prompt, reason for selection, scope, verified capability basis, sample status where relevant, rights/privacy and user approval. The owner may reject otherwise real material when it fails to communicate the core purpose. Keep these records out of public prose.

## Storage, display and captions

For a concrete layout and wording reference, see the [approved Publisher capability illustration case](../examples/readme-visual/publisher-capability.md). Reuse its content-first selection, short capability labels and restrained hierarchy; do not treat its particular palette, three groups or review categories as a template for every Skill.

- Keep images in repository assets/ by default and use relative Markdown embeds in both language files. An asset that is not embedded does not satisfy the preview requirement.
- Choose dimensions to suit the interface, output or conceptual illustration; 16:9 is permitted, not mandatory. There is no universal pixel size or image count. Preserve the source aspect ratio and avoid stretching.
- Inspect the rendered README at normal reading size: key text must be legible and the useful result recognizable without inspecting raw pixels.
- Crop irrelevant regions where useful, while keeping the controls, labels and result context necessary to understand the demonstration. Do not crop away conditions or failures in a misleading way.
- Choose images whose result is understandable at a glance. Each needs a clear purpose and useful alt text. Default to no caption; add at most one short line when the scope or result needs clarification. Avoid multiple near-identical images.
- Do not enumerate controls or add paragraphs about source files, reproduction steps, environment or test status under the image. Record those facts, sample status, rights and approval in the internal [README review](readme-review.md). Put a necessary usage condition beside the relevant installation or use action. Useful alt text or a brief caption can identify a component-only preview without a long disclaimer.
- Keep the demonstrated facts aligned between the two languages; a shared image is acceptable when the accompanying explanation makes it understandable.

## Rights, privacy and review

Confirm rights, privacy and visual quality. Use safe sample data inside the real interface when private data cannot be shown, and identify the sample internally; add a short public label only when needed to prevent a misleading claim. Inspect account names, private document text, credentials and unintended screen regions before release.

Show new or changed screenshots, case outputs or generated illustrations to the user before publication. Reuse approval only for unchanged existing assets within the same applicable scope. Asset approval does not authorize publication. Do not remove or redact user assets automatically; follow the existing cleanup and review-decision rules.

## Missing images and migration

If neither a suitable actual screenshot/case nor a grounded generated illustration can be included, keep Preview / 效果预览 and visibly explain the specific constraint in both READMEs. Repeat it in the final publish summary. For example, available outputs may contain restricted client data and no sanitized sample may be available. Do not invent that constraint when approved assets already exist, use placeholders, or merely say “no UI.”

The checker recognizes a visible reason in Preview / 效果预览, including a nested omission heading. A standalone level-two Why No Preview Image / 暂无配图的原因 heading is a legacy pass-through form and receives a framework warning when explicitly preserved. It is not the default framework. The checker reports candidate reasons for human review; it cannot establish the truth or sufficiency of the explanation.

Missing both image and reason is FAIL, including with legacy/no-impact options. A concrete omission is WARNING requiring human review, not full visual acceptance. A screenshot is not required for every feature or for the generated-illustration route; report the chosen visual's scope honestly.

## Automated checks and human acceptance

scripts/readme-visuals.mjs reads inline/reference-style Markdown images and HTML img tags, ignoring fenced code, inline code and HTML comments. Badges are not evidence. Standard releases need the visual in Preview, or a labelled generated illustration inside Overview when Preview is omitted. Images elsewhere do not satisfy this placement rule. This headingless form changes presentation only, not the visual or manual acceptance requirement. All image paths are checked, including outside Preview. Local images must be nonempty supported image files inside the package; broken paths block even when another valid image exists. External URLs require manual rendering/access verification and remain WARNING; the checker makes no network requests.

The JSON report's readmeVisuals exposes per-language images, external images, invalid paths and omission reasons for the final summary. File checks cannot identify which visual form was used or certify product truth, readability, rights, approval, execution or successful rendering. Inspect the actual rendered preview and record those human review conclusions separately.

Run `node --test scripts/readme-check.test.mjs scripts/readme-document.test.mjs scripts/readme-visuals.test.mjs scripts/review-decisions.test.mjs` for document contracts, the shared reader, visual gates and review-decision regression. See [readme-checks.md](readme-checks.md). These tests do not certify aesthetics, source truth or ordinary-reader comprehension.
