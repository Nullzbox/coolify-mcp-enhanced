# ADR 008: MCP Resources Implementation

## Context

Implement comprehensive MCP resources for exposing files, configurations, and logs across all Coolify entities.

## API Endpoints Used

- GET `/files/{resource_type}/{uuid}` (Line ~3000)

  - Get resource files
  - Response: Array of FileInfo objects
  - Auth: Bearer token required

- GET `/configurations/{resource_type}/{uuid}` (Line ~3050)
  - Get resource configuration
  - Response: Configuration object
  - Auth: Bearer token required

## Implementation Checklist

- [ ] File Resources

  - [ ] resources://coolify/files/applications/{id}/\*
  - [ ] resources://coolify/files/services/{id}/\*
  - [ ] resources://coolify/files/databases/{id}/\*

- [ ] Configuration Resources

  - [ ] resources://coolify/config/applications/{id}
  - [ ] resources://coolify/config/services/{id}
  - [ ] resources://coolify/config/databases/{id}
  - [ ] resources://coolify/config/environments/{id}

- [ ] Log Resources

  - [ ] resources://coolify/logs/applications/{id}
  - [ ] resources://coolify/logs/services/{id}
  - [ ] resources://coolify/logs/databases/{id}

- [ ] Testing
  - [ ] File access tests
  - [ ] Configuration retrieval tests
  - [ ] Log streaming tests
  - [ ] Permission validation tests

## Dependencies

- ADR 001 (Core Server Setup)
- ADR 005 (Application Deployment)
- ADR 006 (Database Management)
- ADR 007 (Service Management)
