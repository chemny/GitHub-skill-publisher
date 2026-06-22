# GitHub-skill-publisher

[中文](README.md) · English

GitHub-skill-publisher turns a local agent skill into a single-skill GitHub repository that is ready for others to inspect, install, and reuse. It checks the README, license, repository shape, GitHub description, sensitive data, and platform compatibility. When publishing is involved, it shows the final release list first and waits for explicit approval.

## Who Is This For?

This skill is designed for:

- Skill authors who want to publish a local agent skill to GitHub.
- Maintainers who manage several skill repositories.
- Teams that want README, license, structure, and release checks to stay consistent.
- Users who want to check API keys, local paths, private files, and hidden dependencies before publishing.

## What It Does

It inspects the actual local files instead of relying on a verbal summary. That includes `SKILL.md`, README files, LICENSE, references, templates, scripts, `.env.example`, `.gitignore`, and Git state.

If the README is too thin, the default language is wrong, the English companion is missing, the repository description is empty, or the files contain tokens, local paths, account details, or private dependencies, it reports those issues before release. It only commits, pushes, or updates GitHub metadata after explicit publish authorization.

## Capabilities

| Capability | What it handles | Output |
|---|---|---|
| Pre-publish review | README, required files, Git state, sensitive data, dependencies, compatibility | A final checklist for deciding whether the skill is ready to publish |
| README writing | Chinese default README, English companion, first-screen copy, install and usage docs | Public documentation that works better on GitHub and is easier to install from |
| Sensitive-data review | API keys, tokens, accounts, local paths, logs, caches | Redaction, replacement, or removal before publishing |
| Completeness and dependency check | `SKILL.md`, references, templates, scripts, assets, dependencies on other skills | Missing-file, broken-reference, and hidden-dependency findings |
| Platform compatibility check | Codex, Claude Code, and OpenClaw installation/runtime assumptions | Clear compatibility notes and unverified risks before release |
| Repository structure check | Single-skill layout, root files, referenced paths | A repository others can install and understand |
| GitHub repository description | One-line GitHub profile and list-page description | Chinese by default, concrete, aligned with the README opening |
| Publish confirmation | File list, check results, remote target, remaining risks | Commit, push, or metadata updates only after user approval |

## Platform Compatibility

This workflow is intended for Codex, Claude Code, and OpenClaw skill repositories. For each target skill, compatibility still needs to be checked against its actual files, scripts, and dependencies.

## Install

```bash
git clone https://github.com/chemny/GitHub-skill-publisher.git
```

Place the cloned folder in the skills directory used by your agent, or import it using your agent's own skill installation flow. Keep `SKILL.md` at the root of that skill folder.

After installing, start a fresh agent session so it can rescan skills.

## Quick Start

Ask your agent:

```text
Use GitHub-skill-publisher to check whether the current skill is ready to publish on GitHub.
```

You should receive a pre-publish review covering README status, repository structure, required files, sensitive data, dependencies, platform compatibility, Git state, and recommended next steps.

## Usage Examples

Prepare a public release:

```text
Use GitHub-skill-publisher to prepare the current skill as a public GitHub repository.
```

Improve README files without publishing:

```text
Use GitHub-skill-publisher to rewrite this skill's Chinese README and English README with the current default structure, but do not publish yet.
```

Check release risks:

```text
Use GitHub-skill-publisher to check whether this skill contains API keys, user accounts, local paths, private files, or hard dependencies on other skills.
```

Edit and publish:

```text
Use GitHub-skill-publisher to update and publish this skill to GitHub.
```

## How It Works

The skill relies on three groups of files:

- README and LICENSE templates in `templates/`.
- Release rules, README guidance, compatibility checks, and security checklists in `references/`.
- Local report scripts in `scripts/`.

The local scripts only report findings:

```bash
node scripts/smoke-test.mjs
node scripts/publish-check.mjs
```

They do not commit, push, create repositories, delete files, or change GitHub state. Publishing always requires explicit user authorization.

## Repository Structure

```text
GitHub-skill-publisher/
├── SKILL.md
├── README.md
├── README.en.md
├── LICENSE
├── .gitignore
├── evals/
├── references/
│   ├── pre-publish-flow.md
│   ├── publish-checklist.md
│   └── ...
├── scripts/
│   ├── smoke-test.mjs
│   └── publish-check.mjs
└── templates/
```

## Requirements

- An agent environment that can read local `SKILL.md` files, such as Codex, Claude Code, or OpenClaw.
- `git` for repository status, commit history, and remote checks.
- Node.js for `scripts/smoke-test.mjs` and `scripts/publish-check.mjs`.
- GitHub CLI `gh` only when creating repositories, updating GitHub metadata, or pushing to GitHub.

## License

This repository is provided under the MIT License.

Third-party names, platform names, and upstream references remain subject to their original terms.
