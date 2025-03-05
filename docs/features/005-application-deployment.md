# ADR 005: Application Deployment

## Context

Core application deployment functionality - allows deploying and managing applications within environments.

## API Endpoints Used

- GET `/applications` (Line 10)

  - Lists all applications
  - Query params: environment_uuid (optional)
  - Response: Array of Application objects
  - Auth: Bearer token required

- POST `/applications/public` (Line 31)

  - Create new application from public repository
  - Request body: {
    project_uuid: string,
    environment_uuid: string,
    git_repository: string,
    git_branch: string,
    build_pack: "nixpacks" | "static" | "dockerfile" | "dockercompose",
    ports_exposes: string,
    name?: string,
    ...additional configuration
    }
  - Response: Application object
  - Auth: Bearer token required

- GET `/applications/{uuid}` (Line ~1600)

  - Get application details
  - Response: Application object with status
  - Auth: Bearer token required

- DELETE `/applications/{uuid}` (Line ~1650)

  - Delete application
  - Response: 204 No Content
  - Auth: Bearer token required

- POST `/applications/{uuid}/deploy` (Line ~1700)

  - Trigger application deployment
  - Response: Deployment object
  - Auth: Bearer token required

- GET `/applications/{uuid}/logs` (Line ~1750)
  - Get application logs
  - Query params: since (optional)
  - Response: Array of Log entries
  - Auth: Bearer token required

## Implementation Checklist

- [ ] Application List Resource

  - [ ] resources://coolify/applications/list
  - [ ] Filter by environment/project
  - [ ] Status information

- [ ] Application Management Tools

  - [ ] createApplication tool
  - [ ] deployApplication tool
  - [ ] configureApplication tool
  - [ ] deleteApplication tool

- [ ] Application Monitoring

  - [ ] resources://coolify/applications/{id}/logs
  - [ ] resources://coolify/applications/{id}/status
  - [ ] Basic metrics

- [ ] Testing
  - [ ] Deployment workflow tests
  - [ ] Configuration management tests
  - [ ] Log retrieval tests

## Dependencies

- ADR 001 (Core Server Setup)
- ADR 004 (Environment Management)
