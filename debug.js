import { CoolifyMcpServer } from './dist/lib/mcp-server.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

// Enable debug logging
process.env.DEBUG = '*';

const server = new CoolifyMcpServer({
    baseUrl: 'https://coolify.dev',  // Replace with your actual Coolify URL
    accessToken: 'your-actual-token'   // Replace with your actual Coolify token
});

const transport = new StdioServerTransport();
await server.connect(transport); 