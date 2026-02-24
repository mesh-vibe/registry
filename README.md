# Registry

Service catalog, health checks, and discovery for the MeshVibe ecosystem.

Registry discovers MeshVibe projects by scanning `~/IdeaProjects/*/manifest.md` and provides a unified view of what's installed, running, and healthy.

## CLI Commands

```
registry list            List all discovered services
registry status          Show health of all services
registry health <name>   Check specific service health
registry info <name>     Show details for a service
registry init            Install Claude Code skill
```

## Development

```bash
npm install
npm run build
npm test
```

## License

MIT
