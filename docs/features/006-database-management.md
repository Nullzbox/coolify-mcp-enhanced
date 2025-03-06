# ADR 006: Database Management

## Context

Implementation of database management features through MCP resources, allowing users to manage various types of databases (PostgreSQL, MySQL, MariaDB, MongoDB, Redis, etc.).

## API Endpoints Used

- GET `/databases` (List)

  - Lists all databases
  - Response: Array of Database objects
  - Auth: Bearer token required

- GET `/databases/{uuid}` (Get)

  - Get database details
  - Response: Database object
  - Auth: Bearer token required

- DELETE `/databases/{uuid}` (Delete)

  - Delete database
  - Optional query params:
    - delete_configurations (boolean, default: true)
    - delete_volumes (boolean, default: true)
    - docker_cleanup (boolean, default: true)
    - delete_connected_networks (boolean, default: true)
  - Auth: Bearer token required

- PATCH `/databases/{uuid}` (Update)
  - Update database configuration
  - Supports various database types:
    - PostgreSQL
    - MariaDB
    - MySQL
    - MongoDB
    - Redis
    - KeyDB
    - Clickhouse
    - Dragonfly

## Implementation Checklist

- [ ] Basic Database Management

  - [ ] List databases resource
  - [ ] Get database details
  - [ ] Delete database
  - [ ] Update database configuration

- [ ] Database Type Support

  - [ ] PostgreSQL configuration
  - [ ] MariaDB configuration
  - [ ] MySQL configuration
  - [ ] MongoDB configuration
  - [ ] Redis configuration
  - [ ] KeyDB configuration
  - [ ] Clickhouse configuration
  - [ ] Dragonfly configuration

- [ ] Resource Testing
  - [ ] Unit tests for database operations
  - [ ] Integration tests with mock data
  - [ ] Live test with real Coolify instance

## Dependencies

- ADR 001 (Core Server Setup)
- ADR 002 (Server Information Resources)
