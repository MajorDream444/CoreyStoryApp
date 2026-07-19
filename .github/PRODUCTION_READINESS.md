# Production Readiness Gate

This gate applies to every new feature, integration, agent, workflow, API, data pipeline, and deployment.

## 1. Automated tests

Required evidence:

- [ ] Changed behavior has unit and/or integration coverage.
- [ ] Critical user journey has an end-to-end or contract test.
- [ ] Failure, retry, timeout, authorization, and invalid-input paths are covered where relevant.
- [ ] Tests use synthetic or irreversibly anonymized data.
- [ ] Relevant test commands pass in CI.

Evidence (commands, CI link, coverage, exceptions):

> Add evidence here.

## 2. Observability

Required evidence:

- [ ] Structured logs exist for important state transitions and failures.
- [ ] Errors are captured with actionable context and correlation IDs.
- [ ] Health, latency, error-rate, and dependency signals exist where relevant.
- [ ] Alerts have an owner and a useful threshold.
- [ ] Logs, traces, metrics, and error reports contain no secrets or unnecessary personal data.
- [ ] A rollback or containment path is documented.

Evidence (dashboards, alerts, sample sanitized event, owner):

> Add evidence here.

## 3. Data, privacy, and PII

Required evidence:

- [ ] Data inventory identifies inputs, purpose, storage, processors/subprocessors, and outputs.
- [ ] Collection is limited to what the feature actually needs.
- [ ] PII and secrets are classified before implementation.
- [ ] Sensitive fields are encrypted in transit and at rest.
- [ ] Access follows least privilege and is auditable.
- [ ] Retention and deletion rules are defined and testable.
- [ ] PII is redacted from prompts, logs, traces, analytics, fixtures, screenshots, and support artifacts.
- [ ] Third-party/model-provider data use is approved and documented.
- [ ] User consent, export, correction, and deletion requirements are handled where applicable.
- [ ] Incident response owner and notification path are known.

Data-flow summary and evidence:

> Data source → processing → storage → subprocessors → output → retention/deletion.

## Release decision

- [ ] PASS — all required controls have evidence.
- [ ] EXCEPTION — named owner, written risk acceptance, compensating control, and expiry date are recorded.
- [ ] BLOCKED — do not merge or deploy.

Owner:

Review date:

Exception expiry (if any):

## Definition of done for coding agents

Codex, Claude Code, and other coding agents must treat this gate as part of the task. They must not claim completion when any applicable item lacks evidence. “Not applicable” requires a written reason.
