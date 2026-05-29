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
Inspect -> Normalize -> Write README -> Vet -> Commit -> Publish or Push -> Verify
```

1. Inspect the local skill files and current git state.
2. Normalize to single-skill repository structure.
3. Write or update `README.md`, `README.zh.md`, `LICENSE`, and `.gitignore` when useful.
4. Generate or update GitHub repository metadata, especially the repository description.
5. Test platform compatibility where possible, then run portability and security checks.
   - Target platforms are Codex, Claude Code, and OpenClaw.
   - If a platform cannot be tested in the current environment, mark it `Not tested` and explain why.
   - If any platform is incompatible or only partially compatible, tell the user before publishing and pause for confirmation.
6. Commit only after the user is satisfied, unless the user explicitly asks to publish immediately.
7. Create the GitHub repository or push to the existing remote.
8. Verify URL, branch, remote, repository description, and clean working tree.

## Required references

Read only what is needed:

- `references/repo-structure.md` for repository layout rules.
- `references/readme-style.md` for the bilingual README style.
- `references/install-section.md` for skill installation instructions that README files should include.
- `references/platform-compatibility.md` before public release.
- `references/publish-checklist.md` before publishing.
- `references/security-checklist.md` before public release.
- `references/github-workflow.md` for first-time GitHub publishing.
- `references/update-workflow.md` for later updates.

## Templates

Use these as starting points, not rigid boilerplate:

- `templates/README.md`
- `templates/README.zh.md`
- `templates/LICENSE-MIT`
- `templates/gitignore`

The README templates intentionally omit a limitations section by default.
Use MIT for `LICENSE` unless the user requests another license.

## Collaboration rule

If the user asks for writing or README improvement, draft locally and discuss before pushing unless they explicitly say to sync or publish.

Before consequential GitHub actions, explain:

- target repository,
- visibility,
- branch,
- files being committed,
- expected result.

Proceed directly only when the user clearly asks to execute.

## Safety boundaries

- Do not ask the user to paste GitHub tokens.
- Prefer `gh auth login` browser/device authorization.
- Check for secrets, personal paths, local-only assumptions, and unsafe scripts before public release.
- Do not publish private or user-specific memory files.
- Do not force push unless the user explicitly requests it and understands the impact.
