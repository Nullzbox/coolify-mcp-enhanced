# Debug MCP Coolify

## Activer les logs de debug

Pour voir les détails complets des requêtes et erreurs API :

### Linux/macOS

```bash
# Dans le terminal avant de lancer Claude Desktop
export DEBUG=coolify:*

# Puis lancer Claude Desktop
/path/to/claude
```

### Alternative : Modifier la config MCP

Dans `~/.config/claude/mcp.json` ou équivalent :

```json
{
  "mcpServers": {
    "coolify": {
      "command": "node",
      "args": ["/path/to/coolify-mcp-enhanced/dist/index.js"],
      "env": {
        "DEBUG": "coolify:*"
      }
    }
  }
}
```

## Ce que vous verrez

Avec `DEBUG=coolify:*`, les logs afficheront :

1. **Paramètres envoyés** à chaque requête API
2. **URL complète** de la requête
3. **Détails complets des erreurs** API incluant :
   - Message d'erreur
   - Code d'erreur
   - Données de validation
   - Statut HTTP
   - Stack trace (en mode dev)

## Exemple de log debug

```
coolify:client Creating private GitHub app application with data: {
  "name": "backend-medusa",
  "project_uuid": "swsc8k8kw4k08oogsw8sgc80",
  "server_uuid": "r8wk0c0wwkckww4k04sw44cw",
  "environment_name": "production",
  "github_app_uuid": "frail-falcon-i4gwsow8sk48ss8wk",
  "git_repository": "Nullzbox/ThearAbianPerfumes",
  "git_branch": "main",
  "build_pack": "dockerfile"
}

coolify:client Making request to: https://coolify.example.com/api/v1/applications/private-github-app

coolify:client API error: 422 - Validation failed
coolify:client API error details: {
  "message": "Validation failed",
  "errors": {
    "destination_uuid": ["The destination uuid field is required."]
  }
}
```

## Résolution des erreurs courantes

### "Validation failed" sans détails

**Cause** : Le MCP n'affiche pas les détails de validation

**Solution** :
1. Activer `DEBUG=coolify:*`
2. Réessayer l'opération
3. Les détails de validation seront visibles dans les logs

### Missing required parameters

Les paramètres **REQUIS** pour `create_application_private_github_app` :

- `name`
- `project_uuid`
- `server_uuid`
- `environment_name` OU `environment_uuid`
- `github_app_uuid`
- `git_repository`
- `git_branch`
- `build_pack`
- `destination_uuid` ⚠️ **IMPORTANT** - UUID du Docker container/destination

Pour trouver le `destination_uuid` :
```bash
# Via l'API Coolify
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://your-coolify.com/api/v1/servers/SERVER_UUID
```

Ou dans l'interface Coolify : Servers → Destinations

## Tester le MCP

```bash
# Build
npm run build

# Tester avec debug activé
DEBUG=coolify:* node dist/index.js
```

## Versions

- v1.4.1 : Enhanced error reporting avec détails de validation complets
- v1.4.0 : Support repos privés (GitHub App + Deploy Key)
- v1.3.0 : Fix endpoint critique
- v1.1.0 : Error handling standardisé
