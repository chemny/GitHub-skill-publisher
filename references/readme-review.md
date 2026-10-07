# README Preparation and Semantic Review

Use [readme-style.md](readme-style.md) as the sole framework authority. This reference makes preparation and acceptance executable. Fill [readme-review-record.md](../templates/readme-review-record.md) in the local task artifacts, outside the public README. Do not publish private fact records, user confirmations or local evidence paths by default.

## 0. Understand the product before choosing examples

Apply the product-understanding rules in [readme-style.md](readme-style.md). Read the current entry point and component duties, inspect implementation or materials where the claims need it, and reuse the owner's confirmed priorities. Record audience/situation, core problem, principal outcomes, main versus supporting tasks, evidence, representative first use and common scenarios in the local review record.

Build a mapping: core problem -> main capability -> useful result -> Features row -> first-use or example. Explain gaps honestly; not every capability needs a duplicate public example, but principal outcomes must not disappear behind supporting utilities. Select a small representative task, not simply the easiest screenshot or demo. If the product's purpose or a consequential claim remains unclear, resolve that gap before declaring semantic acceptance. Continue unrelated local work while asking only for genuinely missing facts.

Do not generalize a content-factory ranking to every project. A layout-only product can use layout as its first task. A developer tool can use a command; its core runtime may differ. Keep Agent client terminology accurate and user prompts short.

## 1. Establish facts before drafting

Inspect the current project, not only its old README. Record every material claim with current file path and line evidence (or another directly inspected source), verification method, status and intended public section. Check:

- Product type, audience, useful outputs and supported tasks.
- Entry points, installation/discovery behavior and actual installed contents.
- Core runtime/client and dependency manifest; optional services, tools, permissions and accounts separately.
- First-use materials, how users provide them, supported action, delivery location and success criteria.
- Complete bundled sub-Skill/component identifiers and responsibilities; distinguish planning from execution and optional plugins.
- Actual principal directories and real documentation links.
- License, third-party rights, approved public author facts and applicable prior decisions.
- Preview selection: actual screenshot/case preferred; otherwise a verified workflow/pain-point generated illustration (16:9 allowed). Record selected form, source or generation prompt, why existing material is unsuitable, scope, sample status where relevant, rights/privacy, approval and readability. Generated visuals are not execution evidence.

Statuses: verified from source, actually executed, explicitly approved, unresolved, not tested, or not applicable with a reason. Source inspection does not prove runtime behavior. Record dependency package versions internally even when ordinary readers only need the Agent and minimum core runtime. Put source/reproduction/rights details in this record, not long image captions.

## 2. Resolve only consequential gaps

| Situation | Action |
|---|---|
| Fact can be inspected directly | Read current files; do not ask the user to look it up. |
| An unchanged scoped decision was explicitly approved | Reuse it; follow [review-decisions.md](review-decisions.md) for identity/attribution. |
| A fact requires the user's preference, missing authorization or unavailable essential information | Ask a concise question while continuing independent work. |
| A nonessential claim is unverified | Omit the claim conservatively; record why. |
| A missing fact would create an installation, capability, rights or author claim | Do not invent it. Mark the affected draft unresolved; resolve before release. |
| Author biography is unavailable | Keep About Me in the local draft, record missing approved content here, and do not publish filler or inferred biography. This need not block unrelated local edits. |
| Suitable actual screenshots/cases are unavailable | Generate a labelled illustration of the verified workflow and pain points; no extra actual screenshot is required. Record rationale and prompt, inspect claims and show it for approval. If neither route is possible, record the actual constraint and retain Preview with a concrete public reason. |

Explicit publication authorization is still required by the main Skill. The review does not authorize external changes or product execution.

## 3. Review what a reader can understand

For each section below, quote the actual answer and line evidence. A heading alone does not pass. Avoid making these questions compulsory public labels.

Before section-level acceptance, record three independent manual semantic gates with passed / failed / unresolved status and evidence:

- Representative first use: does Quick Start deliver a small but principal result for this product?
- Scenario coverage and priority: do examples cover the main tasks, with supporting/finishing tasks later?
- Product consistency: do Overview, Features, Quick Start and Usage Examples agree with the same product brief?

Any failed or unresolved consequential gate prevents README semantic acceptance, regardless of formatting passes or score. Record the reason and correction separately from automated script results. Existing checkers do not infer product priority. A source-verified workflow brief does not prove actual execution or reader understanding.

| Section | Reader question / evidence to inspect |
|---|---|
| Overview | What is it, who uses it, and what concrete result will I get? |
| Preview | Can I understand the principal capability at normal size? Was suitable actual material preferred, or is the grounded fallback illustration accurately labelled without implying execution? Is scope clear without a paragraph? |
| Features | What useful tasks can it do? Does the main two-column table explain outcomes in familiar language? |
| Installation | What is needed now, what can wait, and what request/action gets me installed? Can I distinguish actual verification from promises? |
| Quick Start | Does this small request/action represent core value, and can I understand the intended useful result without unnecessary extra explanation? |
| Usage Examples | Are principal tasks covered first, using ordinary requests? Are necessary conditions easy to find? |
| How It Works | Which components are included, what does each do, and can I use parts independently? |
| Repository Structure | Does the tree match current files, and which parts are installed or further documentation? |
| License | What rights apply to the project and to third-party materials? |
| About Me | Does the approved identity suit this publication, and is an intended contact invitation paired with an approved public route? No inferred background or filler. |

Natural-writing checks: concrete opening; Requirements explanation plus Item/Requirement table and Quick Installation; Agent client terminology; no mandatory post-prompt filler; functional tree order; familiar terms; short conversational prompts; no internal IDs/paths/task cards unless needed; short requirements table; no repeated caveats; no long image captions; no public input/output review forms. Keep essential conditions and exact identifiers where they help navigation. Developer projects may need commands and parameters. Do not use an AI-detector score as a readability measure.

Check history by meaning, not keywords. “This release fixes …; upgrade from …” is maintenance history. “Ask the Agent to refresh the dashboard” may describe the actual current product. Keep product-required publishing confirmation once at the relevant action.

## 4. Walk through first use using only the document

Record whether the reader can find these answers; do not require five labeled public paragraphs:

1. Which input is required and how to supply it? The first task must match a main capability in the product brief. A topic is enough only when the project can ask follow-up questions. Is any claimed bundled sample actually present?
2. What concrete prompt, command or action should the reader use? Is it appropriate for the audience?
3. What useful result appears, and where does the reader receive or locate it?
4. How can the reader tell that result serves the task, rather than merely seeing “completed”?
5. What next step makes sense, and what optional service/account is needed at that point?

Report unavailable integrations and unverified behavior separately. This is a text walkthrough, not proof that the product executed or that ordinary readers understood it. Running the case product is a separate task requiring suitable scope and authorization; never substitute its runtime tests for a README comparison.

## 5. Small writing examples and counterexamples

These fragments are illustrative writing examples, not real product outputs or execution evidence. For semantic priority, a content-production collection whose examples begin with only layout/export is an inadequate representation of its principal tasks; a layout-only product beginning with layout is appropriate. Record the actual product brief and judged fragment, not a blanket keyword ban.

| Too heavy / incomplete | Better direction |
|---|---|
| “Use sub-skill-name, provide a task card, set output.md and list acceptance gates …” | “Help me write an article about how to organize scattered notes.” Use the real project to verify it can accept this request. |
| “Input / Conditions / Output / Success / Next step” repeated for every task | A familiar scenario title, one short request, and a brief result or condition only if useful. |
| A screenshot followed by controls, source YAML, environment and test paragraphs | A self-explanatory real image; if necessary, one line such as “Preview of the article layout editor.” Keep provenance internally. |
| An installation paragraph listing every dependency and shell entry point | A basic/optional requirements table and a request to check, fill core gaps, install and verify. |
| A tree with ten IDs but no duties | A complete friendly-name/identifier/duty inventory; keep the tree compact. |
| “About Me: profile unavailable” or invented biography | Record the missing approved fact internally; finish unrelated draft changes without inventing release-ready copy. |

Negative semantic fixtures for manual review: a Quick Start heading with no action; an unbundled sample presented as bundled; a complete tree without component duties; an unapproved author biography. Each must be marked unresolved/fail with the relevant question and evidence. Do not claim these manual exercises are automated gates.

## 6. Compare changes fairly

For each modification stage, define the actual object (standard, template, workflow, checker or resulting README). Agree dimensions and weights, freeze the rubric before changes, preserve source inputs and before outputs, then score before and after under the same rubric with per-item evidence. Record the freeze time and hash, scoring method, reviewer and missing evidence.

A limited binary checklist score is satisfied weight / total weight × 10. Mark unknown evidence unverified; do not silently count it as passed or publish a complete score. Report blockers independently. If a rubric changes after feedback, retain historical scores and re-score every compared text under the new rubric. Do not compare numbers from different rubrics.

Use the same factual source set; record deliberate prompt/wording changes when these are the tested modification. Do not claim independent generation, blinding or real reader testing when one writer knows both versions. Retain item-by-item before/after quotations, lengths and unchanged deficiencies; do not attribute already-present facts to the rewrite.

Separate four report categories: automated document checks; manual fact/semantic/text walkthrough review; product runtime tests, if separately authorized; real reader feedback/studies, if performed. Pass/fail/skipped/not tested are distinct. Checklist coverage and engineering-hygiene scores are not overall reader-quality scores.
