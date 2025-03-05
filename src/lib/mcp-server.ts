import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';
import { CoolifyClient } from './coolify-client.js';
import { CoolifyConfig } from '../types/coolify.js';

export class CoolifyMcpServer {
  private server: McpServer;
  private client: CoolifyClient;

  constructor(config: CoolifyConfig) {
    this.server = new McpServer({
      name: 'Coolify MCP',
      version: '0.1.0',
    });

    this.client = new CoolifyClient(config);
    this.setupResources();
  }

  private setupResources(): void {
    // Server info resource
    this.server.resource('server-info', 'coolify://server/info', async () => {
      const info = await this.client.getServerInfo();
      return {
        contents: [
          {
            uri: 'coolify://server/info',
            text: JSON.stringify(info, null, 2),
          },
        ],
      };
    });

    // Server status resource
    this.server.resource('server-status', 'coolify://server/status', async () => {
      const status = await this.client.getServerStatus();
      return {
        contents: [
          {
            uri: 'coolify://server/status',
            text: JSON.stringify(status, null, 2),
          },
        ],
      };
    });

    // More resources will be added here
  }

  async start(transport: Transport): Promise<void> {
    await this.server.connect(transport);
  }
}
