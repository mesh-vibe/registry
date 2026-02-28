import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import matter from "gray-matter";
import type { ServiceManifest } from "./types.js";

const PROJECTS_DIR = join(homedir(), "IdeaProjects", "mesh-vibe");

export function scanManifests(projectsDir: string = PROJECTS_DIR): ServiceManifest[] {
  if (!existsSync(projectsDir)) return [];

  const entries = readdirSync(projectsDir, { withFileTypes: true });
  const manifests: ServiceManifest[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const manifestPath = join(projectsDir, entry.name, "manifest.md");
    if (!existsSync(manifestPath)) continue;

    try {
      const raw = readFileSync(manifestPath, "utf-8");
      const parsed = matter(raw);
      const data = parsed.data as Record<string, unknown>;

      const manifest: ServiceManifest = {
        name: String(data.name ?? entry.name),
        description: String(data.description ?? ""),
        cli: String(data.cli ?? ""),
        version: String(data.version ?? "0.0.0"),
        projectDir: join(projectsDir, entry.name),
        dataDir: data.data_dir ? expandHome(String(data.data_dir)) : undefined,
        healthCheck: data.health_check ? String(data.health_check) : undefined,
        dependsOn: Array.isArray(data.depends_on)
          ? (data.depends_on as string[])
          : undefined,
        reports: Array.isArray(data.reports)
          ? (data.reports as Array<{ name: string; path: string }>).map((r) => ({
              name: String(r.name),
              path: expandHome(String(r.path)),
            }))
          : undefined,
        notifyOn: Array.isArray(data.notify_on)
          ? (data.notify_on as Array<{ event: string; priority: string }>).map(
              (n) => ({
                event: String(n.event),
                priority: String(n.priority),
              })
            )
          : undefined,
      };

      manifests.push(manifest);
    } catch {
      // Skip invalid manifests
    }
  }

  return manifests.sort((a, b) => a.name.localeCompare(b.name));
}

function expandHome(path: string): string {
  if (path.startsWith("~/")) {
    return join(homedir(), path.slice(2));
  }
  return path;
}
