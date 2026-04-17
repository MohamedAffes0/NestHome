# Authentification — NestHome Frontend

## Vue d'ensemble

L'authentification repose sur **Better Auth** avec des sessions HTTP-only cookies. Le frontend ne stocke jamais de token dans `localStorage` — tout passe par le cookie de session géré automatiquement par le navigateur.

Deux méthodes de connexion sont disponibles : **email / mot de passe** et **Google OAuth**.

---

## Fichier de configuration

```typescript
// src/lib/auth-client.ts
import { createAuthClient } from 'better-auth/client';

export const BASE_URL     = 'http://localhost:3000';
export const FRONTEND_URL = 'http://localhost:4200';

export const authClient = createAuthClient({
  baseURL: 'http://localhost:3000'
});
```

---

## AuthService

**Fichier :** `src/app/core/services/auth.service.ts`

Le service central de l'authentification. Il expose deux observables publics :

```typescript
public user$    = this.userSubject.asObservable();    // User | null
public session$ = this.sessionSubject.asObservable(); // Session | null
```

### Initialisation

Au démarrage de l'application, `loadSession()` est appelé dans le constructeur. Il vérifie si une session active existe côté serveur :

```typescript
loadSession(): void {
  if (typeof window === 'undefined') return; // SSR guard
  this.getSession().subscribe();
}
```

Si une session est trouvée, `user$` est alimenté et les favoris sont chargés automatiquement (`FavoriteService.loadUserFavorites()`).

### Méthodes principales

**`getSession()`** — Appel `GET /api/auth/get-session`. Met à jour `user$`, `session$` et charge les favoris.

**`login(email, password)`** — Utilise `authClient.signIn.email()` puis recharge la session.

**`signInWithGoogle(errorCallbackPath?)`** — Utilise `authClient.signIn.social({ provider: 'google', ... })`. Redirige l'utilisateur vers Google, puis redirige vers `/` après authentification réussie.

**`signUp(data)`** — `POST /api/auth/sign-up/email` via HttpClient.

**`logout()`** — Vide `user$` et `session$`, efface les favoris, appelle `authClient.signOut()`.

**`verifyEmail(token)`** — `GET /api/auth/verify-email?token=...` — appelé par le composant `VerifyEmail`.

**`requestPasswordReset(email)`** — `POST /api/auth/request-password-reset` — appelé par le composant `ForgotPassword`.

**`resetPassword(token, newPassword)`** — `POST /api/auth/reset-password` — appelé par le composant `ResetPassword`.

---

## Flux de connexion — Email / Mot de passe

```
Utilisateur soumet le formulaire (/login)
         │
         ▼
Login.onSubmit()
  └── authService.login(email, password)
         │
         ▼
authClient.signIn.email({ email, password })
  └── POST /api/auth/sign-in/email
  └── Réponse : cookie de session HTTP-only
         │
         ▼
authService.getSession().subscribe()
  └── GET /api/auth/get-session (avec cookie)
  └── userSubject.next(response.user)
  └── FavoriteService.loadUserFavorites()
         │
         ▼
router.navigate(['/'])
```

---

## Flux d'inscription — Email / Mot de passe

```
Signup.onSubmit()
  └── authService.signUp({ name, email, password })
         │
         ▼
POST /api/auth/sign-up/email
         │
  ┌──────▼──────────────────────────┐
  │  Succès 200                     │──→ router.navigate(['/check-email'])
  │  Erreur 409 (email existant)    │──→ "Un compte avec cet email existe déjà."
  │  Erreur 400 (données invalides) │──→ "Données invalides."
  └─────────────────────────────────┘
```

L'utilisateur est redirigé vers `/check-email`, une page d'attente qui lui explique de vérifier sa boîte mail.

---

## Flux de vérification d'email

```
Backend envoie un email contenant :
  http://localhost:4200/verify-email?token=<TOKEN>
         │
         ▼
VerifyEmail (ngOnInit)
  └── token = route.snapshot.queryParamMap.get('token')
  └── si token absent → state = 'error'
         │
         ▼
authService.verifyEmail(token)
  └── GET /api/auth/verify-email?token=...
         │
  ┌──────▼──────────────────────────────────┐
  │  Succès (200 / 302 / 0)                 │──→ state = 'success'
  │                                          │    barre de progression 3s
  │                                          │    router.navigate(['/login'])
  │  Erreur (expired / invalid)             │──→ state = 'expired'
  │  Autre erreur                           │──→ state = 'error'
  └─────────────────────────────────────────┘
```

**États visuels du composant `VerifyEmail` :**
- `loading` — spinner animé pendant l'appel API
- `success` — icône verte + barre de progression + bouton "Se connecter maintenant"
- `expired` — icône orange + bouton "Créer un nouveau compte"
- `error` — icône rouge + message + bouton "Retour à la connexion"

---

## Flux de réinitialisation du mot de passe

### Étape 1 — Demande

```
ForgotPassword.onSubmit()
  └── authService.requestPasswordReset(email)
         │
         ▼
POST /api/auth/request-password-reset
  └── toujours → sent = true (sécurité : pas d'énumération d'emails)
         │
         ▼
Page affiche l'état "envoyé" avec tips :
  - vérifier le dossier spam
  - lien valide 1 heure
```

### Étape 2 — Application du nouveau mot de passe

```
Backend envoie un email contenant :
  http://localhost:4200/reset-password?token=<TOKEN>
         │
         ▼
ResetPassword (ngOnInit)
  └── token = route.snapshot.queryParamMap.get('token')
  └── si token absent → state = 'invalid'
         │
         ▼
ResetPassword.onSubmit()
  └── authService.resetPassword(token, newPassword)
         │
  ┌──────▼────────────────────────────────────────────┐
  │  Succès                                           │──→ state = 'success'
  │                                                   │    barre de progression 3.5s
  │                                                   │    router.navigate(['/login'])
  │  Erreur (expired / invalid dans message)         │──→ state = 'invalid'
  │  Autre erreur                                    │──→ errorMsg affiché dans le form
  └──────────────────────────────────────────────────┘
```

**États visuels du composant `ResetPassword` :**
- `form` — formulaire avec indicateur de force du mot de passe et confirmation
- `success` — icône navy + barre de progression + bouton "Se connecter maintenant"
- `invalid` — icône orange + bouton "Demander un nouveau lien" → `/forgot-password`

---

## Flux de connexion — Google OAuth

```
Login (ou Signup).onGoogleSignIn()
  └── authService.signInWithGoogle('/login')  ← errorCallbackPath
         │
         ▼
authClient.signIn.social({
  provider:          'google',
  callbackURL:       'http://localhost:4200/',
  errorCallbackURL:  'http://localhost:4200/login',
  newUserCallbackURL:'http://localhost:4200/',
})
         │
         ▼
Redirection navigateur vers Google
  └── sélection du compte
  └── consentement
         │
         ▼
Google rappelle : GET /api/auth/callback/google?code=...
  └── Better Auth crée ou lie le compte
  └── session créée (cookie HTTP-only)
         │
         ▼
Redirection vers callbackURL (http://localhost:4200/)
  └── AppComponent charge la session automatiquement
  └── user$ alimenté → navbar mise à jour
```

**Comportement selon le cas :**
- Email Google **inexistant** en base → compte créé avec `role = user`, `emailVerified = true`
- Email Google **déjà existant** (compte email/mdp) → comptes liés, même session
- Erreur lors de l'OAuth → redirection vers `errorCallbackURL` (ex: `/login`)

> **Note :** La connexion Google ne nécessite pas de vérification email. La page `/check-email` et le composant `VerifyEmail` ne sont jamais affichés pour les utilisateurs Google.

---

## Page /check-email

Affichée immédiatement après une inscription par email réussie. Elle explique à l'utilisateur les 3 étapes à suivre :

1. Ouvrir sa messagerie
2. Trouver un email de **NestHome**
3. Cliquer sur le lien de vérification

Elle propose aussi un lien vers `/login` et un lien vers `/signup` pour utiliser une autre adresse.

---

## Vérification de session au rechargement

```
AppComponent (bootstrap)
  └── authService.loadSession()
        └── GET /api/auth/get-session
              ├── Session valide → user$ alimenté + favoris chargés
              └── Session expirée / absente → user$ = null
```

Toutes les routes privées dépendent de `user$` dans leurs templates pour afficher/masquer les actions.

---

## Gestion de l'état d'authentification dans les composants

```typescript
// Dans un composant
constructor(private authService: AuthService) {}

// S'abonner à l'état utilisateur
ngOnInit(): void {
  this.authService.user$.subscribe(user => {
    this.currentUser = user;
  });
}

// Dans la navbar (template)
<div *ngIf="currentUser$ | async as currentUser">
  {{ currentUser.name }}
</div>
```

---

## Comptes inactifs

Si `user.isActive === false`, le backend retourne `403 Forbidden`. La navbar affiche "Compte inactif" et le menu est restreint. L'utilisateur peut toujours voir le catalogue public mais ne peut pas effectuer d'actions.

```typescript
// Navbar
isActive(user: User | null): boolean {
  return user?.isActive !== false;
}

isManager(user: User | null): boolean {
  if (!this.isActive(user)) return false;
  return user?.role === 'agent' || user?.role === 'admin';
}
```

---

## Toutes les requêtes authentifiées

Chaque service qui appelle une route privée inclut `withCredentials: true` :

```typescript
return this.http.get<PaginatedResponse<Contract>>(this.apiUrl, {
  params,
  withCredentials: true,  // ← transmet le cookie de session
});
```

---

## Routes Angular liées à l'authentification

| Route | Composant | Description |
|---|---|---|
| `/login` | `Login` | Formulaire email/mdp + bouton Google |
| `/signup` | `Signup` | Formulaire email/mdp + bouton Google |
| `/check-email` | `CheckEmail` | Page d'attente après inscription |
| `/verify-email` | `VerifyEmail` | Traitement du lien de vérification |
| `/forgot-password` | `ForgotPassword` | Formulaire de demande de reset |
| `/reset-password` | `ResetPassword` | Formulaire du nouveau mot de passe |

---

## Gestion des erreurs d'authentification

Les composants mappent les codes HTTP vers des messages lisibles :

```typescript
private mapError(err: any): string {
  const status = err?.status;
  if (status === 401 || status === 403)
    return 'Session expirée. Veuillez vous reconnecter.';
  if (status === 409)
    return 'Un compte avec cette adresse e-mail existe déjà.';
  if (status === 400)
    return 'Données invalides. Vérifiez les champs.';
  if (status === 0 || status >= 500)
    return 'Serveur indisponible. Réessayez plus tard.';
  return err?.error?.message || 'Une erreur est survenue.';
}
```