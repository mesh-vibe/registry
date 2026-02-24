import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

const SKILL_CONTENT = `---
name: registry
description: Discover and check health of MeshVibe services. Use when you need to find what tools are available or check if services are running.
---

# Registry — MeshVibe Service Catalog

Registry discovers all MeshVibe projects by scanning for manifest files and provides health checking.

## CLI commands

- \`registry list\` — list all discovered services with version and status
- \`registry status\` — show health of all services
- \`registry health <name>\` — check health of a specific service
- \`registry info <name>\` — show full details for a service
`;

export function installSkill(): void {
  const skillDir = join(homedir(), ".claude", "skills", "registry");
  mkdirSync(skillDir, { recursive: true });
  writeFileSync(join(skillDir, "SKILL.md"), SKILL_CONTENT, "utf-8");
}
