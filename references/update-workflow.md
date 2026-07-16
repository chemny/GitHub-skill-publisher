# Update Workflow

Use this for later updates to an existing skill repository.

## Process

```text
Inspect -> Edit -> Smoke test -> Pre-publish check -> Final summary -> Commit or ask -> Push -> Verify
```

## Steps

1. Inspect the user's request and current repo state.
2. Edit only the relevant files.
3. Run cleanup, `.gitignore`, `.env`, `.env.example`, tracked-file, completeness, dependency, sensitive-data, platform compatibility, portability, and security checks when public files changed.
   - Check for API keys, user accounts, local paths, private memory files, logs, caches, and machine-specific assumptions.
   - Redact or replace sensitive/local-only content before commit.
   - Check whether new text, templates, scripts, references, or adapters create a hard dependency on another skill or private resource.
   - If a hard dependency exists, document it, make it optional, bundle it, or pause and report it to the user before publishing.
   - If README files are present, evaluate them against the current default README structure, not only the language layout.
   - If the user did not explicitly ask to preserve the current README as-is, upgrade missing README modules before publishing.
4. Run README change-impact review.
   - Compare the current diff against `README.md` and `README.zh.md`.
   - If the release changes user-visible capabilities, usage examples, install flow, dependencies, compatibility, outputs, repository/file structure, templates, scripts, safety/copyright boundaries, or GitHub metadata, update the relevant README sections before publishing.
   - If the release only contains small internal edits that do not affect public documentation, README does not need to change. Record the no-impact reason in the final pre-publish summary.
5. Run `node scripts/smoke-test.mjs` when available.
6. Run `node scripts/publish-check.mjs` when available.
   - By default this requires normalized release surface: English `README.md`, Chinese `README.zh.md`, and no legacy `README.en.md`.
   - By default this also checks required README structure modules for publisher-managed releases.
   - By default this fails when README-impacting files changed but README files did not.
   - Use `--readme-no-impact` only after reviewing the diff and confirming the changes do not affect README content.
   - Use `--allow-legacy-readme` only when the user explicitly asks to preserve old README files or publish current files as-is.
7. Show the final pre-publish summary after all content, including README files, has been generated and checked.
8. If the user's current request already included explicit edit-plus-publish authorization, commit and push after successful checks. Otherwise ask whether to publish to GitHub.
9. Commit with a clear message only after explicit publish authorization exists.
10. Push to the tracked remote.
11. Verify GitHub state.

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

If the user explicitly says only "sync", "publish", "push", or "update GitHub" after local changes are already complete, run the relevant checks, show the final pre-publish summary, and proceed.

If the user says "modify and publish", "update and sync to GitHub", "修改并发布", "改完发布", or equivalent edit-plus-publish wording in the current request, treat that as publish authorization after successful checks.

If the user only asks to edit, do not commit, push, sync, publish, or update GitHub metadata without asking first.
