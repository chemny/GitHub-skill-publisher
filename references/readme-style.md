# README Style

## Purpose and authority

A README is a product introduction and the entry point to first successful use. It should help a reader understand what the project is, what problem it solves, whether it fits their needs, what to prepare, and how to install and use it. Write for the project's actual audience, including readers unfamiliar with Agent Skills.

This file is the single authority for the default README framework, section order and information responsibilities. Installation, visuals, compatibility and repository references elaborate their own topics; they do not define alternative reading orders. Templates are starting points and must follow this standard. If a template or historical example conflicts with it, follow this file and record the mismatch for repair.

Use concrete, practical language. Do not use hype, invented benefits or implementation vocabulary that the intended reader cannot understand.

## Language and release surface

For publisher-managed releases, create:

```text
README.md      English, default GitHub repository homepage
README.zh.md   Chinese
GitHub description: English by default
```

Put a project title and a clear language switch before the sections:

```markdown
English | [中文](./README.zh.md)
```

```markdown
[English](./README.md) | 中文
```

Use language names only, without a redundant README label. Keep each body in its own language, including prompts and examples. Technical identifiers, commands, proper names and the language switch may retain their original spelling. Both versions must cover the same facts, conditions, components and examples; translation may use natural phrasing rather than identical sentence lengths.

Legacy Chinese README.md plus English README.en.md must be normalized before a publisher-managed release. Preserve an old language layout or structure only when the user explicitly requests pass-through. Report what is preserved and what does not meet the current standard; use `--allow-legacy-readme` when appropriate. This exception does not waive secrets, broken assets or the visual-evidence gate. An explicitly requested single bilingual README also requires reporting the departure from the default surface.

Do not overwrite useful project-specific facts when migrating an existing README. Review the current files and diff first.

## Default framework

Use these ten top-level sections, in this order, after the title and language switch. Use the English titles in README.md and the Chinese titles in README.zh.md. Do not introduce separate top-level audience, requirements, compatibility or documentation sections; place those facts where the table assigns them.

| Order | English | Chinese | Information responsibility |
|---|---|---|---|
| 1 | Overview | 项目简介 | What it is, intended users, the problem and useful outcome |
| 2 | Preview | 效果预览 | Actual screenshot/case first; otherwise a grounded workflow/pain-point illustration; at most one short caption |
| 3 | Features | 核心功能 | Main user tasks and benefits, ordered by user importance |
| 4 | Installation | 安装 | Prerequisites, relevant support boundaries, installation and verified feedback |
| 5 | Quick Start | 快速开始 | One small task representing core value, with a natural prompt/action |
| 6 | Usage Examples | 使用示例 | Other supported scenarios using ordinary requests and necessary conditions |
| 7 | How It Works | 工作原理 | Complete component inventory, responsibilities and collaboration or execution flow |
| 8 | Repository Structure | 目录结构 | Actual principal files and directories, installed content and further documentation |
| 9 | License | 许可 | Applicable license and third-party rights boundaries |
| 10 | About Me | 关于我 | Approved identity suited to the sharing purpose, with a public contact route when intended |

For a generated capability/workflow illustration, the visual may be embedded in Overview without a separate Preview / 效果预览 heading. Do not call an explanatory illustration an effect preview. This folds the visual duty into Overview; the other nine sections keep their order and responsibilities. Use illustrative alt text (illustration / 示意图), keep the image before Features, and retain rights, approval and rendering checks. Actual screenshots/cases and omission explanations continue to use Preview.

Keep the skeleton consistent across single Skills, collections, applications and CLI/library projects. Adjust depth and the first-use method to the audience. Use subsections for necessary detail, not a second competing framework. For a small project, explain a section briefly and honestly; do not invent components, scenarios or claims to fill it. License and About Me remain at the end.

## Product understanding before drafting

Before choosing headings, sample prompts or screenshots, establish the actual product's audience, core problem, principal outcomes and main user tasks from current Skill entry points, capabilities, implementation where needed, and the owner's explicit priorities. Reuse confirmed scope; do not infer priority from directory order, code size or the screenshot currently available.

Record this product brief internally using [readme-review.md](readme-review.md) and [the review record](../templates/readme-review-record.md):

1. Who needs it, in which situation, and what problem do they want solved?
2. What principal useful results should they receive?
3. Which capabilities directly deliver those results, and which support, process or finish them? Record evidence and material conditions.
4. Which small first-use task represents that core value?
5. Which common scenarios cover the principal capabilities, in user-importance order?

Map Overview, Features, Quick Start and Usage Examples to that brief before writing. The first task should be small and representative; avoid substituting an easy-to-demonstrate utility for the product's main purpose. List supporting capabilities after principal tasks. A screenshot of a secondary capability must not define the product's positioning.

Use this product's actual priority, not a universal ranking copied from a case. Layout is a core task for a layout product; video tools may be core requirements for a video product. Do not force content-writing examples or Python requirements onto unrelated Skills, apps or CLI/library projects.

Terminology: use Agent client / Agent 客户端 for Codex, Claude Code, OpenClaw or another verified host application; use Agent for the actor receiving requests. Do not substitute generic AI assistant / AI 助手 for the client name in this framework. Keep prompts conversational without changing the technical role.

## Section requirements

### Overview

Explain in plain language:

- what kind of product this is; explain Agent Skill briefly when unfamiliar readers need it,
- which people and workflows it serves,
- what difficult or repeated work it helps with,
- what useful result the reader receives.

Put audience fit in this section instead of duplicating it in a separate heading. Prefer a concrete outcome over broad statements such as “for everyone” or “an end-to-end intelligent platform.” Do not start with version history, internal architecture or file lists.

### Preview

Follow [readme-visuals.md](readme-visuals.md). Prefer a representative actual screenshot or case under Preview. If no suitable material is available, generate a workflow and pain-point illustration from verified capabilities; 16:9 is acceptable. Either form satisfies the visual duty when accurately scoped and approved. A generated capability illustration may instead sit in Overview without a Preview heading; do not add a replacement heading solely to name the image. Identify a generated illustration in the image or alt text; it explains the product rather than proving execution. Use useful alt text. Prefer evidence of a principal task or outcome, not merely the most convenient screenshot. If only a relevant supporting-feature preview is available, keep its scope accurate and record the core-output display gap for review. Prefer a self-explanatory image with no caption; if clarification is necessary, use at most one short line identifying the result or scope. A screenshot of one component is not proof of the whole product. Record the selected form, screenshot/case source or generation prompt and rationale, sample provenance where relevant, rights and approval in the internal review, not paragraphs under the image. Conditions that materially change use belong beside the relevant action.

If neither an actual screenshot/case nor a grounded generated illustration is suitable, keep Preview and state the specific constraint visibly in both languages, in the section body or a nested omission subsection. The checker recognizes these forms. An explicitly authorized legacy pass-through may retain a standalone Why No Preview Image / 暂无配图的原因 heading, with a framework warning; it is not a second default structure. Missing both a preview and a concrete reason is FAIL. A candidate omission is WARNING requiring human review, not proof that its stated constraint is accurate or adequate. Follow [readme-checks.md](readme-checks.md) for supported Markdown forms and automation limits.

### Features

Make the main capabilities easy to scan. Use a two-column user-facing table: `Capability` + `What it helps you do` (Chinese: `能力` + `它能帮你做什么`). Do not use a three-column implementation table such as `Capability / Input / Output` or `能力 / 处理内容 / 输出结果` as the main feature table.

Order by the product brief: principal outcomes and main user tasks first, supporting or finishing capabilities after them. Distinguish built-in, optional and conditional capabilities when it affects expectations. Explain benefits without unsupported performance or compatibility claims. This section answers “what can I do”; component names and routing details belong in How It Works.

### Installation

Follow [install-section.md](install-section.md). Divide Installation into Requirements / 配置要求 and Quick Installation / 快速安装. Requirements starts with a short explanation, followed by an Item / Requirement (项目 / 要求) table whose rows are named by actual environment/tool needs, not repeated Basic / 基本 labels. Distinguish core requirements from optional needs. Quick Installation then shows the actual install action and concise completion feedback. For ordinary Skill users, list the Agent client and the minimum core runtime version, plus required accounts or materials only when genuinely necessary for first use. Do not expose package manifests, transitive dependency names or implementation versions that the Agent can manage. Retain technical versions when they affect the reader's choice or the intended developer audience.

Give one copy-ready installation request with the public repository URL: check the core environment, prepare missing core requirements, install, and verify installation plus discovery/loading or actual readiness. Prepare optional image, video and platform integrations only when requested. Never promise successful automatic setup on every client; missing permissions or unavailable tools must be reported truthfully. Keep operating-system implementation paths and internal test matrices in deeper documentation. Disclose a known limitation here only if it changes the reader's ability to start.

Applications and CLI/library projects use their actual supported method with a minimal verification action. Installation remains before Quick Start.

### Quick Start

Show a small task representing the product's main value. For ordinary Skill users, default to one brief introduction and one short conversational request for this product's core task. The user supplies a topic, goal or existing material; the Agent asks for necessary missing information. Do not require a task card, internal Skill ID, output path or a full process specification unless actually necessary for the product.

Do not require a paragraph after the request. Omit generic explanations such as “this is only a sample topic,” “you can replace it,” and repeated narration of what the Agent will do. Add a result/location note only when the reader genuinely needs it to act. The writer must check input availability, concrete action, result location, success judgment and next step using [readme-review.md](readme-review.md). These five review questions are internal checks, not five compulsory public labels or paragraphs. Do not promise optional-service results without disclosing their conditions. A command or UI action is appropriate for a product whose audience uses it.

### Usage Examples

Derive examples from the principal tasks in the product brief, cover the main outcomes, and place supporting or finishing tasks last. Use a familiar scenario title and a short natural request. Add a brief result or condition only when it helps the reader act. Avoid repetitive “Input / Conditions / Output” task cards for ordinary users. Do not duplicate Quick Start or fabricate scenarios. Developer-facing products may need real parameters and commands; keep what their readers genuinely use.

### How It Works

For a collection, list every included sub-Skill with a friendly name, exact identifier and one-line plain-language responsibility. Exact identifiers belong in this inventory; do not force readers to type them in ordinary requests. For a single Skill or application, explain its actual principal components without inventing sub-Skills. Distinguish bundled components, optional plugins and external dependencies.

Explain the entry point, component collaboration and any supported direct-use routes. Distinguish planning from execution when separate components perform those jobs. Use a short workflow or Mermaid diagram only when it explains the mechanism. Where tasks can use selected components independently, say so; do not imply that every request runs the entire pipeline. Avoid narrating internal authoring discussions or overwhelming the reader with script internals.

### Repository Structure

Follow [repo-structure.md](repo-structure.md). Generate a compact tree from actual files, ordered by functional importance: core entry points or capability directories first, execution/configuration next, supporting assets/docs next, README and license files last. Show the principal directories and explain what they contain. Choose this project's actual order rather than an alphabetical listing or a case-specific tree. A short tree may summarize repeated children when the complete inventory is already in How It Works.

Explain any difference between repository contents and what installation loads. Link detailed usage, configuration, contribution or developer documents here. Do not imply an absent directory is required. Keep drafts, caches and task-specific records out of the public tree unless deliberately included and useful.

### License

State the actual license and link to the license file. Use MIT by default only when choosing a license for original work and the user has not specified another; do not overwrite an existing or upstream license by inference.

Explain third-party materials, trademarks and upstream attribution boundaries where applicable. Do not imply that the repository license relicenses every referenced or bundled asset. Follow [review-decisions.md](review-decisions.md) for new or changed identity and attribution findings; reuse unchanged explicit scoped decisions rather than asking repeatedly. Do not automatically remove attributions or invent ownership.

### About Me

Use only verified, approved public information about the author or maintainer and any project motivation. Match the role to the publication purpose; personal Skill sharing may call for a practitioner/developer identity rather than a teaching title. Do not rewrite an approved identity without authority. When the owner wants a relationship with users, briefly connect identity, sharing value and a contact invitation, followed by an approved public contact route. An invitation alone does not establish a usable route; record a missing route internally without inventing one. Personal biography and contact values belong in project materials, not generic templates. Organization-maintained projects may introduce the actual maintaining organization under the same agreed title.

Do not infer a biography from a GitHub handle, copyright line or Git commit author. Do not add private contact details, an invented professional background or unapproved social links. Reuse matching approved public facts; ask only for information that is actually missing and necessary. A concise approved maintainer statement is sufficient. If none is available, record the unresolved item in the local review rather than fabricate a publish-ready section.

## Content boundaries

These rules apply to the entire README, not only heading names.

Exclude version change histories, “what is new” summaries, bug-fix chronicles, upgrade or migration instructions, repository release procedures, developer maintenance logs, internal verification records and the authoring conversation. Keep these in changelogs, release notes, CONTRIBUTING or developer references. Never hide them inside Overview, Features, examples or the closing paragraph.

Keep facts needed for current use: required dependency versions, current capability conditions, genuine limitations, account access, license restrictions and necessary approval steps in the product itself. A product whose purpose includes publishing content or maintaining software may describe and demonstrate that current capability. The words “publish,” “update” or a version number alone do not indicate forbidden history.

Do not add a default standalone limitations section. Explain an actual constraint at the point where it changes installation or use. Do not remove material conditions in the name of brevity.

Remove internal collaboration wording such as “after asking,” “add this rule to your prompt,” “rerun setup,” “征得你同意,” “加进提示词” or “重跑 setup” when it describes the authoring process. Product-required confirmation or authorization is legitimate user-facing behavior and must remain understandable.

## Style variants and depth

Standard, Hero and Practical Tool share the same ten-section order and information requirements.

- Standard is the default product introduction.
- Hero may change the opening presentation, use a centered title, badges and navigation, but cannot move Quick Start before Installation or imply unverified compatibility through badges.
- Practical Tool may use richer examples, rule categories, before/after comparisons and checklists inside the relevant sections. Long rulebooks, FAQs and maintenance procedures belong in linked documents.

Use the smallest amount of text that explains the facts completely. Avoid repeating benefits, component inventories and instructions across sections. Explain unfamiliar terms at first use. Keep essential conditions close to their relevant action. Prefer user-facing results to file names except where exact identifiers are needed for use or navigation.

The six templates under templates/ are starting points. [readme-full-agent-evolution.md](readme-full-agent-evolution.md) is a historical content example, not a current order or scope standard.

## Natural writing for the audience

Write as if explaining a product to another person. “Remove AI-like writing” here means editing observable text, not using an AI-detector score:

- Lead with a concrete job and result; replace abstract process slogans and unneeded jargon.
- Use short conversational example requests. Do not make the user specify internal operations the Agent can handle.
- Use tables for requirements and component inventories; keep ordinary use guidance in connected short prose.
- Delete duplicate explanations, defensive caveats and public review/task-card fields. Place each essential condition once at the action it affects.
- Keep technical facts, full component inventory, rights and actual limits accurate. Concision never means inventing simplicity or hiding a material condition.
- Avoid filler for missing author facts. Keep the draft section and record the missing approved content internally; do not treat the draft as release-ready.

Templates contain writer comments. Resolve placeholders and remove writer comments before release; do not copy instructions into product prose. Review both languages with [readme-review.md](readme-review.md) and record evidence in [the internal review template](../templates/readme-review-record.md).

## Repository description

Generate one concise sentence matching the Overview value proposition. Use English by default; use Chinese when explicitly requested for a Chinese-facing repository. Prefer 80–140 English characters or 35–80 Chinese characters where practical. Say what the product helps the reader do and why it matters; avoid an empty label, only the repository name or unsupported claims.

## Validation and change impact

Before a publisher-managed release or update:

- Review both languages against the same framework, section duties and verified project facts.
- Apply three independent semantic acceptance checks: Quick Start represents core value; examples cover main tasks in priority order; Overview/Features/Quick Start/Usage Examples agree with the product brief. A failure prevents README acceptance even when formatting checks or engineering scores are high. Report it as a manual finding; existing scripts do not automatically determine product meaning.
- Review the diff for changes to capability, usage, installation, dependencies, support, outputs, components, structure, templates, scripts, rights or metadata; update current product information in both READMEs when affected.
- For a genuinely no-impact change, record the reason and use `--readme-no-impact` only after review. No-impact does not waive existing README quality or visual gates.
- Preserve explicitly requested pass-through content and report the exception; do not claim it meets the new standard.
- Check actual image rendering and user understanding as well as file existence, links, section order and tables.
- Report automated checks and semantic review separately. A checker PASS is not proof that ordinary readers understand the README; an engineering-hygiene score is not a reader-quality score.
- For a before/after writing evaluation, agree the dimensions and 10-point rubric before scoring, retain the original and revised outputs, and apply the same rubric to both with evidence. Do not score a proposed framework as if its generated results already existed.

Use [publish-checklist.md](publish-checklist.md) for release checks and [readme-checks.md](readme-checks.md) for current automated coverage. Record unsupported syntax or other remaining gaps; static framework regression does not certify semantic acceptance.

## Visual capture workflow

Program or Page Screenshot is a legacy label for actual UI evidence; the current section is Preview / 效果预览.

- for a web page, open the page in a browser and capture its actual running interface;
- for a desktop/app program, launch the real program and capture its actual UI;
- for output-producing Skills, reuse a representative approved real case/result when available;
- if no suitable screenshot/case is available, generate a verified workflow and pain-point illustration; 16:9 is permitted; this can be the primary Preview;
- identify the generated image as an illustration, not proof of execution, passed checks or compatibility;
- store assets in the repository, usually assets/, and embed them in both languages;
- show the screenshot to the user, or show the selected case/generated illustration, before publication when it is new or changed; reuse approval only for unchanged applicable assets.

Preserve aspect ratio, rights and privacy, and follow the detailed review in [readme-visuals.md](readme-visuals.md). A generated illustration may explain a concept, but must not masquerade as a screenshot or execution evidence.
