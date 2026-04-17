# Structure du Projet — NestHome API

## Arborescence complète

```
nesthome/
├── src/
│   ├── app.controller.ts          # Route racine / et /private
│   ├── app.module.ts              # Module racine — import de tous les modules
│   ├── app.service.ts             # Service racine
│   ├── main.ts                    # Bootstrap de l'application NestJS
│   │
│   ├── auth/                      # Système d'authentification et d'autorisation
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts   # @CurrentUser() — extrait l'utilisateur du request
│   │   │   ├── permissions.decorator.ts    # @RequirePermissions() — définit les permissions requises
│   │   │   └── public.decorator.ts         # @Public() — marque une route comme publique
│   │   ├── guards/
│   │   │   └── permissions.guard.ts        # PermissionsGuard — RBAC + session BetterAuth
│   │   └── types/
│   │       ├── auth-user.ts                # Interface AuthUser (id, email, role, isActive)
│   │       └── permissions.types.ts        # Enum Permission + ROLE_PERMISSIONS mapping
│   │
│   ├── config/
│   │   ├── database.config.ts     # Configuration TypeORM alternative (non utilisée en prod)
│   │   └── multer.config.ts       # Configuration upload : dossiers, nommage, filtres, limite
│   │
│   ├── utils/
│   │   └── auth.ts                # Instance Better Auth (emailAndPassword, session, rôles)
│   │
│   └── modules/
│       ├── comment/               # Commentaires sur les biens
│       │   ├── comment.controller.ts
│       │   ├── comment.entity.ts
│       │   ├── comment.module.ts
│       │   ├── comment.service.ts
│       │   └── dto/
│       │       ├── create-comment.dto.ts
│       │       └── update-comment.dto.ts
│       │
│       ├── contract/              # Contrats de vente et de location
│       │   ├── contract.controller.ts
│       │   ├── contract.entity.ts
│       │   ├── contract.module.ts
│       │   ├── contract.service.ts
│       │   └── dto/
│       │       ├── contract-filter.dto.ts
│       │       ├── create-contract.dto.ts
│       │       └── update-contract.dto.ts
│       │
│       ├── favorite/              # Favoris par utilisateur
│       │   ├── favorite.controller.ts
│       │   ├── favorite.entity.ts
│       │   ├── favorite.module.ts
│       │   ├── favorite.service.ts
│       │   └── dto/
│       │       └── favorite.dto.ts
│       │
│       ├── payment/               # Enregistrement des paiements
│       │   ├── payment.controller.ts
│       │   ├── payment.entity.ts
│       │   ├── payment.module.ts
│       │   ├── payment.service.ts
│       │   └── dto/
│       │       ├── create-payment.dto.ts
│       │       ├── payment-filter.dto.ts
│       │       └── update-payment.dto.ts
│       │
│       ├── real-estate/           # Biens immobiliers (cœur métier)
│       │   ├── real-estate.controller.ts
│       │   ├── real-estate.entity.ts
│       │   ├── real-estate.module.ts
│       │   ├── real-estate.service.ts
│       │   └── dto/
│       │       ├── create-real-estate.dto.ts
│       │       ├── filter-real-estate.dto.ts
│       │       ├── real-estate-stats.dto.ts
│       │       └── update-real-estate.dto.ts
│       │
│       ├── reservation/           # Réservations de visites
│       │   ├── reservation.controller.ts
│       │   ├── reservation.entity.ts
│       │   ├── reservation.module.ts
│       │   ├── reservation.service.ts
│       │   └── dto/
│       │       ├── create-reservation.dto.ts
│       │       ├── reservation-filter.dto.ts
│       │       └── update-reservation.dto.ts
│       │
│       ├── stats/                 # Tableaux de bord et statistiques
│       │   ├── stats.controller.ts
│       │   ├── stats.module.ts
│       │   ├── stats.service.ts
│       │   └── dto/
│       │       └── stats.dto.ts
│       │
│       ├── upload/                # Gestion des uploads de fichiers
│       │   ├── upload.module.ts
│       │   ├── upload.service.ts
│       │   └── interceptors/
│       │       └── cleanup-files.interceptor.ts  # Supprime les fichiers en cas d'erreur
│       │
│       └── user/                  # Gestion des utilisateurs
│           ├── user.controller.ts
│           ├── user.entity.ts
│           ├── user.module.ts
│           ├── user.service.ts
│           └── dto/
│               ├── change-password.dto.ts
│               ├── create-user.dto.ts
│               ├── update-profile.dto.ts
│               └── user-filter.dto.ts
│
├── test/
│   ├── app.e2e-spec.ts           # Tests end-to-end
│   └── jest-e2e.json             # Configuration Jest pour les tests e2e
│
├── uploads/                       # Fichiers uploadés (servis statiquement)
│   ├── profiles/                  # Images de profil utilisateurs
│   └── real-estates/              # Images des biens immobiliers
│
├── docs/
│   ├── API_REQUESTS.md           # Documentation cURL complète
│   ├── STRUCTURE.md              # Ce fichier
│   └── ARCHITECTURE.md           # Patterns et décisions d'architecture
│
├── .env                           # Variables d'environnement
├── nest-cli.json                  # Configuration CLI NestJS
├── package.json
├── tsconfig.json
└── README.md
```

---

## Description des fichiers clés

### `src/main.ts`

Point d'entrée de l'application. Configure :
- **Body parser désactivé** (pour compatibilité multipart avec Multer)
- **Fichiers statiques** servis depuis `/uploads/`
- **ValidationPipe global** avec `whitelist`, `forbidNonWhitelisted` et `transform`
- **CORS** autorisé pour `http://localhost:4200` (Angular)

### `src/app.module.ts`

Module racine qui importe :
- `TypeOrmModule.forRoot()` — connexion PostgreSQL via `DATABASE_URL`
- `AuthModule.forRoot()` — Better Auth en mode global, guard global désactivé
- Tous les modules métier

### `src/auth/guards/permissions.guard.ts`

Guard central appliqué sur chaque controller. Logique :
1. Si `@Public()` → laisser passer
2. Appeler `auth.api.getSession()` pour valider la session
3. Si `isActive === false` → `403 Forbidden`
4. Attacher `request.user` pour `@CurrentUser()`
5. Vérifier les permissions RBAC si `@RequirePermissions()` est présent

### `src/auth/types/permissions.types.ts`

Définit le mapping complet `ROLE_PERMISSIONS` :

| Permission | Admin | Agent | User |
|---|:---:|:---:|:---:|
| `users:view` | ✓ | — | — |
| `users:delete` | ✓ | — | — |
| `users:update` | ✓ | — | — |
| `admin:user:create` | ✓ | — | — |
| `admin:user:activate` | ✓ | — | — |
| `update:user:role` | ✓ | — | — |
| `realestate:create` | ✓ | ✓ | — |
| `realestate:update` | ✓ | ✓ | — |
| `realestate:delete` | ✓ | ✓ | — |
| `reservations:manage` | ✓ | ✓ | — |
| `reservations:create` | ✓ | ✓ | ✓ |
| `payment:view/create/update/delete` | ✓ | ✓ | — |
| `contract:view/create/update/delete` | ✓ | ✓ | — |
| `stats:view` | ✓ | ✓ | — |

### `src/config/multer.config.ts`

Configuration Multer avec :
- **Destination dynamique** selon `fieldname` : `profiles/`, `real-estates/`, `others/`
- **Nommage unique** : `{basename}-{timestamp}-{random}{ext}`
- **Filtre MIME** : `image/jpeg`, `image/jpg`, `image/png`, `image/webp`
- **Limite de taille** : 1 MB

### `src/utils/auth.ts`

Instance Better Auth configurée avec :
- Auth par email + mot de passe (regex : au moins une lettre + un chiffre + 8 chars)
- Champs utilisateur étendus : `role` (enum) + `isActive` (boolean)
- Session d'une durée de **1 jour**
- Origines de confiance : `localhost:3000` et `localhost:4200`

### `src/modules/upload/upload.service.ts`

Service utilitaire partagé pour :
- Générer les URLs publiques des fichiers
- Supprimer un ou plusieurs fichiers du système de fichiers
- Valider les fichiers uploadés (type + taille)

### `src/modules/upload/interceptors/cleanup-files.interceptor.ts`

Intercepteur NestJS qui supprime automatiquement les fichiers uploadés en cas d'erreur lors du traitement de la requête (évite les fichiers orphelins).

---

## Conventions de nommage

| Élément | Convention | Exemple |
|---|---|---|
| Fichiers | `kebab-case` | `real-estate.service.ts` |
| Classes | `PascalCase` | `RealEstateService` |
| Méthodes | `camelCase` | `findAll()` |
| Variables | `camelCase` | `realEstateId` |
| Colonnes DB | `camelCase` (TypeORM) | `realEstateId` |
| Tables DB | `snake_case` ou nom défini | `real_estates`, `comments` |
| DTOs | `{Action}{Resource}Dto` | `CreateRealEstateDto` |
| Entités | `{Resource}` | `RealEstate` |

---

## Organisation des modules

Chaque module fonctionnel suit la même structure :

```
module/
├── module.module.ts      # Déclarations, imports TypeORM, exports
├── module.controller.ts  # Routes HTTP, guards, DTOs d'entrée
├── module.service.ts     # Logique métier, accès DB
├── module.entity.ts      # Entité TypeORM (table)
└── dto/
    ├── create-xxx.dto.ts
    ├── update-xxx.dto.ts
    └── filter-xxx.dto.ts
```
