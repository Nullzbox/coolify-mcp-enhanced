# 📘 Guide d'Utilisation: create_application (Corrigé v1.2.0)

**Date**: 2025-01-08
**Bug corrigé**: RESOURCE_NOT_FOUND
**Version MCP**: 1.2.0+

---

## 🐛 Problème Résolu

### Avant (v1.1.0)
```json
{
  "tool": "create_application",
  "args": {
    "name": "my-app",
    "project_uuid": "xxx",
    "server_uuid": "yyy",
    "environment_name": "production"  // ❌ INSUFFISANT
  }
}
```

**Résultat**:
```
Error: RESOURCE_NOT_FOUND - The requested resource was not found
```

### Après (v1.2.0)
```json
{
  "tool": "create_application",
  "args": {
    "name": "my-app",
    "project_uuid": "xxx",
    "server_uuid": "yyy",
    "environment_uuid": "zzz",  // ✅ REQUIS
    "git_repository": "https://github.com/user/repo",
    "git_branch": "main",
    "build_pack": "dockerfile"
  }
}
```

**Résultat**: ✅ Application créée avec succès

---

## 📋 Paramètres du Tool

### Paramètres Requis

| Paramètre | Type | Description | Exemple |
|-----------|------|-------------|---------|
| `name` | string | Nom de l'application | `"backend-medusa"` |
| `project_uuid` | string | UUID du projet Coolify | `"swsc8k8k..."` |
| `server_uuid` | string | UUID du serveur | `"r8wk0c0w..."` |

### Paramètres Optionnels (mais Recommandés)

| Paramètre | Type | Description | Exemple |
|-----------|------|-------------|---------|
| `environment_uuid` | string | **IMPORTANT**: UUID de l'environnement | `"e44s0cog..."` |
| `environment_name` | string | Nom de l'environnement (legacy) | `"production"` |
| `destination_uuid` | string | UUID de la destination Docker | `"abcd1234..."` |
| `git_repository` | string | URL du repository Git | `"https://github.com/user/repo"` |
| `git_branch` | string | Branche Git à déployer | `"main"` ou `"develop"` |
| `build_pack` | enum | Type de build | `"nixpacks"`, `"dockerfile"`, `"docker-compose"`, `"static"` |
| `dockerfile_location` | string | Chemin du Dockerfile | `"backend/Dockerfile"` |
| `docker_compose_location` | string | Chemin du docker-compose.yml | `"docker-compose.prod.yml"` |
| `base_directory` | string | Répertoire de base du repo | `"backend"` ou `"apps/api"` |
| `fqdn` | string | Nom de domaine | `"api.example.com"` |
| `description` | string | Description de l'application | `"Backend API"` |

---

## 🎯 Exemples d'Utilisation

### Exemple 1: Application Dockerfile (Medusa.js Backend)

```json
{
  "tool": "create_application",
  "args": {
    "name": "backend-medusa",
    "description": "Medusa.js e-commerce backend",
    "project_uuid": "swsc8k8kw4k08oogsw8sgc80",
    "server_uuid": "r8wk0c0wwkckww4k04sw44cw",
    "environment_uuid": "e44s0cogcg4w8s8g8gs0owc0",
    "git_repository": "https://github.com/Nullzbox/ThearAbianPerfumes",
    "git_branch": "main",
    "build_pack": "dockerfile",
    "dockerfile_location": "backend/Dockerfile",
    "base_directory": "backend",
    "fqdn": "backend-tap.nullbase.xyz"
  }
}
```

### Exemple 2: Application Next.js (Nixpacks)

```json
{
  "tool": "create_application",
  "args": {
    "name": "storefront-nextjs",
    "description": "Next.js storefront",
    "project_uuid": "swsc8k8kw4k08oogsw8sgc80",
    "server_uuid": "r8wk0c0wwkckww4k04sw44cw",
    "environment_uuid": "e44s0cogcg4w8s8g8gs0owc0",
    "git_repository": "https://github.com/Nullzbox/ThearAbianPerfumes",
    "git_branch": "main",
    "build_pack": "nixpacks",
    "base_directory": "storefront",
    "fqdn": "tap.nullbase.xyz"
  }
}
```

### Exemple 3: Site Statique

```json
{
  "tool": "create_application",
  "args": {
    "name": "landing-page",
    "project_uuid": "xxx",
    "server_uuid": "yyy",
    "environment_uuid": "zzz",
    "git_repository": "https://github.com/user/landing",
    "git_branch": "main",
    "build_pack": "static",
    "base_directory": "dist",
    "fqdn": "example.com"
  }
}
```

### Exemple 4: Docker Compose

```json
{
  "tool": "create_application",
  "args": {
    "name": "fullstack-app",
    "project_uuid": "xxx",
    "server_uuid": "yyy",
    "environment_uuid": "zzz",
    "git_repository": "https://github.com/user/fullstack",
    "git_branch": "main",
    "build_pack": "docker-compose",
    "docker_compose_location": "docker-compose.yml"
  }
}
```

---

## 🔍 Comment Obtenir les UUIDs Requis

### 1. Obtenir le Project UUID

```json
{
  "tool": "list_projects",
  "args": {}
}
```

Réponse:
```json
{
  "success": true,
  "data": [
    {
      "uuid": "swsc8k8kw4k08oogsw8sgc80",  // ← Copier cet UUID
      "name": "Arabian Perfumes Project"
    }
  ]
}
```

### 2. Obtenir le Server UUID

```json
{
  "tool": "list_servers",
  "args": {}
}
```

Réponse:
```json
{
  "success": true,
  "data": [
    {
      "uuid": "r8wk0c0wwkckww4k04sw44cw",  // ← Copier cet UUID
      "name": "Production Server"
    }
  ]
}
```

### 3. Obtenir l'Environment UUID

```json
{
  "tool": "get_project_environment",
  "args": {
    "project_uuid": "swsc8k8kw4k08oogsw8sgc80",
    "environment_name": "production"
  }
}
```

Réponse:
```json
{
  "success": true,
  "data": {
    "uuid": "e44s0cogcg4w8s8g8gs0owc0",  // ← Copier cet UUID
    "name": "production"
  }
}
```

---

## ⚠️ Erreurs Courantes et Solutions

### Erreur: "RESOURCE_NOT_FOUND"

**Cause**: Manque `environment_uuid` ou UUID invalide

**Solution**:
```json
{
  "environment_uuid": "e44s0cogcg4w8s8g8gs0owc0"  // ✅ Ajouter ceci
}
```

### Erreur: "Project not found"

**Vérification**:
```json
{
  "tool": "get_project",
  "args": {
    "uuid": "swsc8k8kw4k08oogsw8sgc80"
  }
}
```

### Erreur: "Server not found"

**Vérification**:
```json
{
  "tool": "get_server",
  "args": {
    "uuid": "r8wk0c0wwkckww4k04sw44cw"
  }
}
```

### Erreur: Build échoue

**Vérifications**:
1. Le `dockerfile_location` est correct
2. Le `base_directory` existe dans le repo
3. Le `git_branch` existe
4. Le repository est accessible (public ou avec SSH key configurée)

---

## 📊 Réponse de Succès

```json
{
  "success": true,
  "data": {
    "uuid": "app123456789"  // ← UUID de l'application créée
  },
  "message": "Application 'backend-medusa' created successfully"
}
```

### Après Création

1. **Récupérer les détails de l'application**:
```json
{
  "tool": "get_application",
  "args": {
    "uuid": "app123456789"
  }
}
```

2. **Configurer les variables d'environnement**:
```json
{
  "tool": "update_application_environment_variables",
  "args": {
    "uuid": "app123456789",
    "variables": [
      {
        "key": "DATABASE_URL",
        "value": "postgres://...",
        "is_build_time": false,
        "is_preview": false
      }
    ]
  }
}
```

3. **Déployer l'application**:
```json
{
  "tool": "deploy_application",
  "args": {
    "uuid": "app123456789"
  }
}
```

---

## 🚀 Workflow Complet: De la Création au Déploiement

```bash
# Étape 1: Obtenir les UUIDs
list_projects → project_uuid
list_servers → server_uuid
get_project_environment → environment_uuid

# Étape 2: Créer l'application
create_application(
  name,
  project_uuid,
  server_uuid,
  environment_uuid,
  git_repository,
  build_pack,
  ...
) → application_uuid

# Étape 3: Configurer les variables
update_application_environment_variables(
  uuid: application_uuid,
  variables: [...]
)

# Étape 4: Déployer
deploy_application(uuid: application_uuid)

# Étape 5: Surveiller
get_deployments(application_uuid: application_uuid)
get_application_logs(uuid: application_uuid)
```

---

## 📝 Notes Importantes

### Build Packs

- **nixpacks**: Auto-détection (Node.js, Python, Go, etc.)
- **dockerfile**: Utilise un Dockerfile personnalisé
- **docker-compose**: Multi-containers
- **static**: Sites statiques (HTML/CSS/JS)

### Base Directory

Si votre repo a cette structure:
```
monorepo/
├── backend/
│   └── Dockerfile
└── frontend/
    └── package.json
```

Pour le backend:
```json
{
  "base_directory": "backend",
  "dockerfile_location": "backend/Dockerfile"
}
```

Pour le frontend:
```json
{
  "base_directory": "frontend",
  "build_pack": "nixpacks"
}
```

### FQDN (Fully Qualified Domain Name)

- Doit pointer vers votre serveur Coolify
- Coolify génère automatiquement un certificat SSL
- Peut être laissé vide (Coolify génère un domaine par défaut)

---

## 🆘 Troubleshooting

### Le tool ne trouve pas l'environnement

**Vérifier que l'environnement existe**:
```json
{
  "tool": "list_projects",
  "args": {}
}
```

Puis chercher l'environnement dans le projet.

### L'application est créée mais ne démarre pas

**Vérifier les logs**:
```json
{
  "tool": "get_application_logs",
  "args": {
    "uuid": "app123456789",
    "lines": 100
  }
}
```

### Le déploiement échoue

**Vérifier le déploiement**:
```json
{
  "tool": "get_deployments",
  "args": {
    "application_uuid": "app123456789",
    "limit": 5
  }
}
```

---

## ✅ Checklist de Création d'Application

- [ ] Obtenir `project_uuid` via `list_projects`
- [ ] Obtenir `server_uuid` via `list_servers`
- [ ] Obtenir `environment_uuid` via `get_project_environment`
- [ ] Vérifier que le repository Git est accessible
- [ ] Vérifier que la branche existe
- [ ] Choisir le bon `build_pack`
- [ ] Spécifier `dockerfile_location` si build_pack=dockerfile
- [ ] Spécifier `base_directory` si monorepo
- [ ] Optionnel: Configurer `fqdn` pour le domaine personnalisé
- [ ] Créer l'application via `create_application`
- [ ] Configurer les variables d'environnement
- [ ] Déployer via `deploy_application`
- [ ] Vérifier les logs et le statut

---

**Version**: 1.2.0
**Dernière mise à jour**: 2025-01-08
**Status**: ✅ Bug RESOURCE_NOT_FOUND corrigé
