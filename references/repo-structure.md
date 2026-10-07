# Repository Structure

The preferred publishing model is one skill per repository. Follow [readme-style.md](readme-style.md) for the README framework. Repository Structure / 目录结构 is its eighth section; this reference explains file layout, not another reading order.

## Standard layout

```text
skill-name/
├── SKILL.md
├── README.md
├── README.zh.md
└── LICENSE
```

`SKILL.md` must be at the repository root.

Optional directories depend on the skill:

```text
references/
adapters/
scripts/
evals/
```

## Do not use this by default

```text
my-skills/
└── skills/
    └── skill-name/
```

Use a collection repository only if the user explicitly asks for one. For an authorized collection, inspect its actual entry points and installation behavior instead of claiming every SKILL.md must be at the root. Explain the orchestrator, included sub-Skills and optional companions accurately.

## Required files

```text
SKILL.md
README.md
README.zh.md
LICENSE
```

If the user does not specify a license, create an MIT `LICENSE`.

Optional when useful:

```text
.gitignore
references/
evals/
scripts/
adapters/
```

## Naming

Prefer kebab-case for the repository name. Preserve the user's requested casing and wording when they explicitly specify a name.

```text
agent-evolution
GitHub-skill-publisher
```

Keep the `name` in `SKILL.md` aligned with the repository name unless the user has a reason to differ.

## README tree and inventory

Generate a compact tree from actual files, ordered by functional importance: core entry points/capabilities first; execution and configuration next; supporting assets/docs next; README and license files last. The tree is an explanatory view, not an alphabetical file listing. Select the actual order for this product; do not copy another project's directory names. Include principal directories such as assets/, docs/, references/, scripts/, templates/ or skills/ only when present, with plain-language descriptions. Do not expose local workspaces, caches, logs or drafts in the public tree unless deliberately included and useful.

List every included sub-Skill with a friendly name, exact identifier and responsibility in How It Works; do not rely on an abbreviated tree to communicate the complete inventory. Summarize repeated children in the tree when the complete inventory is already above; do not single out one child as though it were the entire collection. In Repository Structure, explain what installation loads and how that differs from the checkout, especially for collections with optional plugins or separate tooling.

Link further usage, configuration, contribution and developer documentation here. Update the tree and component inventory when files or installation contents change. Do not add an absent directory to make a template look complete.
