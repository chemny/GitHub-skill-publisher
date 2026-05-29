# GitHub Publishing Workflow

Use this for first-time publishing.

## Before publishing

1. Confirm repository name.
2. Confirm public or private visibility.
3. Confirm repository root is the skill root.
4. Run publish, platform compatibility, and security checks.
5. Review `git status`.

## Authentication

Prefer GitHub CLI browser/device login:

```bash
gh auth login
```

Do not ask the user to paste a token into chat.

If browser/device flow is used, guide the user through:

```text
GitHub.com
HTTPS
Authenticate Git: yes
Login with browser/device code
```

## Create and push

For a new public repository:

```bash
gh repo create <repo-name> --public --source=. --remote=origin --push
```

For an existing empty repository:

```bash
git remote add origin <repo-url>
git push -u origin main
```

## Verify

After push:

```bash
git status --short
git remote -v
git log --oneline -1
gh repo view <owner>/<repo> --json url,visibility,defaultBranchRef
```

Return the GitHub URL to the user.
