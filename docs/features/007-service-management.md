# ADR 007: Service Management

## Context

Service deployment and management - allows deploying predefined services (WordPress, Ghost, Plausible, etc.).

## API Endpoints Used

- GET `/services` (Line ~2500)

  - Lists all services
  - Query params: environment_uuid (optional)
  - Response: Array of Service objects
  - Auth: Bearer token required

- GET `/services/templates` (Line ~2550)

  - Lists available service templates
  - Response: Array of ServiceTemplate objects
  - Auth: Bearer token required

- POST `/services` (Line ~2600)

  - Create new service
  - Request body: {
    environment_uuid: string,
    template_id: string,
    name: string,
    configuration: ServiceConfiguration
    }
  - Response: Service object
  - Auth: Bearer token required

- GET `/services/{uuid}` (Line ~2650)

  - Get service details
  - Response: Service object with status
  - Auth: Bearer token required

- DELETE `/services/{uuid}` (Line ~2700)

  - Delete service
  - Response: 204 No Content
  - Auth: Bearer token required

- POST `/services/{uuid}/restart` (Line ~2750)

  - Restart service
  - Response: 202 Accepted
  - Auth: Bearer token required

- GET `/services/{uuid}/logs` (Line ~2800)
  - Get service logs
  - Query params: since (optional)
  - Response: Array of Log entries
  - Auth: Bearer token required

## Implementation Checklist

- [ ] Service List Resource

  - [ ] resources://coolify/services/list
  - [ ] resources://coolify/services/templates (available service types)
  - [ ] Filter by environment/project

- [ ] Service Management Tools

  - [ ] createService tool
  - [ ] configureService tool
  - [ ] deleteService tool
  - [ ] restartService tool
  - [ ] updateService tool

- [ ] Service Monitoring

  - [ ] resources://coolify/services/{id}/status
  - [ ] resources://coolify/services/{id}/logs
  - [ ] Configuration view (masked secrets)

- [ ] Testing
  - [ ] Service deployment tests
  - [ ] Configuration management tests
  - [ ] Service template validation

## Dependencies

- ADR 001 (Core Server Setup)
- ADR 004 (Environment Management)
