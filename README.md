<p align="center">
    <picture>
        <img src="./docs/images/logo.png" width=450px>
    </picture>
</p>

<p align="center">
    <img src="https://img.shields.io/badge/Made%20with-NestJS-red.svg">
    <img src="https://img.shields.io/badge/Database-PostgreSQL-blue.svg">
    <img src="https://img.shields.io/badge/License-MIT-green.svg">
    <img src="https://img.shields.io/badge/Groupe-IGL3-yellow.svg">
</p>

---

## Vue d'ensemble

**NestHome** est une API REST complète de gestion immobilière construite avec **NestJS**. Elle permet de gérer des biens immobiliers, des réservations de visites, des contrats de vente/location, des paiements, des favoris et des commentaires, le tout avec un système d'authentification et de permissions basé sur les rôles.

---

## 🚀 Démarrage rapide

### Prérequis

| Outil | Version minimale |
|---|---|
| Node.js | 18+ |
| npm | 9+ |
| PostgreSQL | 14+ |

### Installation

```bash
# Cloner le projet
git clone <repo-url>
cd nesthome

# Installer les dépendances
npm install

# Copier les variables d'environnement
cp .env.example .env
# → Remplir les valeurs dans .env

# Lancer en développement
npm run start:dev
```

### Variables d'environnement

```bash
# Base de données
DATABASE_URL=postgres://postgres:PASSWORD@localhost:5432/nesthome
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=PASSWORD
DB_DATABASE=nesthome

# Application
NODE_ENV=development
PORT=3000

# Better Auth
BETTER_AUTH_SECRET=<votre_secret_32_chars>
BETTER_AUTH_URL=http://localhost:3000
BACKEND_URL=http://localhost:3000
FRONTEND_URL=http://localhost:4200
FRONTEND_VERIFY_EMAIL_PATH=/verify-email
FRONTEND_RESET_PASSWORD_PATH=/reset-password

# Upload
MULTER_BASE_URL=http://localhost:3000

# Mailer SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre@gmail.com
SMTP_PASS=votre_app_password_16_chars
SMTP_FROM_NAME=NestHome
SMTP_FROM_EMAIL=no-reply@nesthome.tn

# Google OAuth (optionnel)
GOOGLE_CLIENT_ID=<votre_google_client_id>
GOOGLE_CLIENT_SECRET=<votre_google_client_secret>
```

---

## 🏗️ Architecture

```
Client (Angular / Postman)
         │
         ▼
  NestJS API (port 3000)
         │
    ┌────┴────┐
    │  Guards │  ← PermissionsGuard (BetterAuth + RBAC)
    └────┬────┘
         │
  ┌──────▼──────────────────────────┐
  │         Modules NestJS          │
  │  Users · RealEstate · Comments  │
  │  Reservations · Contracts       │
  │  Payments · Favorites · Stats   │
  └──────┬──────────────────────────┘
         │
    ┌────▼────┐
    │ TypeORM │
    └────┬────┘
         │
   ┌─────▼──────┐
   │ PostgreSQL  │
   └────────────┘
```

---

## 🔐 Système de rôles

| Rôle | Description |
|---|---|
| `admin` | Accès complet à toutes les fonctionnalités |
| `agent` | Gestion des biens, contrats, paiements et réservations |
| `user` | Consultation publique + créer des réservations et commentaires |

---

## 📦 Modules principaux

| Module | Route de base | Accès |
|---|---|---|
| Auth | `/api/auth` | Public / Authentifié |
| Users | `/users` | Authentifié / Admin |
| RealEstate | `/real-estate` | Public / Agent / Admin |
| Comments | `/comments` | Public / Authentifié |
| Favorites | `/favorites` | Authentifié |
| Reservations | `/reservations` | Authentifié / Agent / Admin |
| Contracts | `/contracts` | Agent / Admin |
| Payments | `/payments` | Agent / Admin |
| Stats | `/stats` | Agent / Admin |

---

## 📁 Documentation

| Fichier | Description |
|---|---|
| [`docs/API_REQUESTS.md`](docs/API_REQUESTS.md) | Toutes les routes cURL avec exemples |
| [`docs/STRUCTURE.md`](docs/STRUCTURE.md) | Arborescence et rôle de chaque fichier |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Décisions d'architecture, patterns et flux |

---

## 🛠️ Scripts disponibles

```bash
npm run start:dev     # Développement avec hot-reload
npm run start:prod    # Production
npm run build         # Compilation TypeScript
npm run test          # Tests unitaires
npm run test:e2e      # Tests end-to-end
npm run lint          # ESLint
```

---

## 📤 Uploads de fichiers

Les fichiers sont servis statiquement depuis `/uploads/` :

- **Profils** → `/uploads/profiles/<filename>`
- **Biens immobiliers** → `/uploads/real-estates/<filename>`

Contraintes :
- Taille max : **1 MB** par fichier
- Types acceptés : `jpg`, `jpeg`, `png`, `webp`
- Max **10 images** par bien immobilier

---

## 🔑 Authentification

L'API utilise **Better Auth** avec sessions HTTP-only cookies et **vérification d'email obligatoire**. Un compte non vérifié ne peut pas se connecter.

Deux méthodes d'authentification sont disponibles :

### Authentification par email / mot de passe

```
1. Inscription  →  email de vérification envoyé automatiquement
2. Vérification →  clic sur le lien reçu par email
3. Connexion    →  session créée (cookie HTTP-only)
4. Requêtes     →  cookie transmis à chaque appel
```

### Authentification via Google OAuth

```
1. Redirection  →  GET /api/auth/sign-in/social?provider=google&callbackURL=...
2. Consentement →  l'utilisateur autorise l'accès sur la page Google
3. Callback     →  Google redirige vers /api/auth/callback/google
4. Session      →  créée automatiquement (cookie HTTP-only)
5. Requêtes     →  cookie transmis à chaque appel
```

> Les comptes Google sont créés avec le rôle `user` par défaut et leur email est considéré comme **vérifié d'office** par Google.

### Endpoints d'authentification

| Action | Méthode | Endpoint |
|---|---|---|
| Inscription email | `POST` | `/api/auth/sign-up/email` |
| Connexion email | `POST` | `/api/auth/sign-in/email` |
| Connexion Google | `GET` | `/api/auth/sign-in/social?provider=google&callbackURL=...` |
| Déconnexion | `POST` | `/api/auth/sign-out` |
| Session courante | `GET` | `/api/auth/get-session` |
| Vérifier l'email | `GET` | `/api/auth/verify-email?token=...` |
| Demander reset password | `POST` | `/api/auth/request-password-reset` |
| Appliquer nouveau password | `POST` | `/api/auth/reset-password` |

---

## 📧 Emails transactionnels

L'API envoie automatiquement deux types d'emails via **Nodemailer** (SMTP) :

### 1. Email de vérification d'adresse

Envoyé automatiquement à chaque nouvelle inscription par email/mot de passe. Contient un lien de la forme :

```
http://localhost:4200/verify-email?token=<TOKEN>
```

Le frontend doit extraire le `token` et appeler `GET /api/auth/verify-email?token=<TOKEN>` pour activer le compte. Le lien expire après **24 heures**.

### 2. Email de réinitialisation du mot de passe

Envoyé lorsque l'utilisateur appelle `POST /api/auth/request-password-reset`. Contient un lien de la forme :

```
http://localhost:4200/reset-password?token=<TOKEN>
```

Le frontend doit extraire le `token` et appeler `POST /api/auth/reset-password` avec le nouveau mot de passe. Le lien expire après **1 heure**.

---

## 📧 Configuration email (SMTP)

### Avec Gmail

1. Activez la **validation en 2 étapes** sur [myaccount.google.com/security](https://myaccount.google.com/security)
2. Générez un **mot de passe d'application** sur [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Copiez les 16 caractères générés (sans espaces) dans `SMTP_PASS`

### Avec Mailtrap (tests uniquement)

Créez un compte sur [mailtrap.io](https://mailtrap.io) → **Email Testing → SMTP Settings** et copiez les credentials. Les emails sont interceptés sans être envoyés réellement.

```bash
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=<user_mailtrap>
SMTP_PASS=<pass_mailtrap>
```

---

## 🔵 Configuration Google OAuth

Pour activer la connexion via Google, suivez ces étapes :

### 1. Créer un projet Google Cloud

1. Rendez-vous sur [console.cloud.google.com](https://console.cloud.google.com)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Activez l'**API Google+ / People API** dans la bibliothèque d'APIs

### 2. Configurer les identifiants OAuth 2.0

1. Allez dans **APIs & Services → Identifiants → Créer des identifiants → ID client OAuth**
2. Type d'application : **Application Web**
3. Ajoutez les **origines JavaScript autorisées** :
   ```
   http://localhost:3000
   http://localhost:4200
   ```
4. Ajoutez les **URI de redirection autorisés** :
   ```
   http://localhost:3000/api/auth/callback/google
   ```
5. Copiez le **Client ID** et le **Client Secret** générés

### 3. Renseigner les variables d'environnement

```bash
GOOGLE_CLIENT_ID=<votre_client_id>.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<votre_client_secret>
```

> Si `GOOGLE_CLIENT_ID` ou `GOOGLE_CLIENT_SECRET` sont absents du `.env`, le provider Google est simplement **désactivé** — l'application fonctionne normalement avec l'authentification par email.