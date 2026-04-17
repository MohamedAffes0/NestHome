<p align="center">
    <picture>
        <img src="./docs/images/logo.png" width=450px>
    </picture>
</p>

<p align="center">
    <img src="https://img.shields.io/badge/Made_with-Angular-red.svg">
    <img src="https://img.shields.io/badge/API-REST-blue.svg">
    <img src="https://img.shields.io/badge/License-MIT-green.svg">
    <img src="https://img.shields.io/badge/Groupe-IGL3-yellow.svg">
</p>

# Introduction

NestHome est une application web complète de gestion immobilière. Elle permet de publier des annonces, réserver des visites, établir des contrats de vente ou de location, enregistrer des paiements et consulter des statistiques en temps réel.

---
# Screenshots

<p>
    <img src="./docs/images/screenshot1.png">
    <img src="./docs/images/screenshot2.png">
    <img src="./docs/images/screenshot3.png">
    <img src="./docs/images/screenshot4.png">
</p>


## Aperçu du projet

```
nesthome/
├── nesthome-backend/    ← API REST (NestJS + PostgreSQL)
└── nesthome-frontend/   ← SPA (Angular 19)
```

| Couche | Technologie | URL |
|---|---|---|
| Backend API | NestJS + TypeORM + PostgreSQL | `http://localhost:3000` |
| Frontend SPA | Angular 19 | `http://localhost:4200` |
| Authentification | Better Auth (sessions HTTP-only) | `/api/auth/...` |

---

## Fonctionnalités

### Côté public
- Catalogue de biens immobiliers avec filtres (type, statut, prix, surface, ville, chambres)
- Fiche détaillée avec galerie photos, carte OpenStreetMap, équipements, avis clients
- Réservation de visites en ligne
- Commentaires et notes sur les biens

### Côté utilisateur connecté
- Favoris (toggle, liste, synchronisation instantanée)
- Suivi de ses réservations de visites
- Profil : modification des informations, photo, mot de passe, suppression de compte

### Côté agent / admin
- Gestion complète des biens (création, modification, suppression, images)
- Gestion des réservations (confirmation, annulation)
- Gestion des contrats de vente et de location (avec génération PDF)
- Gestion des paiements (avec génération de reçus PDF)
- Tableau de bord statistiques (revenus, réservations, contrats, biens)

### Côté admin uniquement
- Gestion des comptes utilisateurs (création, rôle, activation/désactivation, suppression)
- Statistiques avancées

---

## Stack technique

### Backend
| Outil | Usage |
|---|---|
| NestJS | Framework Node.js |
| TypeORM | ORM PostgreSQL |
| Better Auth | Authentification + sessions |
| Multer | Upload de fichiers |
| class-validator | Validation des DTOs |
| nestjs-typeorm-paginate | Pagination |

### Frontend
| Outil | Usage |
|---|---|
| Angular 19 | Framework SPA (Standalone + Zoneless) |
| Better Auth Client | Gestion de session côté client |
| Chart.js | Graphiques du tableau de bord |
| html2pdf.js | Génération de PDF (contrats, reçus) |
| OpenStreetMap | Cartes de localisation |

---

## Prérequis

| Outil | Version |
|---|---|
| Node.js | 18+ |
| npm | 9+ |
| PostgreSQL | 14+ |

---

## Démarrage rapide

### 1. Base de données

```bash
psql -U postgres -c "CREATE DATABASE nesthome;"
```

### 2. Backend

```bash
cd nesthome-backend
npm install

cp .env.example .env
# Éditer .env avec vos identifiants PostgreSQL

npm run start:dev
# → API disponible sur http://localhost:3000
```

### 3. Frontend

```bash
cd nesthome-frontend
npm install

ng serve
# → Application disponible sur http://localhost:4200
```

---

## Variables d'environnement (Backend)

```dotenv
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

# Mailer SMTP (Gmail)
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

## 🔐 Authentification

L'application propose deux méthodes de connexion.

### Email / Mot de passe

```
1. Inscription (/signup)       →  email de vérification envoyé automatiquement
2. Page /check-email           →  l'utilisateur est informé de vérifier sa boîte
3. Clic sur le lien reçu       →  redirection vers /verify-email?token=...
4. Vérification réussie        →  redirection automatique vers /login
5. Connexion (/login)          →  session créée (cookie HTTP-only)
```

Un compte non vérifié ne peut pas se connecter (le backend retourne `403`).

### Google OAuth

```
1. Clic sur "Continuer avec Google" (login ou signup)
2. Redirection vers la page de sélection de compte Google
3. Consentement accordé
4. Retour automatique sur / avec session active
```

> Les comptes Google sont créés automatiquement avec le rôle `user` et leur email est considéré comme **vérifié d'office**. La méthode `signInWithGoogle()` est disponible sur les deux pages `/login` et `/signup`.

---

## 📧 Emails transactionnels

Le backend envoie deux types d'emails automatiquement. Le frontend expose les pages dédiées pour traiter ces liens.

### Vérification d'email (après inscription)

- **Backend envoie :** lien vers `http://localhost:4200/verify-email?token=<TOKEN>`
- **Route Angular :** `/verify-email` → composant `VerifyEmail`
- **Comportement :** affiche un état `loading`, appelle `AuthService.verifyEmail(token)`, puis redirige vers `/login` après succès
- **États gérés :** `loading` · `success` (avec barre de progression) · `expired` · `error`

### Réinitialisation du mot de passe

- **Demande :** page `/forgot-password` → `AuthService.requestPasswordReset(email)`
- **Backend envoie :** lien vers `http://localhost:4200/reset-password?token=<TOKEN>`
- **Route Angular :** `/reset-password` → composant `ResetPassword`
- **Comportement :** extrait le `token` depuis `queryParamMap`, affiche le formulaire, appelle `AuthService.resetPassword(token, newPassword)`, puis redirige vers `/login`
- **États gérés :** `form` · `success` (avec barre de progression) · `invalid` (token expiré ou manquant)

---

## Système de rôles

| Rôle | Accès |
|---|---|
| `user` | Catalogue public · Favoris · Réservations · Commentaires |
| `agent` | Tout `user` + Gestion biens / contrats / paiements / réservations · Stats |
| `admin` | Accès complet + Gestion des utilisateurs · Stats avancées |

---

## Structure des projets

### Backend (`nesthome-backend/src/`)

```
auth/               ← Guards, décorateurs, types RBAC
config/             ← Config Multer, base de données
utils/              ← Instance Better Auth, mailer, templates email
modules/
├── user/           ← CRUD utilisateurs
├── real-estate/    ← CRUD biens immobiliers
├── comment/        ← Commentaires et notes
├── favorite/       ← Favoris
├── reservation/    ← Réservations de visites
├── contract/       ← Contrats vente/location
├── payment/        ← Paiements
├── stats/          ← Statistiques agrégées
└── upload/         ← Service de fichiers
```

### Frontend (`nesthome-frontend/src/app/`)

```
core/
├── models/         ← Interfaces TypeScript
└── services/       ← Services HTTP
features/
├── login/          ← Connexion (email + Google)
├── signup/         ← Inscription (email + Google)
├── verify-email/   ← Vérification email (depuis lien reçu par mail)
├── check-email/    ← Page d'attente après inscription
├── forgot-password/← Demande de réinitialisation
├── reset-password/ ← Nouveau mot de passe (depuis lien reçu par mail)
├── profile/        ← Profil utilisateur
└── ...             ← Autres pages (catalogue, gestion, stats...)
shared/
└── components/     ← Composants réutilisables
```

---

## Routes API principales

| Méthode | Route | Description | Accès |
|---|---|---|---|
| `GET` | `/real-estate` | Catalogue paginé + filtres | Public |
| `GET` | `/real-estate/:id` | Détail d'un bien | Public |
| `POST` | `/real-estate` | Créer un bien | Agent/Admin |
| `GET` | `/comments/:realEstateId` | Avis d'un bien | Public |
| `POST` | `/reservations/:realEstateId` | Réserver une visite | Authentifié |
| `GET` | `/reservations/user/me` | Mes réservations | Authentifié |
| `GET` | `/contracts` | Liste des contrats | Agent/Admin |
| `POST` | `/contracts` | Créer un contrat | Agent/Admin |
| `GET` | `/contracts/unpaid/expired` | Contrats impayés | Agent/Admin |
| `GET` | `/payments` | Liste des paiements | Agent/Admin |
| `GET` | `/stats/overview` | KPIs globaux | Agent/Admin |
| `GET` | `/users` | Liste utilisateurs | Admin |
| `POST` | `/api/auth/sign-in/email` | Connexion email | Public |
| `POST` | `/api/auth/sign-up/email` | Inscription email | Public |
| `GET` | `/api/auth/sign-in/social?provider=google` | Connexion Google | Public |
| `POST` | `/api/auth/request-password-reset` | Demande reset mdp | Public |
| `POST` | `/api/auth/reset-password` | Appliquer nouveau mdp | Public |
| `GET` | `/api/auth/verify-email?token=...` | Vérifier l'email | Public |

---

## Uploads de fichiers

Les fichiers sont servis statiquement depuis le backend :

```
http://localhost:3000/uploads/profiles/<filename>      ← photos de profil
http://localhost:3000/uploads/real-estates/<filename>  ← images des biens
```

Contraintes : **1 MB** max · Types : `jpg`, `jpeg`, `png`, `webp` · Max **10 images** par bien

---

## Génération de PDF

Depuis l'interface de gestion, il est possible de télécharger :

- **Contrat PDF** — document officiel de vente ou de location (A4, avec signatures)
- **Reçu de paiement PDF** — reçu confirmé avec détails du bien et du client

La génération se fait entièrement côté navigateur via `html2pdf.js`.

---

## Documentation détaillée

### Backend
| Fichier | Contenu |
|---|---|
| [`docs/API_REQUESTS.md`](https://github.com/MohamedAffes0/NestHome-backend/blob/main/docs/API_REQUESTS.md) | Toutes les routes cURL avec exemples |
| [`docs/STRUCTURE.md`](https://github.com/MohamedAffes0/NestHome-backend/blob/main/docs/STRUCTURE.md) | Arborescence et rôle de chaque fichier |
| [`docs/ARCHITECTURE.md`](https://github.com/MohamedAffes0/NestHome-backend/blob/main/docs/ARCHITECTURE.md) | Patterns, flux, décisions techniques |

### Frontend
| Fichier | Contenu |
|---|---|
| [`frontend-docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Flux, change detection, patterns Angular |
| [`frontend-docs/AUTHENTICATION.md`](docs/AUTHENTICATION.md) | Sessions, login, Google OAuth, emails, comptes inactifs |
| [`frontend-docs/ROUTING.md`](docs/ROUTING.md) | Routes et navigation |
| [`frontend-docs/SERVICES.md`](docs/SERVICES.md) | Méthodes de tous les services HTTP |
| [`frontend-docs/MODELS.md`](docs/MODELS.md) | Interfaces et DTOs TypeScript |
| [`frontend-docs/STYLES.md`](docs/STYLES.md) | Design tokens et classes CSS |
| [`frontend-docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md) | Conventions et guide de contribution |
| [`frontend-docs/INSTALLATION.md`](docs/INSTALLATION.md) | Prérequis et démarrage |
| [`frontend-docs/PDF_GENERATION.md`](docs/PDF_GENERATION.md) | Génération PDF contrats et reçus |
| [`frontend-docs/SKELETON_LOADING.md`](docs/SKELETON_LOADING.md) | Skeletons, shimmer, états de chargement |
| [`frontend-docs/ERROR_HANDLING.md`](docs/ERROR_HANDLING.md) | Gestion des erreurs HTTP et validation |
| [`frontend-docs/UI_PATTERNS.md`](docs/UI_PATTERNS.md) | Timers, spinners, modaux, animations CSS |

---

## Scripts disponibles

### Backend
```bash
npm run start:dev   # Développement avec hot-reload
npm run start:prod  # Production
npm run build       # Compilation TypeScript
npm run test        # Tests unitaires
npm run test:e2e    # Tests end-to-end
```

### Frontend
```bash
ng serve            # Serveur de développement
ng build            # Build de production
ng test             # Tests unitaires
ng lint             # ESLint
```