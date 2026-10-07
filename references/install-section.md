# Installation Section

Follow [readme-style.md](readme-style.md) for the section framework. This reference defines the installation method, not another reading order.

## Two public subsections

Use Requirements / 配置要求, then Quick Installation / 快速安装 within Installation. Requirements starts with one short explanation of what is needed to begin and what can wait, followed by a two-column Item / Requirement (项目 / 要求) table. Name rows by need, such as Agent client, core runtime or an optional capability; do not repeat Basic / 基本 as row labels. Quick Installation explains where to send the request or run the supported action, then gives concise actual verification feedback.

Use Agent client / Agent 客户端 for the host application, and Agent for the actor receiving the installation request. Keep implementation dependency files and exact package ranges internal when they are not needed for the reader's decision.

## Requirements readers can scan

For an ordinary Agent Skill user, use the compact named-item table after the short explanation. Core entries show the supported Agent client and minimum core runtime version. Optional entries show which extra feature needs a tool/service or account. The reader should see what is necessary to start and what can wait.

Do not list requirements.txt, every dependency package, package-version range, shell entry point or a platform testing matrix in the main install section. The installing Agent must inspect the current manifest/requirements and prepare the real core dependencies; hiding those implementation details from product prose does not waive the check. Versions or limitations that change the reader's decision remain visible. Developer-facing applications and CLI/library projects may legitimately show technical installation commands and package requirements.

## Agent-directed installation

The current Agent owns core environment detection, preparation, installation and verification. Use one natural request with the actual public repository URL.

English:

```text
Install this Skill: {{repo-url}}
Check the basic environment and prepare anything missing first, then install and verify it works. Set up optional features when I need them.
```

Chinese:

```text
帮我安装这个 Skill：{{repo-url}}
先检查基础环境，缺什么帮我补齐，再安装并检查能不能用。其他功能等我需要时再配置。
```

Replace the URL with the verified public repository. Read the client's actual requirements before selecting the method. Check the core runtime and permissions first; install or choose a suitable supported runtime if missing or below the minimum. For a Python≥3.9 requirement, Python 3.9 already qualifies; do not upgrade it just because it equals the minimum. Do not remove or replace a working system runtime unnecessarily. Check the core dependency manifest, install the Skill, and verify installation plus discovery/loading or actual readiness using supported client facilities.

Prepare only the minimum core environment. Do not preinstall every optional image/video/upload service, request unrelated account access or silently perform destructive/system-wide changes. Report permission or availability blockers and the actual remaining step. Do not guarantee automatic success for every machine.

## Audience adaptations

For ordinary Skill users, rewrite default git-clone/copy flows, installation directories, manual dependency commands and restart instructions into the Agent request. Do not add speculative fallbacks. Keep advanced troubleshooting in an existing linked document.

When explicitly requested, or when the project serves applications, CLI/library users or another non-Agent audience, use the actual supported method and minimal verification. An official plugin installation command may be appropriate for its intended audience. These adaptations preserve Installation's place before Quick Start.

## Completion feedback

Give concise actual results: installed, loaded/discovered or ready, and any remaining requirement. A file copy alone proves neither loading nor readiness. If loading only happens after a new session, say so truthfully rather than claiming it was verified.

Quick Start demonstrates a useful task. The five first-use review questions belong in [readme-review.md](readme-review.md), not mandatory public labels.

## Checker audience

Use the default Agent audience for ordinary Skill readers. Developer-facing applications, CLI/library projects or other command-based installations use `--readme-audience=developer` when running the publish checker. This adaptation preserves the framework and all link/visual/safety/manual-review gates; see [readme-checks.md](readme-checks.md).
