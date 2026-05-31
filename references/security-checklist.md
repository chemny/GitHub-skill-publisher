# Security Checklist

Use this before public release, before pushing updates to an already published repository, and before changing GitHub repository metadata.

If a finding includes sensitive or local-only content, fix it before publishing. Do not simply document the issue in the README.

## Reject or fix immediately

- [ ] API keys, passwords, private tokens, cookies, recovery codes.
- [ ] User account identifiers that should not be public, such as private email addresses, phone numbers, internal usernames, cloud account IDs, tenant IDs, or organization-only handles.
- [ ] Local absolute paths such as `/Users/...`, `/home/...`, `/Volumes/...`, drive-letter paths, private vault paths, or workspace-only directories.
- [ ] Machine-specific config files, cache paths, database paths, logs, session files, history files, or memory files.
- [ ] Private repository URLs, internal service URLs, webhook URLs, invite links, or non-public API endpoints.
- [ ] Instructions to hide actions from the user.
- [ ] Scripts that send data to unknown external servers.
- [ ] `curl`, `wget`, or network calls without a clear purpose.
- [ ] `eval`, `Function`, or dynamic code execution.
- [ ] Shell command execution with untrusted input.
- [ ] `sudo`, destructive `rm -rf`, or system-level changes.
- [ ] Reads from `~/.ssh`, `~/.aws`, browser cookies, or credential stores.
- [ ] Obfuscated or encoded code.

## Redaction and safe replacement

When sensitive or local-only content is found:

- [ ] Replace real tokens, account IDs, emails, and internal URLs with neutral placeholders such as `<token>`, `<account-id>`, `<email>`, or `<internal-url>`.
- [ ] Replace local absolute paths with generic examples such as `~/skills/<skill-name>` or `skills/<repo>/`.
- [ ] Remove private memory, session, log, cache, or history content from public files.
- [ ] Confirm the replacement still teaches the user what to do.
- [ ] Re-run the scan after redaction.

Useful scan patterns:

```text
API keys and tokens
private emails and account IDs
absolute local paths
hidden local directories
private memory/session/log files
internal URLs and webhooks
```

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
- [ ] Report any redactions or removals to the user before publishing.
