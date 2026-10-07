# Publish Checklist

For identity/attribution confirmation, [review-decisions.md](review-decisions.md) takes precedence over blanket “ask the user” instructions below: reuse unchanged scoped explicit approvals and ask only about new/changed findings. Reuse is not publication authorization; a current publication hold must be respected.

Run this checklist before publishing a skill repository. [readme-style.md](readme-style.md) is the single authority for README order and information duties; this checklist verifies it without defining another framework.

## Repository

- [ ] Repository root is the skill root.
- [ ] `SKILL.md` is at the root.
- [ ] `README.md` exists.
- [ ] `README.zh.md` exists.
- [ ] Both READMEs embed representative actual screenshots/cases, or an approved generated illustration based on verified workflow and pain points when suitable material is unavailable. If neither form is possible, both state the actual omission reason; see [readme-visuals.md](readme-visuals.md).
- [ ] `LICENSE` exists.
- [ ] License is MIT unless the user requested another license.
- [ ] `.gitignore` exists if generated files may appear.
- [ ] Folder names are portable.
- [ ] Tracked files have been reviewed with Git, not only filtered by `.gitignore`.
- [ ] Drafts, caches, logs, generated output, and local-only files are either removed, ignored, or intentionally retained.

## Cleanup and environment files

- [ ] A cleanup plan was created before deletion, redaction, file moves, or high-risk cleanup.
- [ ] User confirmed any destructive or ambiguous cleanup before it was performed.
- [ ] `.env` is absent from tracked files.
- [ ] `.env.example`, if present, contains placeholders only, not real credentials or account values.
- [ ] `.gitignore` covers common generated output, dependency directories, local caches, and OS files.
- [ ] Ignored files were checked when relevant to make sure no sensitive generated output remains staged or tracked.

## GitHub repository metadata

- [ ] Repository description is filled in GitHub.
- [ ] Repository description is English by default unless the user explicitly requested Chinese.
- [ ] Description explains what the skill does in one sentence.
- [ ] Description is concrete, not generic, empty, or only the skill name.
- [ ] Description matches the README value proposition.
## Skill metadata

- [ ] `SKILL.md` has valid YAML frontmatter.
- [ ] Frontmatter includes `name`.
- [ ] Frontmatter includes a strong `description`.
- [ ] Description contains trigger phrases and task contexts.
- [ ] Version, when present, uses `metadata.version`; top-level `version` has been migrated.
- [ ] No private `local_updated_at` or machine-specific metadata is required for release.

## Completeness and dependencies

- [ ] Required files are present: `SKILL.md`, `README.md`, `README.zh.md`, `LICENSE`.
- [ ] Every reference, template, script, adapter, or asset mentioned by `SKILL.md` exists or is explicitly optional.
- [ ] Relative paths resolve from the skill root.
- [ ] The skill does not silently depend on another private skill.
- [ ] Required public dependencies are documented.
- [ ] Optional dependencies are marked optional.
- [ ] Private, local-only, or user-specific dependencies are removed or replaced before publishing.

## Sensitive data and local information

- [ ] API keys, passwords, private tokens, cookies, recovery codes, and webhook URLs are absent.
- [ ] User accounts, private emails, tenant IDs, cloud account IDs, and internal handles are absent or redacted.
- [ ] Local absolute paths and private workspace paths are absent or replaced with generic examples.
- [ ] Private memory files, session logs, caches, database paths, and history files are absent.
- [ ] Any redaction preserves useful installation or usage guidance.
- [ ] Sensitive-data scan was re-run after redaction.

## Third-party and copyright review

- [ ] Public files were checked for third-party names, brand names, platform names, copyright notices, trademark notices, upstream-source statements, and external license limits.
- [ ] Findings were not removed automatically.
- [ ] Findings were listed for the user with file paths and short context.
- [ ] User chose whether to keep, rewrite, add attribution, or remove each finding before publishing.
- [ ] Neutral references to design style, design language, and company names such as Apple, Anthropic, and Meta were allowed when they were only design or compatibility context and did not imply ownership, endorsement, copied assets, or relicensing.
- [ ] README and LICENSE findings involving other third parties were treated as high-priority review items when they included attribution, copyright, trademark, source, license, generated-by, or ownership language.
- [ ] Any retained third-party references are necessary for compatibility, installation, usage, attribution, or license clarity.
- [ ] No third-party endorsement, ownership, relicensing, or affiliation is implied unless documented.

## Identity and attribution metadata review

- [ ] `LICENSE`, README files, package manifests, citation files, source comments, generated assets, and public configuration were checked for author names, maintainer names, private emails, personal usernames, and social handles.
- [ ] Public files were checked for generator or tool watermarks such as `Generated by`, `Created with`, `Made with`, `Scaffolded by`, or equivalent Chinese wording.
- [ ] Git commit authors, emails, and signature metadata were reviewed before publishing.
- [ ] Findings were not removed automatically.
- [ ] Findings were listed for the user with file paths or Git metadata context.
- [ ] User chose whether to keep, anonymize, replace with organization identity, or remove each finding before publishing.

## Automated publish check

- [ ] `node scripts/smoke-test.mjs` was run when available.
- [ ] Smoke test result is passing, or failures were fixed and the smoke test was re-run.
- [ ] `node scripts/publish-check.mjs` was run when available.
- [ ] Automated check result is `PASS` or all `FAIL` items have been fixed and the check was re-run.
- [ ] Any `WARNING` items were reviewed and either fixed or included in the final pre-publish summary.
- [ ] The automated checks did not publish, push, commit, delete files, or mutate GitHub state.

## README

- [ ] Both languages follow the default ten sections and order (or fold a labelled capability illustration into Overview as allowed by the standard) in [readme-style.md](readme-style.md), or an explicitly requested pass-through exception is documented without a compliance claim.
- [ ] Overview makes the product, target users, problem and useful outcome understandable from the first screen.
- [ ] Preview / 效果预览 is second for screenshots/cases; a labelled generated capability illustration may be embedded in Overview without that heading, with the other sections unchanged. Legacy 程序或页面截图 / Program or Page Screenshot labels are handled as migration exceptions, not alternative defaults.
- [ ] Both languages embed representative actual screenshots/cases or an approved generated workflow/pain-point illustration; if neither route is possible, state the actual omission reason.
- [ ] Screenshot was captured from the real running page/program, an approved real case/output was reused, or the fallback illustration was generated from verified workflow and pain points; label illustrations and never present them as execution evidence.
- [ ] Screenshot was shown to the user before publishing, or the selected case/generated illustration was shown and approved when new or changed; unchanged applicable approval was reused within its scope.
- [ ] Images use valid package paths, normally assets/, preserve proportions, show readable key information and avoid misleading crops.
- [ ] Images are self-explanatory with useful alt text; no caption by default, at most one short line if needed. Source, sample, reproduction and rights facts are kept in the internal review, not paragraphs under the image.
- [ ] Rights, privacy, approval and actual rendered appearance were reviewed separately from file checks.
- [ ] Features uses a two-column user-facing capability/benefit table, ordered by importance, without implementation-oriented main columns.
- [ ] Installation has Requirements / 配置要求 (short explanation and named-item table) and Quick Installation / 快速安装 (actual action and feedback); ordinary users see the Agent and minimum core runtime, not internal dependency files/versions or platform test matrices. Necessary current limitations remain visible.
- [ ] Agent-facing installation gives one copy-ready request with the public repository URL; stale default clone/copy, directory-selection, dependency-command and restart instructions were rewritten.
- [ ] Other product types use their actual supported installation method and success feedback; no Agent-only flow is forced onto a CLI/library or application.
- [ ] The installation request asks the Agent to check and fill core environment gaps before installation, verify discovery/loading or readiness, and prepare optional features on demand; feedback distinguishes actual verification from unresolved conditions.
- [ ] Quick Start uses a short natural request/action for a representative core task; no compulsory generic post-prompt explanation; the five first-use questions are verified internally, not five mandatory public fields.
- [ ] Prompts/examples use the README language, are copy-ready, and do not require undisclosed services or missing samples.
- [ ] Usage Examples gives familiar scenario titles and short ordinary requests, adding only useful conditions/results; no repeated task cards or forced internal IDs/paths.
- [ ] How It Works gives the complete included sub-Skill/component inventory, responsibilities, entry point and supported collaboration/direct-use routes.
- [ ] Included components, optional plugins and external dependencies are distinguished; diagrams explain a real process when useful.
- [ ] Repository Structure matches actual principal files, sorts by functional importance with core content first and README/license last, explains installed versus checkout contents and links detailed documentation.
- [ ] License states the actual original/third-party rights boundaries; default MIT does not override existing or upstream licenses.
- [ ] About Me is last and uses an approved identity suited to the publication; when contact is intended, its public route is approved or recorded unresolved. Personal facts are not hard-coded in generic templates and missing facts were not invented.
- [ ] New or changed identity/attribution findings follow review-decisions.md; unchanged scoped approvals are reused.
- [ ] No update history, upgrade/migration/fix records, release procedures, developer logs or authoring conversation appear anywhere in the README body.
- [ ] Current dependency versions, genuine conditions/limitations and product publishing capabilities were retained where relevant; keywords alone were not used to delete legitimate content.
- [ ] Terms are understandable to the intended audience, repetition is minimized and essential conditions remain next to the action they affect.
- [ ] The current diff was reviewed for README impact; changed current product facts were reflected in both languages.
- [ ] A genuine no-impact reason was recorded before using --readme-no-impact; that flag does not waive structure or visual acceptance.
- [ ] Release surface is English README.md plus complete Chinese README.zh.md, with language-name-only reciprocal links near the top; any explicitly authorized legacy preservation is reported.
- [ ] Both languages align in facts, conditions, inventory and examples; technical identifiers do not count as accidental bilingual prose.
- [ ] Automated findings and semantic review are reported separately; older checker/template coverage gaps are manually reviewed and disclosed.
- [ ] Before/after reader evaluation uses previously agreed dimensions and a 10-point rubric, retained case outputs and the same evidence criteria; no predicted result is reported as an achieved score.

## Static README checks

- [ ] Both languages pass the static framework, section/table, link, placeholder and preview checks in [readme-checks.md](readme-checks.md); audience selection matches the actual product.
- [ ] Automated status and engineering grade are separate; FAIL means blocked, and a static pass still requires manual semantic/visual/fact review.
- [ ] The complete document/visual/review-decision regression suite ran; actual-repository smoke failures remain visible.

## README preparation and semantic evidence

- [ ] A local [review record](../templates/readme-review-record.md) follows [readme-review.md](readme-review.md), while [readme-style.md](readme-style.md) remains the sole framework authority.
- [ ] A product brief records audience, core problem/outcomes, main versus supporting tasks with evidence, representative first use and priority-ordered scenarios.
- [ ] Three independent manual product-fit gates pass with draft evidence: representative first use, main-scenario coverage/priority, four-section consistency. Failed/unresolved gates prevent semantic acceptance regardless of formatting scores.
- [ ] Material claims have current source/file-line evidence, method, status and section placement; required dependency manifests were inspected internally.
- [ ] Consequential gaps were resolved or recorded as release blockers; approved scoped decisions were reused. Missing author/visual facts were not invented or replaced with public filler.
- [ ] The ten reader questions have draft evidence; full component duties and the real tree were verified.
- [ ] First-use input availability, action, delivery, usefulness and next step were walked through from text; external conditions and unverified behavior are recorded.
- [ ] Naturalness, captions, requirements tables, jargon, prompt burden and repeated explanations were reviewed for the intended audience.
- [ ] Comparisons preserve the frozen rubric, common inputs and before/after evidence for every item; unlike historical scores are not compared.
- [ ] Automated document checks, manual review, separately authorized product tests and actual reader studies are reported separately, with skipped/not tested states explicit.

## Portability

- [ ] Compatibility with Codex, Claude Code, and OpenClaw has been tested where possible.
- [ ] OS compatibility with macOS and Windows has been tested where possible or explicitly reviewed when direct testing is unavailable.
- [ ] Missing macOS or Windows validation is reported to the user before publishing and treated as a pause point.
- [ ] Linux compatibility is treated as optional unless the user, repository, or documented runtime explicitly requires Linux.
- [ ] Windows compatibility was considered when scripts, installers, path handling, shell commands, browser automation, filesystem operations, or external CLIs are involved.
- [ ] Windows requirements such as Node.js, Git, Python, or GitHub CLI being available in `PATH` are documented when relevant.
- [ ] POSIX-only commands such as `bash`, `sh`, `sed`, `grep`, `xargs`, `cp`, `mv`, `rm`, or `chmod` are avoided in default flows or isolated behind documented adapters.
- [ ] Any untestable platform is marked `Not tested` with a reason.
- [ ] Any incompatible platform is marked `Unsupported` and reported to the user before publishing.
- [ ] Any partially compatible platform is marked `Partial` with exact limitations.
- [ ] README includes a concise compatibility sentence when publishing for broad use.
- [ ] Untested platforms are marked `Not tested`, not implied as supported.
- [ ] No absolute local paths such as `/Users/...`.
- [ ] No user-specific memory files.
- [ ] No local tool directories or local install assumptions unless explicitly documented as optional examples.
- [ ] Host-specific behavior is isolated in adapters.

## Git

- [ ] `git status` reviewed.
- [ ] Commit includes only intended files.
- [ ] Remote points to the intended GitHub repository.
- [ ] Branch is correct, usually `main`.
- [ ] Repository visibility matches user intent.
- [ ] GitHub repository description is verified after publish or update.

## Final publish confirmation

- [ ] All content, including README files, has been generated and checked.
- [ ] Final pre-publish summary was shown to the user.
- [ ] Summary included target repository, remote URL, branch, visibility, file list, README status, security result, third-party/copyright review result, identity/attribution metadata review result, completeness result, dependency result, compatibility result, GitHub metadata, warnings, and remaining risks.
- [ ] Summary included the README change-impact result: updated / no-impact with reason / blocked until README is updated.
- [ ] Summary included the preview paths and approval scope, or the exact omission reason for both languages. Missing image plus missing reason blocks release.
- [ ] Explicit publish authorization exists before any commit, push, repository creation, sync, or GitHub metadata update.
- [ ] If the current request used edit-only wording, the user was asked before publishing.
- [ ] If the current request used explicit edit-plus-publish wording, publishing proceeded after successful checks without a second confirmation.
- [ ] Publishing was paused if checks failed, sensitive data was found, cleanup was destructive or ambiguous, compatibility was partial/unsupported, remote/branch/visibility was ambiguous, or the action was destructive.
