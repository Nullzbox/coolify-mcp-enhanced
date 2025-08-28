# MCP Usage Guide - Preventing Token Overflow Errors

## ⚠️ Critical Information for MCP Users

This guide explains how to use the Coolify MCP server without encountering token limit errors.

## The Problem

MCP tools have a **25,000 token response limit**. Some Coolify operations (especially deployments) can return massive amounts of data that exceed this limit, causing errors like:

```
Error: MCP tool "get_deployments" response (101070 tokens) exceeds maximum allowed tokens (25000).
```

## The Solution: Pagination

All list operations now support pagination parameters to control response size.

## Quick Reference

| Tool | Safe Default | Parameters | Example |
|------|--------------|------------|---------|
| `get_deployments` | limit: 10 | `skip`, `limit` | `get_deployments(app_uuid, skip: 0, limit: 10)` |
| `list_applications` | limit: 25 | `limit`, `full` | `list_applications(limit: 25, full: false)` |
| `list_databases` | limit: 25 | `limit` | `list_databases(limit: 25)` |
| `list_services` | limit: 25 | `limit` | `list_services(limit: 25)` |
| `get_application_deployments` | take: 10 | `skip`, `take` | `get_application_deployments(uuid, skip: 0, take: 10)` |
| `list_deployments` | take: 10 | `skip`, `take` | `list_deployments(skip: 0, take: 10)` |

## Usage Examples

### Getting Deployments (Most Common Issue)

❌ **WRONG - Will likely fail:**
```javascript
get_deployments(application_uuid: "xxx")
```

✅ **CORRECT - With pagination:**
```javascript
// First page
get_deployments(application_uuid: "xxx", skip: 0, limit: 10)

// Second page
get_deployments(application_uuid: "xxx", skip: 10, limit: 10)

// Third page
get_deployments(application_uuid: "xxx", skip: 20, limit: 10)
```

### Listing Applications

❌ **WRONG - May return too much data:**
```javascript
list_applications()
```

✅ **CORRECT - With limits:**
```javascript
// Get summary of first 25 apps
list_applications(limit: 25, full: false)

// If you need full details (use sparingly!)
list_applications(limit: 10, full: true)
```

### Getting Application Details

✅ **BEST PRACTICE - Two-step approach:**
```javascript
// Step 1: Get list with summaries
list_applications(limit: 25, full: false)

// Step 2: Get specific app details
get_application(uuid: "specific-app-uuid")
```

## Understanding Responses

All paginated responses include helpful metadata:

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "skip": 0,
    "limit": 10,
    "count": 10,
    "hasMore": true,
    "message": "Showing 10 deployments (skip: 0, limit: 10)"
  },
  "hint": "Use skip and limit parameters for pagination..."
}
```

## Token Usage Guidelines

| Data Type | Tokens per Item | Safe Limit |
|-----------|----------------|------------|
| Deployment (full) | 10,000-30,000 | 1-2 items |
| Deployment (summary) | 1,000-3,000 | 10 items |
| Application (full) | 2,000-5,000 | 5-10 items |
| Application (summary) | 200-500 | 25-50 items |
| Database/Service | 200-500 | 25-50 items |

## Troubleshooting

### Error: "exceeds maximum allowed tokens"

**Immediate fixes:**
1. Reduce the `limit` parameter
2. Use `full: false` for summaries only
3. Use specific `get_*` tools instead of `list_*`

### Error: "Failed to get deployments"

**Check:**
1. Are you using pagination parameters?
2. Is the application UUID correct?
3. Try with `limit: 5` first

## Best Practices

1. **Always specify limits** - Never rely on defaults being small enough
2. **Start small** - Begin with limit: 5 or 10, increase if needed
3. **Use summaries** - Set `full: false` unless you need complete details
4. **Paginate large sets** - Use `skip` to get additional pages
5. **Cache UUIDs** - Store UUIDs from list operations for detail fetches

## For AI Assistants

If you're an AI assistant using this MCP server:

1. **Check for pagination guide**: Call `coolify_pagination_guide()` tool first
2. **Monitor token usage**: Check response sizes in pagination metadata
3. **Inform users**: Tell users when data is paginated and more is available
4. **Handle errors gracefully**: If token limit exceeded, retry with smaller limit

## Environment Variables

Ensure these are set correctly:
```bash
COOLIFY_BASE_URL="https://your-server.com"
COOLIFY_ACCESS_TOKEN="your-token-here"
```

## Getting Help

1. Use the `coolify_pagination_guide` tool for quick reference
2. Check response hints - they provide context-specific guidance
3. Look at pagination metadata to understand data availability

## Summary

**Remember:** It's better to make multiple small requests than one large request that fails!

- Default to small limits (10 for deployments, 25 for others)
- Use pagination (`skip` parameter) for large datasets
- Request summaries (`full: false`) by default
- Get specific details with targeted `get_*` tools