# GitHub Skill Publisher

English | [中文](./README.zh.md)

## Overview

GitHub Skill Publisher helps you turn a local Skill into a GitHub repository you can share: write bilingual READMEs, review publication readiness, address findings, then publish with your authorization and verify the result.

![Capability illustration: Skill preparation, pre-publication review, and GitHub publication; includes dependencies, compatibility, safety and rights checks](./assets/publisher-hero-v4.png)

It is for authors who have built a Skill and want to share it, with help organizing files, usage instructions and publication concerns. By default, each Skill has its own repository, with the Skill entry point at the repository root.

## Features

| Capability | What it helps you do |
|---|---|
| Organize a Skill repository | Identify the entry point, supporting files and dependencies; separate material to share from local drafts and caches. |
| Write bilingual READMEs | Understand the Skill's main purpose, then explain its features, installation, usage and structure so users know where to begin. |
| Check publication readiness | Locate missing files, broken links, image problems, sensitive information, and identity or rights questions that need review. |
| Publish to GitHub | With your explicit instruction to publish, prepare repository details, commit and push, then verify the remote result. Requires GitHub account access. |
| Modify an existing Skill | Make the requested local changes and update affected descriptions; your instruction determines whether to publish. |
| Review engineering quality | Assess structure, reuse and robustness to prioritize improvements; a score does not prove tested functionality or readable copy. |

## Installation

### Requirements

Use an Agent client that can read Skills and run local commands. Prepare the core tools first; GitHub login is needed only when you want to operate a GitHub repository.

| Item | Requirement |
|---|---|
| Agent client | For example, Codex or Claude Code; installation and loading depend on the client. |
| Node.js | Used by the check scripts; the project's check configuration uses version 22. |
| Git | Used to inspect file changes, repository state and commit history. |
| GitHub CLI (optional) | Use `gh` with an appropriately authorized account when operating GitHub repositories. |

Local checks have run on macOS. Actual installation and use on Windows, Linux and different Agent clients still need verification. If a step cannot be completed in your environment, the Agent should explain why. See [compatibility details](./references/platform-compatibility.md).

### Quick Installation

Send this request to the Agent you are using:

> Install this Skill for me: https://github.com/chemny/GitHub-skill-publisher . Check Node.js and Git first and prepare any missing core tools, then install the Skill and verify that the client can find and load it. Leave GitHub login until I need to publish.

When finished, ask the Agent to report the installation location, whether loading works, and any unmet requirements.

## Quick Start

After installation, open the folder of the Skill you want to share and check whether it is ready:

> Check this Skill and tell me what needs fixing before I publish it to GitHub.

## Usage Examples

### Prepare a Skill to share

> I've been using this Skill locally. Help me organize it into a repository suitable for GitHub.

### Make the README easy to understand

> Rewrite this Skill's English and Chinese READMEs so a first-time reader knows what it does and how to install and use it.

### Publish a prepared Skill

> Publish this Skill to my GitHub. Use the Skill's name for the repository and make it public.

### Modify and publish together

> Make the README's installation instructions clearer, then sync the changes to GitHub once the checks pass.

A request to modify files leads to local changes. An explicit request to modify and publish continues to publication after checks pass. Sensitive information, failed checks, unverified compatibility or an unclear repository target will pause the workflow for an explanation.

### Check what should stay private

> Check this repository for keys, private paths and material whose rights need review.

### Choose improvements to tackle first

> Review this Skill's engineering quality. What is most worth improving first?

## How It Works

The Agent reads your Skill to understand its main purpose and files, then organizes the repository, writes the introduction and runs checks. It operates GitHub only when publication conditions are met and you have explicitly authorized publication.

This is one standalone Skill, with no bundled sub-Skills. Its main components are:

| Component | Role |
|---|---|
| `SKILL.md` | The Agent entry point: work sequence, authorization and publication boundaries. |
| `references/` | Detailed guidance for writing, installation, visuals, compatibility, safety and publication checks. |
| `templates/` | Standard, Hero and Practical Tool READMEs, each in English and Chinese, for a regular introduction, a prominent opening presentation or a utility needing more scenarios. Also includes license, ignore-file and internal review-record templates. |
| `scripts/` | Publication-readiness checks, engineering-quality analysis and checks of Publisher's own files and templates. |
| `evals/` | Check scenarios and regression cases used when maintaining the rules. |
| `examples/` | An approved README illustration case with reusable practices and product-specific choices clearly separated. |

Each check serves a different purpose:

- **Publication-readiness check**: inspects the current project's documentation, files, safety and Git state, producing `publish-check-report.json`. Results indicate a pass, required review or a blocker; the engineering-hygiene score is not permission to publish.
- **Engineering-quality analysis**: produces `se-quality-report.json`, distinguishing directly verifiable items from advisory estimates. It supplements the publication check rather than replacing it.
- **Publisher self-check**: validates this Skill's supporting files, templates and check tools, producing `smoke-test-report.json`. It cannot prove that another Skill works; other projects still need their own tests.

The check tools write local reports. The Agent handles commits, pushes and repository creation according to your authorization. After automated checks, a person still needs to review product fit, examples, bilingual facts and the scope of visual evidence.

## Repository Structure

```text
GitHub-skill-publisher/
├── SKILL.md                 # Agent entry point
├── references/              # Writing and publication guidance
├── templates/               # Three bilingual README styles and supporting templates
├── scripts/                 # Check tools and tests
├── evals/                   # Check cases
├── assets/                  # README capability illustration
├── examples/                # Approved illustration reference case
├── .github/workflows/       # Automated check configuration
├── .gitignore               # Local-file ignore rules
├── README.md                # English introduction
├── README.zh.md             # Chinese introduction
└── LICENSE                  # License
```

Installation needs `SKILL.md` and its referenced guidance, templates and tools, not just the entry file. Generated reports are not required installation content: publication and engineering reports go into the project being checked; the Publisher self-check report goes into this Skill's directory.

Further reading: [README writing standard](./references/readme-style.md), [copy review method](./references/readme-review.md), [checker coverage](./references/readme-checks.md), [illustration reference case](./examples/readme-visual/publisher-capability.md), and [GitHub workflow](./references/github-workflow.md).

## License

This project uses the [MIT License](./LICENSE). Referenced third-party materials, trademarks and upstream content remain subject to their own terms.

## About Me

Author: 美名 Neo, an independent developer focused on practical AI.

If you need help learning or applying AI, feel free to get in touch!
