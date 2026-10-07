# {{Skill Name}}

English | [中文](./README.zh.md)

<!-- Writer guidance, not user steps: establish the core problem, principal outcomes, main/supporting tasks and evidence in the internal review first, then map Overview, Features, Quick Start and Examples. Do not infer priority from available screenshots or directory order. follow references/readme-style.md; use references/readme-review.md for facts and first-use review, keeping the record in local task artifacts. Resolve placeholders and remove comments before release. Describe the current product without update history or developer logs; never invent capabilities, compatibility, results or author facts. -->

## Overview

{{One plain sentence: who uses this product to turn which task into what useful result.}}

{{Briefly explain the core problem or typical situation and why the principal result is useful; explain Skill if unfamiliar readers need it.}}

## Preview

![{{Actual screenshot/case scope, or labelled capability/workflow illustration}}](./assets/{{preview-file}})

<!-- Default to no caption; add at most one short line if needed. Keep source, sample provenance, reproduction environment, rights and approval in the internal review. Prefer a representative actual screenshot/case; if unavailable or unsuitable, generate an illustration from verified workflow and pain points, optionally 16:9. This can be the primary Preview; label it as an illustration, not execution or compatibility evidence. Record the choice, rationale and prompt internally; inspect proportions, readable text, cropping and privacy. If unavailable, retain Preview with the actual constraint, not merely “no UI.” The checker accepts a specific in-section reason as a candidate for manual review, not proof of its adequacy; see references/readme-checks.md. A standalone Why No Preview Image heading is legacy only. -->

## Features

| Capability | What it helps you do |
|---|---|
| {{Main capability}} | {{Concrete task or useful result}} |
| {{Other capability}} | {{Actual benefit; optional condition only if needed}} |

<!-- Follow the product brief: main user tasks and principal outcomes first, supporting/finishing capabilities later. Remove irrelevant rows, do not invent features or copy another product's priority. Put component identifiers in How It Works. -->

## Installation

### Requirements

{{A short explanation of what is needed to begin and what can wait until an optional feature is used.}}

| Item | Requirement |
|---|---|
| Agent client | {{Verified supported clients, for example Codex or Claude Code}} |
| Core environment | {{Minimum core runtime and version; omit if unnecessary. The Agent helps prepare missing requirements}} |
| {{Optional capability}} (when needed) | {{Corresponding tool, service or account; omit if irrelevant}} |

### Quick Installation

Open your Agent client and send this to the Agent:

```text
Install this Skill: {{repo-url}}
Check the basic environment and prepare anything missing first, then install and verify it works. Set up optional features when I need them.
```

The Agent will tell you whether it is installed, can be loaded or used, and what remains missing.

<!-- Name actual requirements, not repeated Basic labels. Use an explanation plus the table, not only tables. The Agent inspects the actual core manifest; do not expose implementation packages or requirements.txt in ordinary-user prose. Prepare only core gaps, not every optional service; do not guarantee automatic success. Retain actual first-use limits, with platform paths/test matrices in deeper docs. Apps, CLI/library and non-Agent audiences use their real method and minimum verification within the two subsections. -->

## Quick Start

{{Introduce a low-entry first task representing this product's core value; briefly identify necessary materials only if needed.}}

```text
{{A short ordinary request for this product's representative core task; do not copy another product's topic or supporting utility.}}
```

<!-- Default to one introduction plus the request, with no mandatory explanation paragraph. Remove generic “sample topic / replace it with your own” filler. Add a minimal result/location note only when needed to act. Internally check input availability, action, delivery location, usefulness and next step; do not mandate five public fields. Do not require task cards, internal Skill IDs, output paths or process instructions unless genuinely necessary. Do not promise results needing unconfigured services. Developer audiences may need actual commands. -->

## Usage Examples

### {{Principal use case}}

```text
{{A short ordinary request directly representing a principal result of this product.}}
```

### {{Another principal use case, if applicable}}

```text
{{Another core need; keep only if actually supported and useful.}}
```

<!-- Cover main user tasks first, then useful supporting/finishing scenarios. Do not let an easy utility demonstration define the product. Add only necessary brief conditions/results, not repeated input/conditions/output task cards. Do not duplicate Quick Start or invent multiple paths; remove excess placeholders for a single-path product. Map scenarios to the product brief and Features. -->

<!-- Practical Tool: show a useful before/after example or rule group here only when it helps this audience; link long manuals rather than expanding task cards. -->

## How It Works

{{Explain the real entry point, collaboration and necessary information handoff around principal results. State independent routes when supported; do not imply every request uses the entire pipeline.}}

| Name | Identifier | What it does |
|---|---|---|
| {{Friendly name}} | `{{Exact component or sub-Skill ID}}` | {{One-line duty; distinguish planning from execution}} |
| {{All other included names}} | `{{Exact ID}}` | {{Corresponding duty}} |

{{Briefly distinguish optional plugins or external services from included components, if relevant.}}

<!-- Collections list all sub-Skills. Single Skills, apps and CLI projects explain actual components without inventing sub-Skills. This inventory may have three columns; the main Features table stays two columns. Add a real workflow diagram only when helpful. -->

## Repository Structure

```text
{{Order actual files by functional importance: core entry points/capabilities, execution/configuration, supporting materials, README/license last. Summarize repeated children when already listed; do not copy another project's paths.}}
```

{{Naturally explain what installation loads and how it differs from the full checkout.}}

{{Real relative links to usage, configuration or developer documentation.}}

<!-- Do not list absent directories, private paths, caches or internal review records. -->

## License

{{Actual license}}. See [LICENSE](./LICENSE).

{{Necessary third-party rights explanation and real documentation link.}}

<!-- Check the existing license; do not assume it relicenses third-party assets. Choose MIT only for applicable original work when no other license was specified. -->

## About Me

{{Approved factual author/maintainer identity suited to this publication's purpose.}}

{{A brief sharing-value statement or contact invitation, if needed.}}

{{Approved public contact route; omit when contact is not intended, record missing facts internally without invention.}}

<!-- Choose identity for the publication purpose; an actionable invitation needs an approved route. Personal names, biography and contact values belong in project materials, not generic templates. Reuse approved wording; do not infer biography from an account or expose private contacts. Record missing author facts internally instead of public “profile unavailable” filler; an unresolved draft is not release-ready. -->

<!-- Internal semantic gates need evidence: representative first use, scenario coverage/priority, and Overview/Features/Quick Start/Examples consistency. Failure cannot be offset by formatting or high scores. readme-style is the framework authority; remove these writer notes before release. -->
