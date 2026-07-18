# Publish Checklist

Run this checklist before publishing a skill repository.

## Repository

- [ ] Repository root is the skill root.
- [ ] `SKILL.md` is at the root.
- [ ] `README.md` exists.
- [ ] `README.zh.md` exists.
- [ ] If the skill has a web page, app, program, or other visual surface, a real screenshot asset exists in the repository.
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
- [ ] Any retained third-party references are necessary for compatibility, installation, usage, attribution, or license clarity.
- [ ] No third-party endorsement, ownership, relicensing, or affiliation is implied unless documented.

## Automated publish check

- [ ] `node scripts/smoke-test.mjs` was run when available.
- [ ] Smoke test result is passing, or failures were fixed and the smoke test was re-run.
- [ ] `node scripts/publish-check.mjs` was run when available.
- [ ] Automated check result is `PASS` or all `FAIL` items have been fixed and the check was re-run.
- [ ] Any `WARNING` items were reviewed and either fixed or included in the final pre-publish summary.
- [ ] The automated checks did not publish, push, commit, delete files, or mutate GitHub state.

## README

- [ ] Existing README was evaluated against the current default README structure before publishing.
- [ ] README template compliance was treated as a release quality gate, not only as writing guidance.
- [ ] Current diff was reviewed for README impact before publishing.
- [ ] User-visible changes to capability, usage, install flow, dependencies, compatibility, outputs, repository/file structure, templates, scripts, safety/copyright boundaries, or GitHub metadata were reflected in `README.md` and `README.zh.md`.
- [ ] If README was not updated, the change was confirmed as small/no-impact and the no-impact reason was included in the final pre-publish summary.
- [ ] `node scripts/publish-check.mjs --readme-no-impact` was used only after the diff was reviewed and README was confirmed unnecessary.
- [ ] Missing key modules were added unless the user explicitly requested a pass-through release.
- [ ] Explains why the skill exists.
- [ ] Explains who should use or install it.
- [ ] Names target users and target workflows.
- [ ] Explains what it can do.
- [ ] Explains how it works.
- [ ] Includes a “程序或页面截图” / “Program or Page Screenshot” / “Preview” section when the skill has a visual surface.
- [ ] Screenshot was captured by opening the real web page or real program, not by inventing a mock image.
- [ ] Screenshot is referenced from both `README.md` and `README.zh.md` when both files exist.
- [ ] Screenshot was shown to the user before publishing.
- [ ] Reduces comprehension friction: reader can tell what it is and why it matters from the first screen.
- [ ] Reduces trust friction: mechanism and limits of authority are clear.
- [ ] Reduces action friction: install, verify, and first-use path are easy to follow.
- [ ] Main install section has one copy-ready natural-language request asking the current Agent to install the public repository URL.
- [ ] Existing clone-and-copy installation prose was rewritten during README normalization before the final publish check.
- [ ] The default README install flow does not expose `git clone`, directory copying, platform paths, manual installation, dependency commands, or restart instructions.
- [ ] README does not include internal collaboration wording such as "after asking", "with your consent", "add this rule to your prompt/instructions", "rerun setup", "征得你同意", "加进提示词", or "重跑 setup".
- [ ] Uses baseline or full structure according to the skill's complexity.
- [ ] Includes diagrams only when process-oriented.
- [ ] Installation details are delegated to the current Agent, which selects the client-appropriate method and verifies the result.
- [ ] Includes a verification prompt.
- [ ] Includes a quick-start or first-success example.
- [ ] Includes usage examples.
- [ ] Includes core capabilities.
- [ ] Core capabilities table is user-facing and two-column: capability + what it helps the user do.
- [ ] Core capabilities table does not use implementation-oriented columns such as `处理内容`, `输出结果`, `Input`, `Output`, or `What it handles`.
- [ ] Includes requirements, configuration, or dependency assumptions when relevant.
- [ ] Includes repository structure generated from actual files.
- [ ] Explains license and copyright limits.
- [ ] Release surface was normalized by default for publisher-managed release.
- [ ] `README.md` is English by default because GitHub uses it as the repository homepage.
- [ ] `README.zh.md` is complete Chinese documentation, not a short placeholder.
- [ ] `README.md` and `README.zh.md` link to each other near the top using a clear language switch.
- [ ] Legacy `README.en.md` is absent unless the user explicitly requested a pass-through release that preserves old README files.
- [ ] If pass-through was explicitly requested, legacy `README.md` Chinese + `README.en.md` English was reported as a warning and `--allow-legacy-readme` was used.
- [ ] If pass-through was explicitly requested for any old README structure, missing current-template modules were reported as warnings.
- [ ] English and Chinese READMEs are aligned in substance.
- [ ] No accidental mixed-language README body unless the user explicitly requested a single bilingual README.
- [ ] No default limitations section unless the user asks for one.
- [ ] Repository structure, if shown, matches actual files.

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
- [ ] Summary included target repository, remote URL, branch, visibility, file list, README status, security result, third-party/copyright review result, completeness result, dependency result, compatibility result, GitHub metadata, warnings, and remaining risks.
- [ ] Summary included the README change-impact result: updated / no-impact with reason / blocked until README is updated.
- [ ] Summary included the screenshot path and whether the user approved the screenshot before publish.
- [ ] Explicit publish authorization exists before any commit, push, repository creation, sync, or GitHub metadata update.
- [ ] If the current request used edit-only wording, the user was asked before publishing.
- [ ] If the current request used explicit edit-plus-publish wording, publishing proceeded after successful checks without a second confirmation.
- [ ] Publishing was paused if checks failed, sensitive data was found, cleanup was destructive or ambiguous, compatibility was partial/unsupported, remote/branch/visibility was ambiguous, or the action was destructive.
