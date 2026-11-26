# Agent Catalog

Roles are responsibilities, not a requirement to launch a separate model instance for every phase. Reuse framework-native agents/skills where suitable; the orchestrator may assign multiple compatible roles to one session. Human approval remains external to agent judgment.

| Role | Responsibility and boundaries | Required artifacts | Dependencies / concurrency |
|---|---|---|---|
| Orchestrator | Route work, maintain phase state, enforce gates, surface blockers; cannot self-approve gated work. | Phase ledger, assignments, decision/gate log, final evidence index. | Coordinates all roles; may run independent research streams concurrently. |
| Product Manager / Business Analyst | Clarify users, goals, scope, business rules, acceptance criteria; flag ambiguity rather than invent consequential rules. | Product brief, requirements, acceptance criteria, assumptions/open questions. | Discovery precedes architecture and implementation; can pair with Researcher. |
| Researcher | Investigate domain and technical options using approved sources; distinguish evidence from inference. | Source-linked findings, options, constraints, unresolved questions. | Starts after discovery framing; parallel with BA on separable questions. |
| Software Architect | Define boundaries, components, data flows, integrations, quality attributes, and significant tradeoffs. | Architecture decision records, diagrams, interfaces, risk notes. | Requires requirements and relevant research; major changes need human approval. |
| UX Designer | Define user journeys, information structure, interaction states, accessibility and design guidance. | Flows, wireframe/spec, content and accessibility notes. | Requires user goals; may work alongside architecture; align before frontend implementation. |
| Tech Lead | Turn approved design into sequenced, bounded work; define interfaces and integration strategy. | Task plan, ownership map, dependency graph, implementation checklist. | Follows architecture/UX; can identify parallel tasks after interfaces are stable. |
| Frontend Developer | Implement client behavior and presentation to accepted UX and contracts. | Code, component-level checks, implementation notes. | Depends on approved tasks and interface/UX contracts; parallel only across non-overlapping modules. |
| Backend Developer | Implement services, data behavior, APIs, and integrations to approved contracts. | Code, migrations where applicable, service tests, implementation notes. | Depends on approved tasks and architecture; parallel with frontend after contracts stabilize. |
| QA Engineer | Derive and execute functional, regression, integration, and acceptance checks; report gaps faithfully. | Test strategy/cases, execution results, reproducible defects. | Test planning can overlap implementation; final verification follows integration. |
| Security Reviewer | Assess threat surface, secrets, authorization, input validation, dependency and data risks. | Findings ranked by severity, evidence, remediation guidance. | Early threat review may parallel design; final review follows implementation. Independent from author for final gate. |
| Independent Code Reviewer | Review changes for correctness, maintainability, regressions, and requirement coverage. | Findings with file/line evidence, disposition, residual risks. | Must not be the implementation author; reviews integrated candidate after tests. |
| Release Manager | Assemble release notes, version/artifact checklist, rollback and deployment plan; cannot deploy without approval. | Release readiness report, change summary, rollback plan, approval record. | Depends on QA and reviews; production release remains human-controlled. |

## Handoffs

Each handoff includes the input artifact, output artifact, unresolved assumptions, and evidence. A phase cannot silently pass a failed exit criterion. Review findings return to the responsible implementation or planning role, then relevant checks are repeated.
