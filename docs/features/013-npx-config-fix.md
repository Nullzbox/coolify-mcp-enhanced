# npx config fix

I want to be able to have the following config:

```json
{
  "mcpServers": {
    "coolify": {
      "command": "npx",
      "args": [
        "-y",
        "@masonator/coolify-mcp"
      ],
      "env": {
        "COOLIFY_ACCESS_TOKEN": "token",
        "COOLIFY_BASE_URL": "https://url"
      }
    },
    "github": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-github"
      ],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "pat"
      }
    }
  }
}
```

The github config is correct, but the coolify config currently does not work.

I get the following error:

```
2025-03-07T09:43:34.691Z [coolify] [info] Initializing server...
2025-03-07T09:43:34.783Z [coolify] [info] Server started and connected successfully
2025-03-07T09:43:35.882Z [coolify] [info] Message from client: {"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"claude-ai","version":"0.1.0"}},"jsonrpc":"2.0","id":0}
node:internal/modules/cjs/loader:603
      throw e;
      ^

Error: Cannot find module '/Users/stumason/.npm/_npx/4e3adc8df0812880/node_modules/@modelcontextprotocol/sdk/dist/cjs/server/mcp'
    at createEsmNotFoundErr (node:internal/modules/cjs/loader:1186:15)
    at finalizeEsmResolution (node:internal/modules/cjs/loader:1174:15)
    at resolveExports (node:internal/modules/cjs/loader:596:14)
    at Module._findPath (node:internal/modules/cjs/loader:673:31)
    at Module._resolveFilename (node:internal/modules/cjs/loader:1135:27)
    at Module._load (node:internal/modules/cjs/loader:990:27)
    at Module.require (node:internal/modules/cjs/loader:1237:19)
    at require (node:internal/modules/helpers:176:18)
    at Object.<anonymous> (/Users/stumason/.npm/_npx/4e3adc8df0812880/node_modules/@masonator/coolify-mcp/dist/lib/mcp-server.js:4:15)
    at Module._compile (node:internal/modules/cjs/loader:1378:14) {
  code: 'MODULE_NOT_FOUND',
  path: '/Users/stumason/.npm/_npx/4e3adc8df0812880/node_modules/@modelcontextprotocol/sdk/package.json'
}
node:internal/modules/cjs/loader:603
      throw e;
      ^

Error: Cannot find module '/Users/stumason/.npm/_npx/4e3adc8df0812880/node_modules/@modelcontextprotocol/sdk/dist/cjs/server/mcp'
    at createEsmNotFoundErr (node:internal/modules/cjs/loader:1186:15)
    at finalizeEsmResolution (node:internal/modules/cjs/loader:1174:15)
    at resolveExports (node:internal/modules/cjs/loader:596:14)
    at Module._findPath (node:internal/modules/cjs/loader:673:31)
    at Module._resolveFilename (node:internal/modules/cjs/loader:1135:27)
    at Module._load (node:internal/modules/cjs/loader:990:27)
    at Module.require (node:internal/modules/cjs/loader:1237:19)
    at require (node:internal/modules/helpers:176:18)
    at Object.<anonymous> (/Users/stumason/.npm/_npx/4e3adc8df0812880/node_modules/@masonator/coolify-mcp/dist/lib/mcp-server.js:4:15)
    at Module._compile (node:internal/modules/cjs/loader:1378:14) {
  code: 'MODULE_NOT_FOUND',
  path: '/Users/stumason/.npm/_npx/4e3adc8df0812880/node_modules/@modelcontextprotocol/sdk/package.json'
}

Node.js v21.6.0

Node.js v21.6.0
2025-03-07T09:43:36.909Z [coolify] [info] Server transport closed
2025-03-07T09:43:36.910Z [coolify] [info] Client transport closed
2025-03-07T09:43:36.910Z [coolify] [info] Server transport closed unexpectedly, this is likely due to the process exiting early. If you are developing this MCP server you can add output to stderr (i.e. `console.error('...')` in JavaScript, `print('...', file=sys.stderr)` in python) and it will appear in this log.
2025-03-07T09:43:36.910Z [coolify] [error] Server disconnected. For troubleshooting guidance, please visit our [debugging documentation](https://modelcontextprotocol.io/docs/tools/debugging) {"context":"connection"}
2025-03-07T09:43:36.911Z [coolify] [info] Client transport closed
2025-03-07T09:43:36.912Z [coolify] [info] Server transport closed
2025-03-07T09:43:36.912Z [coolify] [info] Client transport closed
2025-03-07T09:43:36.912Z [coolify] [info] Server transport closed unexpectedly, this is likely due to the process exiting early. If you are developing this MCP server you can add output to stderr (i.e. `console.error('...')` in JavaScript, `print('...', file=sys.stderr)` in python) and it will appear in this log.
2025-03-07T09:43:36.912Z [coolify] [error] Server disconnected. For troubleshooting guidance, please visit our [debugging documentation](https://modelcontextprotocol.io/docs/tools/debugging) {"context":"connection"}
2025-03-07T09:43:36.913Z [coolify] [info] Client transport closed
2025-03-07T09:51:22.595Z [coolify] [info] Initializing server...
2025-03-07T09:51:22.618Z [coolify] [info] Server started and connected successfully
2025-03-07T09:51:22.621Z [coolify] [info] Message from client: {"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"claude-ai","version":"0.1.0"}},"jsonrpc":"2.0","id":0}
2025-03-07T09:51:23.837Z [coolify] [info] Initializing server...
2025-03-07T09:51:23.853Z [coolify] [info] Server started and connected successfully
2025-03-07T09:51:23.948Z [coolify] [info] Message from client: {"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"claude-ai","version":"0.1.0"}},"jsonrpc":"2.0","id":0}
node:internal/modules/cjs/loader:603
      throw e;
      ^

Error: Cannot find module '/Users/stumason/.npm/_npx/4e3adc8df0812880/node_modules/@modelcontextprotocol/sdk/dist/cjs/server/mcp'
    at createEsmNotFoundErr (node:internal/modules/cjs/loader:1186:15)
    at finalizeEsmResolution (node:internal/modules/cjs/loader:1174:15)
    at resolveExports (node:internal/modules/cjs/loader:596:14)
    at Module._findPath (node:internal/modules/cjs/loader:673:31)
    at Module._resolveFilename (node:internal/modules/cjs/loader:1135:27)
    at Module._load (node:internal/modules/cjs/loader:990:27)
    at Module.require (node:internal/modules/cjs/loader:1237:19)
    at require (node:internal/modules/helpers:176:18)
    at Object.<anonymous> (/Users/stumason/.npm/_npx/4e3adc8df0812880/node_modules/@masonator/coolify-mcp/dist/lib/mcp-server.js:4:15)
    at Module._compile (node:internal/modules/cjs/loader:1378:14) {
  code: 'MODULE_NOT_FOUND',
  path: '/Users/stumason/.npm/_npx/4e3adc8df0812880/node_modules/@modelcontextprotocol/sdk/package.json'
}

Node.js v21.6.0
2025-03-07T09:51:25.767Z [coolify] [info] Server transport closed
2025-03-07T09:51:25.768Z [coolify] [info] Client transport closed
2025-03-07T09:51:25.768Z [coolify] [info] Server transport closed unexpectedly, this is likely due to the process exiting early. If you are developing this MCP server you can add output to stderr (i.e. `console.error('...')` in JavaScript, `print('...', file=sys.stderr)` in python) and it will appear in this log.
2025-03-07T09:51:25.768Z [coolify] [error] Server disconnected. For troubleshooting guidance, please visit our [debugging documentation](https://modelcontextprotocol.io/docs/tools/debugging) {"context":"connection"}
2025-03-07T09:51:25.769Z [coolify] [info] Client transport closed
node:internal/modules/cjs/loader:603
      throw e;
      ^

Error: Cannot find module '/Users/stumason/.npm/_npx/4e3adc8df0812880/node_modules/@modelcontextprotocol/sdk/dist/cjs/server/mcp'
    at createEsmNotFoundErr (node:internal/modules/cjs/loader:1186:15)
    at finalizeEsmResolution (node:internal/modules/cjs/loader:1174:15)
    at resolveExports (node:internal/modules/cjs/loader:596:14)
    at Module._findPath (node:internal/modules/cjs/loader:673:31)
    at Module._resolveFilename (node:internal/modules/cjs/loader:1135:27)
    at Module._load (node:internal/modules/cjs/loader:990:27)
    at Module.require (node:internal/modules/cjs/loader:1237:19)
    at require (node:internal/modules/helpers:176:18)
    at Object.<anonymous> (/Users/stumason/.npm/_npx/4e3adc8df0812880/node_modules/@masonator/coolify-mcp/dist/lib/mcp-server.js:4:15)
    at Module._compile (node:internal/modules/cjs/loader:1378:14) {
  code: 'MODULE_NOT_FOUND',
  path: '/Users/stumason/.npm/_npx/4e3adc8df0812880/node_modules/@modelcontextprotocol/sdk/package.json'
}

Node.js v21.6.0
2025-03-07T09:51:25.851Z [coolify] [info] Server transport closed
2025-03-07T09:51:25.851Z [coolify] [info] Client transport closed
2025-03-07T09:51:25.852Z [coolify] [info] Server transport closed unexpectedly, this is likely due to the process exiting early. If you are developing this MCP server you can add output to stderr (i.e. `console.error('...')` in JavaScript, `print('...', file=sys.stderr)` in python) and it will appear in this log.
2025-03-07T09:51:25.852Z [coolify] [error] Server disconnected. For troubleshooting guidance, please visit our [debugging documentation](https://modelcontextprotocol.io/docs/tools/debugging) {"context":"connection"}
2025-03-07T09:51:25.852Z [coolify] [info] Client transport closed
```

For reference, the github package.json looks like this:

```json
{
  "name": "@modelcontextprotocol/server-github",
  "version": "0.6.2",
  "description": "MCP server for using the GitHub API",
  "license": "MIT",
  "author": "Anthropic, PBC (https://anthropic.com)",
  "homepage": "https://modelcontextprotocol.io",
  "bugs": "https://github.com/modelcontextprotocol/servers/issues",
  "type": "module",
  "bin": {
    "mcp-server-github": "dist/index.js"
  },
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "tsc && shx chmod +x dist/*.js",
    "prepare": "npm run build",
    "watch": "tsc --watch"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "1.0.1",
    "@types/node": "^22",
    "@types/node-fetch": "^2.6.12",
    "node-fetch": "^3.3.2",
    "universal-user-agent": "^7.0.2",
    "zod": "^3.22.4",
    "zod-to-json-schema": "^3.23.5"
  },
  "devDependencies": {
    "shx": "^0.3.4",
    "typescript": "^5.6.2"
  }
}
```
