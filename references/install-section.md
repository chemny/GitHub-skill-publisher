# Install Section

Use this reference when writing installation instructions for a public Skill repository intended for Agent users.

## Default principle

The reader should not need to choose an installation directory, run Git, copy a folder, install dependencies, or decide whether the client needs a restart. The current Agent owns environment detection, installation, dependency checks, load verification, and user-facing feedback.

The main installation section is a copy-ready natural-language request containing the public repository URL.

## Standard English structure

````markdown
## Install

Send this to your Agent:

```text
Install this Skill for me:
https://github.com/[owner]/[repo]
```

The Agent will choose the installation method for the current client, check dependencies, and verify that the Skill loads.
````

## Standard Chinese structure

````markdown
## 安装

把下面这句话发送给你的 Agent：

```text
帮我安装这个 Skill：
https://github.com/[owner]/[repo]
```

Agent 会根据当前客户端完成安装、依赖检查和加载验证。
````

## Rewrite rule

During publisher-managed normalization, rewrite an existing install section when it exposes any of these as the default user flow:

- `git clone`
- copying or moving the repository into a Skill directory
- `.agents/skills`, `.codex/skills`, `.claude/skills`, or another platform path
- manual installation or fallback instructions
- dependency installation commands
- restart or rescan instructions
- repository-shape instructions such as asking the user to inspect the `SKILL.md` level

Rewrite first, then run the final publish check. Do not stop at reporting that the README uses the old structure.

## Boundaries

- Do not include a manual-install section by default.
- Do not list platform directories in the main README.
- Do not promise that every client can install automatically. The request asks the current Agent to try, verify, and report the real result.
- Add manual instructions only when the user explicitly requests them or the repository is intentionally aimed at a non-Agent audience.
- Claude Code plugin marketplaces with an official plugin command may use that official command instead of this generic Skill prompt.

## Verification

Installation verification belongs to the installing Agent. The README quick-start section should demonstrate the Skill's first useful task, not ask the user to debug installation state.
