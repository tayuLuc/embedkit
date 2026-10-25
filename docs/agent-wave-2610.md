# Wave protocol — parallel agents on one repo (26.10)

Three agents share one working tree. Rules that make it safe:
- Agents do NOT commit/push/branch; they leave changes in the tree.
- Orchestrator (boss) commits each agent's files separately, per-agent,
  in landing order: providers -> polish -> pwa (style drift of later
  agents rebased on committed earlier code).
- Full suite (test+check+build) runs once per landed agent, not per agent run.
- Shared-file conflicts (Base.astro, generator.client.ts, index list,
  provider registry) are resolved by the orchestrator at landing, using
  each agent's reported intent.
- Element ids (ek-url, ek-code, ...) are contract: tests mount built pages.
