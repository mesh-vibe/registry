#!/usr/bin/env node

import { Command } from "commander";
import { scanManifests } from "./scanner.js";
import { checkHealth, checkAllHealth } from "./health.js";
import { installSkill } from "./templates/skill.md.js";

const program = new Command();

program
  .name("registry")
  .description("Service catalog, health checks, and discovery for the MeshVibe ecosystem")
  .version("0.1.0");

program
  .command("list")
  .description("List all discovered services")
  .action(() => {
    const manifests = scanManifests();
    if (manifests.length === 0) {
      console.log("No services discovered. Add manifest.md files to projects in ~/IdeaProjects/.");
      return;
    }

    console.log(`\n  ${"Service".padEnd(18)} ${"Version".padEnd(10)} ${"CLI".padEnd(16)} Description`);
    console.log(`  ${"─".repeat(18)} ${"─".repeat(10)} ${"─".repeat(16)} ${"─".repeat(40)}`);

    for (const m of manifests) {
      console.log(`  ${m.name.padEnd(18)} ${m.version.padEnd(10)} ${m.cli.padEnd(16)} ${m.description}`);
    }
    console.log();
  });

program
  .command("status")
  .description("Show health of all services")
  .action(() => {
    const manifests = scanManifests();
    if (manifests.length === 0) {
      console.log("No services discovered.");
      return;
    }

    const results = checkAllHealth(manifests);

    console.log(`\n  ${"Service".padEnd(18)} ${"Status".padEnd(10)} Message`);
    console.log(`  ${"─".repeat(18)} ${"─".repeat(10)} ${"─".repeat(30)}`);

    for (const r of results) {
      const status = r.healthy ? "OK" : "FAIL";
      console.log(`  ${r.name.padEnd(18)} ${status.padEnd(10)} ${r.message}`);
    }

    const healthy = results.filter((r) => r.healthy).length;
    console.log(`\n  ${healthy}/${results.length} services healthy\n`);
  });

program
  .command("health <name>")
  .description("Check specific service health")
  .action((name: string) => {
    const manifests = scanManifests();
    const manifest = manifests.find((m) => m.name === name);

    if (!manifest) {
      console.error(`Error: Service "${name}" not found.`);
      process.exit(1);
    }

    const result = checkHealth(manifest);
    const status = result.healthy ? "OK" : "FAIL";
    console.log(`${manifest.name}: ${status} — ${result.message}`);
    if (!result.healthy) process.exit(1);
  });

program
  .command("info <name>")
  .description("Show details for a service")
  .action((name: string) => {
    const manifests = scanManifests();
    const manifest = manifests.find((m) => m.name === name);

    if (!manifest) {
      console.error(`Error: Service "${name}" not found.`);
      process.exit(1);
    }

    console.log(`\n  Name:         ${manifest.name}`);
    console.log(`  Description:  ${manifest.description}`);
    console.log(`  Version:      ${manifest.version}`);
    console.log(`  CLI:          ${manifest.cli}`);
    console.log(`  Project:      ${manifest.projectDir}`);
    if (manifest.dataDir) console.log(`  Data Dir:     ${manifest.dataDir}`);
    if (manifest.healthCheck) console.log(`  Health Check: ${manifest.healthCheck}`);
    if (manifest.dependsOn?.length) console.log(`  Depends On:   ${manifest.dependsOn.join(", ")}`);
    if (manifest.reports?.length) {
      console.log(`  Reports:`);
      for (const r of manifest.reports) {
        console.log(`    - ${r.name}: ${r.path}`);
      }
    }
    if (manifest.notifyOn?.length) {
      console.log(`  Notify On:`);
      for (const n of manifest.notifyOn) {
        console.log(`    - ${n.event} (${n.priority})`);
      }
    }
    console.log();
  });

program
  .command("init")
  .description("Install Claude Code skill")
  .action(() => {
    installSkill();
    console.log("Installed skill to ~/.claude/skills/registry/SKILL.md");
  });

program.parse();
