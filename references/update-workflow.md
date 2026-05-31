# Update Workflow

Use this for later updates to an existing skill repository.

## Process

```text
Inspect -> Edit -> Review diff -> Commit -> Push -> Verify
```

## Steps

1. Inspect the user's request and current repo state.
2. Edit only the relevant files.
3. Run completeness, dependency, sensitive-data, platform compatibility, portability, and security checks when public files changed.
   - Check for API keys, user accounts, local paths, private memory files, logs, caches, and machine-specific assumptions.
   - Redact or replace sensitive/local-only content before commit.
   - Check whether new text, templates, scripts, references, or adapters create a hard dependency on another skill or private resource.
   - If a hard dependency exists, document it, make it optional, bundle it, or pause and report it to the user before publishing.
4. Show or summarize the diff if the user wants discussion before publishing.
5. Commit with a clear message.
6. Push to the tracked remote.
7. Verify GitHub state.

## Common update types

```text
README update
Security patch
Skill trigger update
Template update
Reference docs update
Script hardening
Release prep
Dependency audit
Sensitive-data redaction
```

## Commit messages

Use concise imperative messages:

```text
Improve bilingual README
Harden helper script paths
Add trigger governance docs
Update publish checklist
```

## Discussion-first rule

If the user asks to "look at", "discuss", "improve the writing", "review", or "what do you think", do not push automatically.

If the user explicitly says "sync", "publish", "push", or "update GitHub", proceed after the relevant checks.
