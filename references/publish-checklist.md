# Publish Checklist

Run this checklist before publishing a skill repository.

## Repository

- [ ] Repository root is the skill root.
- [ ] `SKILL.md` is at the root.
- [ ] `README.md` exists.
- [ ] `README.zh.md` exists.
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
- [ ] Description explains what the skill does in one sentence.
- [ ] Description is concrete, not generic, empty, or only the skill name.
- [ ] Description matches the README value proposition.
- [ ] Topics are added when useful.

## Skill metadata

- [ ] `SKILL.md` has valid YAML frontmatter.
- [ ] Frontmatter includes `name`.
- [ ] Frontmatter includes a strong `description`.
- [ ] Description contains trigger phrases and task contexts.
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

## Automated publish check

- [ ] `node scripts/smoke-test.mjs` was run when available.
- [ ] Smoke test result is passing, or failures were fixed and the smoke test was re-run.
- [ ] `node scripts/publish-check.mjs` was run when available.
- [ ] Automated check result is `PASS` or all `FAIL` items have been fixed and the check was re-run.
- [ ] Any `WARNING` items were reviewed and either fixed or included in the final pre-publish summary.
- [ ] The automated checks did not publish, push, commit, delete files, or mutate GitHub state.

## README

- [ ] Explains why the skill exists.
- [ ] Explains who should use or install it.
- [ ] Names target users, target workflows, and non-target cases.
- [ ] Explains what problems it solves.
- [ ] Explains why it is worth installing.
- [ ] Explains what it can do.
- [ ] Explains how it works.
- [ ] Explains design principles and practical advantages.
- [ ] Reduces comprehension friction: reader can tell what it is and why it matters from the first screen.
- [ ] Reduces trust friction: mechanism and limits of authority are clear.
- [ ] Reduces action friction: install, verify, and first-use path are easy to follow.
- [ ] Uses baseline or full structure according to the skill's complexity.
- [ ] Includes diagrams only when process-oriented.
- [ ] Includes install instructions beyond a bare `git clone`.
- [ ] Explains `SKILL.md` must be at the skill root.
- [ ] Explains that a fresh agent session may be needed after installation.
- [ ] Includes a verification prompt.
- [ ] Includes a quick-start or first-success example.
- [ ] Includes update instructions.
- [ ] Includes usage examples.
- [ ] Includes repository structure generated from actual files.
- [ ] Explains license and copyright limits.
- [ ] `README.md` is English-only by default, except intentional language-switch labels.
- [ ] `README.zh.md` is complete Chinese documentation, not a short placeholder.
- [ ] `README.md` and `README.zh.md` link to each other near the top using a clear language switch.
- [ ] English and Chinese READMEs are aligned in substance.
- [ ] No accidental mixed-language README body unless the user explicitly requested a single bilingual README.
- [ ] No default limitations section unless the user asks for one.
- [ ] Repository structure, if shown, matches actual files.

## Portability

- [ ] Compatibility with Codex, Claude Code, and OpenClaw has been tested where possible.
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
- [ ] Summary included target repository, remote URL, branch, visibility, file list, README status, security result, completeness result, dependency result, compatibility result, GitHub metadata, warnings, and remaining risks.
- [ ] User explicitly confirmed publishing to GitHub before any commit, push, repository creation, sync, or GitHub metadata update.
