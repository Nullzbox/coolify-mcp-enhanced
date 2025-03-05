# ADR 006: Database Management

## Context

Database service management - allows creating and managing database instances (MySQL, PostgreSQL, MongoDB, Redis).

## API Endpoints Used

- GET `/databases` (Line ~2000)

  - Lists all databases
  - Query params: environment_uuid (optional)
  - Response: Array of Database objects
  - Auth: Bearer token required

- POST `/databases` (Line ~2050)

  - Create new database
  - Request body: {
    environment_uuid: string,
    type: "mysql" | "postgresql" | "mongodb" | "redis",
    version: string,
    name: string,
    settings?: DatabaseSettings
    }
  - Response: Database object
  - Auth: Bearer token required

- GET `/databases/{uuid}` (Line ~2100)

  - Get database details
  - Response: Database object with connection info
  - Auth: Bearer token required

- DELETE `/databases/{uuid}` (Line ~2150)

  - Delete database
  - Response: 204 No Content
  - Auth: Bearer token required

- GET `/databases/{uuid}/backups` (Line ~2175)

  - List database backups
  - Response: Array of Backup objects
  - Auth: Bearer token required

- POST `/databases/{uuid}/backup` (Line ~2200)

  - Create database backup
  - Response: Backup object
  - Auth: Bearer token required

- POST `/databases/{uuid}/restore` (Line ~2250)
  - Restore database from backup
  - Request body: { backup_id: string }
  - Response: 202 Accepted
  - Auth: Bearer token required

## Implementation Checklist

- [ ] Database List Resource

  - [ ] resources://coolify/databases/list
  - [ ] Filter by environment/project
  - [ ] Status information

- [ ] Database Management Tools

  - [ ] createDatabase tool (supports MySQL, PostgreSQL, MongoDB, Redis)
  - [ ] configureDatabase tool
  - [ ] deleteDatabase tool
  - [ ] backupDatabase tool
  - [ ] restoreDatabase tool
  - [ ] listBackups tool

- [ ] Database Monitoring

  - [ ] resources://coolify/databases/{id}/status
  - [ ] resources://coolify/databases/{id}/backups
  - [ ] Connection information (masked credentials)

- [ ] Testing
  - [ ] Database creation tests for each type
  - [ ] Backup/restore workflow tests
  - [ ] Security tests for credential handling

## Dependencies

- ADR 001 (Core Server Setup)
- ADR 004 (Environment Management)
