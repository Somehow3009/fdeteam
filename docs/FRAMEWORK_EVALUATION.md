# Framework Evaluation

**Decision:** Select MetaSwarm as the primary framework candidate for a minimal, isolated pilot. Do not install competing frameworks. Installation and workflow behavior are pending; this is a documented recommendation, not a claim of operational validation.

## Comparison

| Option | Windows | Codex | Gemini | Custom roles/workflows and gates | Isolation/testing/review | Cost and assessment |
|---|---|---|---|---|---|---|
| MetaSwarm | CLI/plugin route exists, but PowerShell-specific compatibility was not established from available official docs. Verify installer behavior before running. | Explicit Codex plugin marketplace path; docs describe sequential Codex execution. | Explicit Gemini extension path; docs label parallel agents experimental. | Ships role catalog, skills, task workflow, review gates, rubrics, and human checkpoints; supports project instructions. | Documents Git worktree use through optional Superpowers workflow; Beads/GTG and optional skills add setup dependencies. Must validate exact isolation and tests in pilot. | Open source and locally installed, but model/CLI usage may incur subscription or API costs. Best feature fit with Codex/Gemini. |
| OpenHands Agent Canvas | Current official docs describe a maintained local Agent Canvas path; native Windows support is evolving/preview. Legacy OpenHands CLI requires WSL and is no longer actively maintained. | ACP agent selection includes Codex. | ACP agent selection includes Gemini CLI. | Agent canvas provides conversations, files, terminals, backends, and automations; not a ready-made SDLC role/process package, so considerable workflow configuration would be needed. | Backend/sandbox choices available; does not itself prove this factory's phase gates or review policy. | Open source; local setup may use local models or provider credentials. Less aligned with a docs-first, Codex/Gemini task workflow. |
| Custom orchestration | Can target PowerShell directly. | Possible via CLI. | Possible via CLI. | Full control, but all role, state, gates, retries, audit trail, and approval behavior must be built and maintained. | Can be designed precisely, but nothing is inherited or proven. | No framework license fee; highest engineering and maintenance cost. Not recommended for foundation stage. |

## MetaSwarm evidence and caveats

The official project installation guide lists Claude Code, Gemini CLI, and Codex CLI paths. Codex uses a plugin marketplace; Gemini uses `gemini extensions install`; the cross-platform `npx metaswarm init` route is available. Its own platform comparison says Codex parallel agents are sequential-only and Gemini parallelism is experimental. It recommends Beads (`bd`) and GitHub CLI for some capabilities; Superpowers and GTG are optional/referenced dependencies. External Codex/Gemini delegation is optional.

The environment has Node 20.19.0, npm 10.8.2, Python 3.12.3, Git 2.46.0.windows.1, Codex CLI 0.162.0-alpha.17.2, Gemini CLI command, and Claude Code 2.1.88. Running `gemini --version` failed before reporting a version because Gemini attempted to resolve the inaccessible user home (`EPERM`). This workspace restriction needs resolution or a supported isolated setting before Gemini integration can be validated. Codex plugin support/version has not been verified. No framework installation was attempted.

## Pilot gates before adoption

1. Review current upstream installer/release and pin a version or commit.
2. Verify the documented installation route is safe and compatible with this Windows shell; inspect all files it would create before applying them.
3. Confirm Codex plugin support; resolve Gemini CLI's workspace/home permission issue without exposing credentials.
4. In a disposable local repository, validate role customization, phase gates, Git isolation, test execution, independent review, and stop-for-human-approval behavior.
5. Record exact commands, outputs, versions, and limitations in `reports/setup/` before calling the workflow tested.

## Official references

- [MetaSwarm Getting Started](https://github.com/dsifry/metaswarm/blob/main/GETTING_STARTED.md)
- [MetaSwarm Installation and prerequisites](https://github.com/dsifry/metaswarm/blob/main/INSTALL.md)
- [MetaSwarm project repository](https://github.com/dsifry/metaswarm)
- [OpenHands Agent Canvas overview](https://docs.openhands.dev/openhands/usage/agent-canvas/overview)
- [OpenHands Agent Canvas setup](https://docs.openhands.dev/openhands/usage/agent-canvas/setup)
- [OpenHands legacy CLI installation and Windows/WSL requirements](https://docs.openhands.dev/openhands/usage/cli/installation)
