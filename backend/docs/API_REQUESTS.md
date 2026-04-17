# Guide Complet des Commandes cURL — NestHome API

## Table des Matières

1. [Authentication (Better Auth)](#1-authentication-better-auth)
2. [Users](#2-users)
3. [Real Estate](#3-real-estate)
4. [Comments](#4-comments)
5. [Favorites](#5-favorites)
6. [Reservations](#6-reservations)
7. [Contracts](#7-contracts)
8. [Payments](#8-payments)
9. [Stats](#9-stats)
10. [App Routes](#10-app-routes)

---

## 1. Authentication (Better Auth)

### Inscription (Sign Up) — Email / Mot de passe

```bash
curl -X POST "http://localhost:3000/api/auth/sign-up/email" \
-H "Content-Type: application/json" \
-d '{
  "email": "user@example.com",
  "password": "Password123",
  "name": "John Doe"
}'
```

> **Remarque :** Le mot de passe doit contenir au moins **8 caractères**, une lettre et un chiffre.  
> Un email de vérification est envoyé automatiquement après l'inscription.

**Réponse :**
```json
{
  "token": null,
  "user": {
    "id": "xxx",
    "email": "user@example.com",
    "emailVerified": false,
    "name": "John Doe",
    "role": "user",
    "isActive": true
  }
}
```

---

### Vérification de l'email

Après l'inscription, un **email de vérification** est envoyé automatiquement à l'adresse fournie. L'email contient un lien de la forme :

```
http://localhost:4200/verify-email?token=<TOKEN>
```

Le frontend extrait le `token` depuis l'URL et appelle le backend :

```bash
curl "http://localhost:3000/api/auth/verify-email?token=TOKEN_RECU_PAR_EMAIL&callbackURL=http://localhost:4200"
```

> Le token expire après **24 heures**.  
> Tant que l'email n'est pas vérifié, la connexion retourne une erreur `403`.

**Contenu de l'email envoyé :**
- Expéditeur : configuré via `SMTP_FROM_NAME` et `SMTP_FROM_EMAIL`
- Sujet : `Confirmez votre adresse email — NestHome`
- Corps : bouton HTML pointant vers `FRONTEND_URL/verify-email?token=<TOKEN>`

---

### Connexion (Sign In) — Email / Mot de passe

```bash
curl -X POST "http://localhost:3000/api/auth/sign-in/email" \
-H "Content-Type: application/json" \
-d '{
  "email": "user@example.com",
  "password": "Password123"
}' \
-c cookies.txt
```

> Sauvegardez le cookie avec `-c cookies.txt` et réutilisez-le avec `-b cookies.txt`.

**Si l'email n'est pas vérifié :**
```json
{ "code": "EMAIL_NOT_VERIFIED", "message": "Email not verified" }
```

---

### Connexion via Google OAuth

La connexion Google s'effectue via une redirection navigateur — elle ne peut **pas** être testée avec cURL seul. Voici le flux complet :

**Étape 1 — Initier la connexion Google (ouvrir dans un navigateur)**

```
GET http://localhost:3000/api/auth/sign-in/social?provider=google&callbackURL=http://localhost:4200/dashboard
```

> Remplacez `callbackURL` par la route de votre frontend vers laquelle Google redirigera après authentification.

**Étape 2 — Consentement Google**

L'utilisateur est redirigé vers la page de sélection de compte Google. Après accord, Google rappelle automatiquement :

```
GET http://localhost:3000/api/auth/callback/google?code=...&state=...
```

**Étape 3 — Session créée**

Better Auth crée la session et redirige vers le `callbackURL` fourni. Le cookie de session est positionné automatiquement.

**Comportement :**
- Si l'email Google n'existe pas en base → **compte créé** avec rôle `user`, email vérifié d'office
- Si l'email Google existe déjà (compte email/mdp) → **comptes liés**, même session

> **Prérequis :** `GOOGLE_CLIENT_ID` et `GOOGLE_CLIENT_SECRET` doivent être configurés dans le `.env`. L'URI de callback `http://localhost:3000/api/auth/callback/google` doit être autorisée dans la Google Cloud Console.

---

### Déconnexion (Sign Out)

```bash
curl -X POST "http://localhost:3000/api/auth/sign-out" \
-H "Origin: http://localhost:3000" \
-b cookies.txt \
-c cookies.txt
```

---

### Obtenir la session courante

```bash
curl -X GET "http://localhost:3000/api/auth/get-session" \
-b cookies.txt
```

---

### Demander la réinitialisation du mot de passe

```bash
curl -X POST "http://localhost:3000/api/auth/request-password-reset" \
-H "Content-Type: application/json" \
-d '{
  "email": "user@example.com",
  "redirectTo": "http://localhost:4200/reset-password"
}'
```

**Réponse :**
```json
{
  "status": true,
  "message": "If this email exists in our system, check your email for the reset link"
}
```

> Un **email de réinitialisation** est envoyé à l'adresse indiquée si elle existe en base.  
> L'email contient un lien de la forme : `http://localhost:4200/reset-password?token=<TOKEN>`  
> Le token expire après **1 heure**.

**Contenu de l'email envoyé :**
- Expéditeur : configuré via `SMTP_FROM_NAME` et `SMTP_FROM_EMAIL`
- Sujet : `Réinitialisation de votre mot de passe — NestHome`
- Corps : bouton HTML pointant vers `FRONTEND_URL/reset-password?token=<TOKEN>`

---

### Appliquer le nouveau mot de passe

Extrayez le `TOKEN` depuis l'URL reçue dans l'email, puis :

```bash
curl -X POST "http://localhost:3000/api/auth/reset-password" \
-H "Content-Type: application/json" \
-d '{
  "token": "TOKEN_EXTRAIT_DU_LIEN",
  "newPassword": "NewPassword123"
}'
```

**Réponse :**
```json
{ "status": true }
```

> Le nouveau mot de passe doit respecter les mêmes règles : 8 caractères min, une lettre + un chiffre.

---

### Flux complet — Authentification email

```bash
# 1. Inscription
curl -s -X POST "http://localhost:3000/api/auth/sign-up/email" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Password123","name":"John Doe"}' | jq

# 2. Vérifier l'email reçu dans la boîte mail → cliquer le lien ou :
curl -s "http://localhost:3000/api/auth/verify-email?token=TOKEN_DU_MAIL&callbackURL=http://localhost:4200"

# 3. Connexion (sauvegarde le cookie)
curl -s -X POST "http://localhost:3000/api/auth/sign-in/email" \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"user@example.com","password":"Password123"}' | jq

# 4. Demander un reset de mot de passe
curl -s -X POST "http://localhost:3000/api/auth/request-password-reset" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","redirectTo":"http://localhost:4200/reset-password"}' | jq

# 5. Appliquer le nouveau mot de passe (token extrait du mail reçu)
curl -s -X POST "http://localhost:3000/api/auth/reset-password" \
  -H "Content-Type: application/json" \
  -d '{"token":"TOKEN_DU_MAIL","newPassword":"NewPassword123"}' | jq
```

---

### Flux complet — Connexion Google OAuth

```
1. Ouvrir dans le navigateur :
   GET http://localhost:3000/api/auth/sign-in/social?provider=google&callbackURL=http://localhost:4200/dashboard

2. Sélectionner un compte Google et accorder les permissions

3. Google redirige automatiquement vers :
   http://localhost:3000/api/auth/callback/google?code=...

4. Better Auth crée la session et redirige vers :
   http://localhost:4200/dashboard

5. Le cookie de session est désormais actif → utiliser -b cookies.txt pour les appels suivants
```

---

## 2. Users

### Lister tous les utilisateurs *(Admin)*

**Pagination :** Oui (`page`, `limit`)  
**Filtres :** `email`, `name`, `role`, `createdAtMin`, `createdAtMax`, `isActive`

```bash
curl -X GET "http://localhost:3000/users?page=1&limit=20" \
-b cookies.txt
```

**Exemple avec filtres :**

```bash
curl -X GET "http://localhost:3000/users?page=1&limit=20&role=agent&name=John&isActive=true" \
-b cookies.txt
```

---

### Obtenir mon profil

```bash
curl -X GET "http://localhost:3000/users/profile/me" \
-b cookies.txt
```

---

### Mettre à jour mon profil

```bash
curl -X PATCH "http://localhost:3000/users/profile/me" \
-b cookies.txt \
-H "Content-Type: application/json" \
-d '{
  "name": "John Updated",
  "email": "newmail@example.com"
}'
```

> **Champs optionnels :** `name`, `email`

---

### Changer mon mot de passe

```bash
curl -X PATCH "http://localhost:3000/users/profile/password" \
-b cookies.txt \
-H "Content-Type: application/json" \
-d '{
  "currentPassword": "Password123",
  "newPassword": "NewPassword456"
}'
```

---

### Mettre à jour mon image de profil

```bash
curl -X PATCH "http://localhost:3000/users/profile/me/image" \
-b cookies.txt \
-F "profileImage=@/chemin/vers/image.jpg"
```

> **Validations :** 1 image max · Taille max 1MB · Types : `jpg`, `jpeg`, `png`, `webp`

---

### Supprimer mon image de profil

```bash
curl -X DELETE "http://localhost:3000/users/profile/me/image" \
-b cookies.txt
```

---

### Supprimer mon compte

```bash
curl -X DELETE "http://localhost:3000/users/me" \
-b cookies.txt
```

---

### Obtenir un utilisateur par ID *(Admin)*

```bash
curl -X GET "http://localhost:3000/users/<user_id>" \
-b cookies.txt
```

---

### Mettre à jour un utilisateur *(Admin)*

```bash
curl -X PATCH "http://localhost:3000/users/<user_id>" \
-b cookies.txt \
-H "Content-Type: application/json" \
-d '{
  "name": "Updated Name",
  "email": "updated@example.com"
}'
```

---

### Supprimer un utilisateur *(Admin)*

```bash
curl -X DELETE "http://localhost:3000/users/<user_id>" \
-b cookies.txt
```

---

### Créer un utilisateur admin/agent *(Admin)*

```bash
curl -X POST "http://localhost:3000/users/admin" \
-b cookies.txt \
-H "Content-Type: application/json" \
-d '{
  "email": "agent@example.com",
  "password": "Password123",
  "name": "Agent Dupont",
  "role": "agent",
  "isActive": true
}'
```

> **Valeurs de `role` :** `admin`, `agent`, `user`

---

### Activer / Désactiver un utilisateur *(Admin)*

```bash
curl -X PATCH "http://localhost:3000/users/isActive/<user_id>" \
-b cookies.txt \
-H "Content-Type: application/json" \
-d '{
  "isActive": false
}'
```

---

### Changer le rôle d'un utilisateur *(Admin)*

```bash
curl -X PATCH "http://localhost:3000/users/role/<user_id>" \
-b cookies.txt \
-H "Content-Type: application/json" \
-d '{
  "role": "agent"
}'
```

> **Valeurs de `role` :** `admin`, `agent`

---

## 3. Real Estate

### Lister tous les biens *(Public)*

**Pagination :** Oui (`page`, `limit`)  
**Filtres :** `title`, `address`, `type`, `status`, `minPrice`, `maxPrice`, `minSurface`, `maxSurface`, `minRooms`, `sortByPrice`, `agentId`

```bash
curl -X GET "http://localhost:3000/real-estate?page=1&limit=20"
```

**Exemple avec filtres :**

```bash
curl -X GET "http://localhost:3000/real-estate?page=1&limit=20&type=0&status=0&minPrice=50000&maxPrice=300000&sortByPrice=asc&minRooms=3"
```

> **Valeurs de `type` :** `0` = Maison · `1` = Appartement · `2` = Terrain · `3` = Commercial  
> **Valeurs de `status` :** `0` = À vendre · `1` = À louer · `2` = Vendu · `3` = Loué

---

### Obtenir un bien par ID *(Public)*

```bash
curl -X GET "http://localhost:3000/real-estate/<real_estate_id>"
```

---

### Créer un bien immobilier *(Agent / Admin)*

```bash
curl -X POST "http://localhost:3000/real-estate" \
-b cookies.txt \
-F "title=Villa Moderne Lac 1" \
-F "description=Splendide villa avec piscine, vue lac." \
-F "price=850000" \
-F "address=Lac 1, Tunis" \
-F "lat=36.8319" \
-F "lng=10.2306" \
-F "type=0" \
-F "status=0" \
-F "condition=Neuf" \
-F "rooms=5" \
-F "surface=320" \
-F "bathroom=3" \
-F "equipment[]=Piscine" \
-F "equipment[]=Garage" \
-F "equipment[]=Jardin" \
-F "images=@/chemin/vers/image1.jpg" \
-F "images=@/chemin/vers/image2.jpg"
```

> **Champs optionnels :** `description`, `lat`, `lng`, `status`, `images`, `equipment`  
> **Validations :** Max 10 images · 1MB max par image · Types : `jpg`, `jpeg`, `png`, `webp`

---

### Mettre à jour un bien immobilier *(Agent / Admin)*

```bash
curl -X PATCH "http://localhost:3000/real-estate/<real_estate_id>" \
-b cookies.txt \
-F "title=Villa Moderne Mise à Jour" \
-F "price=900000" \
-F "status=0" \
-F "imagesToKeep[]=http://localhost:3000/uploads/real-estates/existing1.jpg" \
-F "images=@/chemin/vers/nouvelle_image.jpg"
```

> **Champs optionnels :** Tous les champs sont optionnels  
> `imagesToKeep` : liste des URLs des images existantes à conserver ; les autres seront supprimées

---

### Mettre à jour les images d'un bien *(Agent / Admin)*

```bash
curl -X PATCH "http://localhost:3000/real-estate/<real_estate_id>/images" \
-b cookies.txt \
-F "images=@/chemin/vers/image1.jpg" \
-F "images=@/chemin/vers/image2.jpg" \
-F "replaceAll=false"
```

> **`replaceAll` :** `"true"` remplace toutes les images · `"false"` ajoute aux existantes (défaut)  
> **Validations :** Max 10 images au total · 1MB max par image

---

### Supprimer un bien immobilier *(Agent / Admin)*

```bash
curl -X DELETE "http://localhost:3000/real-estate/<real_estate_id>" \
-b cookies.txt
```

---

## 4. Comments

### Lister tous les commentaires *(Public)*

```bash
curl -X GET "http://localhost:3000/comments"
```

---

### Obtenir les commentaires d'un bien *(Public)*

**Pagination :** Oui (`page`, `limit`)

```bash
curl -X GET "http://localhost:3000/comments/<real_estate_id>?page=1&limit=20"
```

---

### Créer un commentaire *(Authentifié)*

```bash
curl -X POST "http://localhost:3000/comments" \
-b cookies.txt \
-H "Content-Type: application/json" \
-d '{
  "realEstateId": "<real_estate_id>",
  "content": "Très bel appartement, quartier calme et bien desservi.",
  "rating": 4
}'
```

> **`rating` :** Entier entre `1` et `5`

---

### Supprimer un commentaire *(Propriétaire)*

```bash
curl -X DELETE "http://localhost:3000/comments/<comment_id>" \
-b cookies.txt
```

---

## 5. Favorites

### Lister tous les favoris *(Admin)*

```bash
curl -X GET "http://localhost:3000/favorites" \
-b cookies.txt
```

---

### Obtenir mes favoris *(Authentifié)*

```bash
curl -X GET "http://localhost:3000/favorites/user" \
-b cookies.txt
```

---

### Ajouter un favori *(Authentifié)*

```bash
curl -X POST "http://localhost:3000/favorites" \
-b cookies.txt \
-H "Content-Type: application/json" \
-d '{
  "realEstateId": "<real_estate_id>"
}'
```

---

### Basculer favori (toggle) *(Authentifié)*

Ajoute si absent, supprime si présent.

```bash
curl -X POST "http://localhost:3000/favorites/switch" \
-b cookies.txt \
-H "Content-Type: application/json" \
-d '{
  "realEstateId": "<real_estate_id>"
}'
```

---

### Supprimer un favori *(Propriétaire)*

```bash
curl -X DELETE "http://localhost:3000/favorites/<favorite_id>" \
-b cookies.txt
```

---

## 6. Reservations

### Créer une réservation de visite *(Authentifié)*

```bash
curl -X POST "http://localhost:3000/reservations/<real_estate_id>" \
-b cookies.txt \
-H "Content-Type: application/json" \
-d '{
  "cinPassport": "12345678",
  "clientPhone": "55123456",
  "visitDate": "2025-04-15",
  "visitTime": "10:00"
}'
```

> **`clientPhone` :** Exactement 8 chiffres  
> **`visitDate` :** Format ISO 8601 (`YYYY-MM-DD`)

---

### Lister toutes les réservations *(Agent / Admin)*

**Pagination :** Oui (`page`, `limit`)  
**Filtres :** `clientPhone`, `status`, `realEstateId`, `userId`, `minVisitDate`, `maxVisitDate`, `sortByVisitDate`

```bash
curl -X GET "http://localhost:3000/reservations?page=1&limit=10" \
-b cookies.txt
```

**Exemple avec filtres :**

```bash
curl -X GET "http://localhost:3000/reservations?page=1&limit=10&status=pending&minVisitDate=2025-04-01&maxVisitDate=2025-04-30&sortByVisitDate=asc" \
-b cookies.txt
```

> **Valeurs de `status` :** `pending`, `confirmed`, `cancelled`

---

### Obtenir mes réservations *(Authentifié)*

```bash
curl -X GET "http://localhost:3000/reservations/user/me" \
-b cookies.txt
```

---

### Obtenir une réservation par ID *(Agent / Admin)*

```bash
curl -X GET "http://localhost:3000/reservations/<reservation_id>" \
-b cookies.txt
```

---

### Mettre à jour une réservation *(Agent / Admin)*

```bash
curl -X PATCH "http://localhost:3000/reservations/<reservation_id>" \
-b cookies.txt \
-H "Content-Type: application/json" \
-d '{
  "status": "confirmed",
  "visitDate": "2025-04-20",
  "visitTime": "14:00"
}'
```

> **Champs optionnels :** `cinPassport`, `clientPhone`, `visitDate`, `visitTime`, `status`

---

### Annuler ma réservation *(Propriétaire, statut `pending` uniquement)*

```bash
curl -X PATCH "http://localhost:3000/reservations/<reservation_id>/cancel" \
-b cookies.txt
```

---

### Supprimer une réservation *(Agent / Admin)*

```bash
curl -X DELETE "http://localhost:3000/reservations/<reservation_id>" \
-b cookies.txt
```

---

## 7. Contracts

### Créer un contrat *(Agent / Admin)*

```bash
curl -X POST "http://localhost:3000/contracts" \
-b cookies.txt \
-H "Content-Type: application/json" \
-d '{
  "cinPassport": "12345678",
  "startDate": "2025-04-01",
  "endDate": "2026-04-01",
  "userId": "<user_id>",
  "realEstateId": "<real_estate_id>"
}'
```

> **`endDate` :** Obligatoire pour les biens **À louer** (`FOR_RENT`), optionnel pour les ventes  
> Après création, le statut du bien passe automatiquement à `SOLD` ou `RENTED`

---

### Lister tous les contrats *(Agent / Admin)*

**Pagination :** Oui (`page`, `limit`)  
**Filtres :** `userId`, `agentId`, `realEstateId`, `startDate`, `endDate`

```bash
curl -X GET "http://localhost:3000/contracts?page=1&limit=10" \
-b cookies.txt
```

**Exemple avec filtres :**

```bash
curl -X GET "http://localhost:3000/contracts?page=1&limit=10&userId=<user_id>&startDate=2025-01-01" \
-b cookies.txt
```

---

### Contrats impayés / expirés *(Agent / Admin)*

Retourne les contrats de vente non soldés et les locations sans paiement du mois courant.

```bash
curl -X GET "http://localhost:3000/contracts/unpaid/expired" \
-b cookies.txt
```

---

### Obtenir un contrat par ID *(Agent / Admin)*

```bash
curl -X GET "http://localhost:3000/contracts/<contract_id>" \
-b cookies.txt
```

---

### Mettre à jour un contrat *(Agent / Admin)*

```bash
curl -X PATCH "http://localhost:3000/contracts/<contract_id>" \
-b cookies.txt \
-H "Content-Type: application/json" \
-d '{
  "cinPassport": "87654321",
  "startDate": "2025-05-01",
  "endDate": "2026-05-01"
}'
```

> **Champs optionnels :** `cinPassport`, `startDate`, `endDate`  
> On ne peut pas ajouter une `endDate` à un contrat de vente, ni la supprimer d'un contrat de location

---

### Supprimer un contrat *(Agent / Admin)*

```bash
curl -X DELETE "http://localhost:3000/contracts/<contract_id>" \
-b cookies.txt
```

---

## 8. Payments

### Enregistrer un paiement *(Agent / Admin)*

```bash
curl -X POST "http://localhost:3000/payments" \
-b cookies.txt \
-H "Content-Type: application/json" \
-d '{
  "amount": 1500.00,
  "realEstateId": "<real_estate_id>",
  "userId": "<user_id>"
}'
```

---

### Lister tous les paiements *(Agent / Admin)*

**Pagination :** Oui (`page`, `limit`)  
**Filtres :** `userId`, `realEstateId`, `sortByDate`

```bash
curl -X GET "http://localhost:3000/payments?page=1&limit=10" \
-b cookies.txt
```

**Exemple avec filtres :**

```bash
curl -X GET "http://localhost:3000/payments?page=1&limit=10&userId=<user_id>&sortByDate=desc" \
-b cookies.txt
```

> **Valeurs de `sortByDate` :** `asc`, `desc`

---

### Obtenir un paiement par ID *(Agent / Admin)*

```bash
curl -X GET "http://localhost:3000/payments/<payment_id>" \
-b cookies.txt
```

---

### Mettre à jour un paiement *(Agent / Admin)*

```bash
curl -X PATCH "http://localhost:3000/payments/<payment_id>" \
-b cookies.txt \
-H "Content-Type: application/json" \
-d '{
  "amount": 2000.00
}'
```

---

### Supprimer un paiement *(Agent / Admin)*

```bash
curl -X DELETE "http://localhost:3000/payments/<payment_id>" \
-b cookies.txt
```

---

## 9. Stats

> Toutes les routes Stats nécessitent la permission `stats:view` (rôle `agent` ou `admin`).

### Vue d'ensemble globale

Compteurs : biens, utilisateurs, réservations, contrats, paiements, revenu total.

```bash
curl -X GET "http://localhost:3000/stats/overview" \
-b cookies.txt
```

**Exemple de réponse :**

```json
{
  "totalProperties": 42,
  "totalUsers": 128,
  "totalReservations": 315,
  "totalContracts": 87,
  "totalPayments": 204,
  "totalRevenue": 4250000
}
```

---

### Revenus mensuels (12 mois glissants)

```bash
curl -X GET "http://localhost:3000/stats/revenue" \
-b cookies.txt
```

---

### Statistiques des réservations

Distribution mensuelle + répartition par statut (`pending`, `confirmed`, `cancelled`).

```bash
curl -X GET "http://localhost:3000/stats/reservations" \
-b cookies.txt
```

---

### Statistiques des biens

Distribution par statut + top 5 des biens les mieux notés.

```bash
curl -X GET "http://localhost:3000/stats/properties" \
-b cookies.txt
```

---

### Statistiques des contrats

Contrats mensuels (12 mois) + total ventes vs locations.

```bash
curl -X GET "http://localhost:3000/stats/contracts" \
-b cookies.txt
```

---

## 10. App Routes

### Route publique

```bash
curl -X GET "http://localhost:3000/"
```

### Route privée (authentification requise)

```bash
curl -X GET "http://localhost:3000/private" \
-b cookies.txt
```

---

## Notes importantes

1. **Cookies :** Better Auth utilise des cookies HTTP-only. Utilisez `-c cookies.txt` pour sauvegarder et `-b cookies.txt` pour les inclure.
2. **Vérification email :** Obligatoire avant toute connexion par email/mdp. Vérifiez votre boîte mail après l'inscription.
3. **Google OAuth :** La connexion Google se fait via une redirection navigateur — pas simulable avec cURL. L'email Google est vérifié d'office.
4. **Reset password :** Le token se trouve dans l'URL du lien reçu par email — extrayez le paramètre `token=<TOKEN>` depuis le lien `reset-password?token=...`.
5. **Emails transactionnels :** Deux emails sont envoyés automatiquement : vérification à l'inscription, réinitialisation sur demande. Configurés via les variables `SMTP_*` et les templates dans `src/utils/email-templates.ts`.
6. **Dates :** Format ISO 8601 — `YYYY-MM-DD` pour les dates, `HH:MM` pour les heures.
7. **UUIDs :** Remplacez `<xxx_id>` par les vrais identifiants de votre base de données.
8. **Pagination :** Par défaut `page=1` et `limit=10` ou `20`. Ajustez selon vos besoins.
9. **Filtres textuels :** Recherche partielle, insensible à la casse (`ILIKE`).
10. **Rôles et permissions :** Chaque endpoint précise le rôle requis entre parenthèses. Une session inactive (`isActive=false`) renvoie une erreur `403`.
11. **Images :** Fichiers servis via `http://localhost:3000/uploads/<dossier>/<filename>`.
12. **Contraintes images :** Max 1MB par fichier · Types : `jpg`, `jpeg`, `png`, `webp` · Max 10 images/bien.
13. **Contrats :** La création d'un contrat change automatiquement le statut du bien (`SOLD` ou `RENTED`).
14. **Combinaison de filtres :** Tous les filtres d'un endpoint sont cumulables dans la même requête.