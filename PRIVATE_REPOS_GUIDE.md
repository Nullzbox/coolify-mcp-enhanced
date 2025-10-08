# 🔐 Guide: Repositories Privés - MCP Coolify v1.4.0

**Date**: 2025-01-08
**Version**: 1.4.0
**Status**: ✅ **PRODUCTION READY**

---

## 🎯 Nouveauté v1.4.0: Support Complet des Repos Privés!

Le MCP Coolify supporte maintenant **TOUS** les types de repositories:
- ✅ **Repositories publics** (v1.3.0)
- ✅ **Repositories privés via GitHub App** (v1.4.0) ← **NOUVEAU**
- ✅ **Repositories privés via Deploy Key** (v1.4.0) ← **NOUVEAU**

---

## 📊 Tableau Comparatif

| Méthode | Public Repos | Private Repos | Setup Coolify | Sécurité |
|---------|--------------|---------------|---------------|----------|
| **Public** | ✅ | ❌ | Aucun | Faible (code public) |
| **GitHub App** | ✅ | ✅ | GitHub App installation | ⭐⭐⭐ Haute |
| **Deploy Key** | ✅ | ✅ | SSH Key | ⭐⭐ Moyenne |

---

## 🚀 Méthode 1: GitHub App (RECOMMANDÉ pour repos privés)

### Avantages
- ✅ Intégration GitHub complète
- ✅ Déploiement automatique sur commit
- ✅ Support Pull Requests deployments
- ✅ Permissions granulaires
- ✅ Meilleure sécurité

### Setup Préalable dans Coolify

1. **Aller dans Coolify UI**
   - Keys & Tokens → GitHub Apps
   - "Install GitHub App"
   - Suivre le processus d'installation GitHub
   - Sélectionner les repos à autoriser

2. **Récupérer le GitHub App UUID**
   ```json
   {
     "tool": "list_github_apps",  // Tool à implémenter si besoin
     "args": {}
   }
   ```
   **OU** copier depuis l'UI Coolify

### Utilisation du Tool MCP

```json
{
  "tool": "create_application_private_github_app",
  "args": {
    "name": "backend-medusa",
    "description": "Medusa.js e-commerce backend (private repo)",
    "project_uuid": "swsc8k8kw4k08oogsw8sgc80",
    "server_uuid": "r8wk0c0wwkckww4k04sw44cw",
    "environment_name": "production",
    "github_app_uuid": "ghapp_xxxxxxxxxxxxx",
    "git_repository": "Nullzbox/ThearAbianPerfumes",
    "git_branch": "main",
    "build_pack": "dockerfile",
    "dockerfile_location": "Dockerfile",
    "base_directory": "backend",
    "domains": "backend-tap.nullbase.xyz",
    "ports_exposes": "9000"
  }
}
```

### Paramètres Requis

| Paramètre | Type | Description | Exemple |
|-----------|------|-------------|---------|
| `name` | string | Nom de l'application | `"backend-medusa"` |
| `project_uuid` | string | UUID du projet | `"swsc8k8k..."` |
| `server_uuid` | string | UUID du serveur | `"r8wk0c0w..."` |
| `environment_name` | string | Nom de l'environnement | `"production"` |
| `github_app_uuid` | string | **UUID de la GitHub App** | `"ghapp_xxx..."` |
| `git_repository` | string | Repository (format: owner/repo) | `"Nullzbox/MyRepo"` |
| `git_branch` | string | Branche Git | `"main"` ou `"master"` |

### Paramètres Optionnels Avancés

```json
{
  "build_pack": "dockerfile",           // ou "nixpacks", "docker-compose", "static"
  "dockerfile_location": "Dockerfile",
  "base_directory": "backend",
  "install_command": "npm install",
  "build_command": "npm run build",
  "start_command": "npm start",
  "ports_exposes": "9000",
  "domains": "backend-tap.nullbase.xyz,api.nullbase.xyz",
  "health_check_enabled": true,
  "limits_memory": "2GB",
  "limits_cpus": "1.5"
}
```

---

## 🔑 Méthode 2: Deploy Key (SSH)

### Avantages
- ✅ Fonctionne avec GitLab, Bitbucket, etc.
- ✅ Plus simple que GitHub App
- ✅ Contrôle total via SSH

### Désavantages
- ❌ Pas de déploiement auto sur commit (nécessite webhooks manuels)
- ❌ Pas de support PR deployments natif

### Setup Préalable dans Coolify

#### Option A: Générer une nouvelle clé dans Coolify

1. **Aller dans Coolify UI**
   - Keys & Tokens → Private Keys
   - "Generate New Key"
   - Copier la clé publique

2. **Ajouter dans GitHub/GitLab**
   - Repository → Settings → Deploy Keys
   - Ajouter la clé publique copiée
   - Cocher "Allow write access" si besoin

#### Option B: Utiliser une clé existante

1. **Upload dans Coolify**
   - Keys & Tokens → Private Keys
   - "Import Existing Key"
   - Coller ta clé privée SSH

2. **Récupérer le Private Key UUID**
   ```json
   {
     "tool": "list_private_keys",  // Tool à implémenter si besoin
     "args": {}
   }
   ```
   **OU** copier depuis l'UI Coolify

### Utilisation du Tool MCP

```json
{
  "tool": "create_application_private_deploy_key",
  "args": {
    "name": "storefront",
    "description": "Next.js storefront (private repo)",
    "project_uuid": "swsc8k8kw4k08oogsw8sgc80",
    "server_uuid": "r8wk0c0wwkckww4k04sw44cw",
    "environment_name": "production",
    "git_repository": "git@github.com:Nullzbox/ThearAbianPerfumes.git",
    "git_branch": "main",
    "private_key_uuid": "pk_xxxxxxxxxxxxx",
    "build_pack": "dockerfile",
    "dockerfile_location": "Dockerfile",
    "base_directory": "storefront",
    "domains": "tap.nullbase.xyz",
    "ports_exposes": "3000"
  }
}
```

### Paramètres Requis

| Paramètre | Type | Description | Exemple |
|-----------|------|-------------|---------|
| `name` | string | Nom de l'application | `"storefront"` |
| `project_uuid` | string | UUID du projet | `"swsc8k8k..."` |
| `server_uuid` | string | UUID du serveur | `"r8wk0c0w..."` |
| `environment_name` | string | Nom de l'environnement | `"production"` |
| `git_repository` | string | Repository SSH URL | `"git@github.com:user/repo.git"` |
| `git_branch` | string | Branche Git | `"main"` |

**Note**: `private_key_uuid` est **optionnel** - Coolify utilisera la clé par défaut si non fourni

---

## 🎯 Cas d'Usage: Arabian Perfumes (Repos Privés)

### Backend Medusa via GitHub App

```json
{
  "tool": "create_application_private_github_app",
  "args": {
    "name": "backend-medusa",
    "description": "Medusa.js e-commerce backend",
    "project_uuid": "swsc8k8kw4k08oogsw8sgc80",
    "server_uuid": "r8wk0c0wwkckww4k04sw44cw",
    "environment_name": "production",
    "github_app_uuid": "<GITHUB_APP_UUID>",
    "git_repository": "Nullzbox/ThearAbianPerfumes",
    "git_branch": "main",
    "build_pack": "dockerfile",
    "dockerfile_location": "Dockerfile",
    "base_directory": "backend",
    "domains": "backend-tap.nullbase.xyz",
    "ports_exposes": "9000",
    "health_check_enabled": true,
    "limits_memory": "4GB",
    "limits_cpus": "2"
  }
}
```

### Storefront Next.js via Deploy Key

```json
{
  "tool": "create_application_private_deploy_key",
  "args": {
    "name": "storefront",
    "description": "Next.js storefront",
    "project_uuid": "swsc8k8kw4k08oogsw8sgc80",
    "server_uuid": "r8wk0c0wwkckww4k04sw44cw",
    "environment_name": "production",
    "git_repository": "git@github.com:Nullzbox/ThearAbianPerfumes.git",
    "git_branch": "main",
    "build_pack": "dockerfile",
    "dockerfile_location": "Dockerfile",
    "base_directory": "storefront",
    "domains": "tap.nullbase.xyz",
    "ports_exposes": "3000",
    "health_check_enabled": true,
    "limits_memory": "2GB",
    "limits_cpus": "1"
  }
}
```

---

## 📝 Comment Obtenir les UUIDs Requis?

### 1. GitHub App UUID

**Via UI Coolify**:
1. Keys & Tokens → GitHub Apps
2. Copier l'UUID de ton GitHub App
3. Format: `ghapp_xxxxxxxxxxxxx`

**Via API** (à implémenter dans le MCP):
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://your-coolify.com/api/v1/github-apps
```

### 2. Private Key UUID

**Via UI Coolify**:
1. Keys & Tokens → Private Keys
2. Copier l'UUID de ta clé SSH
3. Format: `pk_xxxxxxxxxxxxx`

### 3. Project UUID, Server UUID, Environment Name

Utilise les tools existants:
```json
{
  "tool": "list_projects",
  "args": {}
}

{
  "tool": "list_servers",
  "args": {}
}

{
  "tool": "get_project_environment",
  "args": {
    "project_uuid": "xxx",
    "environment_name": "production"
  }
}
```

---

## ⚙️ Configurations Avancées

### Limits Resources

```json
{
  "limits_memory": "4GB",     // Limite mémoire
  "limits_cpus": "2",         // Limite CPU (2 cores)
}
```

### Health Checks

```json
{
  "health_check_enabled": true,
  // Le health check sera configuré via Coolify automatiquement
  // Pour custom health check, utiliser update_application après création
}
```

### Multiple Domains

```json
{
  "domains": "example.com,www.example.com,api.example.com"
}
```

### Multiple Ports

```json
{
  "ports_exposes": "3000,9000,8080"
}
```

---

## 🐛 Troubleshooting

### Erreur: "GitHub App not found"

**Cause**: L'UUID de la GitHub App est incorrect ou n'existe pas

**Solution**:
1. Vérifier l'UUID dans Coolify UI (Keys & Tokens → GitHub Apps)
2. S'assurer que la GitHub App est installée
3. Vérifier que le repo est autorisé dans la GitHub App

### Erreur: "Private key not found"

**Cause**: L'UUID de la clé privée est incorrect

**Solution**:
1. Ne pas fournir `private_key_uuid` (Coolify utilisera la clé par défaut)
2. OU vérifier l'UUID dans Coolify UI (Keys & Tokens → Private Keys)

### Erreur: "Repository not accessible"

**Cause**: Le repo n'est pas accessible avec les credentials fournis

**Solutions**:
- **GitHub App**: Vérifier que le repo est autorisé dans l'installation GitHub App
- **Deploy Key**: Vérifier que la clé publique est ajoutée dans les Deploy Keys du repo

### Erreur: "Environment not found"

**Cause**: L'environnement n'existe pas dans le projet

**Solution**:
```json
{
  "tool": "get_project_environment",
  "args": {
    "project_uuid": "swsc8k8kw4k08oogsw8sgc80",
    "environment_name": "production"
  }
}
```

Si l'environnement n'existe pas, créer via Coolify UI ou utiliser un autre nom.

---

## 🔄 Migration depuis Repos Publics

Si tu as des applications existantes avec des repos publics, tu peux:

### Option 1: Recréer l'application

1. Noter toutes les variables d'environnement de l'ancienne app
2. Supprimer l'ancienne app
3. Créer via `create_application_private_github_app` ou `create_application_private_deploy_key`
4. Reconfigurer les variables d'environnement

### Option 2: Update Repository (si supporté par Coolify)

```json
{
  "tool": "update_application",
  "args": {
    "uuid": "app_uuid",
    // Payload pour changer de public → private
    // À vérifier si Coolify API le supporte
  }
}
```

---

## 📊 Comparaison des 3 Méthodes

| Feature | Public Repo | GitHub App | Deploy Key |
|---------|-------------|------------|------------|
| **Repos publics** | ✅ | ✅ | ✅ |
| **Repos privés** | ❌ | ✅ | ✅ |
| **Auto-deploy on push** | ✅ | ✅ | ⚠️ Webhooks manuels |
| **PR deployments** | ✅ | ✅ | ❌ |
| **Multi-provider** | GitHub public | GitHub | GitHub, GitLab, Bitbucket |
| **Setup complexity** | ⭐ Facile | ⭐⭐ Moyenne | ⭐⭐ Moyenne |
| **Sécurité** | ⭐ Faible | ⭐⭐⭐ Haute | ⭐⭐ Moyenne |

---

## ✅ Checklist: Créer une App Privée

### Méthode GitHub App

- [ ] Installer GitHub App dans Coolify
- [ ] Autoriser le repository dans GitHub App
- [ ] Récupérer `github_app_uuid`
- [ ] Récupérer `project_uuid` et `server_uuid`
- [ ] Appeler `create_application_private_github_app`
- [ ] Configurer les variables d'environnement
- [ ] Déployer l'application

### Méthode Deploy Key

- [ ] Générer ou importer une clé SSH dans Coolify
- [ ] Ajouter la clé publique dans le repo (Deploy Keys)
- [ ] Récupérer `private_key_uuid` (optionnel)
- [ ] Récupérer `project_uuid` et `server_uuid`
- [ ] Appeler `create_application_private_deploy_key`
- [ ] Configurer les variables d'environnement
- [ ] Déployer l'application

---

## 🎉 Conclusion

**Le MCP Coolify v1.4.0 supporte maintenant TOUS les types de repos!**

### Pour Arabian Perfumes (repos privés):

**Recommandation**: Utiliser **GitHub App** pour:
- ✅ Meilleure sécurité
- ✅ Auto-deployments
- ✅ PR previews

**Commencer par**:
1. Installer GitHub App dans Coolify
2. Récupérer le `github_app_uuid`
3. Créer le backend avec `create_application_private_github_app`
4. Créer le storefront avec `create_application_private_github_app`
5. Configurer les variables d'environnement (voir CONFIGURATION_ARABIAN_PERFUMES.md)
6. Déployer!

---

**Version**: 1.4.0
**Date**: 2025-01-08
**Status**: ✅ **PRODUCTION READY - REPOS PRIVÉS SUPPORTÉS**
**Prêt pour**: ✅ **TOUS LES PROJETS** (publics ET privés)
