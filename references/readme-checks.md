# README checks and their limits

[readme-style.md](readme-style.md) remains the sole framework authority. [readme-review.md](readme-review.md) covers product facts and manual semantic acceptance. These scripts implement static checks; they do not approve publication.

## Run the checks

From the target repository:

```bash
node /path/to/publisher/scripts/publish-check.mjs --json --report=publish-check-report.json
```

The default audience is ordinary Agent Skill users. For a developer-facing application, CLI or library whose actual installation uses commands, select the applicable audience:

```bash
node /path/to/publisher/scripts/publish-check.mjs --readme-audience=developer
```

This changes installation-method checks, not the ten-section framework, links, visual evidence, safety or manual review requirements. Unknown audience values fail. Reviewers select the audience from actual product facts, not to hide an incompatible installation flow.

`--allow-legacy-readme` is for an explicitly authorized pass-through. It reports structural and format departures as warnings without claiming the new framework is satisfied. Broken local links, unresolved ordinary-user scaffolding, retained writer guidance, broken or missing visual evidence and safety failures are not waived. Developer code examples with template-like syntax produce a warning for manual review instead of automatically classifying all such syntax as unfinished prose. `--readme-no-impact` concerns reviewed change impact only; it does not skip README checks.

## Automated coverage

- Both public languages: the default ten Markdown level-two headings, order, duplicates, extra/empty sections, and opening language links. A labelled illustration in Overview may fold Preview into Overview, leaving nine headings; this exception requires a valid local or manually reviewed external image in that section.
- Features: a populated two-column table. Installation: Requirements then Quick Installation, an explanation before a two-column Item/Requirement table, actual named rows, and an audience-appropriate action.
- Local inline/reference/HTML links: existing paths, package boundary, URL-encoded paths and supported Markdown/explicit HTML anchors. HTTP URLs are listed but never fetched; mail links do not establish a approved or working contact route.
- Published prose/action/tree placeholders and retained template authoring comments. Templates are intentionally unfinished and are tested in a separate template mode, never used to waive release checks.
- Preview: inline/reference Markdown images and HTML img tags; path checks across the whole README, placement in Preview or the labelled Overview illustration form, badges/code/comments excluded, concrete in-section or nested omission candidates reported as warnings, and external images pending review.
- Report: automated PASS/WARNING/FAIL, separate engineering grade, `readiness: blocked` on any failure or `review_required` when static checks pass. `manualReview` always exposes unresolved human checks. High engineering scores never label a failed release as ready.

The shared reader supports the forms above, including backtick/tilde fences, matching fence lengths, escaped table pipes, CRLF, Unicode heading slugs and repeated heading suffixes. It is not a full CommonMark/GFM renderer. The default framework uses Markdown ATX headings. Complex HTML layout, unusual Markdown nesting, renderer-specific anchors, image pixels and external availability need rendered/manual review. A candidate omission reason is not certified as true or sufficient by its length check.

## What remains manual

Current-source truth, principal/supporting feature priority, representative first use, example coverage, four-section consistency, natural language, exclusion of maintenance history by meaning, bilingual fact parity, complete component duties, selected screenshot/case or generated-illustration quality, rights, scope and approval, author identity and intended contact route. Generated workflow illustrations are valid Preview assets when appropriately selected and labelled; the script checks asset presence/path/placement, not visual type, suitability or proof of execution. A missing material fact or failed semantic gate still prevents acceptance even when the automated report passes.

## Regression

Run the repository's existing smoke script and the complete suite:

```bash
node --test scripts/readme-check.test.mjs scripts/readme-document.test.mjs scripts/readme-visuals.test.mjs scripts/review-decisions.test.mjs
node scripts/smoke-test.mjs
```

[readme-check-cases.json](../evals/readme-check-cases.json) contains frozen synthetic document contracts, not actual product outputs. The suite checks both useful acceptance and precise diagnostics for negative cases. A negative case cannot pass merely because an unrelated failure exists. The reader tests also check template alignment with the authority. CI runs these on its configured operating systems; local results do not prove that remote Windows/Linux jobs have run.

Smoke checks the actual repository, including its current formal README. It can fail while unit/document fixtures pass when the repository has not yet been brought into line with the standard. Report and fix that release-surface gap rather than weakening the checks or treating the fixture score as release readiness.
