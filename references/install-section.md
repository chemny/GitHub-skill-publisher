# Install Section

Use this reference when writing installation instructions for a public skill repository.

## Required install content

Every published skill README should explain:

1. How to clone or install the repository with the least friction.
2. The cloned repository folder should be placed where the user's agent scans skills.
3. `SKILL.md` must stay at the skill root.
4. Why a fresh agent session may be needed.
5. How to verify the skill is loaded.
6. How to update after installation when useful.

Do not make first-time users read repository-shape theory before installing. Keep those details to one short sentence unless the skill has unusual packaging requirements.

The primary install block must be one copyable command. For simple skills, one `git clone` command is enough. For skills that need more than cloning, publish an installer/bootstrap script and make the README call that installer in one command.

Do not put a multi-step command block such as `git clone`, `cd`, `./setup.sh`, `python -m venv`, `pip install`, or `node scripts/...` in the main install section. Those steps should be inside the installer.

## Standard install structure

````markdown
## Install

```bash
git clone https://github.com/[owner]/[repo].git
```

Place the cloned folder in the skills directory used by your agent, or import it using your agent's own skill installation flow. Keep `SKILL.md` at the root of that skill folder.

After installing, start a fresh agent session so it can rescan skills.

## Quick Start

Try a short prompt that should trigger the skill.

### Update

If installed with Git:

```bash
git pull
```
```

## Chinese version

````markdown
## 怎么安装？

```bash
git clone https://github.com/[owner]/[repo].git
```

把克隆后的目录放到你的 Agent 会扫描的 skills 目录里，或按你的 Agent 的安装方式导入。确保 `SKILL.md` 位于该 skill 目录根部。

安装后开一个新的 Agent 会话，让它重新扫描 skills。

## 快速开始

输入一个应该触发该 skill 的短 prompt。

### 后续更新

如果你是用 Git 安装的：

```bash
git pull
```
```

## Multi-plugin marketplace repos (Claude Code)

When the repository is a Claude Code plugin marketplace (it has `.claude-plugin/marketplace.json` and multiple plugins), do NOT use the single-skill `git clone` structure above, and do NOT list one `claude plugin install` line per plugin — a long list looks unusable.

Give a single one-line command that adds the marketplace and installs every plugin in one shot:

````markdown
## Install / 安装（Claude Code）

```bash
claude plugin marketplace add [owner]/[repo] && \
for p in plugin-a plugin-b plugin-c plugin-d; \
do claude plugin install $p@[marketplace-name]; done
```
````

Rules:

- Use the repo's `owner/repo` shorthand as the default marketplace source — do not leave a `<...>` placeholder.
- `[marketplace-name]` is the `name` field in `.claude-plugin/marketplace.json` (often equals the repo name).
- List the plugin names inside the loop, not as separate install lines.
- This whole block must be ONE pasteable command, so a user installs the entire suite in one step.

## Notes

- Avoid hardcoded local paths.
- Avoid assuming one specific agent's skills directory.
- Do not use the publisher author's local install path as the default command.
- `~/.agents/skills/...` can appear only as an explicitly labeled example, not as the universal install path.
- Prefer a bare `git clone https://github.com/[owner]/[repo].git` command when no cross-agent installer exists.
- If an installer exists, prefer one installer command over showing clone/setup internals.
- Use host-neutral language unless the README has adapter-specific subsections.
- If the skill supports GitHub-based installation through a skill manager, mention it as an optional path.
- If giving examples, keep them generic or clearly marked as examples, such as `$CODEX_HOME/skills/`.
