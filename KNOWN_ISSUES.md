# Known Issues

## ⚠️ Coolify Beta Versions (v4.0.0-beta.434 and earlier)

### Issue: `/applications/private-github-app` endpoint returns 404

**Affected Versions:**
- Coolify v4.0.0-beta.434
- Likely affects other beta versions around beta.380 - beta.434

**Symptoms:**
- API call to `POST /api/v1/applications/private-github-app` returns:
  ```json
  {"message": "Github App not found."}
  ```
- HTTP Status: 404
- Occurs even with valid `github_app_uuid` that exists in `/api/v1/security/keys`

**Root Cause:**
- The `/api/v1/security/keys` endpoint returns a **different UUID** than what the `/applications/private-github-app` endpoint expects
- Issue [#4864](https://github.com/coollabsio/coolify/issues/4864): `github_app_uuid` from API ≠ actual GitHub App UUID
- The correct UUID is only visible in the Coolify UI URL: `http://your-coolify/source/github/CORRECT-UUID-HERE`
- Related GitHub Issues:
  - [#4864](https://github.com/coollabsio/coolify/issues/4864) - github_app_uuid & SecurityKey.uuid mismatch (OPEN)
  - [#3209](https://github.com/coollabsio/coolify/issues/3209) - Unable to identify correct github_app_uuid
  - [#5467](https://github.com/coollabsio/coolify/issues/5467) - Private GitHub apps API timeouts
  - [#5540](https://github.com/coollabsio/coolify/issues/5540) - validateDataApplications method missing

**✅ WORKING SOLUTION (v1.4.7+):**

This MCP now includes a **local config file** workaround:

1. **Get the correct UUID from Coolify UI:**
   - Go to your Coolify dashboard
   - Navigate to: Resources → Sources → GitHub Apps → Your GitHub App
   - Copy the UUID from the browser URL: `http://your-coolify/source/github/YOUR-UUID-HERE`

2. **Create local config file:**
   ```bash
   # Create coolify.config.local.json in the project root
   {
     "githubAppUuid": "your-real-uuid-from-ui-url"  // Your UUID from step 1
   }
   ```

3. **Rebuild the MCP:**
   ```bash
   npm run build
   ```

4. **Restart Claude Desktop** to load the new config

The MCP will now automatically use the correct UUID from your config file, bypassing the broken API endpoint.

**Alternative Workarounds:**
1. **Create applications manually via Coolify UI**
   - Fastest for one-time deployments
   - UI properly links GitHub App to application

2. **Update Coolify to stable version** (when available)
   ```bash
   curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
   ```

**MCP Tool Status:**
- ✅ `create_application` (public repos) - WORKS
- ✅ `create_application_private_github_app` - WORKS with local config workaround (v1.4.7+)
- ✅ All other tools (list, get, update, delete, deploy) - WORK

**Verified Working:**
- Validation error reporting (v1.4.6) ✅
- Error details with `VALIDATION_ERRORS` field ✅
- GitHub App listing via `/security/keys` ✅
- Application CRUD operations ✅

**Testing Results:**
```bash
# Version check
curl http://your-coolify-instance:8000/api/v1/version
# Returns: 4.0.0-beta.434

# Working endpoint
POST /api/v1/applications/public
# Result: Creates app with source_id: 0

# Broken endpoint
POST /api/v1/applications/private-github-app
# Result: {"message": "Github App not found."}
```

**Resolution:**
Wait for Coolify stable release or update to latest version where this endpoint is confirmed working.

---

## 📋 Testing Checklist for Future Versions

When testing a new Coolify version:

1. Check version:
   ```bash
   curl -H "Authorization: Bearer TOKEN" http://your-coolify.com/api/v1/version
   ```

2. List GitHub Apps:
   ```bash
   curl -H "Authorization: Bearer TOKEN" http://your-coolify.com/api/v1/security/keys
   ```

3. Test private GitHub app creation:
   ```bash
   curl -X POST http://your-coolify.com/api/v1/applications/private-github-app \
     -H "Authorization: Bearer TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "test-app",
       "project_uuid": "...",
       "server_uuid": "...",
       "environment_name": "production",
       "github_app_uuid": "...",
       "git_repository": "owner/repo",
       "git_branch": "main",
       "build_pack": "dockerfile",
       "ports_exposes": "3000",
       "destination_uuid": "..."
     }'
   ```

4. Expected success response:
   ```json
   {
     "uuid": "app-uuid-here",
     "domains": null
   }
   ```

---

## 🔧 Workaround Implementation

If you need to use the MCP with beta versions, temporarily use `create_application` (public) and note that private repos won't work until manual configuration.

## 📚 References

- [Coolify API Documentation](https://coolify.io/docs/api-reference/api/operations/create-private-github-app-application)
- [Coolify GitHub Releases](https://github.com/coollabsio/coolify/releases)
- [Issue Tracker](https://github.com/coollabsio/coolify/issues)
