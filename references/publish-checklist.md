# Publish Checklist

Run this checklist before publishing a skill repository.

## Repository

- [ ] Repository root is the skill root.
- [ ] `SKILL.md` is at the root.
- [ ] `README.md` exists.
- [ ] `README.zh.md` exists.
- [ ] `LICENSE` exists.
- [ ] License is MIT unless the user requested another license.
- [ ] `.gitignore` exists if generated files may appear.
- [ ] Folder names are portable.

## GitHub repository metadata

- [ ] Repository description is filled in GitHub.
- [ ] Description explains what the skill does in one sentence.
- [ ] Description is concrete, not generic, empty, or only the skill name.
- [ ] Description matches the README value proposition.
- [ ] Topics are added when useful.

## Skill metadata

- [ ] `SKILL.md` has valid YAML frontmatter.
- [ ] Frontmatter includes `name`.
- [ ] Frontmatter includes a strong `description`.
- [ ] Description contains trigger phrases and task contexts.
- [ ] No private `local_updated_at` or machine-specific metadata is required for release.

## README

- [ ] Explains why the skill exists.
- [ ] Explains who should use or install it.
- [ ] Names target users, target workflows, and non-target cases.
- [ ] Explains what problems it solves.
- [ ] Explains why it is worth installing.
- [ ] Explains what it can do.
- [ ] Explains how it works.
- [ ] Explains design principles and practical advantages.
- [ ] Reduces comprehension friction: reader can tell what it is and why it matters from the first screen.
- [ ] Reduces trust friction: mechanism and limits of authority are clear.
- [ ] Reduces action friction: install, verify, and first-use path are easy to follow.
- [ ] Uses baseline or full structure according to the skill's complexity.
- [ ] Includes diagrams only when process-oriented.
- [ ] Includes install instructions beyond a bare `git clone`.
- [ ] Explains `SKILL.md` must be at the skill root.
- [ ] Explains that a fresh agent session may be needed after installation.
- [ ] Includes a verification prompt.
- [ ] Includes a quick-start or first-success example.
- [ ] Includes update instructions.
- [ ] Includes usage examples.
- [ ] Includes repository structure generated from actual files.
- [ ] Explains license and copyright limits.
- [ ] `README.md` is English-only by default, except intentional language-switch labels.
- [ ] `README.zh.md` is complete Chinese documentation, not a short placeholder.
- [ ] `README.md` and `README.zh.md` link to each other near the top using a clear language switch.
- [ ] English and Chinese READMEs are aligned in substance.
- [ ] No accidental mixed-language README body unless the user explicitly requested a single bilingual README.
- [ ] No default limitations section unless the user asks for one.
- [ ] Repository structure, if shown, matches actual files.

## Portability

- [ ] Compatibility with Codex, Claude Code, and OpenClaw has been tested where possible.
- [ ] Any untestable platform is marked `Not tested` with a reason.
- [ ] Any incompatible platform is marked `Unsupported` and reported to the user before publishing.
- [ ] Any partially compatible platform is marked `Partial` with exact limitations.
- [ ] README includes a concise compatibility sentence when publishing for broad use.
- [ ] Untested platforms are marked `Not tested`, not implied as supported.
- [ ] No absolute local paths such as `/Users/...`.
- [ ] No user-specific memory files.
- [ ] No local tool directories or local install assumptions unless explicitly documented as optional examples.
- [ ] Host-specific behavior is isolated in adapters.

## Git

- [ ] `git status` reviewed.
- [ ] Commit includes only intended files.
- [ ] Remote points to the intended GitHub repository.
- [ ] Branch is correct, usually `main`.
- [ ] Repository visibility matches user intent.
- [ ] GitHub repository description is verified after publish or update.
