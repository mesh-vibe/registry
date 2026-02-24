export interface ServiceManifest {
  name: string;
  description: string;
  cli: string;
  version: string;
  projectDir: string;
  dataDir?: string;
  healthCheck?: string;
  dependsOn?: string[];
  reports?: Array<{ name: string; path: string }>;
  notifyOn?: Array<{ event: string; priority: string }>;
}

export interface HealthResult {
  name: string;
  healthy: boolean;
  message: string;
}
