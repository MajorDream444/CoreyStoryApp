# Engineering Instructions

## Mandatory production-readiness gate

No feature is complete, mergeable, deployable, or commercially classifiable until all three controls have evidence:

1. **Tests:** Add or update automated tests for changed behavior, including failure paths and authorization boundaries. Run the relevant suite and report results. Never delete or weaken tests merely to obtain a green build.
2. **Observability:** Add structured, privacy-safe logs, error capture, and useful health/performance signals for new production paths. Include correlation IDs where appropriate. Never log secrets, tokens, prompt contents, or personal data.
3. **Data and PII safety:** Map what data enters, where it is stored, every processor it reaches, retention, deletion, and access controls. Minimize collection; redact logs; use synthetic test data; encrypt sensitive data; and prevent unapproved PII from reaching model providers, analytics, or monitoring tools.

Before finishing work, complete the repository's `.github/PRODUCTION_READINESS.md` evidence section. If a control is not applicable, explain why. If a control cannot be satisfied, stop and disclose the gap rather than silently shipping.
