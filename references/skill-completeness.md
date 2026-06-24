# Skill Completeness And Dependency Check

Run this before publishing a new skill repository and before updating an already published skill repository.

## Goal

Confirm that the skill is complete enough to install and use, and that it does not silently depend on other private skills, local-only files, unpublished scripts, or hidden runtime state.

If a required dependency is missing, private, or platform-specific, tell the user before publishing and pause for confirmation.

## Required files

- [ ] `SKILL.md` exists at the repository root.
- [ ] `SKILL.md` has valid YAML frontmatter.
- [ ] Frontmatter includes `name`, `description`, and `version` when available.
- [ ] `README.md` exists for public repositories.
- [ ] `README.zh.md` exists when bilingual publishing is required.
- [ ] `LICENSE` exists.
- [ ] `.gitignore` exists when generated files, build output, local caches, or package managers may appear.

## Skill logic completeness

- [ ] The skill states when to use it.
- [ ] The skill states what it should not be used for when that matters.
- [ ] Required references listed in `SKILL.md` actually exist.
- [ ] Templates listed in `SKILL.md` actually exist.
- [ ] Scripts listed in `SKILL.md` actually exist and are executable or documented.
- [ ] Relative paths in instructions resolve from the skill root.
- [ ] The skill can still provide value if optional references, scripts, or adapters are not used.

## Dependency check

Look for hard dependencies on:

- [ ] Other skills by name.
- [ ] Private local paths.
- [ ] User memory files.
- [ ] Host-specific config files.
- [ ] Local databases, caches, logs, or session files.
- [ ] Specific tools such as `gh`, Node.js, Python, browser automation, Slack, Gmail, Lark, or other connectors.
- [ ] Network services, API keys, cloud accounts, or private endpoints.

For every dependency, classify it:

```text
required       must be installed or available for the skill to work
optional       improves workflow but the skill still works without it
adapter-only   isolated to a platform or integration adapter
private        must not be published as-is
```

## Dependency handling

- [ ] Required public dependencies are documented in README and `SKILL.md`.
- [ ] Optional dependencies are clearly marked optional.
- [ ] Adapter-only dependencies are isolated in adapter sections or files.
- [ ] Private dependencies are removed, replaced, or documented as unsupported before publishing.
- [ ] The user is told before publishing if a dependency cannot be bundled, documented, or removed.

## Pre-publish report

Report the result before publishing:

```text
Completeness:
- Required files: pass/fail
- Missing references/templates/scripts: none / [list]
- Hard dependencies: none / [list]
- Private or local-only dependencies: none / [list]
- Required fixes before publish: none / [list]
```
