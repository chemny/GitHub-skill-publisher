# Install Section

Use this reference when writing installation instructions for a public skill repository.

## Required install content

Every published skill README should explain:

1. The repository is a single-skill repository.
2. `SKILL.md` must stay at the skill root.
3. How to clone the repository.
4. Where to place or symlink the directory.
5. Why a fresh agent session may be needed.
6. How to verify the skill is loaded.
7. How to update after installation.

## Standard install structure

````markdown
## Install

[Skill Name] is published as a single-skill repository. The repository root is the skill root.

Required shape:

```text
skill-name/
└── SKILL.md
````

### 1. Clone

```bash
git clone https://github.com/[owner]/[repo].git
```

### 2. Place It In Your Agent's Skills Directory

Copy or symlink the cloned directory into the skills directory used by your agent.

### 3. Start A Fresh Agent Session

Many agents scan skill metadata when a new session starts. After installing, open a fresh session so the agent can read `SKILL.md`.

### 4. Verify

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

[Skill Name] 是一个「单 skill 单仓库」。仓库根目录就是 skill 根目录。

必须满足这个结构：

```text
skill-name/
└── SKILL.md
````

### 1. 克隆仓库

```bash
git clone https://github.com/[owner]/[repo].git
```

### 2. 放到你的 Agent skills 目录

把克隆下来的目录复制或软链接到你的 Agent skills 目录里。

### 3. 开一个新会话

很多 Agent 会在新会话启动时扫描 skill metadata。安装后建议重新开启一个新会话。

### 4. 验证是否生效

输入一个应该触发该 skill 的短 prompt。

### 后续更新

如果你是用 Git 安装的：

```bash
git pull
```
```

## Notes

- Avoid hardcoded local paths.
- Avoid assuming one specific agent's skills directory.
- Use host-neutral language unless the README has adapter-specific subsections.
- If the skill supports GitHub-based installation through a skill manager, mention it as an optional path.
- If giving examples, keep them generic or clearly marked as examples, such as `$CODEX_HOME/skills/`.
