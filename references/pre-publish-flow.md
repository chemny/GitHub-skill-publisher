# Pre-publish Flow

Use this flow before publishing a new skill repository or pushing an update to an existing public skill repository.

## Flow

```mermaid
flowchart TD
    A["Start: publish or update skill"] --> B["Inspect Repo<br/>Check directory, Git status, remote, branch"]
    B --> C["Classify Files<br/>Core files, templates, references, scripts, drafts, caches, generated output"]
    C --> D["Cleanup Plan<br/>List suggested deletion, redaction, .gitignore updates, or files to keep"]
    D --> E{"Deletion, redaction,<br/>move, or high-risk cleanup?"}
    E -- "Yes" --> F["Ask user to confirm cleanup"]
    E -- "No" --> G["Gitignore / Env Check"]
    F --> G
    G["Gitignore / Env Check<br/>Check .gitignore, .env, .env.example, tracked files"] --> H["Generate / Finalize README<br/>Complete README.md and README.zh.md"]
    H --> I0["Smoke Test<br/>Run scripts/smoke-test.mjs when available"]
    I0 --> I["Automated Publish Check<br/>Run scripts/publish-check.mjs when available"]
    I --> J{"Result"}
    J -- "FAIL" --> K["Fix blocking issues<br/>Secrets, local paths, missing files, private hard dependencies"]
    K --> I
    J -- "WARNING" --> L["Record warnings"]
    J -- "PASS" --> M["Skill Completeness Check"]
    L --> M
    M["Skill Completeness Check<br/>SKILL.md, README, LICENSE, references, templates"] --> N{"Can publish as<br/>an independent skill?"}
    N -- "No" --> O["Fix missing files, broken references, or hard dependencies"]
    O --> I
    N -- "Yes" --> P["Compatibility Check<br/>Codex, Claude Code, OpenClaw"]
    P --> Q{"Compatibility risk?"}
    Q -- "Yes" --> R["Report risk and options"]
    Q -- "No" --> S["Final Pre-publish Summary"]
    R --> S
    S["Final Pre-publish Summary<br/>Target, files, README, security, completeness, dependencies, compatibility, metadata, risks"] --> T{"Ask user:<br/>Publish to GitHub?"}
    T -- "No" --> U["Stop publishing<br/>Keep local results"]
    T -- "Yes" --> V["Commit confirmed files only"]
    V --> W["Publish / Push"]
    W --> X["Verify URL, branch, remote, description, clean worktree"]
    X --> Y["Done"]
```

## Confirmation gates

High-risk cleanup confirmation:

- Ask before deleting files, moving files, redacting content, or changing generated output that may be useful to the user.
- Do not treat `.gitignore` as enough. Check tracked files with Git because ignored files can already be committed.

Final publish confirmation:

- After all content, including README files, has been generated and checked, list the final publish summary.
- Ask the user explicitly whether to publish to GitHub.
- Only `commit`, `push`, `sync`, `gh repo create`, or `gh repo edit` after the user clearly confirms the publish action.

## Final pre-publish summary

Include:

- Target repository, remote URL, branch, and visibility.
- Files that will be committed or published.
- README status, including whether README files are complete and aligned.
- Security result: secrets, API keys, tokens, accounts, local paths, private files, logs, and caches.
- Completeness result: `SKILL.md`, README files, `LICENSE`, references, templates, scripts, and assets.
- Dependency result: other skills, private directories, unpublished scripts, and platform-specific assumptions.
- Compatibility result for Codex, Claude Code, and OpenClaw.
- GitHub metadata: repository description, license, and topics when useful.
- Warnings, failures, and remaining risks.
