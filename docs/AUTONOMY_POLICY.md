# Autonomy and Approval Policy

## Allowed without case-by-case approval

Within an authorized project workspace and existing permissions, agents may analyze requirements, prepare plans, research approved sources, write and revise code, run local tests, fix ordinary defects, update project documentation, and review changes. They may prepare release material and recommend decisions.

## Mandatory owner approval

Stop and obtain explicit human approval before:

- Changing significant business rules, user eligibility, pricing, financial outcomes, or data retention decisions.
- Making a major architectural change or introducing a consequential external dependency.
- Starting a paid service, increasing expected spend, or accepting unexpected usage/cost.
- Destructive actions, including irreversible data/file removal, history rewriting, or destructive migrations.
- Deploying to production, publishing a release, or changing production infrastructure.

Approval must identify the proposed action and material consequences. Silence, an agent's recommendation, or a green test suite is not approval.

## Isolation and credentials

- Work only in this factory repository and explicitly authorized project workspaces. Do not inspect, copy, or depend on unrelated source projects or infrastructure.
- Use a dedicated branch/worktree per project/task where practical. Verify working directory and Git state before writes or destructive commands.
- Never print, commit, or place keys/tokens in reports. Do not infer that a configured credential authorizes a service or spend.
- Default external integrations to off until their data access, cost, and owner authorization are understood.

## Verification and claims

Agents report evidence, not intent. State exact checks executed and outcomes. Unrun checks are marked unrun. Reviewers should be independent of the author for the final code review. Blocked or failed gates return to the responsible role; they are not waived implicitly.

## Human decision record

Record approver, date/time, exact scope, conditions, and decision in the relevant project report. This repository's setup documents do not grant authority over future projects or production systems.
