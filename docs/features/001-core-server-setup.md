# ADR 001: Core Server Setup

## Context

Need basic MCP server implementation that can authenticate with Coolify and handle basic operations.

## Implementation Checklist

- [x] Project structure setup

  - [x] TypeScript configuration
  - [x] ESLint + Prettier
  - [x] Jest/Vitest setup
  - [x] Basic GitHub Actions CI

- [x] Core MCP Server

  - [x] Basic server class implementation
  - [x] Environment configuration (COOLIFY_ACCESS_TOKEN, COOLIFY_BASE_URL)
  - [x] Coolify API client wrapper
  - [x] Error handling structure

- [x] Testing Infrastructure
  - [x] Mock Coolify API responses
  - [x] Basic integration test framework

## Dependencies

- None (This is our first implementation)
