# Routing — NestHome Frontend

## Configuration des routes

**Fichier :** `src/app/app.routes.ts`

```typescript
export const routes: Routes = [
  { path: '',                    component: MainPage             },
  { path: 'catalogue',           component: MainPage             },
  { path: 'favoris',             component: Favorites            },
  { path: 'login',               component: Login                },
  { path: 'verify-email',        component: VerifyEmail          },
  { path: 'check-email',         component: CheckEmail           },
  { path: 'signup',              component: Signup               },
  { path: 'forgot-password',     component: ForgotPassword       },
  { path: 'reset-password',      component: ResetPassword        },
  { path: 'profile',             component: Profile              },
  { path: 'real-estate/:id',     component: PropertyPage         },
  { path: 'management',          component: ManagementPage       },
  { path: 'management/new',      component: PropertyFormPage     },
  { path: 'management/:id/edit', component: PropertyFormPage     },
  { path: 'reservations/my',     component: MyReservations       },
  { path: 'admin/users',         component: UserManagement       },
  { path: 'reservations/manage', component: ReservationManagement},
  { path: 'payments/manage',     component: PaymentManagement    },
  { path: 'contracts/manage',    component: ContractManagement   },
  { path: 'stats',               component: StatsPage            },
  { path: '**',                  redirectTo: ''                  },
];
```

---

## Tableau des routes

| Route | Composant | Accès | Description |
|---|---|---|---|
| `/` | `MainPage` | Public | Catalogue avec filtres et pagination |
| `/catalogue` | `MainPage` | Public | Alias de `/` |
| `/real-estate/:id` | `PropertyPage` | Public | Fiche détaillée d'un bien |
| `/favoris` | `Favorites` | Authentifié | Biens sauvegardés |
| `/login` | `Login` | Public | Formulaire de connexion (email + Google) |
| `/signup` | `Signup` | Public | Formulaire d'inscription (email + Google) |
| `/check-email` | `CheckEmail` | Public | Page d'attente après inscription |
| `/verify-email` | `VerifyEmail` | Public | Traitement du lien de vérification email |
| `/forgot-password` | `ForgotPassword` | Public | Demande de réinitialisation du mot de passe |
| `/reset-password` | `ResetPassword` | Public | Formulaire du nouveau mot de passe |
| `/profile` | `Profile` | Authentifié | Profil utilisateur |
| `/reservations/my` | `MyReservations` | Authentifié | Mes réservations de visites |
| `/management` | `ManagementPage` | Agent / Admin | Liste de gestion des biens |
| `/management/new` | `PropertyFormPage` | Agent / Admin | Créer un bien |
| `/management/:id/edit` | `PropertyFormPage` | Agent / Admin | Modifier un bien |
| `/reservations/manage` | `ReservationManagement` | Agent / Admin | Gérer toutes les réservations |
| `/payments/manage` | `PaymentManagement` | Agent / Admin | Gérer les paiements |
| `/contracts/manage` | `ContractManagement` | Agent / Admin | Gérer les contrats |
| `/admin/users` | `UserManagement` | Admin | Gérer les comptes utilisateurs |
| `/stats` | `StatsPage` | Agent / Admin | Tableau de bord |
| `**` | — | — | Redirect vers `/` |

---

## Routes du flux d'authentification email

Ces routes forment le tunnel complet email/mdp + vérification + reset :

```
/signup
    │ (après succès)
    ▼
/check-email  ←── page d'attente (consulter sa boîte mail)
    │
    │  (clic sur le lien reçu par mail)
    ▼
/verify-email?token=<TOKEN>  ←── traitement automatique
    │ (succès → redirection auto après 3s)
    ▼
/login

/login
    │ (lien "Mot de passe oublié ?")
    ▼
/forgot-password
    │ (envoi du mail)
    │  (clic sur le lien reçu par mail)
    ▼
/reset-password?token=<TOKEN>  ←── formulaire nouveau mot de passe
    │ (succès → redirection auto après 3.5s)
    ▼
/login
```

---

## Route `/real-estate/:id` vs `/bien/:id`

Le backend utilise le préfixe `/real-estate`. Le frontend utilise aussi `/real-estate/:id` pour la fiche d'un bien. La navbar et les cards naviguent avec :

```typescript
// PropertyCard
[routerLink]="['/real-estate', property.id]"

// PropertyPage (retour)
goBack(): void { this.router.navigate(['/catalogue']); }
```

---

## PropertyFormPage — mode create / edit

Le même composant sert à la fois pour la création et la modification. Le mode est déterminé par la présence du paramètre `:id` dans l'URL :

```typescript
ngOnInit(): void {
  this.routeSub = this.route.params.subscribe(params => {
    this.propertyId = params['id'] ?? null;
    this.mode       = this.propertyId ? 'edit' : 'create';
    // ...
  });
}
```

Le template adapte les libellés, les actions et le comportement de soumission selon `mode`.

---

## Navigation avec queryParams

Le Hero envoie des filtres via `queryParams` lors d'une recherche :

```typescript
// Hero
this.router.navigate(['/catalogue'], {
  queryParams: {
    address: 'Tunis',
    status: RealEstateStatus.FOR_SALE,
  }
});

// MainPage reçoit via ActivatedRoute
this.route.queryParams.subscribe(params => {
  this.activeFilters = {
    status: params['status'] !== undefined
      ? Number(params['status'])
      : null,
    address: params['address'] ?? '',
    // ...
  };
});
```

---

## Liens actifs dans la navbar

La navbar utilise `routerLinkActive` avec `routerLinkActiveOptions` pour marquer la route active :

```html
<a
  class="navbar__link"
  [routerLink]="link.routerLink"
  routerLinkActive="active"
  [routerLinkActiveOptions]="{ exact: !!link.exact }"
>
```

La route `/` utilise `exact: true` pour éviter que toutes les routes la déclenchent.

---

## Gestion du wildcard

Toute URL inconnue redirige vers `/` (le catalogue) via `{ path: '**', redirectTo: '' }`.

---

## Guards

Il n'y a pas de `CanActivate` guards explicites dans ce projet. L'accès aux routes privées est contrôlé au niveau du **template** et du **service** : si `user$` retourne `null`, les fonctionnalités sont masquées ou redirigées manuellement.

```typescript
// PropertyPage — vérification dans ngOnInit
const id = this.route.snapshot.paramMap.get('id');
if (!id) { this.router.navigate(['/catalogue']); return; }
```

```typescript
// Profile — redirige après suppression du compte
onAccountDeleted(): void {
  this.authService.logout().then(() => {
    this.router.navigate(['/']);
  });
}
```

```typescript
// ResetPassword — redirige après succès
setTimeout(() => this.router.navigate(['/login']), 3500);

// VerifyEmail — redirige après succès
setTimeout(() => this.router.navigate(['/login']), 2000);
```