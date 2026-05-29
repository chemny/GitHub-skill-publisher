# Security Checklist

Use this before public release.

## Reject or fix immediately

- [ ] API keys, passwords, private tokens, cookies, recovery codes.
- [ ] Instructions to hide actions from the user.
- [ ] Scripts that send data to unknown external servers.
- [ ] `curl`, `wget`, or network calls without a clear purpose.
- [ ] `eval`, `Function`, or dynamic code execution.
- [ ] Shell command execution with untrusted input.
- [ ] `sudo`, destructive `rm -rf`, or system-level changes.
- [ ] Reads from `~/.ssh`, `~/.aws`, browser cookies, or credential stores.
- [ ] Obfuscated or encoded code.

## Script safety

If scripts write files:

- [ ] Prefer relative paths only.
- [ ] Reject absolute paths.
- [ ] Reject `..` traversal.
- [ ] Restrict output file types when possible.
- [ ] Avoid network access unless required.
- [ ] Avoid shell execution unless required.

## Documentation safety

- [ ] Do not ask users to paste GitHub tokens.
- [ ] Prefer browser/device login for GitHub CLI.
- [ ] Explain high-impact operations before running them.
- [ ] Do not publish private memory files.
- [ ] Do not include local-only credentials or paths in examples.
