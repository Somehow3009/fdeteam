# Provider Implementation Plan

**Status:** planning only; no provider, authentication, package, or project changes have been made.
**Basis:** `PROVIDER_ARCHITECTURE_PROPOSAL.md` and the current factory documentation. MetaSwarm is not installed in this repository, and no provider integration has been validated here.

## Recommendation

Implement a small factory-owned, fail-closed dispatcher around independently invoked Codex CLI and Gemini CLI adapters. Keep MetaSwarm responsible for workflow and role orchestration only after a pinned-version pilot demonstrates that its routing can be constrained. Do not let MetaSwarm's `cheapest-available` selection, escalation order, or retry behavior route this pilot. If its documented settings cannot prove that, leave its external-tools integration disabled and have the factory dispatcher invoke the selected CLI directly.

The initial pilot should be a disposable repository under `experiments/`, with synthetic input, no credentials supplied to the harness, mocked provider processes for policy tests, and no live inference. A later live smoke test would require separate owner approval and explicit spend bounds.

## Compatibility and implementation audit

### Already supported by MetaSwarm (documented, not locally verified)

- Separate Codex and Gemini CLI external-tool adapters for delegation/review, with independently configurable enablement, timeout, sandbox, and auth environment-variable name.
- Role/task-oriented invocation and per-role provider model fields in the documented `.metaswarm/models.yaml` template.
- Health adapters that report readiness, version, authentication validity, and configured model where supported.
- Reusable roles, workflow skills, review gates, and task orchestration.
- Native Codex plugin and Gemini extension distribution paths.

These are upstream-documented capabilities. This workspace has no installed MetaSwarm configuration or executable integration to verify them against. Host-specific model override semantics and Windows command behavior remain open compatibility questions.

### Must be factory-owned or independently proven

- Deterministic profile resolution to exactly one provider and model; no `cheapest-available` or implicit substitution.
- An allowlisted provider dispatcher and separate CLI adapters, with bounded timeout, cancellation, working directory, output capture, and normalized result contract.
- Default-off external execution, provider pinning, and a hard stop on any cross-provider change until a task-scoped human approval is recorded.
- Conservative error classification and fail-closed handling, including ambiguous failures.
- Human gate before potentially billable execution when cost or entitlement is unknown, and before any provider switch/replay.
- Credential-safe logging, metadata allowlisting, and verification that child-process output/errors are sanitized before persistence.
- Durable task state/approval record sufficient to prevent an automatic retry or alternate-provider launch after a failure.

Do not assume MetaSwarm provides these controls until its pinned implementation and Windows behavior have been inspected. Do not implement a second account manager: CLI authentication remains outside the factory.

## Independent CLI invocation

The dispatcher resolves a role to a named, non-secret model profile and then calls exactly one provider adapter. Adapters are separate process boundaries with separate executable resolution, arguments, timeout/cancellation, stdout/stderr handling, and health status. No provider's output is fed to another provider automatically.

For Codex, the adapter should invoke the installed `codex` executable in its documented noninteractive task mode, passing the selected model only if the pinned CLI supports that option. For Gemini, it should invoke the installed `gemini` executable in its documented prompt/noninteractive mode, with its model option only if supported by the pinned CLI. Exact command flags and structured-output modes must be verified from the selected CLI versions before implementation; the proposal's existing environment record says Gemini version checking currently fails with `EPERM`, so Gemini is a pilot prerequisite, not an assumed-ready dependency.

The adapter contract should be narrow: `describe`, non-billable `health` where supported, `invoke(request)`, and `classify(result)`. The request includes task ID, role, explicit profile, bounded timeout, working directory, and output expectations. It does not include credentials. Child environment should be inherited only as required for CLI-managed auth; the dispatcher must not read or print credential variables or auth stores.

## Authentication and account control

- Codex CLI and Gemini CLI each use their own already-configured local auth mechanism.
- The factory neither logs in, logs out, selects an account, changes account state, reads credential files, nor copies credentials.
- Profiles contain provider/model aliases and non-secret execution settings only. No account identity or credential fields are allowed.
- Health may report `ready`, `not_ready`, or `unknown`; it must not claim a human account identity or remaining quota.
- If a CLI cannot provide a safe non-secret auth readiness signal, record auth readiness as unknown and stop before invocation unless the owner explicitly authorizes a bounded operation.

## Routing, approvals, and fail-closed behavior

Automatic cross-provider fallback is disabled by construction: one task attempt has one provider/profile binding. A failure ends the attempt and leaves task state failed or blocked. The dispatcher must not launch another provider, silently substitute a model, or replay a potentially billable request.

| Condition | Required behavior |
|---|---|
| Authentication missing/invalid | Stop; report sanitized `authentication_failed`; user resolves auth in that CLI. No retry or fallback. |
| Quota exhausted | Stop; report `quota_exhausted` only on an explicit reliable signal; no retry/fallback. |
| Rate limited | Stop; report `rate_limited` only when distinguishable; no automatic retry or fallback. |
| Model missing/inaccessible | Stop with `model_unavailable` only on a specific signal; never substitute another model. |
| CLI missing, provider unavailable, timeout, malformed response | Stop with the known category or `unknown`; preserve task for manual resolution; no fallback. |
| Ambiguous 429/quota text or unrecognized output | `unknown`; stop. Do not infer a category or retry. |

Provider switching requires an explicit owner decision scoped to task ID, alternate provider, model profile, one bounded attempt, and acknowledged cost/account uncertainty. The approval record must be written before invocation. Potentially billable operations require approval whenever spend is not explicitly covered by an owner-approved budget and entitlement. This includes a live health/smoke inference, a replay, or a provider switch. An ordinary non-billable executable/version check does not authorize inference.

## Execution record and secret handling

Record an allowlist of: task ID, role, provider key, model profile alias (and model ID only if non-sensitive), task status, start/end timestamps, duration, CLI version when available, exit code, normalized error category, attempt number, approval decision/scope, and artifact references. Usage/cost fields are recorded only when the CLI supplies reliable structured values.

Do not persist raw prompts, arbitrary stdout/stderr, environment dumps, credential-bearing arguments, auth paths/content, tokens, headers, or account identifiers. Keep only sanitized summaries and explicit artifact paths. Apply redaction before any log write; prefer allowlisted fields over attempting to redact arbitrary output. Local execution records must be excluded from version control if introduced. Tests must include recognizable fake secret strings and assert they never reach persisted logs.

## Smallest isolated pilot

1. Pin a MetaSwarm release/commit and record the exact Codex, Gemini, Node, and Windows versions available. Inspect the pinned external-tools schema, adapter commands, retries/escalation, environment propagation, output handling, and Windows shell dependencies. No install occurs in this planning phase.
2. Create a disposable synthetic repository under `experiments/provider-pilot/` (or a separate disposable checkout). Initially use mock executables only. Implement one dispatcher, two thin adapters, a minimal non-secret profile file, and one execution ledger schema.
3. Exercise success and all failure classes through controlled mock exit codes/output. Verify that only the selected executable is called, no hidden retry occurs, logs are redacted, and approval state gates provider switching and billable invocation.
4. Validate each CLI's non-inference version/help and documented auth-readiness commands only after the Windows access issue is resolved. Do not inspect credentials.
5. A live inference smoke test is out of scope for this plan and requires separate explicit approval, selected models, account confirmation by the owner in each CLI, and a maximum attempt/spend boundary.

## Files that would need to change in a future implementation

No files besides this plan are changed now. Likely future files:

- `factory/providers/` — dispatcher contract and Codex/Gemini CLI adapters.
- `factory/config/provider-profiles.yaml` — non-secret provider/model aliases and default-off flags.
- `factory/schemas/` — profile, invocation, execution record, and approval schemas.
- `factory/policies/provider-execution.md` — fallback, approval, auth, cost, error, and logging rules.
- `workflows/` — provider pinning and approval gate references in task lifecycle.
- `experiments/provider-pilot/` — mock executables, fixtures, and integration harness.
- `.gitignore` — only if the pilot creates local logs or generated state; preserve existing entries.
- `docs/SETUP_STATUS.md` and `docs/FACTORY_ARCHITECTURE.md` — update only after measured pilot evidence exists.
- MetaSwarm-specific project configuration (exact path/version TBD) — only if pinned-source inspection proves required controls can be represented safely; do not overwrite existing configuration without owner approval.

These are planning targets, not a commitment that every file is necessary. The pilot may reduce scope after the actual pinned CLI and MetaSwarm interfaces are inspected.

## Dependency and compatibility assessment

| Component | Current evidence | Assessment / gate |
|---|---|---|
| MetaSwarm | Docs describe Codex and Gemini delegation, health, per-role provider models; not installed in this repo. | Orchestration candidate only. Pin and inspect implementation before relying on controls. Default cheapest-provider/escalation behavior conflicts with this policy unless demonstrably disabled. |
| Codex CLI | Setup status records `codex-cli 0.162.0-alpha.17.2`; CLI/plugin capabilities not verified for this workspace. | Separate adapter is feasible; verify the installed build's noninteractive invocation, model flag, output contract, and exit behavior. |
| Gemini CLI | Command exists, but the recorded version check fails with `EPERM` resolving the user home; auth/version are unverified. | Not ready for integration validation. Resolve access through an approved supported environment path; no auth changes or credential inspection. |
| Windows / PowerShell | Workspace is Windows; MetaSwarm PowerShell behavior is unverified. | Adapter process invocation, quoting, cancellation, environment inheritance, and exit code capture need a mock-based Windows test. |
| Dependencies | Existing docs identify Node/npm and optional MetaSwarm ecosystem dependencies; no provider harness exists. | Add no packages in the pilot unless separately approved. Prefer built-in runtime facilities and mock executables. |
| Costs/auth | CLIs manage credentials independently; entitlement and per-call cost cannot be inferred from readiness. | No external call in compatibility tests. Live calls require explicit owner approval. |

## Acceptance criteria

- Each request resolves to one explicit provider and model profile; missing/ambiguous configuration fails before process launch.
- Codex and Gemini adapters can be invoked independently and tested with mocks without reading or modifying authentication state.
- No automatic cross-provider fallback, model substitution, or unsafe replay occurs for any failure class.
- Authentication failure, quota exhaustion, rate limit, unavailable model, provider outage, and unknown errors each stop the task; classification is conservative and testable.
- Switching provider and any potentially billable operation require a task-scoped approval record before launch.
- Execution records include provider identity, model profile, task status, and safe metadata, while fake credentials and raw sensitive output are absent.
- The isolated pilot passes on the supported Windows shell; MetaSwarm integration is enabled only if pinned implementation evidence confirms the controls above.
- No TDH/external project is inspected or changed; no package is installed; no deployment or unapproved paid call occurs.

## Test plan

All initial tests are local and mocked; no tests are run as part of this planning deliverable.

1. **Profile validation:** unknown provider/profile, missing model, disabled provider, and malformed config fail closed before process launch.
2. **Independent invocation:** mock Codex and Gemini executables record their invocation; assert only the selected one ran and arguments contain no credentials.
3. **Failure matrix:** simulate auth failure, quota, rate limit, unavailable model, missing executable, timeout, cancellation, malformed output, and unknown error; assert stopped task state and zero alternate-provider calls/retries.
4. **Approval gates:** assert provider switch and billable invocation are blocked without an exact task-scoped approval; assert approval cannot be reused for another task/provider/profile or excess attempts.
5. **Secret redaction:** emit fake keys/tokens in stdout, stderr, and error strings; assert persisted records contain neither the values nor unredacted raw output.
6. **Metadata/state:** assert provider key, profile alias, task ID/status, timestamps, exit code, normalized category, and approval decision are present and schema-valid.
7. **Windows process behavior:** test quoting, working directory, timeout, cancellation, and exit-code capture against mock executables in PowerShell.
8. **Pinned MetaSwarm compatibility:** after source pinning, static inspection plus isolated config test proves automatic routing/retries are disabled or bypassed. If not provable, keep MetaSwarm external delegation disabled.
9. **Optional live readiness:** only with separate owner authorization, use non-inference documented CLI checks; any live inference requires a distinct explicit spend approval and remains outside acceptance of this plan.

## Open decisions before implementation

- Which MetaSwarm version/commit is the compatibility target?
- What non-secret model IDs/aliases does the owner approve for the pilot?
- Which local execution-record location and retention period are acceptable?
- What explicit spend ceiling and approval mechanism would govern any later live smoke test?
- Can Gemini CLI operate in this Windows environment without changing account authentication?
