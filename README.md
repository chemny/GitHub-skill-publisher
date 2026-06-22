# GitHub-skill-publisher

中文 · [English](README.en.md)

把一个本地 agent skill **安全、规范地发布成 GitHub 仓库**，并在发布前给它做一次**可量化的工程质量体检**。它先看真实文件、跑三层检查、列出发布清单，等你确认后才提交和推送——绝不擅自发布。

## 适合谁使用？

- 写好了 agent skill、想发布到 GitHub 的作者。
- 同时维护多个 skill 仓库、想让 README / 协议 / 结构 / 检查保持统一的人。
- 发布前想先查一遍密钥、本地路径、私有依赖，并想知道"这个 skill 到底做得够不够好"的人。

## 它解决什么问题？

手动发布 skill 容易踩三个坑：**发布质量不稳定**（README 太薄、结构乱、协议忘了、仓库描述空着）、**安全泄露**（示例里混进 API key、本地路径、私有文件、别人家的版权内容）、**没有客观标尺**（发出去之前没人能说清它好不好）。这个 skill 把这三件事变成固定流程 + 自动检查 + 量化评分。

## 核心能力

| 能力 | 处理内容 | 输出 |
|---|---|---|
| 发布前总检 | README、必需文件、Git 状态、敏感信息、依赖、兼容性 | 一份能判断"能不能发"的最终清单 |
| 三层质量评分 | 包自洽 + 发布卫生 + 软件工程质量 | PASS/FAIL 释放门 + 两个可复现的 0–100 分 |
| 敏感信息检查 | API key、token、账号、本地绝对路径、日志、缓存 | 发布前脱敏、替换或移除 |
| 第三方/署名复核 | 上游引用、版权/商标声明、外部协议条款 | 列出待你决定的署名项，绝不自动删改 |
| 双语 README + 仓库描述 | 中文默认 README、英文 companion、首屏一句话介绍 | 适合 GitHub 展示和安装的公开文档 |
| 多形态兼容 | 单 skill 仓库 / marketplace 集合仓库；跨 agent 可移植 | 自动识别仓库形态，查会被别的 agent 拒装的措辞 |

## 三层质量体检（核心卖点）

发布前跑三套检查，每套回答一个不同的问题，全部**只报告、绝不推送**：

| 工具 | 回答的问题 | 产出 |
|---|---|---|
| `smoke-test.mjs` | 这个包自己自洽吗？ | 必需文件 / 引用 / 模板的逐项自检（PASS/FAIL） |
| `publish-check.mjs` | **能不能发？** | 释放门 `PASS/WARNING/FAIL` + 工程卫生分（元数据/文档/结构/安全/工具，5 类 0–100） |
| `se-quality.mjs` | **作为软件，做得好吗？** | 软件工程质量分（完整性/开放性/复用性/内聚/耦合/健壮性，0–100） |

评分坚持**诚实设计**：硬指标（`det`）才计分，启发式信号（`proxy`）只做提示不进分，不适用项标 `N/A` 排除，并明说**不测功能正确性**——避免给你虚假的安全感。

## 平台兼容性

适用于 Codex、Claude Code、OpenClaw 等 50+ 兼容 skills 的 runtime。同时识别**单 skill 仓库**和 **marketplace 集合仓库**（`.claude-plugin/marketplace.json`）两种结构，并检查"只能在某个 runtime 用"这类会让别的 agent 拒装的措辞。

## 安装

```bash
git clone https://github.com/chemny/GitHub-skill-publisher.git
```

把目录放进你的 Agent 会扫描的 skills 目录，确保 `SKILL.md` 在该 skill 根部，然后重开一个会话让 Agent 重新扫描。

## 快速开始

对 Agent 说：

```text
使用 GitHub-skill-publisher 检查当前这个 skill 是否适合发布到 GitHub。
```

你会拿到一份发布前结果：释放门结论、两个质量分、README/结构/必需文件状态、敏感信息、依赖、兼容性、Git 状态和下一步建议。

## 使用示例

整理成可公开发布的仓库：

```text
使用 GitHub-skill-publisher 帮我把当前 skill 整理成可以公开发布的 GitHub 仓库。
```

只看质量分、不发布：

```text
使用 GitHub-skill-publisher 跑一遍 publish-check 和 se-quality，给我看分数和扣分项，先不要发布。
```

发布前查风险：

```text
使用 GitHub-skill-publisher 检查这个 skill 有没有 API key、账号、本地路径、私有文件或对其他 skill 的强依赖。
```

修改并发布：

```text
使用 GitHub-skill-publisher 修改并发布这个 skill 到 GitHub。
```

## 工作原理

它依赖三类文件：

- `templates/` —— README 和 LICENSE 模板。
- `references/` —— 发布流程、README 写法、兼容性与安全检查清单。
- `scripts/` —— 本地检查脚本，**只报告问题，不改任何东西**：

```bash
node scripts/smoke-test.mjs      # 包自洽自检
node scripts/publish-check.mjs   # 释放门 + 工程卫生分
node scripts/se-quality.mjs      # 软件工程质量分
```

这些脚本不会 commit、push、建仓、删文件或改 GitHub。任何发布动作都必须等你明确授权，且推送前会再单独确认一次。

## 仓库结构

```text
GitHub-skill-publisher/
├── SKILL.md
├── README.md / README.en.md
├── LICENSE
├── .gitignore
├── evals/
├── references/        # 发布流程、README 风格、安全/兼容/完整性清单
├── scripts/
│   ├── smoke-test.mjs
│   ├── publish-check.mjs
│   └── se-quality.mjs
└── templates/         # README / LICENSE / .gitignore 模板
```

## 运行要求

- 一个能读取本地 `SKILL.md` 的 Agent 环境（Codex、Claude Code、OpenClaw 等）。
- `git` —— 检查仓库状态、提交历史和远端。
- Node.js —— 运行 `scripts/` 下的检查脚本。
- GitHub CLI `gh` —— 仅在建仓、更新 metadata 或推送时使用。

## 协议

本仓库使用 MIT License。

第三方名称、平台名称和上游参考资料仍受其原始条款约束。
