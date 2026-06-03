---
name: GitHub-skill-publisher
description: Use this skill when the user wants to publish, update, package, document, or synchronize an agent skill to GitHub. It captures a single-skill-per-repository workflow, bilingual README writing style, GitHub repository creation, commit/push updates, publish readiness checks, Codex/Claude Code/OpenClaw compatibility checks, portability checks, and security review for public skill repositories.
version: 0.1.0
---

# GitHub-skill-publisher

Use this skill to turn a local agent skill into a polished single-skill GitHub repository and to maintain it over time.

This skill is for skill publishing workflows, not general Git tutorials.

## Core rule

The user's preferred structure is:

```text
one skill = one GitHub repository
```

The repository root is the skill root. Do not create a `skills/<name>/` wrapper unless the user explicitly asks for a collection repository.

## Publish authorization rule

This rule applies to GitHub-skill-publisher itself and to every other skill repository it publishes or updates.

Local edits and GitHub publication are separate actions. Use two authorization modes:

1. Local-only by default.
   - If the user says "修改", "更新", "调整", "写进去", "完善", or similar edit-only wording, make local changes only.
   - After local changes, report what changed and ask before any commit, push, repository creation, sync, publish, or GitHub metadata update.
2. Explicit edit-plus-publish authorization.
   - If the user says "修改并发布", "改完发布", "更新并同步到 GitHub", "修改后推送", "改完直接发布", or another unambiguous edit-plus-publish instruction, treat that as permission to publish after checks.
   - In this mode, do not ask for a second confirmation after successful checks.
   - Still stop and ask before publishing if checks fail, sensitive data is found, cleanup requires deletion/redaction/moving user files, compatibility is partial or unsupported, the remote/branch/visibility is ambiguous, or the publish action would be destructive such as force push.

Always run the relevant pre-publish checks and provide a publish summary before or during the final response.

## When to use

Use this skill when the user asks to:

- publish a skill to GitHub,
- update a skill repository,
- improve a skill README,
- create bilingual README files,
- prepare a skill for public release,
- check whether a skill is safe and portable before publishing,
- create a new GitHub repo for a skill,
- push local skill updates to GitHub.

## Standard workflow

```text
Inspect -> Normalize -> Write README -> Pre-publish cleanup -> Smoke test -> Publish check -> Final summary -> User confirmation -> Commit -> Publish or Push -> Verify
```

1. Inspect the local skill files and current git state.
2. Normalize to single-skill repository structure.
3. Write or update `README.md`, `README.en.md`, `LICENSE`, and `.gitignore` when useful.
4. Generate or update GitHub repository metadata, especially the repository description.
   - Use a Chinese repository description by default unless the user explicitly requests English or an international-facing repository.
   - The description should match the first-screen value proposition in `README.md`.
5. Create a pre-publish cleanup plan for drafts, caches, logs, generated output, and local-only files.
   - Do not automatically delete or move files when the action is destructive or ambiguous.
   - Ask the user before deletion, redaction, file moves, or any high-risk cleanup.
   - Use `.gitignore` as prevention, but also check tracked files with Git because `.gitignore` does not protect files already committed.
6. Run automated quality checks when possible.
   - Prefer `node scripts/smoke-test.mjs` from the skill repository when available.
   - Use the smoke test to verify the skill's own required files, references, templates, language switch style, and publish-check script.
7. Run automated publish checks when possible.
   - Prefer `node scripts/publish-check.mjs` from the skill repository when available.
   - The script must report `PASS`, `WARNING`, or `FAIL`; it must not commit, push, create repositories, or publish.
   - Treat `FAIL` as a hard stop until fixed.
8. Run completeness, dependency, sensitive-data, portability, and security checks.
   - Check for API keys, user accounts, private tokens, local paths, private files, and machine-specific assumptions.
   - Redact or replace sensitive/local-only content before publishing.
   - Check whether the skill is complete and whether it has hard dependencies on other skills or private local resources.
   - If a dependency is required, document it clearly or bundle/adapter-isolate it before publishing.
9. Test platform compatibility where possible.
   - Target platforms are Codex, Claude Code, and OpenClaw.
   - If a platform cannot be tested in the current environment, mark it `Not tested` and explain why.
   - If any platform is incompatible or only partially compatible, tell the user before publishing and pause for confirmation.
10. Present a final pre-publish summary after all content, including README files, has been generated and checked.
   - Include target repository, remote URL, branch, visibility, files to publish, README status, security result, completeness result, dependency result, compatibility result, GitHub metadata, warnings, and remaining risks.
   - Ask explicitly whether to publish to GitHub only when the user's current request did not already include explicit edit-plus-publish authorization.
11. Commit, create repositories, push, sync, or update GitHub metadata only after explicit publish authorization exists.
12. Create the GitHub repository or push to the existing remote.
13. Verify URL, branch, remote, repository description, and clean working tree.

## Required references

Read only what is needed:

- `references/repo-structure.md` for repository layout rules.
- `references/pre-publish-flow.md` for the full publish flow and confirmation gates.
- `references/readme-style.md` for the bilingual README style.
- `references/install-section.md` for skill installation instructions that README files should include.
- `references/skill-completeness.md` before public release.
- `references/platform-compatibility.md` before public release.
- `references/publish-checklist.md` before publishing.
- `references/security-checklist.md` before public release.
- `references/github-workflow.md` for first-time GitHub publishing.
- `references/update-workflow.md` for later updates.

## Scripts

Optional helper scripts:

```bash
node scripts/smoke-test.mjs
node scripts/publish-check.mjs
```

The smoke test script is a local quality gate. It verifies that this skill's own files, references, templates, and publish-check script are coherent.

The publish check script is a reporting gate only. It must never publish, push, commit, delete files, or mutate GitHub state.

## Templates

Use these as starting points, not rigid boilerplate:

- `templates/README.md`
- `templates/README.en.md`
- `templates/README.hero.md`
- `templates/README.hero.zh.md`
- `templates/LICENSE-MIT`
- `templates/gitignore`

Use `templates/README.md` and `templates/README.en.md` as the default Standard high-conversion README templates. `README.md` is Chinese by default for GitHub's repository homepage, and `README.en.md` is the English switch page. They prioritize user value, product pain, product highlights, workflow, optional preview, one-line installation, direct-use prompt, default configuration, final result, compatibility, and license.

The README templates intentionally omit a limitations section by default.
Use MIT for `LICENSE` unless the user requests another license.

## Collaboration rule

If the user asks for writing or README improvement, draft locally and discuss before pushing unless they explicitly say to sync or publish.

If the user explicitly asks to both modify and publish, complete the edits, run the checks, and publish without asking a second time unless a blocking risk appears.

Before consequential GitHub actions, explain:

- target repository,
- visibility,
- branch,
- files being committed,
- expected result.

For final publishing, provide the final pre-publish summary. Ask whether to publish only when publish authorization was not already explicit in the user's current request.

## Safety boundaries

- Do not ask the user to paste GitHub tokens.
- Prefer `gh auth login` browser/device authorization.
- Check for secrets, personal paths, local-only assumptions, and unsafe scripts before public release.
- Do not publish private or user-specific memory files.
- Do not force push unless the user explicitly requests it and understands the impact.
