# GitHub-skill-publisher

中文 · [English](README.en.md)

GitHub-skill-publisher 用来把一个本地 agent skill 整理成可以发布到 GitHub 的单 skill 仓库。它会帮你检查 README、协议、目录结构、仓库描述、敏感信息和平台兼容性；需要推送到 GitHub 时，也会先把发布清单列出来，等你确认后再继续。

## 适合谁使用？

这个 skill 适合：

- 正在写 agent skill，想把它发布到 GitHub 的作者。
- 需要维护多个 skill 仓库的人。
- 想让 README、协议、目录结构和发布检查保持统一的团队。
- 发布前想查一遍 API key、本地路径、私有文件和隐藏依赖的用户。

## 它能做什么？

它会先看本地 skill 的真实文件，而不是只看你口头描述。检查范围包括 `SKILL.md`、README、LICENSE、references、templates、scripts、`.env.example`、`.gitignore` 和 Git 状态。

如果 README 太薄、语言默认不对、缺少英文 companion、仓库描述为空，或者文件里混进了 token、本地路径、账号信息和私有依赖，它会直接指出来。只有在你明确说要发布，或者你在最终清单后确认发布时，它才会 commit、push 或更新 GitHub metadata。

## 核心能力

| 能力 | 处理内容 | 输出结果 |
|---|---|---|
| 发布前总检 | README、必需文件、Git 状态、敏感信息、依赖、兼容性 | 一份能判断是否可以发布的最终清单 |
| README 写作 | 中文默认 README、英文 companion、首屏介绍、安装和使用说明 | 更适合 GitHub 展示和用户安装的公开文档 |
| 敏感信息检查 | API key、token、账号、本地路径、日志、缓存 | 发布前脱敏、替换或移除 |
| 完整性和依赖检查 | `SKILL.md`、references、templates、scripts、assets、其他 skill 依赖 | 找出缺失文件、断链引用和隐藏依赖 |
| 平台兼容性检查 | Codex、Claude Code、OpenClaw 的安装和运行假设 | 发布前说明兼容范围和未验证风险 |
| 仓库结构检查 | 单 skill 单仓库、根目录文件、引用路径 | 确认仓库能被别人安装和阅读 |
| GitHub 仓库描述 | GitHub 首页和列表页展示的一句话介绍 | 默认中文、具体、和 README 首屏一致 |
| 发布确认 | 文件清单、检查结果、远端仓库、剩余风险 | 用户确认后再执行 commit、push 或 metadata 更新 |

## 平台兼容性

适用于 Codex、Claude Code 和 OpenClaw 的 skill 发布流程。具体到某个 skill，发布前仍要看它自己的文件、脚本和依赖，不能只凭目录名判断兼容。

## 安装

```bash
git clone https://github.com/chemny/GitHub-skill-publisher.git
```

把克隆后的目录放到你的 Agent 会扫描的 skills 目录里，或按你的 Agent 的安装方式导入。确保 `SKILL.md` 在该 skill 目录根部。

安装后重新开一个 Agent 会话，让它重新扫描 skills。

## 快速开始

对 Agent 说：

```text
使用 GitHub-skill-publisher 检查当前这个 skill 是否适合发布到 GitHub。
```

你会得到一份发布前检查结果，通常包括 README 状态、目录结构、必需文件、敏感信息、依赖、平台兼容性、Git 状态和下一步建议。

## 使用示例

准备公开发布：

```text
使用 GitHub-skill-publisher 帮我把当前 skill 整理成可以公开发布的 GitHub 仓库。
```

只优化 README，不发布：

```text
使用 GitHub-skill-publisher 按当前默认结构重写这个 skill 的中文 README 和英文 README，但先不要发布。
```

发布前查风险：

```text
使用 GitHub-skill-publisher 检查这个 skill 里有没有 API key、用户账号、本地路径、私有文件或其他 skill 强依赖。
```

修改并发布：

```text
使用 GitHub-skill-publisher 修改并发布这个 skill 到 GitHub。
```

## 工作原理

这个 skill 主要依赖三类文件：

- `templates/` 里的 README 和 LICENSE 模板。
- `references/` 里的发布规则、README 写法、兼容性检查和安全检查清单。
- `scripts/` 里的本地检查脚本。

本地检查脚本只负责报告问题：

```bash
node scripts/smoke-test.mjs
node scripts/publish-check.mjs
```

它们不会 commit、push、创建仓库、删除文件，也不会修改 GitHub。发布动作必须等用户明确授权。

## 仓库结构

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

## 运行要求

- 一个能读取本地 `SKILL.md` 的 Agent 环境，例如 Codex、Claude Code 或 OpenClaw。
- `git`，用于检查仓库状态、提交历史和远端配置。
- Node.js，用于运行 `scripts/smoke-test.mjs` 和 `scripts/publish-check.mjs`。
- GitHub CLI `gh`，仅在需要创建仓库、更新 GitHub metadata 或推送到 GitHub 时使用。

## 协议

本仓库使用 MIT License。

第三方名称、平台名称和上游参考资料仍受其原始条款约束。
