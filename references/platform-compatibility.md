# Platform Compatibility

Run this test before publishing a public skill repository.

The default target platforms are:

```text
Codex
Claude Code
OpenClaw
```

## Goal

Confirm whether the skill can be installed, discovered, and used across all target platforms without hidden local assumptions.

If compatibility is partial or broken, tell the user before publishing and pause for confirmation. Do not silently publish a repository that claims compatibility when a platform is incompatible or untested.

## Required behavior before publishing

- Test each target platform when the local environment or available tooling makes that possible.
- If a platform cannot be tested, mark it `Not tested` and explain the reason.
- If a platform is partially compatible, mark it `Partial` and explain exactly what works and what does not.
- If a platform is incompatible, mark it `Unsupported` and tell the user before any commit, push, or GitHub publication.
- Do not replace real testing with assumptions. Static review is useful, but it must be labeled as review rather than tested support.

## Compatibility checks

- [ ] `SKILL.md` is at the repository root.
- [ ] `SKILL.md` uses valid YAML frontmatter.
- [ ] `name`, `description`, and trigger contexts are clear.
- [ ] Instructions do not depend on one platform's private memory files.
- [ ] Instructions do not depend on one platform's hidden runtime behavior.
- [ ] Installation docs explain generic placement in an agent skills directory.
- [ ] Platform-specific paths are examples only, not requirements.
- [ ] Any scripts use portable relative paths.
- [ ] Any scripts document runtime requirements such as Node.js, Python, `gh`, or shell tools.
- [ ] Network, filesystem, browser, email, Slack, Lark, GitHub, or other connector requirements are explicit.
- [ ] Platform-specific capabilities are isolated in adapters or clearly marked sections.
- [ ] README includes a verification prompt that can be tried after a fresh session.

## README compatibility sentence

Add or verify a short compatibility sentence in the README when publishing for broad use:

```markdown
Compatible with Codex, Claude Code, and OpenClaw.
```

Do not put internal statuses such as `Supported`, `Partial`, `Unsupported`, or `Not tested` in the README unless the user explicitly asks for a detailed compatibility matrix. Use those statuses in the pre-publish report to the user.

## Reporting format

Before publishing, report compatibility clearly:

```text
Platform compatibility:
- Codex: Supported / Partial / Unsupported / Not tested — [reason]
- Claude Code: Supported / Partial / Unsupported / Not tested — [reason]
- OpenClaw: Supported / Partial / Unsupported / Not tested — [reason]
```

If any status is `Partial`, `Unsupported`, or `Not tested`, ask the user whether to continue, revise docs, or fix compatibility first.

## README wording

Prefer clear support claims:

- "Designed to be portable across Codex, Claude Code, and OpenClaw."
- "Tested with Codex. Claude Code and OpenClaw are not yet tested."
- "Requires GitHub CLI (`gh`) for repository creation; README writing still works without it."

Avoid vague claims:

- "Works everywhere."
- "Universal agent skill."
- "Fully compatible" when only one platform was tested.
