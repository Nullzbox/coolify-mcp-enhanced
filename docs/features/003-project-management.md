# ADR 003: Project Management

## Context

Basic project management functionality - first interactive feature allowing users to create and manage projects.

## API Endpoints Used

- GET `/projects` (Line ~800)

  - Lists all projects
  - Response: Array of Project objects
  - Auth: Bearer token required

- POST `/projects` (Line ~850)

  - Create new project
  - Request body: { name: string, description?: string }
  - Response: Project object
  - Auth: Bearer token required

- GET `/projects/{uuid}` (Line ~900)

  - Get project details
  - Response: Project object with relationships
  - Auth: Bearer token required

- DELETE `/projects/{uuid}` (Line ~950)

  - Delete project
  - Response: 204 No Content
  - Auth: Bearer token required

- PUT `/projects/{uuid}` (Line ~1000)
  - Update project
  - Request body: { name?: string, description?: string }
  - Response: Updated Project object
  - Auth: Bearer token required

## Implementation Checklist

- [ ] Project List Resource

  - [ ] resources://coolify/projects/list implementation
  - [ ] Pagination support
  - [ ] Basic filtering

- [ ] Project Management Tools

  - [ ] createProject tool
  - [ ] deleteProject tool
  - [ ] updateProject tool

- [ ] Project Detail Resource

  - [ ] resources://coolify/projects/{id} implementation
  - [ ] Project status and configuration

- [ ] Testing
  - [ ] CRUD operation tests
  - [ ] Error handling tests
  - [ ] Resource format tests

## Dependencies

- ADR 001 (Core Server Setup)
- ADR 002 (Server Information Resources)
