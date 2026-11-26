# AI Provider Architecture Proposal

**Status:** proposal only; no auth changes, account changes, provider configuration, or installations were performed.
**Assessment date:** 2026-11-25 (Asia/Saigon)

## Decision summary

Use OpenAI Codex CLI and Google Gemini CLI as independent provider adapters behind a small factory-owned provider contract. Keep role prompts and SDLC phases provider-neutral. Store model preferences as references to named model profiles, and keep authentication entirely in each CLI's own local credential mechanism or an approved OS credential store. A provider profile selects a CLI and model, but never selects or changes an account.

MetaSwarm is compatible as an orchestration/workflow framework and can delegate work/review to both CLIs. Its documented default external-tool routing and retries can automatically cross providers. Therefore stock routing must not be enabled unchanged under this factory policy. For the initial integration, allow explicit provider pinning only; disable cross-provider automatic escalation and disable retries that may replay billable work unless they are demonstrably safe and policy-approved. If MetaSwarm cannot express that behavior, put a thin factory dispatcher in front of its external adapters or keep cross-provider delegation disabled. Do not invent a MetaSwarm API: use only documented configuration/commands and inspect the pinned implementation during a future pilot.

## Separation of concerns

| Concern | Owned by | Repository treatment |
|---|---|---|
| Agent roles | Factory role catalog / MetaSwarm reusable roles | Provider-neutral responsibility and artifacts; no account or credential fields. |
| Workflow | Factory SDLC and MetaSwarm workflow skills | Defines phase order, dependencies, gates, and approvals; independent of CLI login state. |
| Model selection | Named model profiles and role-to-profile mapping | Non-secret IDs, provider, model identifier/alias, capability requirements, context/structured-output constraints, and status. Profile may not contain auth material. |
| Provider execution | Provider adapter contract, implemented initially by Codex CLI and Gemini CLI | Separate invocation, health, error normalization, metadata, and cancellation boundary per CLI. |
| Authentication | Codex CLI / Gemini CLI local auth state or approved OS credential facility | Outside Git and outside workflow configuration. Factory requests the selected CLI to use its already-active identity; it does not read, copy, rotate, or switch credentials. |
| Approval | Human owner plus factory policy gate | Required for switching provider after an error where another provider/account may incur usage, and for any account change. |
| Observability | Redacted factory execution record | Provider/model aliases, status, timestamps, duration, CLI version, normalized error category, retry count, and approval decision; no prompts with secrets, auth files, headers, or token contents. |

### Suggested non-secret profile shape (illustrative only)

```yaml
schema_version: 1
providers:
  openai_codex:
    adapter: codex_cli
    executable: codex
    enabled: false
    auth_mode: cli_managed
    # No account identifier or credential here.
  google_gemini:
    adapter: gemini_cli
    executable: gemini
    enabled: false
    auth_mode: cli_managed
models:
  openai_default:
    provider: openai_codex
    model_id: "<owner-selected Codex model>"
  gemini_default:
    provider: google_gemini
    model_id: "<owner-selected Gemini model>"
roles:
  researcher: openai_default
  independent_reviewer: gemini_default
fallback:
  mode: approval_required
  automatic_cross_provider: false
```

This is a shape proposal, not a file consumed by MetaSwarm. Exact model identifiers and supported CLI flags must be verified against pinned CLI versions before implementation. It intentionally includes no account identity because the CLI does not provide a safe, stable account-selection API through this factory design.

## Provider contract

Each adapter should expose a narrow internal interface:

- `describe()` — stable provider key, CLI name/version, supported invocation modes, and capabilities.
- `health()` — executable present, CLI responds, and authentication status when the CLI offers a documented non-secret status command. Health must not print identity tokens or credential contents.
- `invoke(request)` — explicit model profile, role, task, bounded timeout, working directory, and output format; never implicitly chooses a second provider.
- `classify(error)` — normalize to `authentication_failed`, `model_unavailable`, `rate_limited`, `quota_exhausted`, `provider_unavailable`, `invalid_request`, `cancelled`, or `unknown` with safe retryability metadata.
- `metadata()` — provider/model alias, CLI version, timestamps, duration, exit status, normalized category, and redacted usage fields only if CLI emits them reliably.

Provider-specific behavior stays inside adapters. Workflow files refer to roles and model profile aliases, never CLI-specific auth state. A new provider can implement the same contract without changing role descriptions or phase sequencing.

## Routing, fallback, and account safety

1. A role resolves to one named model profile and one provider. The initial default is pinned, not `cheapest-available` or round-robin.
2. Same-provider retry may occur only for a clearly transient failure, within a bounded policy, and only if request replay is known safe. Do not retry rate limits or quota exhaustion automatically.
3. Authentication failure, unavailable model, rate limit, quota exhaustion, timeout, or provider outage stops the task and reports a sanitized category. It does not trigger a different provider automatically.
4. The dispatcher may present available alternative provider/model profiles, estimated consequence if known, and task context to the owner. It resumes on the alternate profile only after explicit approval. An alternate CLI's current account and cost must be treated as unknown until the owner verifies them.
5. Account changes remain manual owner actions in the relevant CLI. After an owner changes an account, a later health check may report ready/unready, but the factory must not initiate the login flow or claim it selected a particular account.
6. Approval is scoped to a task, provider, model profile, and bounded attempt count; it is not blanket consent to future fallback or account rotation.

This intentionally forgoes transparent cross-provider failover: silent failover cannot satisfy the requirement that another account's quota not be consumed without approval.

## Failure detection and health

MetaSwarm documents adapter health checks that report readiness, version, authentication validity, and configured model, and describes checking availability per task. Its setup guide discusses Codex auth status, Gemini Google login/API-key modes, and rate/quota troubleshooting. These signals are useful, but the upstream docs do not establish a comprehensive stable typed error taxonomy for every CLI/model/quota case. The factory should therefore distinguish:

- **Preflight health**: command missing, command failed, auth missing/invalid where a supported signal exists, model/profile not configured.
- **Invocation error**: inspect documented structured output/exit status where available; normalize known patterns conservatively and preserve only sanitized summaries.
- **Ambiguous errors**: report `unknown`; stop rather than guess or fall back.
- **Quota vs rate limit**: keep separate only when the CLI response clearly differentiates them. Do not infer quota exhaustion from every HTTP 429 or generic retry message.
- **Model unavailable**: classify only with a provider/CLI signal that specifically identifies an unknown, inaccessible, or retired model. Avoid silently substituting a model.

Health checks themselves must avoid billable inference calls unless the owner explicitly requests a paid smoke test. Record when a health field is unsupported or unknown.

## Secret handling and telemetry

- Never put API keys, OAuth tokens, passwords, cookie/session values, account auth files, or credential-bearing URLs in tracked files, reports, command arguments, prompts, or logs.
- Continue using CLI-managed auth unless the owner later approves another secret backend. Do not inspect or copy `.codex/auth.json`, Gemini credential stores, or other auth state.
- Keep local provider state under each CLI's own protected storage; do not build an account vault or account switcher into the factory.
- Add conservative secret redaction before writing error text; allowlist metadata fields rather than logging arbitrary CLI output.
- Git-ignore local execution logs and auth-related files if the implementation ever creates any. Commit only schemas, model aliases without secrets, policies, and redacted examples.
- Do not log full prompts by default. Record task IDs and artifact paths, not raw sensitive task context.

## MetaSwarm compatibility assessment

### Supported by inspected upstream documentation

- Native Codex CLI plugin distribution and native Gemini CLI extension distribution are both documented. MetaSwarm's release notes identify first-class Codex support from v0.12.0; its current installation docs show marketplace install for Codex and `gemini extensions install` for Gemini.
- External tool delegation supports Codex and Gemini CLI adapters for implementation/review; provider tool installation is optional.
- The external-tools template separates adapter enablement, timeout, sandbox, and auth environment-variable *name* from routing and budget settings. It states models are set per role in `.metaswarm/models.yaml` (`roles.<role>.codex` / `.gemini`) and adapter calls accept `--role`.
- Documented health adapters report readiness/version/auth validity/model. The guide describes health checks per work unit and bounded adapter invocation timeouts.
- Workflow, role and review customization exists in MetaSwarm; model configuration is at least per-role in its documented current template.

### Incompatible or not established

- Current external-tools template uses `default_implementer: "cheapest-available"` and escalation order `codex`, `gemini`, `claude`; setup docs describe retries followed by another provider. That is unsafe for the no-unapproved-spend rule unless disabled/replaced.
- No inspected official documentation exposes account/profile selectors for Codex or Gemini CLI. `auth_env_var` names an API-key environment variable; it does not switch OAuth accounts. Google login is documented as a Gemini alternative. Codex login is owned by Codex CLI. Switching account behavior is not an automatic MetaSwarm feature.
- Per-role `models.yaml` is documented with `roles.<role>.codex`/`gemini` in the template, but role-level model configuration host behavior differs: the README explicitly documents generated per-agent model override for Claude Code and points Codex/Gemini hosts to platform adaptation. Do not assume identical per-agent model selection on every host.
- The official docs do not promise typed detection for all four requested failure classes, or complete secret-redaction guarantees for all adapter output. Factory-side normalization/redaction requires implementation and tests.
- Health checks establish CLI/auth readiness per documented behavior, but do not prove which human account is active or guarantee remaining quota.
- Metadata fields and exact model IDs/CLI options are not yet pinned or verified against a release commit.

### Conclusion

MetaSwarm can supply orchestration and invoke both CLIs, but it cannot be treated as the account manager or policy enforcement boundary for this requirement. Preserve MetaSwarm for role/workflow/task orchestration only after a pinned-version pilot. Enforce provider pinning, stop-on-failure, approval-before-fallback, and redacted telemetry at a factory-owned adapter/dispatcher boundary unless an implementation inspection proves MetaSwarm already provides these controls. Do not claim native account switching or account identity verification.

## Compatibility matrix

| Requirement | Assessment | Proposed treatment |
|---|---|---|
| Independent Codex and Gemini providers | Supported as separate external CLI adapters. | Keep independent adapter configuration and health state. |
| Separate roles/workflows/models/auth | Partially supported by MetaSwarm; CLI auth is separate. | Factory owns provider-neutral roles/workflow and profile references; CLIs own auth. |
| Change active account without rebuilding workflow | Workflow independence is feasible; account selection is manual and CLI-specific. | Change account only in CLI; keep roles/profile aliases stable; re-check health. |
| Multiple model configurations | Per-role provider model fields appear in external-tools template; exact cross-host semantics need validation. | Profile aliases and CLI-specific model IDs; pin model explicitly after compatibility test. |
| Provider fallback | Technically supported as automatic routing/escalation in MetaSwarm, but conflicts with approval requirement. | Disable automatic cross-provider fallback; offer human-approved provider change. |
| Auth/model/rate/quota detection | Some health and troubleshooting support; full typed classification not guaranteed. | Normalize conservative status categories; unknown stops. |
| No tracked credentials | Achievable by design; MetaSwarm docs suggest env variables or CLI OAuth. | Use CLI-managed secrets/local env injection, keep secrets out of Git. |
| No account rotation or paid fallback without approval | Not satisfied by stock cheapest-available/escalation defaults. | Override/disable routing or gate in factory dispatcher. |
| Safe health/execution metadata | Basic health JSON is documented; arbitrary logs/redaction unspecified. | Allowlist and redact metadata at factory boundary. |
| Future providers | Adapter pattern is feasible but factory-owned. | Stable provider contract, provider-neutral workflow/model aliases. |

## Future implementation gates

Before implementation, pin a MetaSwarm tag/commit and inspect the actual adapter scripts, models schema, retries, environment propagation, logging, and Windows shell dependencies. In a disposable local project, test with credentials deliberately absent first; then, only after owner authorization, perform non-billable or explicitly bounded CLI health checks. Test each failure classification with mocked adapter output, verify no alternate provider invocation occurs, verify secrets are redacted, and verify explicit approval gates fallback. Document exact evidence and unsupported fields. Do not change local authentication settings as part of this proposal.

## Official MetaSwarm references

- [MetaSwarm external-tools configuration template](https://github.com/dsifry/metaswarm/blob/main/templates/external-tools.yaml)
- [MetaSwarm external-tools setup, auth, health, routing, retries, and budget guide](https://github.com/dsifry/metaswarm/blob/main/templates/external-tools-setup.md)
- [MetaSwarm installation and platform support](https://github.com/dsifry/metaswarm/blob/main/INSTALL.md)
- [MetaSwarm README: architecture, external delegation, per-phase models, and host differences](https://github.com/dsifry/metaswarm/blob/main/README.md)
- [MetaSwarm releases: first-class Codex support](https://github.com/dsifry/metaswarm/releases)
