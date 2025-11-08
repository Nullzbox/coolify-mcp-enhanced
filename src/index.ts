#!/usr/bin/env node

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CoolifyMcpServer } from './lib/mcp-server.js';
import { EnhancedCoolifyMcpServer } from './lib/enhanced-mcp-server.js';
import { CoolifyConfig } from './types/coolify.js';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

declare const process: NodeJS.Process;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main(): Promise<void> {
  // Base config from environment variables
  const config: CoolifyConfig = {
    baseUrl: process.env.COOLIFY_BASE_URL || 'http://localhost:3000',
    accessToken: process.env.COOLIFY_ACCESS_TOKEN || '',
  };

  // Try to load local config file (gitignored)
  const localConfigPath = join(__dirname, '..', 'coolify.config.local.json');
  if (existsSync(localConfigPath)) {
    try {
      const localConfig = JSON.parse(readFileSync(localConfigPath, 'utf-8'));
      if (localConfig.githubAppUuid) {
        config.githubAppUuid = localConfig.githubAppUuid;
        console.error(`✅ Loaded GitHub App UUID from local config: ${localConfig.githubAppUuid.substring(0, 8)}...`);
      }
    } catch (error) {
      console.error('⚠️  Failed to parse coolify.config.local.json:', error);
    }
  }

  if (!config.accessToken) {
    throw new Error('COOLIFY_ACCESS_TOKEN environment variable is required');
  }

  // Use enhanced server if ENHANCED flag is set, otherwise use original
  const useEnhanced = process.env.COOLIFY_MCP_ENHANCED === 'true';
  const server = useEnhanced 
    ? new EnhancedCoolifyMcpServer(config)
    : new CoolifyMcpServer(config);

  const transport = new StdioServerTransport();

  console.error(`Starting ${useEnhanced ? 'Enhanced' : 'Standard'} Coolify MCP Server...`);
  await server.connect(transport);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
