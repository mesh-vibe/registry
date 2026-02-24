import { execFileSync } from "node:child_process";
export function checkHealth(manifest) {
    if (!manifest.healthCheck) {
        return { name: manifest.name, healthy: true, message: "no health check configured" };
    }
    const parts = manifest.healthCheck.split(/\s+/);
    const cmd = parts[0];
    const args = parts.slice(1);
    try {
        execFileSync(cmd, args, {
            encoding: "utf-8",
            timeout: 10_000,
            stdio: ["ignore", "pipe", "pipe"],
        });
        return { name: manifest.name, healthy: true, message: "ok" };
    }
    catch {
        return { name: manifest.name, healthy: false, message: "health check failed" };
    }
}
export function checkAllHealth(manifests) {
    return manifests.map(checkHealth);
}
//# sourceMappingURL=health.js.map