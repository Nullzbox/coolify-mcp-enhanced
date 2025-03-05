# Coolify MCP Server

A Model Context Protocol (MCP) server implementation for [Coolify](https://coolify.io/), enabling AI assistants to interact with your Coolify instances through natural language.

## Claude Desktop, Cursor, and other MCP compatible IDEs

### Claude

```json
"coolify": {
    "command": "npx",
    "args": [
        "-y", "@stumason/coolify-mcp"
    ],
    "env": {
        "COOLIFY_ACCESS_TOKEN": "0|your-secret-token",
        "COOLIFY_BASE_URL": "https://your-coolify-instance.com"
    }
},
```

### Cursor

command:

`env COOLIFY_ACCESS_TOKEN:0|your-secret-token COOLIFY_BASE_URL:https://your-coolify-instance.com npx -y @stumason/coolify-mcp`

## Overview

This MCP server provides a standardized interface for AI models to:

- Query Coolify server information
- Manage projects and environments
- Handle deployments and resources
- Monitor server status
- And more...

By implementing the [Model Context Protocol](https://modelcontextprotocol.io), this server allows AI assistants to understand and interact with your Coolify infrastructure in a secure and controlled manner.

## Prerequisites

- Node.js >= 18
- A running Coolify instance
- Coolify API access token

## Installation

```bash
# Clone the repository
git clone https://github.com/stumason/coolify-mcp.git
cd coolify-mcp

# Install dependencies
npm install
```

## Configuration

The server requires the following environment variables:

```bash
# Required
COOLIFY_ACCESS_TOKEN=your_access_token_here

# Optional (defaults to http://localhost:3000)
COOLIFY_BASE_URL=https://your.coolify.instance
```

## Available Tools

### Server Management

#### list_servers

Lists all Coolify servers in your instance.

```typescript
// Returns: ServerInfo[]
await client.list_servers();
```

#### get_server

Get detailed information about a specific server.

```typescript
// Returns: ServerInfo
await client.get_server(uuid: string)
```

#### get_server_resources

Get current resources (applications, databases, etc.) running on a server.

```typescript
// Returns: ServerResources[]
await client.get_server_resources(uuid: string)
```

#### get_server_domains

Get domains associated with a server.

```typescript
// Returns: ServerDomain[]
await client.get_server_domains(uuid: string)
```

#### validate_server

Validate the connection to a specific server.

```typescript
// Returns: ValidationResponse
await client.validate_server(uuid: string)
```

### Project Management

#### list_projects

List all projects in your Coolify instance.

```typescript
// Returns: Project[]
await client.list_projects();
```

#### get_project

Get detailed information about a specific project.

```typescript
// Returns: Project
await client.get_project(uuid: string)
```

#### create_project

Create a new project.

```typescript
// Returns: { uuid: string }
await client.create_project({
  name: string,
  description?: string
})
```

#### update_project

Update an existing project's details.

```typescript
// Returns: Project
await client.update_project(uuid: string, {
  name?: string,
  description?: string
})
```

#### delete_project

Delete a project.

```typescript
// Returns: { message: string }
await client.delete_project(uuid: string)
```

### Environment Management

#### getProjectEnvironment

Get an environment within a project. This is the only supported method for environment operations.

```typescript
// Returns: Environment
await client.getProjectEnvironment(
  project_uuid: string,
  environment_name_or_uuid: string
)
```

Example:
```typescript
const environment = await client.getProjectEnvironment(
  'ikokwc8sk00wk8sg8gkwoscw',  // Project UUID
  'production'                  // Environment name or UUID
);
```

Note: Environment operations are only available through the project endpoints. There are no standalone environment endpoints.

## Type Definitions

### ServerInfo

```typescript
interface ServerInfo {
  uuid: string;
  name: string;
  status: 'running' | 'stopped' | 'error';
  version: string;
  resources: {
    cpu: number;
    memory: number;
    disk: number;
  };
}
```

### Environment

```typescript
interface Environment {
  id: number;
  uuid: string;
  name: string;
  project_uuid: string;
  variables?: Record<string, string>;
  created_at: string;
  updated_at: string;
}
```

### Project

```typescript
interface Project {
  id: number;
  uuid: string;
  name: string;
  description?: string;
  environments?: Environment[];
}
```

## Development

```bash
# Run in development mode
npm run build -- --watch
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Code Quality

```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint -- --fix

# Format code
npm run format
```

## Architecture

The project follows a modular architecture:

```
src/
├── lib/
│   ├── coolify-client.ts    # Coolify API client
│   └── mcp-server.ts        # MCP server implementation
├── types/
│   └── coolify.ts           # TypeScript type definitions
└── index.ts                 # Entry point
```

### Key Components

1. **CoolifyClient**: Handles communication with the Coolify API

   - Authentication
   - API request handling
   - Error management

2. **CoolifyMcpServer**: Implements the MCP server
   - Resource management
   - Tool implementations
   - Client request handling

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Maintain test coverage
- Update documentation as needed
- Follow the established code style

## CI/CD

GitHub Actions workflows are configured to:

- Run tests on Node.js 18.x and 20.x
- Check code formatting
- Verify build process
- Run linting checks

## License

MIT

## Support

For support, please:

1. Check the [issues](https://github.com/stumason/coolify-mcp/issues) page
2. Create a new issue if needed
3. Join the Coolify community
