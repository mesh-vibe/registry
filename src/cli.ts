#!/usr/bin/env node

import { Command } from "commander";

const program = new Command();

program
  .name("registry")
  .description(
    "Service catalog, health checks, and discovery for the MeshVibe ecosystem",
  )
  .version("0.1.0");

program
  .command("list")
  .description("List all discovered services")
  .action(() => {
    console.log("registry list — not yet implemented");
  });

program
  .command("status")
  .description("Show health of all services")
  .action(() => {
    console.log("registry status — not yet implemented");
  });

program
  .command("health <name>")
  .description("Check specific service health")
  .action((name: string) => {
    console.log(`registry health ${name} — not yet implemented`);
  });

program
  .command("info <name>")
  .description("Show details for a service")
  .action((name: string) => {
    console.log(`registry info ${name} — not yet implemented`);
  });

program
  .command("init")
  .description("Install Claude Code skill")
  .action(() => {
    console.log("registry init — not yet implemented");
  });

program.parse();
