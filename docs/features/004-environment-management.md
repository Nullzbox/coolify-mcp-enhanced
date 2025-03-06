# ADR 004: Environment Management

## Context

Environment management within projects - allows retrieving environment information and deploying applications within environments.

## API Endpoints Used

- GET `/projects/{uuid}/{environment_name_or_uuid}`
  - Get environment details by project UUID and environment name/UUID
  - Response: Environment object
  - Auth: Bearer token required

- POST `/applications/{uuid}/deploy`
  - Deploy an application using its UUID
  - Response: Deployment object
  - Auth: Bearer token required

Note: Environment creation and management is handled through the Projects API. Environments are created and configured as part of project setup.

## Implementation Status

### Completed
- [x] Environment Detail Resource
  - [x] GET project environment endpoint implemented
  - [x] Client method: `getProjectEnvironment`
  - [x] MCP tool: `get_project_environment`

- [x] Application Deployment
  - [x] Deploy application endpoint implemented
  - [x] Client method: `deployApplication`
  - [x] MCP tool: `deploy_application`

### Environment Schema
```typescript
interface Environment {
  id: number;
  name: string;
  project_id: number;
  created_at: string;
  updated_at: string;
  description: string;
}
```

## Dependencies

- ADR 001 (Core Server Setup)
- ADR 003 (Project Management)

## Notes

- Environment management is tightly coupled with projects in the Coolify API
- Environment variables are managed at the application level during application creation/updates
- Direct environment CRUD operations are not available through dedicated endpoints
- Environment information can be retrieved through the project endpoints
