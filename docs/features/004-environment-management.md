# ADR 004: Environment Management

## Context

Environment management within projects - allows setting up different environments (dev, staging, prod).

## API Endpoints Used

- GET `/environments` (Line ~1200)

  - Lists all environments
  - Query params: project_uuid (optional)
  - Response: Array of Environment objects
  - Auth: Bearer token required

- POST `/environments` (Line ~1250)

  - Create new environment
  - Request body: {
    name: string,
    project_uuid: string,
    variables?: Record<string, string>
    }
  - Response: Environment object
  - Auth: Bearer token required

- GET `/environments/{uuid}` (Line ~1300)

  - Get environment details
  - Response: Environment object with variables
  - Auth: Bearer token required

- DELETE `/environments/{uuid}` (Line ~1350)

  - Delete environment
  - Response: 204 No Content
  - Auth: Bearer token required

- PUT `/environments/{uuid}/variables` (Line ~1400)
  - Update environment variables
  - Request body: { variables: Record<string, string> }
  - Response: Updated Environment object
  - Auth: Bearer token required

## Implementation Checklist

- [x] Environment List Resource
- [x] Environment Management Tools

## Dependencies

- ADR 001 (Core Server Setup)
- ADR 003 (Project Management)
