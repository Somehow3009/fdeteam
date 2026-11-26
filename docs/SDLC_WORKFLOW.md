# SDLC Workflow

This is the intended workflow specification. No phase automation has been installed or tested yet.

| Phase | Entry criteria | Work and deliverables | Exit criteria |
|---|---|---|---|
| Product Discovery | Owner supplies a problem, audience, or opportunity. | Product brief; users, goals, constraints, scope boundaries, success signals, assumptions. | Owner can confirm the problem and intended outcome; consequential unknowns are explicit. |
| Requirements | Discovery brief is coherent. | Functional/non-functional requirements, acceptance criteria, business rules, exclusions, open questions. | Requirements are testable and ambiguity is either resolved or explicitly gated. |
| Research | Requirements identify questions needing evidence. | Source-linked domain/technical investigation, options, compatibility and risk findings. | Material claims have evidence; recommendations and uncertainties are separated. |
| Architecture | Requirements and relevant research are available. | System context, component/data/interface design, quality attributes, decision records, threat considerations. | Design meets requirements; major architecture changes receive human approval. |
| Task Planning | Architecture and UX direction are accepted. | Ordered work units, ownership, dependencies, acceptance/check strategy, Git isolation plan. | Tasks are bounded, reviewable, and can be assigned without inventing design decisions. |
| Implementation | Plan is accepted; branch/worktree and tool permissions are established. | Code, focused documentation, incremental commits if configured, implementation notes. | Planned scope is implemented; no unresolved blocker is hidden; changes stay isolated. |
| Automated Testing | Integrated candidate and available test commands are known. | Build/lint/unit/integration/acceptance results as applicable; defect records. | Required checks pass or deviations are explicitly documented and escalated. |
| Independent Review | Candidate, test evidence, and requirements are available. | Independent code and security findings, dispositions, residual risk. | No unresolved critical/high issue under project policy; fixes re-run relevant checks. |
| Release Preparation | Checks and reviews have acceptable dispositions. | Release notes, version/artifact checklist, migration/rollback plan, deployment checklist. | Candidate is reproducible and ready for owner decision; no deployment has occurred. |
| Human Approval | Complete evidence packet is available. | Owner decision covering release and any policy-gated decisions. | Explicit approval is recorded; otherwise stop and revise. Production deployment always requires explicit approval. |

## Dependency and parallelism

Discovery → Requirements → Research/UX/Architecture (some research and UX may overlap) → Task Planning → Implementation → Testing → Independent Review → Release Preparation → Human Approval. Parallelize only independent research or implementation units after interfaces and ownership are stable. Integration is a named task, followed by tests and independent review.

## Evidence rule

Reports must state which commands actually ran, their results, environment, and any skipped checks. A planned workflow is not evidence that it works. A release report is not approval to deploy.
