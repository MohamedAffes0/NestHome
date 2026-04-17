# Services — NestHome Frontend

Tous les services sont dans `src/app/core/services/` et exportés via `src/app/core/services/index.ts`.

---

## AuthService

**Fichier :** `auth.service.ts`

Gère la session Better Auth. Expose `user$` et `session$` comme observables publics partagés dans toute l'application.

| Méthode | Description |
|---|---|
| `getSession()` | `GET /api/auth/get-session` — charge l'utilisateur et les favoris |
| `loadSession()` | Appelé au démarrage, lance `getSession()` |
| `login(email, password)` | `authClient.signIn.email()` puis recharge la session |
| `signUp(data)` | `POST /api/auth/sign-up/email` |
| `logout()` | Vide l'état, appelle `authClient.signOut()` |
| `currentUser` | Getter synchrone sur `userSubject.value` |

---

## RealEstateService

**Fichier :** `real-estate.service.ts`

Gère les biens immobiliers. Construit des `FormData` pour les uploads multipart.

| Méthode | Endpoint | Auth |
|---|---|---|
| `getAll(filters, page, limit)` | `GET /real-estate` | Public |
| `getById(id)` | `GET /real-estate/:id` | Public |
| `create(dto, images?)` | `POST /real-estate` | Agent/Admin |
| `update(id, dto, newImages?)` | `PATCH /real-estate/:id` | Agent/Admin |
| `updateImages(id, images, replaceAll?)` | `PATCH /real-estate/:id/images` | Agent/Admin |
| `delete(id)` | `DELETE /real-estate/:id` | Agent/Admin |

**Helpers statiques :**
- `typeLabel(type)` → `'Maison'`, `'Appartement'`, `'Terrain'`, `'Commerce'`
- `statusLabel(status)` → `'À Vendre'`, `'À Louer'`, `'Vendu'`, `'Loué'`
- `isSale(status)` → `boolean`

---

## UserService

**Fichier :** `user.service.ts`

| Méthode | Endpoint | Auth |
|---|---|---|
| `getAllUsers(filter?, page, limit)` | `GET /users` | Admin |
| `deleteUser(userId)` | `DELETE /users/:id` | Admin |
| `deleteMyProfile()` | `DELETE /users/me` | Authentifié |
| `updateProfile(data)` | `PATCH /users/profile/me` | Authentifié |
| `updateProfileImage(file)` | `PATCH /users/profile/me/image` | Authentifié |
| `changePassword(data)` | `PATCH /users/profile/password` | Authentifié |
| `deleteProfileImage()` | `DELETE /users/profile/me/image` | Authentifié |
| `updateActivateUser(userId, isActive)` | `PATCH /users/isActive/:id` | Admin |
| `updateUserRole(userId, role)` | `PATCH /users/role/:id` | Admin |
| `createUser(userData)` | `POST /users/admin` | Admin |

Après `updateProfile()`, `updateProfileImage()` et `deleteProfileImage()`, le service met à jour directement `AuthService.userSubject` via `.pipe(tap(...))`.

---

## ReservationService

**Fichier :** `reservation.service.ts`

| Méthode | Endpoint | Auth |
|---|---|---|
| `create(realEstateId, dto)` | `POST /reservations/:realEstateId` | Authentifié |
| `getAll(filters, page, limit)` | `GET /reservations` | Agent/Admin |
| `getById(id)` | `GET /reservations/:id` | Agent/Admin |
| `getMyReservations()` | `GET /reservations/user/me` | Authentifié |
| `update(id, dto)` | `PATCH /reservations/:id` | Agent/Admin |
| `cancel(id)` | `PATCH /reservations/:id/cancel` | Authentifié |
| `updateStatus(id, status)` | `PATCH /reservations/:id` | Agent/Admin |
| `delete(id)` | `DELETE /reservations/:id` | Agent/Admin |

---

## ContractService

**Fichier :** `contract.service.ts`

| Méthode | Endpoint | Auth |
|---|---|---|
| `create(dto)` | `POST /contracts` | Agent/Admin |
| `getAll(filters, page, limit)` | `GET /contracts` | Agent/Admin |
| `getUnpaidExpired()` | `GET /contracts/unpaid/expired` | Agent/Admin |
| `getById(id)` | `GET /contracts/:id` | Agent/Admin |
| `update(id, dto)` | `PATCH /contracts/:id` | Agent/Admin |
| `delete(id)` | `DELETE /contracts/:id` | Agent/Admin |
| `isRental(contract)` | — | Helper |
| `isSale(contract)` | — | Helper |

---

## PaymentService

**Fichier :** `payment.service.ts`

| Méthode | Endpoint | Auth |
|---|---|---|
| `create(dto)` | `POST /payments` | Agent/Admin |
| `getAll(filters, page, limit)` | `GET /payments` | Agent/Admin |
| `getById(id)` | `GET /payments/:id` | Agent/Admin |
| `update(id, dto)` | `PATCH /payments/:id` | Agent/Admin |
| `delete(id)` | `DELETE /payments/:id` | Agent/Admin |
| `getByRealEstate(realEstateId, page, limit)` | — | Helper (appelle `getAll`) |
| `getByUser(userId, page, limit)` | — | Helper (appelle `getAll`) |

---

## FavoriteService

**Fichier :** `favorite.service.ts`

Gère un `BehaviorSubject<Set<string>>` des IDs favoris pour un accès O(1) dans les cartes.

| Méthode | Endpoint | Auth |
|---|---|---|
| `loadUserFavorites()` | `GET /favorites/user` | Authentifié |
| `clearFavorites()` | — | Local (logout) |
| `isFavorited(realEstateId)` | — | Synchrone O(1) |
| `switchFavorite(realEstateId)` | `POST /favorites/switch` | Authentifié |
| `addFavorite(realEstateId)` | `POST /favorites` | Authentifié |
| `deleteFavorite(favoriteId, realEstateId)` | `DELETE /favorites/:id` | Authentifié |
| `getAllFavorites()` | `GET /favorites` | Admin |
| `count` | — | Getter synchrone |

Après `switchFavorite()`, `addFavorite()` et `deleteFavorite()`, le `Set` local est mis à jour via `.pipe(tap(...))` — pas besoin de re-requêter l'API.

---

## CommentService

**Fichier :** `comment.service.ts`

| Méthode | Endpoint | Auth |
|---|---|---|
| `getByRealEstate(id, page, limit)` | `GET /comments/:realEstateId` | Public |
| `create(dto)` | `POST /comments` | Authentifié |
| `delete(commentId)` | `DELETE /comments/:commentId` | Authentifié |

---

## StatsService

**Fichier :** `stats.service.ts`

| Méthode | Endpoint | Auth |
|---|---|---|
| `getOverview()` | `GET /stats/overview` | Agent/Admin |
| `getRevenue()` | `GET /stats/revenue` | Agent/Admin |
| `getReservations()` | `GET /stats/reservations` | Agent/Admin |
| `getProperties()` | `GET /stats/properties` | Agent/Admin |
| `getContracts()` | `GET /stats/contracts` | Agent/Admin |

`StatsPage` utilise `forkJoin` pour charger tous les endpoints en parallèle en une seule souscription.

---

## ContractReceiptService

**Fichier :** `contract-receipt.service.ts`

Génère un PDF A4 de contrat (vente ou location) via `html2pdf.js`.

| Méthode | Description |
|---|---|
| `download(contract)` | Construit le HTML, l'injecte dans le DOM, génère et télécharge le PDF |

---

## PaymentReceiptService

**Fichier :** `payment-receipt.service.ts`

Génère un reçu de paiement PDF A4 via `html2pdf.js`.

| Méthode | Description |
|---|---|
| `download(payment)` | Construit le HTML, l'injecte dans le DOM, génère et télécharge le PDF |
