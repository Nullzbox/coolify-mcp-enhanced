import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';
import { CoolifyClient } from './coolify-client.js';
import { CoolifyConfig, ServerInfo, ServerResources, ServerDomain, ValidationResponse } from '../types/coolify.js';
import { z } from 'zod';

export class CoolifyMcpServer {
  private server: McpServer;
  private client: CoolifyClient;

  constructor(config: CoolifyConfig) {
    this.server = new McpServer({
      name: 'coolify',
      version: '0.1.0',
    });

    this.client = new CoolifyClient(config);
    this.setupTools();
  }

  private setupTools(): void {
    this.server.tool(
      'list_servers',
      'List all Coolify servers',
      {},
      async () => {
        try {
          const servers = await this.client.listServers();
          return {
            content: [{ type: 'text', text: JSON.stringify(servers) }],
            isError: false
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          return {
            content: [{ type: 'text', text: errorMessage }],
            isError: true
          };
        }
      }
    );

    this.server.tool(
      'get_server',
      'Get details about a specific Coolify server',
      { uuid: z.string().describe('UUID of the server to get details for') },
      async (params) => {
        try {
          const server = await this.client.getServer(params.uuid);
          return {
            content: [{ type: 'text', text: JSON.stringify(server) }],
            isError: false
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          return {
            content: [{ type: 'text', text: errorMessage }],
            isError: true
          };
        }
      }
    );

    this.server.tool(
      'get_server_resources',
      'Get the current resources running on a specific Coolify server',
      { uuid: z.string().describe('UUID of the server to get resources for') },
      async (params) => {
        try {
          const resources = await this.client.getServerResources(params.uuid);
          return {
            content: [{ type: 'text', text: JSON.stringify(resources) }],
            isError: false
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          return {
            content: [{ type: 'text', text: errorMessage }],
            isError: true
          };
        }
      }
    );

    this.server.tool(
      'get_server_domains',
      'Get the domains associated with a specific Coolify server',
      { uuid: z.string().describe('UUID of the server to get domains for') },
      async (params) => {
        try {
          const domains = await this.client.getServerDomains(params.uuid);
          return {
            content: [{ type: 'text', text: JSON.stringify(domains) }],
            isError: false
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          return {
            content: [{ type: 'text', text: errorMessage }],
            isError: true
          };
        }
      }
    );

    this.server.tool(
      'validate_server',
      'Validate the connection to a specific Coolify server',
      { uuid: z.string().describe('UUID of the server to validate') },
      async (params) => {
        try {
          const result = await this.client.validateServer(params.uuid);
          return {
            content: [{ type: 'text', text: JSON.stringify(result) }],
            isError: false
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          return {
            content: [{ type: 'text', text: errorMessage }],
            isError: true
          };
        }
      }
    );
  }

  async start(transport: Transport): Promise<void> {
    try {
      await this.client.validateConnection();
      await this.server.connect(transport);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to start MCP server: ${errorMessage}`);
    }
  }

  async list_servers(): Promise<ServerInfo[]> {
    return this.client.listServers();
  }

  async get_server(uuid: string): Promise<ServerInfo> {
    return this.client.getServer(uuid);
  }

  async get_server_resources(uuid: string): Promise<ServerResources> {
    return this.client.getServerResources(uuid);
  }

  async get_server_domains(uuid: string): Promise<ServerDomain[]> {
    return this.client.getServerDomains(uuid);
  }

  async validate_server(uuid: string): Promise<ValidationResponse> {
    return this.client.validateServer(uuid);
  }
}
