# Platform Compatibility

Run this test before publishing a public skill repository.

The default target agent runtimes are:

```text
Codex
Claude Code
```

Only these two clients are in the default compatibility review. Do not add other clients as checks, unresolved review items or publication gates without an explicit user request.

The required target operating systems are:

```text
macOS
Windows
```

Linux compatibility is optional. Test or review it when it is easy or relevant, but do not treat missing Linux validation as a release blocker by default.

## Goal

Confirm whether the skill can be installed, discovered, and used across target agent runtimes and required operating systems without hidden local assumptions.

If macOS or Windows compatibility is partial, broken, or not checked, tell the user before publishing and pause for confirmation. Do not silently publish a repository that claims compatibility when a required operating system is incompatible or untested.

## Required behavior before publishing

- Test each target platform when the local environment or available tooling makes that possible.
- Test or statically review macOS and Windows compatibility whenever scripts, installers, path handling, shell commands, browser automation, filesystem operations, or external CLIs are involved.
- Treat Linux compatibility as optional unless the user, repository, or documented runtime explicitly requires Linux.
- If a platform cannot be tested, mark it `Not tested` and explain the reason.
- If a platform is partially compatible, mark it `Partial` and explain exactly what works and what does not.
- If macOS or Windows is incompatible, partial, or not checked, tell the user before any commit, push, or GitHub publication.
- Do not replace real testing with assumptions. Static review is useful, but it must be labeled as review rather than tested support.

## Compatibility checks

- [ ] `SKILL.md` is at the repository root.
- [ ] `SKILL.md` uses valid YAML frontmatter.
- [ ] `name`, `description`, and trigger contexts are clear.
- [ ] Instructions do not depend on one platform's private memory files.
- [ ] Instructions do not depend on one platform's hidden runtime behavior.
- [ ] Installation docs use an Agent-directed installation request and do not make the user choose a platform directory.
- [ ] Platform-specific paths are examples only, not requirements.
- [ ] Any scripts use portable relative paths.
- [ ] Any scripts document runtime requirements such as Node.js, Python, `gh`, or shell tools.
- [ ] Network, filesystem, browser, email, Slack, Lark, GitHub, or other connector requirements are explicit.
- [ ] Dependencies on other skills are absent, optional, bundled, or documented.
- [ ] The skill can be installed without private user memory, local-only folders, or unpublished companion skills.
- [ ] Platform-specific capabilities are isolated in adapters or clearly marked sections.
- [ ] README includes a verification prompt that can be tried after a fresh session.
- [ ] macOS is explicitly considered when the skill uses scripts, installers, paths, shell commands, browser automation, filesystem operations, or external CLIs.
- [ ] Windows is explicitly considered when the skill uses scripts, installers, paths, shell commands, browser automation, filesystem operations, or external CLIs.
- [ ] Windows checks do not rely on POSIX-only tools such as `bash`, `sh`, `sed`, `grep`, `xargs`, `cp`, `mv`, `rm`, `chmod`, or Unix-only path assumptions unless an adapter or fallback is documented.
- [ ] Node.js scripts use `path.join`, `path.resolve`, `path.relative`, and `path.sep` instead of hardcoded `/` path assumptions for filesystem operations.
- [ ] External CLIs required on Windows, such as `git`, `node`, `python`, or `gh`, are documented and expected to be available in `PATH`.

## README compatibility and conditions

Follow [readme-style.md](readme-style.md): put reader-relevant support and minimum core runtime conditions in the Installation table before the install action, not in a separate top-level compatibility section. Keep detailed OS entry points and internal test status in the review or deeper documentation; surface a limitation only when it changes the ability to start. Optional integration environments are prepared on demand by the Agent.

Name supported clients only when evidence justifies the claim. If support is partial or untested and that affects the reader, explain the actual boundary plainly. Do not hide it to keep the sentence short. For example: “Tested with Codex; Claude Code has not been tested yet.” Static review must not be described as a successful runtime test.

Keep internal status labels and detailed test matrices in the pre-publish report unless explicitly requested in the README. A concise user-facing statement of an untested platform is required when relevant; it is not an internal testing log.

Distinguish core dependencies, optional integrations and platform-specific capabilities. State required versions, account access or external services where they affect installation or use. Successful installation, CI or testing of one component does not establish support for every integration or OS.

For a collection, apply the root-level SKILL.md checks below to the actual component entry points and authorized collection layout; see [repo-structure.md](repo-structure.md).

## Reporting format

Before publishing, report compatibility clearly:

```text
Platform compatibility:
- Codex: Supported / Partial / Unsupported / Not tested — [reason]
- Claude Code: Supported / Partial / Unsupported / Not tested — [reason]
OS compatibility:
- macOS: Supported / Partial / Unsupported / Not tested — [reason]
- Windows: Supported / Partial / Unsupported / Not tested — [reason]
- Linux: Supported / Partial / Unsupported / Not tested / Optional not checked — [reason]
```

If macOS or Windows is `Partial`, `Unsupported`, or `Not tested`, stop before publishing and ask the user whether to continue, revise docs, or fix compatibility first. Linux can be reported as optional when it was not checked.

## README wording

Prefer clear support claims:

- "Designed to be portable across Codex and Claude Code."
- "Tested with Codex. Claude Code is not yet tested."
- "Requires GitHub CLI (`gh`) for repository creation; README writing still works without it."

Avoid vague claims:

- "Works everywhere."
- "Universal agent skill."
- "Fully compatible" when only one platform was tested.
