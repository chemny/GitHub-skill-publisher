# Repository Structure

The preferred publishing model is one skill per repository.

## Standard layout

```text
skill-name/
├── README.md
├── README.zh.md
├── LICENSE
└── SKILL.md
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

Use a collection repository only if the user explicitly asks for one.

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
