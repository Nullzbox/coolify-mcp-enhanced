# Future ADR Considerations

Based on available Coolify API endpoints, here are potential future features to implement:

## Deployment Management

- Webhook integration for GitHub, GitLab, Bitbucket, Gitea

  - POST `/webhooks/github/{uuid}` (Line ~4000)
  - POST `/webhooks/gitlab/{uuid}` (Line ~4050)
  - POST `/webhooks/bitbucket/{uuid}` (Line ~4100)
  - POST `/webhooks/gitea/{uuid}` (Line ~4150)

- Build pack support

  - POST `/applications/{uuid}/buildpack` (Line ~4200)
  - GET `/buildpacks/templates` (Line ~4250)

- Custom deployment commands
  - POST `/applications/{uuid}/commands/pre-deploy` (Line ~4300)
  - POST `/applications/{uuid}/commands/post-deploy` (Line ~4350)

## Resource Management

- Resource limits management

  - PUT `/applications/{uuid}/limits` (Line ~4400)
  - PUT `/services/{uuid}/limits` (Line ~4450)
  - GET `/resources/usage` (Line ~4500)

- Health check configuration
  - PUT `/applications/{uuid}/health` (Line ~4550)
  - GET `/applications/{uuid}/health/status` (Line ~4600)

## Network Management

- Domain management

  - POST `/domains` (Line ~4650)
  - GET `/domains/{uuid}/verify` (Line ~4700)
  - PUT `/domains/{uuid}/ssl` (Line ~4750)

- SSL/TLS configuration
  - POST `/certificates` (Line ~4800)
  - GET `/certificates/{uuid}/status` (Line ~4850)

## Build Management

- Build server configuration
  - POST `/build-servers` (Line ~4900)
  - GET `/build-servers/{uuid}/status` (Line ~4950)
  - PUT `/build-servers/{uuid}/cache` (Line ~5000)

## Team Management

- Team member management

  - POST `/teams` (Line ~5050)
  - POST `/teams/{uuid}/members` (Line ~5100)
  - PUT `/teams/{uuid}/permissions` (Line ~5150)

- API key management
  - POST `/api-keys` (Line ~5200)
  - GET `/api-keys/{uuid}/usage` (Line ~5250)

## Monitoring and Logging

- Resource usage monitoring

  - GET `/monitoring/resources` (Line ~5300)
  - GET `/monitoring/alerts` (Line ~5350)

- Centralized logging
  - GET `/logs/aggregate` (Line ~5400)
  - POST `/logs/search` (Line ~5450)

Each of these could be developed into full ADRs once the core functionality is stable. The line numbers reference the OpenAPI specification for implementation details.
