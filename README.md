# AI Software Factory

A reusable foundation for coordinating software work with AI agents. This repository currently defines the team, workflow, autonomy boundaries, and framework decision; it does not claim an executable end-to-end workflow yet.

## Status

Foundation setup is documented in [docs/SETUP_STATUS.md](docs/SETUP_STATUS.md). MetaSwarm is the recommended orchestration framework, pending installation and an isolated proof-of-workflow. See [docs/FRAMEWORK_EVALUATION.md](docs/FRAMEWORK_EVALUATION.md).

## Repository map

- `factory/` — framework integration, reusable agent definitions, workflows, policies, models, and templates.
- `projects/demo-app/` — reserved for a future small validation project; no application has been started.
- `knowledge/` — engineering, business, and standards reference material.
- `reports/` — setup, execution, QA, and review records.
- `experiments/` — contained framework and workflow experiments.
- `docs/` — architecture, roles, SDLC, autonomy, evaluation, and setup status.

## Start here

1. Read the setup status and framework evaluation.
2. Complete the owner actions listed at the end of `docs/SETUP_STATUS.md`.
3. Validate a minimal workflow in a disposable branch or repository before using this foundation for application work.

No credentials, production connections, or API keys belong in this repository.
