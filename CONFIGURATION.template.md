# 🏪 Configuration Template - Production

**⚠️ IMPORTANT: CECI EST UN TEMPLATE!**

**NE JAMAIS COMMITTER VOS VRAIES CONFIGURATIONS!**

**Instructions**:
1. Copier ce fichier: `cp CONFIGURATION.template.md CONFIGURATION_YOURPROJECT.md`
2. Remplir avec vos vraies valeurs
3. **VÉRIFIER** que `CONFIGURATION_YOURPROJECT.md` est dans `.gitignore`
4. **NE JAMAIS** committer le fichier avec vos secrets réels

---

## ✅ Services Déjà Créés et Fonctionnels

### PostgreSQL
- **UUID**: `<VOTRE_POSTGRESQL_UUID>`
- **Status**: ✅ Actif
- **Port**: 5432
- **Database**: `<VOTRE_DATABASE_NAME>`
- **User**: `<VOTRE_USER>`
- **Password**: `<VOTRE_PASSWORD>`

### MongoDB (optionnel)
- **UUID**: `<VOTRE_MONGODB_UUID>`
- **Status**: ✅ Actif
- **Port**: 27017

### Redis
- **UUID**: `<VOTRE_REDIS_UUID>`
- **Status**: ✅ Actif
- **Port**: 6379
- **Password**: `<VOTRE_REDIS_PASSWORD>`

### MinIO (S3-Compatible Storage)
- **UUID**: `<VOTRE_MINIO_UUID>`
- **Status**: ✅ Actif
- **Console URL**: https://console-<UUID>.<VOTRE_IP>.sslip.io
- **API S3 URL**: https://minio-<UUID>.<VOTRE_IP>.sslip.io
- **Access Key**: `<VOTRE_S3_ACCESS_KEY>`
- **Secret Key**: `<VOTRE_S3_SECRET_KEY>`
- **Region**: `us-east-1`
- **Bucket**: `<VOTRE_BUCKET_NAME>`

---

## 🎯 APPLICATION 1: Backend

### Informations Générales
```
Nom: <VOTRE_APP_NAME>
Type: Application
Build Pack: Dockerfile
Domaine: <VOTRE_DOMAINE>
```

### Repository Git
```
URL: <VOTRE_REPO_URL>
Branch: main
Base Directory: backend
Dockerfile: backend/Dockerfile
```

### Variables d'Environnement

#### 🔐 Secrets Générés (GÉNÉREZ VOS PROPRES VALEURS)

**⚠️ Pour générer des secrets sécurisés**:
```bash
# JWT Secret (64 caractères)
openssl rand -base64 48

# Cookie Secret (64 caractères)
openssl rand -base64 48

# API Token (64 caractères)
openssl rand -hex 32
```

```bash
JWT_SECRET=<GÉNÉRER_AVEC_OPENSSL>
COOKIE_SECRET=<GÉNÉRER_AVEC_OPENSSL>
PAYLOAD_API_TOKEN=<GÉNÉRER_AVEC_OPENSSL>
```

#### 📊 Base de Données
```bash
DATABASE_URL=postgres://<USER>:<PASSWORD>@<POSTGRES_UUID>:5432/<DATABASE_NAME>
DATABASE_TYPE=postgres
```

#### 🔴 Redis
```bash
REDIS_URL=redis://default:<REDIS_PASSWORD>@<REDIS_UUID>:6379/0
```

#### 🔑 Secrets de Session
```bash
JWT_SECRET=<VOTRE_JWT_SECRET>
COOKIE_SECRET=<VOTRE_COOKIE_SECRET>
```

#### 🌐 URLs et CORS
```bash
MEDUSA_BACKEND_URL=https://<VOTRE_BACKEND_DOMAIN>
STORE_CORS=https://<VOTRE_STORE_DOMAIN>
ADMIN_CORS=https://<VOTRE_STORE_DOMAIN>,https://<VOTRE_BACKEND_DOMAIN>
AUTH_CORS=https://<VOTRE_STORE_DOMAIN>
```

#### ⚙️ Configuration Application
```bash
NODE_ENV=production
MEDUSA_WORKER_MODE=shared
DISABLE_MEDUSA_ADMIN=false
```

#### 📦 S3/MinIO Storage
```bash
S3_FILE_URL=https://minio-<UUID>.<IP>.sslip.io
S3_ACCESS_KEY_ID=<VOTRE_S3_ACCESS_KEY>
S3_SECRET_ACCESS_KEY=<VOTRE_S3_SECRET_KEY>
S3_REGION=us-east-1
S3_BUCKET=<VOTRE_BUCKET>
S3_ENDPOINT=https://minio-<UUID>.<IP>.sslip.io
```

#### 💳 Stripe (À COMPLÉTER)
```bash
STRIPE_API_KEY=sk_live_XXXXXX  # Votre clé Stripe LIVE
STRIPE_WEBHOOK_SECRET=whsec_XXXXXX  # Secret du webhook Stripe
```

#### 📧 Email (À COMPLÉTER)
```bash
RESEND_API_KEY=re_XXXXXX  # Votre clé email provider
RESEND_FROM_EMAIL=noreply@votredomaine.com
```

---

## 🎨 APPLICATION 2: Storefront

### Variables d'Environnement

#### 🔗 Backend Connection
```bash
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://<VOTRE_BACKEND_DOMAIN>
NEXT_PUBLIC_STORE_URL=https://<VOTRE_STORE_DOMAIN>
```

#### 🔑 API Tokens
```bash
MEDUSA_API_TOKEN=<VOTRE_API_TOKEN>
```

#### ⚙️ Next.js Configuration
```bash
NODE_ENV=production
NEXT_PUBLIC_BASE_URL=https://<VOTRE_STORE_DOMAIN>
```

#### 💳 Stripe Public Key
```bash
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_live_XXXXXX
```

---

## ⚠️ SÉCURITÉ - CHECKLIST

Avant de déployer, vérifier:

- [ ] **TOUS** les secrets ont été régénérés (pas de valeurs par défaut)
- [ ] Les passwords sont complexes (64+ caractères)
- [ ] `CONFIGURATION_VOTRE projet.md` est dans `.gitignore`
- [ ] Le fichier de config n'a **JAMAIS** été commité
- [ ] Les clés Stripe/Email sont réelles (pas de XXXXXX)
- [ ] Les URLs correspondent à vos domaines réels
- [ ] Les UUIDs correspondent à VOS services Coolify

---

## 🔐 Bonnes Pratiques

### Génération de Secrets Sécurisés

```bash
# JWT Secret (64 chars)
openssl rand -base64 48

# Cookie Secret (64 chars)
openssl rand -base64 48

# API Token (hex, 64 chars)
openssl rand -hex 32

# Password complexe (pour BDD)
openssl rand -base64 32
```

### Stockage Sécurisé

**Option 1: Variables d'environnement Coolify**
- Configurer directement dans l'interface Coolify
- Secrets chiffrés côté serveur

**Option 2: Gestionnaire de secrets**
- HashiCorp Vault
- AWS Secrets Manager
- Azure Key Vault

**Option 3: Fichier local (JAMAIS git!)**
- `CONFIGURATION_project.md` dans `.gitignore`
- Permissions restrictives: `chmod 600`

---

## 📋 Utilisation avec le MCP

### Pour Repos Publics

```json
{
  "tool": "create_application",
  "args": {
    "name": "<VOTRE_APP>",
    "project_uuid": "<PROJECT_UUID>",
    "server_uuid": "<SERVER_UUID>",
    "environment_name": "production",
    "git_repository": "<REPO_URL>",
    "git_branch": "main",
    "build_pack": "dockerfile"
  }
}
```

### Pour Repos Privés (GitHub App)

```json
{
  "tool": "create_application_private_github_app",
  "args": {
    "name": "<VOTRE_APP>",
    "project_uuid": "<PROJECT_UUID>",
    "server_uuid": "<SERVER_UUID>",
    "environment_name": "production",
    "github_app_uuid": "<GITHUB_APP_UUID>",
    "git_repository": "<OWNER>/<REPO>",
    "git_branch": "main",
    "build_pack": "dockerfile"
  }
}
```

### Pour Repos Privés (Deploy Key)

```json
{
  "tool": "create_application_private_deploy_key",
  "args": {
    "name": "<VOTRE_APP>",
    "project_uuid": "<PROJECT_UUID>",
    "server_uuid": "<SERVER_UUID>",
    "environment_name": "production",
    "git_repository": "git@github.com:<OWNER>/<REPO>.git",
    "git_branch": "main",
    "private_key_uuid": "<PRIVATE_KEY_UUID>"
  }
}
```

---

## 🆘 En Cas de Compromission

Si vous avez accidentellement commité des secrets:

1. **IMMÉDIATEMENT**:
   - Régénérer TOUS les secrets compromis
   - Changer TOUS les passwords
   - Redéployer les applications

2. **Nettoyer Git**:
   ```bash
   # Supprimer le fichier
   git rm <FICHIER_SENSIBLE>

   # Nettoyer l'historique (BFG)
   bfg --delete-files <FICHIER_SENSIBLE> .
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   git push origin --force --all
   ```

3. **Surveillance**:
   - Monitorer les logs pour activité suspecte
   - Vérifier les accès aux bases de données
   - Alerter l'équipe sécurité

---

**Version**: 1.0.0
**Status**: ✅ Template Sécurisé
**⚠️ RAPPEL**: NE JAMAIS committer ce fichier après l'avoir rempli!
