# ADR 009: MCP Prompts Implementation

## Context

Create reusable prompt templates for common Coolify workflows to make interactions more efficient.

## Implementation Checklist

- [ ] Deployment Prompts

  - [ ] "deploy-application" prompt
    ```typescript
    {
      applicationId: string,
      version?: string,
      environment?: string
    }
    ```
  - [ ] "rollback-deployment" prompt
    ```typescript
    {
      applicationId: string,
      deploymentId: string
    }
    ```

- [ ] Configuration Prompts

  - [ ] "configure-database" prompt
    ```typescript
    {
      databaseId: string,
      settings: DatabaseSettings
    }
    ```
  - [ ] "configure-environment" prompt
    ```typescript
    {
      environmentId: string,
      variables: Record<string, string>
    }
    ```

- [ ] Service Management Prompts

  - [ ] "setup-service" prompt
    ```typescript
    {
      environmentId: string,
      serviceType: string,
      configuration: ServiceConfig
    }
    ```
  - [ ] "troubleshoot-service" prompt
    ```typescript
    {
      serviceId: string,
      issueType?: "connectivity" | "performance" | "logs"
    }
    ```

- [ ] Resource Management Prompts

  - [ ] "optimize-resources" prompt
    ```typescript
    {
      resourceId: string,
      resourceType: "application" | "service" | "database"
    }
    ```
  - [ ] "backup-management" prompt
    ```typescript
    {
      resourceId: string,
      operation: "create" | "restore" | "list"
    }
    ```

- [ ] Testing
  - [ ] Prompt validation tests
  - [ ] Response formatting tests
  - [ ] Error handling tests
  - [ ] Integration tests with actual commands

## Dependencies

- ADR 001 (Core Server Setup)
- ADR 005 (Application Deployment)
- ADR 006 (Database Management)
- ADR 007 (Service Management)
- ADR 008 (MCP Resources Implementation)
