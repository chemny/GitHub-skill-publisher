# GitHub-skill-publisher

[中文](README.md) · English

Publish a local agent skill to GitHub **safely and consistently**, and give it a **quantified engineering-quality check** before release. It inspects the real files, runs three layers of checks, lays out a release checklist, and only commits and pushes after you confirm — it never publishes on its own.

## Who Is This For?

- Authors who have written an agent skill and want to publish it to GitHub.
- Maintainers of several skill repositories who want README / license / structure / checks to stay consistent.
- Anyone who wants to scan for secrets, local paths, and private dependencies before release — and to know whether the skill is actually well built.

## What Problem It Solves

Publishing a skill by hand hits three traps: **inconsistent quality** (thin README, drifting structure, forgotten license, empty repo description), **security leaks** (API keys, local paths, private files, or someone else's copyrighted content in examples), and **no objective gauge** (nobody can say whether it's good before it ships). This skill turns those into a repeatable flow plus automated checks and quantified scores.

## Core Capabilities

| Capability | What It Helps You Do |
|---|---|
| Pre-publish review | Check README, required files, Git state, sensitive data, dependencies, and compatibility before release. |
| Three-layer scoring | Produce reproducible scores for package consistency, release hygiene, and software-engineering quality. |
| Sensitive-data scan | Catch API keys, tokens, accounts, local paths, logs, and caches before they reach a public repository. |
| Third-party / attribution review | Surface upstream references, copyright/trademark notices, and external license terms for a deliberate decision. |
| Bilingual README + repo description | Create or repair the Chinese-default README, English companion, and GitHub first-screen description. |
| Multi-shape support | Recognize single-skill and marketplace repos, then flag phrasing that can break cross-agent installation. |

## Three-Layer Quality Check (the core value)

Three checks run before release, each answering a different question — all **report-only, never push**:

| Tool | Question it answers | Output |
|---|---|---|
| `smoke-test.mjs` | Is the package self-consistent? | Per-item self-check of required files / references / templates (PASS/FAIL) |
| `publish-check.mjs` | **Can I publish?** | Release gate `PASS/WARNING/FAIL` + engineering-hygiene score (metadata / docs / structure / security / tooling, 5 groups, 0–100) |
| `se-quality.mjs` | **As software, is it well built?** | Software-engineering quality score (completeness / openness / reusability / cohesion / coupling / robustness, 0–100) |

The scoring stays **honest**: only deterministic checks (`det`) count toward the number; heuristic signals (`proxy`) are advisory and never scored; inapplicable items are marked `N/A` and excluded; and it states plainly that it **does not test functional correctness** — so the score never gives false confidence.

## Platform Compatibility

Works with Codex, Claude Code, OpenClaw, and 50+ skills-compatible runtimes. It recognizes both **single-skill repos** and **marketplace collection repos** (`.claude-plugin/marketplace.json`), and flags "only works in runtime X" phrasing that would make other agents refuse to install the skill.

## Install

```bash
git clone https://github.com/chemny/GitHub-skill-publisher.git
```

Put the directory in the skills folder your Agent scans, keep `SKILL.md` at the skill root, then start a new session so the Agent re-scans.

## Quick Start

Tell your Agent:

```text
Use GitHub-skill-publisher to check whether the current skill is ready to publish to GitHub.
```

You get a pre-publish result: the release-gate verdict, both quality scores, README/structure/required-file status, sensitive data, dependencies, compatibility, Git state, and next steps.

## Usage Examples

Prepare a publishable repo:

```text
Use GitHub-skill-publisher to turn the current skill into a publishable GitHub repository.
```

Just see the scores, do not publish:

```text
Use GitHub-skill-publisher to run publish-check and se-quality and show me the scores and deductions — do not publish yet.
```

Check risks before release:

```text
Use GitHub-skill-publisher to check this skill for API keys, accounts, local paths, private files, or hard dependencies on other skills.
```

Edit and publish:

```text
Use GitHub-skill-publisher to edit and publish this skill to GitHub.
```

## How It Works

It relies on three kinds of files:

- `templates/` — README and LICENSE templates.
- `references/` — publish flow, README style, compatibility and security checklists.
- `scripts/` — local check scripts that **only report problems, never change anything**:

```bash
node scripts/smoke-test.mjs      # package self-consistency
node scripts/publish-check.mjs   # release gate + engineering-hygiene score
node scripts/se-quality.mjs      # software-engineering quality score
```

These scripts never commit, push, create repos, delete files, or touch GitHub. Any publish action requires your explicit authorization, with one more confirmation before pushing.

## Repository Structure

```text
GitHub-skill-publisher/
├── SKILL.md
├── README.md / README.en.md
├── LICENSE
├── .gitignore
├── evals/
├── references/        # publish flow, README style, security/compat/completeness checklists
├── scripts/
│   ├── smoke-test.mjs
│   ├── publish-check.mjs
│   └── se-quality.mjs
└── templates/         # README / LICENSE / .gitignore templates
```

## Requirements

- An Agent environment that can read a local `SKILL.md` (Codex, Claude Code, OpenClaw, etc.).
- `git` — to inspect repo state, commit history, and remotes.
- Node.js — to run the check scripts under `scripts/`.
- GitHub CLI `gh` — only for creating repos, updating metadata, or pushing.

## License

This repository uses the MIT License.

Third-party names, platform names, and upstream references remain subject to their original terms.
