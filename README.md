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
- Manage deployments
- Handle database operations
- Monitor resources
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

## Usage

### Starting the Server

```bash
# Build and start the server
npm run build
npm start
```

The server will start in stdio mode, allowing it to communicate with MCP clients through standard input/output.

### Development

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

## Testing

The project uses Jest for testing. Tests are located in `src/__tests__/` and can be run with `npm test`.

### Test Structure

- Unit tests for individual components
- Integration tests for API interactions
- Mock implementations for external services

## CI/CD

GitHub Actions workflows are configured to:

- Run tests on Node.js 18.x and 20.x
- Check code formatting
- Verify build process
- Run linting checks

## API Documentation

### Available Resources

1. Server Information
   ```typescript
   // Get server info
   coolify://server/info
   ```

More resources will be documented as they are implemented.

## License

MIT

## Support

For support, please:

1. Check the [issues](https://github.com/stumason/coolify-mcp/issues) page
2. Create a new issue if needed
3. Join the Coolify community
