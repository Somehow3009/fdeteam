# Factory Architecture

## Purpose

This repository is the reusable control plane for AI-assisted software delivery. It keeps stable role instructions, workflow definitions, guardrails, templates, and accumulated engineering knowledge separate from individual application repositories.

## Layers

1. **Orchestration adapter (`factory/`)** — framework-native skills or commands and thin factory-specific configuration. MetaSwarm is the selected candidate; it is not installed yet.
2. **Roles (`agents/`)** — responsibility, inputs, outputs, boundaries, and handoffs for each role. Framework-native roles should be reused where their behavior fits.
3. **Workflow (`workflows/`)** — phase order, prerequisites, evidence, and review/approval gates.
4. **Policies (`policies/`)** — autonomy, security, isolation, cost, and release controls.
5. **Project workspaces (`projects/`)** — isolated application work; the reserved `demo-app/` is empty at foundation stage.
6. **Knowledge (`knowledge/`)** — curated engineering, business, and standards references. Project-specific or confidential facts do not enter shared knowledge without owner authorization.
7. **Evidence (`reports/`)** — dated setup, execution, QA, and review records.

## Execution model

The orchestrator coordinates phase transitions, invokes suitable role instructions, records artifacts, and stops at defined gates. Work is performed in a project-specific Git branch or worktree. Parallel work is allowed only for independent tasks with non-overlapping ownership; integration and verification follow. The selected framework's actual isolation behavior must be proven before relying on it.

## Trust boundaries

- This repository and its projects are independent. Do not inspect or import other project source trees.
- Credentials are supplied through local provider login or an approved secret store, never committed or copied into reports.
- Agents receive the smallest relevant project context and permissions. External services and paid usage require owner review where policy says so.
- Generated plans and code remain proposals until validation and required human approval.

## Current implementation boundary

The directories and documents establish a design, not a running orchestrator. MetaSwarm install, role mapping, Git isolation, phase automation, and approval behavior remain pending validation.
