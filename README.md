<p align="center">
    <picture>
        <img src="./docs/images/logo.png" width=450px>
    </picture>
</p>

Plateforme de gestion immobilière — location et vente de biens résidentiels et commerciaux.

---

## Aperçu

NestHome est une application web full-stack permettant aux propriétaires de gérer leurs biens immobiliers et aux locataires/acheteurs de rechercher, réserver et suivre leurs transactions. Elle couvre l'ensemble du cycle de vie : publication d'annonces, réservations, contrats, paiements et communications.

---

## Stack technique

### Backend [`/backend`](https://github.com/MohamedAffes0/NestHome-backend)
- **Framework** : NestJS
- **Base de données** : PostgreSQL + TypeORM
- **Authentification** : Better Auth (sessions HTTP-only cookies)
- **Email** : Nodemailer / SMTP
- **Fonctionnalités** : REST API, gestion des rôles (admin / utilisateur), OAuth Google

### Frontend [`/frontend`](https://github.com/MohamedAffes0/NestHome-frontend)
- **Framework** : Angular 19 (standalone components)
- **UI** : composants Angular Material / custom
- **Auth** : intégration Better Auth, vérification email, réinitialisation de mot de passe

---

## Fonctionnalités principales

- **Authentification** : inscription, connexion email/mot de passe, OAuth Google, vérification email, réinitialisation de mot de passe
- **Gestion des biens** : CRUD complet, upload de photos, statut actif/inactif
- **Réservations** : création, suivi par statut (en attente, confirmée, annulée), vue admin et vue utilisateur
- **Contrats** : génération de contrats (vente / location), suivi des échéances
- **Paiements** : suivi des paiements, détection des contrats impayés expirés
- **Gestion des utilisateurs** : liste des utilisateurs (admin), indicateur de compte inactif

---

## Structure du dépôt

```
NestHome/
├── backend/          # API NestJS (sous-module Git)
├── frontend/         # Application Angular (sous-module Git)
└── .gitmodules
```

Ce dépôt utilise des **sous-modules Git**. Clonez-le avec :

```bash
git clone --recurse-submodules https://github.com/<your-org>/NestHome.git
```

Ou, si déjà cloné :

```bash
git submodule update --init --recursive
```

---

## Installation et lancement

### Prérequis
- Node.js ≥ 18
- PostgreSQL ≥ 14
- npm ou yarn

### Backend

```bash
cd backend
npm install
cp .env.example .env   # Configurer les variables d'environnement
npm run start:dev
```

Variables d'environnement requises (`.env`) :

```env
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
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

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
```

### Frontend

```bash
cd frontend
npm install
ng serve
```

L'application sera disponible sur `http://localhost:4200`.