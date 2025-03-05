# ADR 002: Server Information Resources

## Context

First useful feature - ability to get server information and status through MCP resources.

## API Endpoints Used

- GET `/servers` (Line ~500)

  - Lists all servers
  - Response: Array of Server objects
  - Auth: Bearer token required

- GET `/servers/{uuid}` (Line ~550)

  - Get server details
  - Response: Server object with status
  - Auth: Bearer token required

- GET `/servers/{uuid}/status` (Line ~600)
  - Get server health and resource usage
  - Response: ServerStatus object
  - Auth: Bearer token required

## Implementation Checklist

- [x] Basic Resource Implementation

  - [x] Server info resource (resources://coolify/server/info)
    - [x] Basic server details
    - [x] Version information
  - [x] Server status resource (resources://coolify/server/status)
    - [x] Health check
    - [x] Resource usage

- [x] Resource Testing
  - [x] Unit tests for resource formatters
  - [x] Integration tests with mock data
  - [x] Live test with real Coolify instance

## Dependencies

- ADR 001 (Core Server Setup)
