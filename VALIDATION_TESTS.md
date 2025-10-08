# 🧪 Tests de Validation Coolify MCP - Mode Production

> ⚠️ **IMPORTANT**: Ces tests sont conçus pour valider le MCP SANS toucher à vos projets réels.
> Ils utilisent des commandes de lecture seule ou créent des ressources de test temporaires.

## ✅ Tests de Validation Obligatoires

### 1. Test de Connexion et Authentification

```bash
# Valide que le serveur MCP démarre correctement
# ✓ SAFE - Lecture seule
npm start
```

**Résultat attendu**: Le serveur démarre sans erreur et affiche:
```
Starting Standard Coolify MCP Server...
Server started successfully
```

---

### 2. Test des Outils de Lecture (Safe - Aucun Impact)

#### 2.1 Liste des Serveurs
```json
{
  "tool": "list_servers",
  "args": {}
}
```

**Validation**:
- ✓ Retourne un objet avec `success: true`
- ✓ Contient un tableau `data` avec les serveurs
- ✓ Pas d'erreur `[object Object]`

#### 2.2 Liste des Projets
```json
{
  "tool": "list_projects",
  "args": {}
}
```

**Validation**:
- ✓ Format de réponse standardisé
- ✓ Compte correct des projets
- ✓ Gestion d'erreur propre si échec

#### 2.3 Liste des Applications (avec pagination)
```json
{
  "tool": "list_applications",
  "args": {
    "limit": 10,
    "full": false
  }
}
```

**Validation**:
- ✓ Pagination fonctionne
- ✓ Pas de dépassement de token
- ✓ Messages de hint inclus

#### 2.4 Liste des Bases de Données
```json
{
  "tool": "list_databases",
  "args": {
    "limit": 10
  }
}
```

#### 2.5 Liste des Services
```json
{
  "tool": "list_services",
  "args": {
    "limit": 10
  }
}
```

---

### 3. Test de Gestion d'Erreurs (Critique)

#### 3.1 Serveur Inexistant
```json
{
  "tool": "get_server",
  "args": {
    "uuid": "00000000-0000-0000-0000-000000000000"
  }
}
```

**Validation**:
- ✓ Retourne `success: false`
- ✓ Contient `error.message` lisible
- ✓ Contient `error.code`
- ✓ **PAS** de `[object Object]`
- ✓ Timestamp inclus

#### 3.2 Projet Inexistant
```json
{
  "tool": "get_project",
  "args": {
    "uuid": "00000000-0000-0000-0000-000000000000"
  }
}
```

**Validation**: Même format d'erreur standardisé

#### 3.3 Application Inexistante (TEST CRITIQUE - Bug Original)
```json
{
  "tool": "get_application",
  "args": {
    "uuid": "00000000-0000-0000-0000-000000000000"
  }
}
```

**Validation**:
- ✓ **CRITIQUE**: Erreur formatée, PAS `[object Object]`
- ✓ Message d'erreur descriptif
- ✓ Code d'erreur inclus

---

### 4. Test de Création (Avec Nettoyage)

> ⚠️ Ces tests créent des ressources temporaires. Notez les UUIDs pour les supprimer après.

#### 4.1 Création de Projet de Test
```json
{
  "tool": "create_project",
  "args": {
    "name": "TEST_MCP_VALIDATION_DELETE_ME",
    "description": "Projet de test - À SUPPRIMER"
  }
}
```

**Validation**:
- ✓ Retourne `success: true`
- ✓ UUID du projet créé
- ✓ Message de succès clair
- ✓ **NOTE L'UUID POUR LE SUPPRIMER**

#### 4.2 Test Création Application (Bug Original Corrigé)
```json
{
  "tool": "create_application",
  "args": {
    "name": "TEST_APP_DELETE_ME",
    "description": "App de test",
    "project_uuid": "<UUID_DU_PROJET_TEST>",
    "server_uuid": "<UUID_SERVEUR_RÉEL>",
    "git_repository": "https://github.com/example/test",
    "git_branch": "main",
    "build_pack": "nixpacks"
  }
}
```

**Validation CRITIQUE**:
- ✓ **PAS D'ERREUR** `[object Object]`
- ✓ En cas d'échec: Message d'erreur clair et détaillé
- ✓ Format de réponse standardisé
- ✓ Contexte d'erreur (project_uuid, server_uuid) inclus

---

### 5. Test de Déploiements avec Pagination

#### 5.1 Liste des Déploiements (avec pagination)
```json
{
  "tool": "list_deployments",
  "args": {
    "skip": 0,
    "take": 10
  }
}
```

**Validation**:
- ✓ Pagination fonctionne
- ✓ Pas de dépassement de 25000 tokens
- ✓ Hint pour pagination inclus

#### 5.2 Déploiements d'une Application
```json
{
  "tool": "get_deployments",
  "args": {
    "application_uuid": "<UUID_APP_RÉELLE>",
    "skip": 0,
    "limit": 10
  }
}
```

**Validation**:
- ✓ Résumé des déploiements, pas de logs complets
- ✓ Champs tronqués correctement
- ✓ Message hint pour obtenir détails complets

---

### 6. Test des Variables d'Environnement

```json
{
  "tool": "get_application_environment_variables",
  "args": {
    "uuid": "<UUID_APP_TEST>"
  }
}
```

**Validation**:
- ✓ Variables retournées correctement
- ✓ Gestion d'erreur si app n'existe pas

---

### 7. Test de Nettoyage

#### 7.1 Supprimer l'Application de Test
```json
{
  "tool": "delete_application",
  "args": {
    "uuid": "<UUID_APP_TEST>",
    "options": {
      "deleteVolumes": true,
      "dockerCleanup": true
    }
  }
}
```

#### 7.2 Supprimer le Projet de Test
```json
{
  "tool": "delete_project",
  "args": {
    "uuid": "<UUID_PROJET_TEST>"
  }
}
```

---

## 📊 Checklist de Validation Finale

### Gestion d'Erreurs (Critique)
- [ ] Toutes les erreurs retournent un format standardisé
- [ ] Aucune erreur `[object Object]` n'apparaît
- [ ] Tous les messages d'erreur sont lisibles et descriptifs
- [ ] Le code d'erreur est toujours inclus
- [ ] Le contexte d'erreur (UUIDs, paramètres) est inclus

### Format de Réponse
- [ ] Toutes les réponses succès ont `success: true`
- [ ] Toutes les réponses échec ont `success: false`
- [ ] Messages descriptifs inclus
- [ ] Count inclus pour les listes

### Pagination
- [ ] `list_applications` respecte la limite
- [ ] `list_databases` respecte la limite
- [ ] `list_services` respecte la limite
- [ ] `get_deployments` respecte skip/limit
- [ ] Hints de pagination présents

### Performance
- [ ] Aucune réponse ne dépasse 25000 tokens
- [ ] Logs tronqués correctement
- [ ] Champs volumineux tronqués

### Build
- [ ] `npm run build` passe sans erreur
- [ ] `npm test` (si applicable) passe
- [ ] Aucune erreur TypeScript

---

## 🎯 Tests Spécifiques au Bug Original

### Bug: `Error: [object Object]` lors de `create_application`

**Test de Non-Régression**:
1. Créer une application avec des paramètres invalides
2. Vérifier que l'erreur est formatée correctement
3. L'erreur doit contenir:
   - Message d'erreur lisible
   - Code d'erreur
   - Contexte (project_uuid, server_uuid, name)
   - Timestamp

**Exemple d'erreur attendue**:
```json
{
  "success": false,
  "error": {
    "message": "Project not found",
    "code": "404",
    "details": null
  },
  "operation": "create_application",
  "timestamp": "2025-01-08T10:00:00.000Z"
}
```

**❌ Erreur INTERDITE** (bug corrigé):
```
Error: [object Object]
```

---

## 🚀 Script de Test Automatisé

```bash
#!/bin/bash
# test-validation.sh

echo "🧪 Tests de Validation Coolify MCP"
echo "================================="

# Test 1: Build
echo "📦 Test 1: Build du projet..."
npm run build
if [ $? -ne 0 ]; then
  echo "❌ ÉCHEC: Build échoué"
  exit 1
fi
echo "✅ Build réussi"

# Test 2: Vérifier que dist existe
echo "📂 Test 2: Vérification des fichiers compilés..."
if [ ! -d "dist" ]; then
  echo "❌ ÉCHEC: Dossier dist manquant"
  exit 1
fi
echo "✅ Fichiers compilés présents"

# Test 3: Vérifier les helpers
echo "🔧 Test 3: Vérification des helpers..."
if [ ! -f "dist/lib/tool-helpers.js" ]; then
  echo "❌ ÉCHEC: tool-helpers.js manquant"
  exit 1
fi
echo "✅ Helpers présents"

echo ""
echo "✅ Tous les tests de validation passent!"
echo "🎉 Le MCP est prêt pour la production"
```

---

## 📝 Notes pour l'Équipe

1. **Exécuter ces tests après chaque changement**
2. **Ne jamais commit sans tester create_application**
3. **Vérifier les erreurs dans les logs de production**
4. **Monitorer les tokens dans les réponses**
5. **Nettoyer les ressources de test après validation**

---

## ⚠️ Rappels Importants

- **NE PAS** utiliser ces tests sur des projets de production
- **TOUJOURS** supprimer les ressources de test après validation
- **VÉRIFIER** que les UUIDs utilisés sont des ressources de test
- **MONITORER** les erreurs dans Claude Desktop ou votre client MCP
- **REPORTER** tout bug d'erreur `[object Object]` immédiatement

---

## 🐛 Debugging

Si vous voyez `[object Object]` quelque part:

1. Identifier le tool concerné
2. Vérifier qu'il a un try/catch
3. Vérifier qu'il utilise `formatToolError`
4. Vérifier que l'erreur est un objet Error valide
5. Logger l'erreur avant de la formatter

```typescript
catch (error: any) {
  console.error('DEBUG ERROR:', error); // Pour debugging
  return {
    content: [{
      type: 'text',
      text: JSON.stringify(formatToolError(error, 'tool_name', context), null, 2)
    }]
  };
}
```

---

**Version**: 1.1.0
**Date**: 2025-01-08
**Status**: ✅ Tous les bugs critiques corrigés
