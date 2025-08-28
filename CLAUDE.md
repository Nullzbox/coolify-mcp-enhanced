# Claude Assistant Instructions for Coolify MCP

## ⚠️ IMPORTANT: Token Limits and Pagination

Many Coolify MCP tools have built-in pagination to prevent token overflow errors. **ALWAYS use pagination parameters when available** to avoid exceeding the 25,000 token limit.

## 📋 Tool Usage Guidelines

### 1. Getting Deployments (`get_deployments`)
**⚠️ ALWAYS use pagination - deployments can be very large!**

```
CORRECT Usage:
- get_deployments(application_uuid: "xxx", skip: 0, limit: 10)
- Default limit is 10, maximum is 50
- For more items, use skip: 10, 20, 30...

INCORRECT Usage:
- get_deployments(application_uuid: "xxx") // May cause token overflow!
```

### 2. Listing Applications (`list_applications`)
```
Parameters:
- limit: number (default: 25, max: 100)
- full: boolean (default: false)

Best Practice:
- Use full: false for summaries (default)
- Only use full: true when you need complete details for specific apps
```

### 3. Listing Databases (`list_databases`)
```
Parameters:
- limit: number (default: 25, max: 100)

Returns: Summary with uuid, name, type, status only
```

### 4. Listing Services (`list_services`)
```
Parameters:
- limit: number (default: 25, max: 100)

Returns: Summary with uuid, name, type, status only
```

## 🎯 Best Practices

### When User Asks for Deployments:
1. **First call**: `get_deployments` with `limit: 10`
2. **Check response**: Look at pagination info
3. **If more needed**: Use `skip` parameter to paginate

### When User Asks for Applications/Databases/Services:
1. **First call**: Use default parameters (returns summary)
2. **For details**: Use `get_application`, `get_database`, or `get_service` with specific UUID

### Example Conversation Flow:
```
User: "Show me my deployments"
Assistant: 
1. Call get_deployments(application_uuid: "xxx", limit: 10)
2. Show user first 10 deployments
3. If response indicates more available, ask: "There are more deployments. Would you like to see the next 10?"
```

## 🚨 Error Prevention

### If you see this error:
```
"MCP tool response exceeds maximum allowed tokens (25000)"
```

**Solution**: 
- Reduce the `limit` parameter
- Use `skip` for pagination
- Request summaries instead of full details

### Token Estimates:
- Deployments: ~10,000-30,000 tokens per 10 items
- Applications: ~500-2,000 tokens per item (full details)
- Applications: ~100-200 tokens per item (summary)
- Databases/Services: ~100-200 tokens per item (summary)

## 📊 Response Structure

All paginated responses include:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "skip": 0,
    "limit": 10,
    "count": 10,
    "hasMore": true,
    "message": "Showing X items"
  },
  "hint": "Usage instructions"
}
```

## 🔍 Finding Specific Items

Instead of listing everything:
1. Ask user for more specific criteria
2. Get limited list first
3. Use specific `get_*` tools for details

## 💡 Smart Defaults

The MCP server has smart defaults:
- `get_deployments`: limit=10 (safe for tokens)
- `list_applications`: limit=25, full=false (summary only)
- `list_databases`: limit=25 (summary only)
- `list_services`: limit=25 (summary only)

## 📝 Summary Fields

When tools return summaries, they include:
- **uuid**: Always included for reference
- **name**: Human-readable identifier
- **status**: Current state
- **created_at**: Timestamp
- **type**: (for databases/services)

For full details, use the specific `get_*` tool with the UUID.

## 🎬 Example Usage Scenarios

### Scenario 1: User wants to see recent deployments
```javascript
// Step 1: Get recent deployments (limited)
get_deployments(application_uuid: "xxx", skip: 0, limit: 5)

// Step 2: If user wants more
get_deployments(application_uuid: "xxx", skip: 5, limit: 5)
```

### Scenario 2: User wants application details
```javascript
// Step 1: Get application list (summary)
list_applications(limit: 10, full: false)

// Step 2: Get specific application details
get_application(uuid: "specific-app-uuid")
```

### Scenario 3: Debugging deployment issues
```javascript
// Step 1: Get recent failed deployments
get_deployments(application_uuid: "xxx", limit: 5)

// Step 2: Get specific deployment details
get_deployment(uuid: "deployment-uuid")

// Step 3: Get application logs
get_application_logs(uuid: "xxx", lines: 100)
```

## 🚀 Performance Tips

1. **Always start with small limits** - You can always fetch more
2. **Use summaries by default** - Only get full details when needed
3. **Paginate large datasets** - Use skip/limit parameters
4. **Cache UUIDs** - Remember UUIDs from list operations for detail fetches

## ⚙️ Tool-Specific Notes

### `get_application`
- Automatically truncates large fields like `docker_compose_raw`
- Environment variables are hidden for security

### `get_deployments`
- Returns only essential fields in summary
- Use `get_deployment` for full deployment details

### `list_applications`
- Use `full: true` only when necessary
- Default summary includes: uuid, name, status, fqdn, git info

Remember: **It's better to make multiple small requests than one large request that fails!**