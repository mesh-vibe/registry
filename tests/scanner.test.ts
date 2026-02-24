import { describe, it, expect, vi, beforeEach } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { scanManifests } from "../src/scanner.js";

let testDir: string;

beforeEach(() => {
  testDir = mkdtempSync(join(tmpdir(), "registry-test-"));
});

function createProject(name: string, frontmatter: string, body: string = ""): void {
  const dir = join(testDir, name);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "manifest.md"), `---\n${frontmatter}\n---\n${body}`, "utf-8");
}

describe("scanManifests", () => {
  it("discovers projects with manifest.md", () => {
    createProject("my-bot", `name: my-bot\ndescription: A test bot\ncli: mybot\nversion: 0.1.0`);

    const results = scanManifests(testDir);
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe("my-bot");
    expect(results[0].cli).toBe("mybot");
    expect(results[0].version).toBe("0.1.0");
  });

  it("skips directories without manifest.md", () => {
    mkdirSync(join(testDir, "no-manifest"), { recursive: true });
    createProject("has-manifest", `name: has-manifest\ndescription: yes\ncli: hm\nversion: 1.0.0`);

    const results = scanManifests(testDir);
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe("has-manifest");
  });

  it("returns empty array for nonexistent directory", () => {
    const results = scanManifests("/tmp/nonexistent-dir-12345");
    expect(results).toEqual([]);
  });

  it("parses optional fields", () => {
    createProject(
      "full-bot",
      [
        "name: full-bot",
        "description: Full featured",
        "cli: fullbot",
        "version: 2.0.0",
        "data_dir: ~/mesh-vibe/data/fullbot",
        "health_check: fullbot status",
        "depends_on:",
        "  - vault",
        "  - registry",
        "reports:",
        "  - name: Main Report",
        "    path: ~/mesh-vibe/data/fullbot/report.html",
        "notify_on:",
        "  - event: task_complete",
        "    priority: low",
      ].join("\n")
    );

    const results = scanManifests(testDir);
    expect(results).toHaveLength(1);

    const m = results[0];
    expect(m.healthCheck).toBe("fullbot status");
    expect(m.dependsOn).toEqual(["vault", "registry"]);
    expect(m.reports).toHaveLength(1);
    expect(m.reports![0].name).toBe("Main Report");
    expect(m.notifyOn).toHaveLength(1);
    expect(m.notifyOn![0].event).toBe("task_complete");
  });

  it("sorts results alphabetically", () => {
    createProject("zebra", `name: zebra\ndescription: z\ncli: z\nversion: 0.1.0`);
    createProject("alpha", `name: alpha\ndescription: a\ncli: a\nversion: 0.1.0`);

    const results = scanManifests(testDir);
    expect(results[0].name).toBe("alpha");
    expect(results[1].name).toBe("zebra");
  });
});
