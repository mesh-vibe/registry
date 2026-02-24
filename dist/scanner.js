import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import matter from "gray-matter";
const PROJECTS_DIR = join(homedir(), "IdeaProjects");
export function scanManifests(projectsDir = PROJECTS_DIR) {
    if (!existsSync(projectsDir))
        return [];
    const entries = readdirSync(projectsDir, { withFileTypes: true });
    const manifests = [];
    for (const entry of entries) {
        if (!entry.isDirectory())
            continue;
        const manifestPath = join(projectsDir, entry.name, "manifest.md");
        if (!existsSync(manifestPath))
            continue;
        try {
            const raw = readFileSync(manifestPath, "utf-8");
            const parsed = matter(raw);
            const data = parsed.data;
            const manifest = {
                name: String(data.name ?? entry.name),
                description: String(data.description ?? ""),
                cli: String(data.cli ?? ""),
                version: String(data.version ?? "0.0.0"),
                projectDir: join(projectsDir, entry.name),
                dataDir: data.data_dir ? expandHome(String(data.data_dir)) : undefined,
                healthCheck: data.health_check ? String(data.health_check) : undefined,
                dependsOn: Array.isArray(data.depends_on)
                    ? data.depends_on
                    : undefined,
                reports: Array.isArray(data.reports)
                    ? data.reports.map((r) => ({
                        name: String(r.name),
                        path: expandHome(String(r.path)),
                    }))
                    : undefined,
                notifyOn: Array.isArray(data.notify_on)
                    ? data.notify_on.map((n) => ({
                        event: String(n.event),
                        priority: String(n.priority),
                    }))
                    : undefined,
            };
            manifests.push(manifest);
        }
        catch {
            // Skip invalid manifests
        }
    }
    return manifests.sort((a, b) => a.name.localeCompare(b.name));
}
function expandHome(path) {
    if (path.startsWith("~/")) {
        return join(homedir(), path.slice(2));
    }
    return path;
}
//# sourceMappingURL=scanner.js.map