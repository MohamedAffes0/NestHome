# Architecture — NestHome API

## Stack technique

| Couche | Technologie | Version | Rôle |
|---|---|---|---|
| **Runtime** | Node.js | 18+ | Environnement d'exécution |
| **Framework** | NestJS | 10+ | Framework backend modulaire |
| **Langage** | TypeScript | 5+ | Typage statique |
| **ORM** | TypeORM | 0.3+ | Mapping objet-relationnel |
| **Base de données** | PostgreSQL | 14+ | Stockage persistant |
| **Auth** | Better Auth | latest | Authentification + sessions |
| **OAuth** | Google OAuth 2.0 | via Better Auth | Connexion sociale |
| **Upload** | Multer | latest | Gestion des fichiers multipart |
| **Email** | Nodemailer | latest | Envoi d'emails transactionnels (SMTP) |
| **Validation** | class-validator | latest | Validation des DTOs |
| **Transformation** | class-transformer | latest | Conversion des types |
| **Pagination** | nestjs-typeorm-paginate | latest | Pagination standardisée |
| **Variables d'env** | dotenv | latest | Configuration |

---

## Architecture globale

NestHome suit une architecture **modulaire en couches** inspirée du pattern **MVC** et des principes **SOLID**.

```
┌──────────────────────────────────────────────────────────┐
│                     CLIENT (Angular)                      │
│                 http://localhost:4200                     │
└───────────────────────────┬──────────────────────────────┘
                            │ HTTP / Cookies
┌───────────────────────────▼──────────────────────────────┐
│                   NestJS Application                      │
│                    http://localhost:3000                   │
│                                                           │
│  ┌─────────────┐   ┌──────────────┐   ┌──────────────┐  │
│  │   Guards    │   │ Interceptors │   │    Pipes     │  │
│  │ Permissions │   │ CleanupFiles │   │  Validation  │  │
│  │   Guard     │   │ Interceptor  │   │     Pipe     │  │
│  └──────┬──────┘   └──────────────┘   └──────────────┘  │
│         │                                                  │
│  ┌──────▼──────────────────────────────────────────────┐  │
│  │                   Controllers                        │  │
│  │  /users  /real-estate  /reservations  /contracts   │  │
│  │  /comments  /favorites  /payments  /stats          │  │
│  └──────┬──────────────────────────────────────────────┘  │
│         │                                                  │
│  ┌──────▼──────────────────────────────────────────────┐  │
│  │                    Services                          │  │
│  │   Logique métier · Requêtes DB · Règles de gestion  │  │
│  └──────┬──────────────────────────────────────────────┘  │
│         │                                                  │
│  ┌──────▼──────────────────────────────────────────────┐  │
│  │                TypeORM Repositories                  │  │
│  └──────┬──────────────────────────────────────────────┘  │
└─────────┼────────────────────────────────────────────────-┘
          │
┌─────────▼────────────┐    ┌───────────────────────────┐
│     PostgreSQL        │    │      Better Auth DB        │
│  (entités métier)     │    │  (users, sessions, tokens) │
│  real_estates         │    │  user · session · account  │
│  comments             │    └───────────────────────────┘
│  contracts            │
│  reservations         │
│  payments             │
│  favorites            │
└──────────────────────┘
```

---

## Flux d'une requête HTTP

```
Request entrante
      │
      ▼
[1] CORS Middleware
      │
      ▼
[2] Body Parser (désactivé pour multipart)
      │
      ▼
[3] Route matching (Controller)
      │
      ▼
[4] PermissionsGuard.canActivate()
      ├── Vérifie @Public() → si oui, passe directement
      ├── Appelle Better Auth → auth.api.getSession()
      ├── Vérifie isActive
      ├── Attache session.user à request.user
      └── Vérifie les permissions RBAC (@RequirePermissions)
      │
      ▼
[5] Pipes (ValidationPipe)
      ├── class-validator : valide les DTOs
      ├── class-transformer : transforme les types
      └── whitelist : élimine les champs inconnus
      │
      ▼
[6] Interceptors (CleanupFilesInterceptor si upload)
      │
      ▼
[7] Handler du Controller
      └── Appelle le Service
      │
      ▼
[8] Service — logique métier
      ├── Accès TypeORM Repository
      ├── QueryBuilder (filtres, pagination, jointures)
      └── Règles métier (validations, transitions d'état)
      │
      ▼
[9] PostgreSQL
      │
      ▼
[10] Réponse JSON + code HTTP
```

---

## Modèle de données

### Entités et relations

```
User (1)─────────────────(N) RealEstate
  │                            │        │        │
  │ (1)                      (N)      (N)      (N)
  │                        Comment  Favorite Reservation
  │
  ├── (1)─(N) Comment
  ├── (1)─(N) Favorite
  ├── (1)─(N) Reservation
  ├── (1)─(N) Contract (en tant que client)
  ├── (1)─(N) Contract (en tant qu'agent)
  └── (1)─(N) Payment

RealEstate (1)──(1) Contract
RealEstate (1)──(N) Payment
```

### Schéma simplifié

```
┌──────────┐     ┌────────────────┐     ┌──────────┐
│   User   │────▶│  RealEstate    │◀────│  Agent   │
│  id (PK) │     │  id (PK)       │     │  (User)  │
│  email   │     │  title         │     └──────────┘
│  name    │     │  price         │
│  role    │     │  status (enum) │
│  isActive│     │  type (enum)   │
└──────────┘     │  images[]      │
    │  │         │  equipment[]   │
    │  │         └───────┬────────┘
    │  │                 │
    │  │         ┌───────▼────────┐
    │  └────────▶│   Contract     │
    │            │  startDate     │
    │            │  endDate?      │
    │            │  cinPassport   │
    │            └────────────────┘
    │
    ├──────────▶ Comment (content, rating 1-5)
    ├──────────▶ Favorite (realEstateId, userId)
    ├──────────▶ Reservation (visitDate, visitTime, status)
    └──────────▶ Payment (amount, date)
```

### Enums importants

**RealEstateStatus :**
```
0 = FOR_SALE   → disponible à la vente
1 = FOR_RENT   → disponible à la location
2 = SOLD       → vendu (après contrat de vente)
3 = RENTED     → loué (après contrat de location)
```

**RealEstateType :**
```
0 = HOUSE       → Maison
1 = APARTMENT   → Appartement
2 = LAND        → Terrain
3 = BUSINESS    → Local commercial
```

**ReservationStatus :**
```
pending    → En attente (défaut)
confirmed  → Confirmée par l'agent
cancelled  → Annulée
```

---

## Système d'authentification

### Better Auth

L'authentification repose sur **Better Auth** (`@thallesp/nestjs-better-auth`), qui gère :
- L'inscription et la connexion par email/mot de passe
- La connexion via **Google OAuth 2.0**
- Les sessions stockées en base de données (table `session`)
- Les cookies HTTP-only pour la sécurité des sessions
- L'envoi d'emails transactionnels (vérification, reset)

### Flux — Email / Mot de passe

```
Client                    NestJS                  Better Auth DB
  │                          │                          │
  │── POST /api/auth/sign-in ─▶│                          │
  │                          │── INSERT session ────────▶│
  │◀── Set-Cookie: session ──│                          │
  │                          │                          │
  │── GET /real-estate ──────▶│                          │
  │   (Cookie: session)      │── SELECT session ────────▶│
  │                          │◀── session data ──────────│
  │                          │  (attach to request.user) │
  │◀── 200 + data ───────────│                          │
```

### Flux — Google OAuth 2.0

```
Client (navigateur)        NestJS / Better Auth        Google
  │                               │                       │
  │── GET /api/auth/sign-in/      │                       │
  │   social?provider=google ────▶│                       │
  │                               │── redirect ──────────▶│
  │                               │                       │
  │        (utilisateur choisit son compte Google)        │
  │                               │                       │
  │                               │◀── code + state ──────│
  │   GET /api/auth/callback/     │                       │
  │   google?code=...  ──────────▶│                       │
  │                               │── échange code/token ▶│
  │                               │◀── profil Google ─────│
  │                               │── INSERT/UPDATE user  │
  │                               │── INSERT session      │
  │◀── redirect callbackURL ──────│                       │
  │   (Set-Cookie: session)       │                       │
```

**Points clés :**
- Si l'email Google **n'existe pas** en base → nouveau compte créé avec `role = user`, `emailVerified = true`
- Si l'email Google **existe déjà** (compte email/mdp) → les comptes sont liés, la session est partagée
- La connexion Google **ne nécessite pas** de vérification email manuelle
- Le provider Google est activé uniquement si `GOOGLE_CLIENT_ID` et `GOOGLE_CLIENT_SECRET` sont présents dans le `.env`

### Champs utilisateur étendus

Better Auth stocke les utilisateurs dans sa propre table `user`. Deux champs custom sont ajoutés :
- `role` : `"admin" | "agent" | "user"` (défaut : `"user"`)
- `isActive` : `boolean` (défaut : `true`)

Le `User` entity TypeORM est synchronisé sur la même table avec `synchronize: false` pour éviter les conflits.

---

## Système d'emails transactionnels

L'API envoie deux types d'emails automatiques via **Nodemailer** configuré en SMTP.

### Architecture email

```
Better Auth (événement)         src/utils/mailer.ts        Serveur SMTP
        │                               │                       │
        │── sendVerificationEmail() ───▶│                       │
        │   (à l'inscription)           │── SMTP AUTH ─────────▶│
        │                               │── SEND (HTML) ───────▶│
        │                               │                       │
        │── sendResetPassword() ────────▶│                       │
        │   (sur demande reset)         │── SMTP AUTH ─────────▶│
        │                               │── SEND (HTML) ───────▶│
```

### Email de vérification d'adresse

Déclenché automatiquement à chaque inscription par email/mot de passe (`sendOnSignUp: true`).

| Champ | Valeur |
|---|---|
| Sujet | `Confirmez votre adresse email — NestHome` |
| Expéditeur | `SMTP_FROM_NAME <SMTP_FROM_EMAIL>` |
| Lien | `FRONTEND_URL/verify-email?token=<TOKEN>` |
| Expiration | **24 heures** |

**Flux frontend :**
1. Extraire le paramètre `token` depuis l'URL reçue dans l'email
2. Appeler `GET /api/auth/verify-email?token=<TOKEN>&callbackURL=<FRONTEND_URL>`
3. La session n'est **pas** créée automatiquement après vérification (`autoSignInAfterVerification: false`)
4. L'utilisateur doit se connecter manuellement

### Email de réinitialisation du mot de passe

Déclenché par `POST /api/auth/request-password-reset`. L'email est envoyé uniquement si l'adresse existe en base (réponse générique dans tous les cas pour éviter l'énumération).

| Champ | Valeur |
|---|---|
| Sujet | `Réinitialisation de votre mot de passe — NestHome` |
| Expéditeur | `SMTP_FROM_NAME <SMTP_FROM_EMAIL>` |
| Lien | `FRONTEND_URL/reset-password?token=<TOKEN>` |
| Expiration | **1 heure** |

**Flux frontend :**
1. Extraire le paramètre `token` depuis l'URL reçue dans l'email
2. Appeler `POST /api/auth/reset-password` avec `{ token, newPassword }`
3. Le token est à usage unique — il est invalidé après utilisation

### Templates email

Les templates HTML sont définis dans `src/utils/email-templates.ts` :

| Fonction | Email généré |
|---|---|
| `verificationEmailTemplate(url)` | Email de vérification avec bouton bleu |
| `resetPasswordEmailTemplate(url)` | Email de reset avec bouton rouge |

Les deux templates sont des blocs HTML inline-styled, compatibles avec tous les clients email.

---

## Système de permissions (RBAC)

```
Requête
  │
  ▼
PermissionsGuard
  │
  ├── @Public() présent ?
  │     └── OUI → accès autorisé ✓
  │
  ├── Session valide ?
  │     └── NON → 401 Unauthorized ✗
  │
  ├── emailVerified === false ?
  │     └── OUI → 403 (email non vérifié) ✗
  │         Note : les comptes Google sont vérifiés d'office
  │
  ├── isActive === false ?
  │     └── OUI → 403 Forbidden ✗
  │
  ├── @RequirePermissions() présent ?
  │     └── NON → accès autorisé (authentifié suffit) ✓
  │
  └── Permissions du rôle ⊇ permissions requises ?
        ├── OUI → accès autorisé ✓
        └── NON → 403 Insufficient permissions ✗
```

---

## Gestion des fichiers (Upload)

```
POST /real-estate (multipart/form-data)
  │
  ▼
FilesInterceptor('images', 10, multerConfig)
  │  ├── Filtre MIME (jpg/png/webp)
  │  ├── Limite 1MB
  │  └── Sauvegarde dans ./uploads/real-estates/
  │
  ▼
UploadService.validateFiles()
  │  └── Vérifie taille et type de chaque fichier
  │
  ▼
UploadService.getFileUrl(filename, 'real-estates')
  │  └── Retourne http://localhost:3000/uploads/real-estates/filename.jpg
  │
  ▼
RealEstateService.createRealEstate() → sauvegarde les URLs en DB
```

Les URLs sont stockées en base sous forme de tableau (`simple-array`). La suppression d'un bien ou la mise à jour d'images déclenche `UploadService.deleteMultipleFiles()` pour nettoyer le disque.

---

## Pagination

Deux stratégies sont utilisées selon le module :

### `nestjs-typeorm-paginate` (Comments, Users)
```typescript
return paginate<Comment>(this.commentRepository, { page, limit }, {
  where: { realEstateId },
  order: { createdAt: 'DESC' },
  relations: ['user'],
});
```

### Pagination manuelle avec QueryBuilder (RealEstate, Payments, Contracts...)
```typescript
const skip = (page - 1) * limit;
const [items, total] = await query.skip(skip).take(limit).getManyAndCount();
return {
  items,
  meta: { totalItems, itemCount, itemsPerPage, totalPages, currentPage }
};
```

**Format de réponse paginée :**
```json
{
  "items": [...],
  "meta": {
    "totalItems": 42,
    "itemCount": 10,
    "itemsPerPage": 10,
    "totalPages": 5,
    "currentPage": 1
  }
}
```

---

## Logique métier notable

### Transition d'état des biens immobiliers

À la création d'un contrat, le statut du bien est automatiquement mis à jour :

```
FOR_SALE  + contrat sans endDate  →  SOLD
FOR_RENT  + contrat avec endDate  →  RENTED
```

### Détection des contrats impayés (`GET /contracts/unpaid/expired`)

**Ventes non soldées :** contrats sans `endDate` (vente) où la somme des paiements est inférieure au prix du bien.

**Locations impayées :** contrats avec `endDate` (location) en cours pour lesquels aucun paiement n'a été enregistré pour le mois courant.

### Favoris en toggle (`POST /favorites/switch`)

Vérifie l'existence d'un favori pour le couple `(userId, realEstateId)`. S'il existe, il est supprimé ; sinon, il est créé. Évite les doublons sans exposer deux routes.

### Réservations — anti-doublon

Un utilisateur ne peut pas avoir deux réservations actives (`status ≠ cancelled`) pour le même bien.

---

## Sécurité

| Mesure | Implémentation |
|---|---|
| Authentification par session | Better Auth · cookies HTTP-only |
| OAuth 2.0 | Google provider via Better Auth · redirect flow sécurisé |
| RBAC | `PermissionsGuard` + enum `Permission` |
| Vérification email | Obligatoire pour email/mdp · automatique pour Google |
| Validation des entrées | `ValidationPipe` global · `class-validator` |
| Champs inconnus rejetés | `forbidNonWhitelisted: true` |
| Comptes désactivables | Champ `isActive` · vérifié à chaque requête |
| Nettoyage des uploads | `CleanupFilesInterceptor` en cas d'erreur |
| CORS restreint | Origine unique autorisée (`localhost:4200`) |
| Mots de passe | Better Auth · hachage automatique · regex de complexité |
| Tokens email | Expiration 24h (vérification) · 1h (reset) · usage unique |

---

## Patterns NestJS utilisés

| Pattern | Usage |
|---|---|
| **Module** | Encapsulation de chaque domaine métier |
| **Guard** | `PermissionsGuard` pour l'auth et le RBAC |
| **Interceptor** | `CleanupFilesInterceptor` pour la gestion des fichiers |
| **Decorator** | `@Public()`, `@RequirePermissions()`, `@CurrentUser()` |
| **Pipe** | `ValidationPipe` global, `ParseUUIDPipe` |
| **Repository pattern** | TypeORM via `@InjectRepository()` |
| **DTO pattern** | Create / Update / Filter DTOs par module |
| **QueryBuilder** | Filtrage dynamique multi-critères |