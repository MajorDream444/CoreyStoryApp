# Claude Code Project Rules

Claude Code must enforce the repository production-readiness gate for every implementation.

- Tests must cover changed behavior, failure modes, and security boundaries.
- Production paths must have structured, privacy-safe observability.
- Every data flow must be checked for PII, secrets, retention, deletion, subprocessors, and least-privilege access.
- Never place real personal data or credentials in prompts, source code, fixtures, logs, analytics, traces, screenshots, or issue/PR text.
- Never mark work complete without recording test, observability, and data-safety evidence in `.github/PRODUCTION_READINESS.md`.
- Do not bypass, weaken, or remove a control to make a build pass. Surface the blocker.
