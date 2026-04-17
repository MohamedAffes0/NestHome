# Architecture — NestHome Frontend

## Stack technique

| Couche | Technologie | Version | Rôle |
|---|---|---|---|
| **Framework** | Angular | 19+ | Framework frontend principal |
| **Langage** | TypeScript | 5+ | Typage statique |
| **Authentification** | Better Auth Client | latest | Sessions HTTP-only |
| **Charts** | Chart.js | latest | Graphiques statistiques |
| **PDF** | html2pdf.js | latest | Génération de reçus et contrats |
| **Cartes** | OpenStreetMap (iframe) | — | Localisation des biens |
| **Styles** | CSS custom (variables) | — | Design system maison |
| **Fonts** | Google Fonts | — | Playfair Display + Inter |

---

## Architecture globale

NestHome Frontend suit une architecture **Feature-Based** avec une séparation nette entre les couches `core`, `features` et `shared`.

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (Angular SPA)                 │
│                    http://localhost:4200                  │
│                                                          │
│  ┌──────────┐  ┌──────────────────────────────────────┐ │
│  │  Router  │  │              Features                 │ │
│  │ (Routes) │  │  main-page · property-page · profile  │ │
│  │          │  │  management · reservations · stats    │ │
│  └────┬─────┘  └────────────────┬─────────────────────┘ │
│       │                         │                        │
│  ┌────▼──────────────────────────▼────────────────────┐  │
│  │                   Shared Components                 │  │
│  │  Navbar · Filter · Cards · Modals · Forms · Charts │  │
│  └──────────────────┬──────────────────────────────────┘ │
│                     │                                    │
│  ┌──────────────────▼──────────────────────────────────┐ │
│  │                   Core Services                      │ │
│  │  AuthService · RealEstateService · UserService      │ │
│  │  ReservationService · ContractService · etc.        │ │
│  └──────────────────┬──────────────────────────────────┘ │
└─────────────────────┼────────────────────────────────────┘
                      │ HTTP + withCredentials (cookies)
┌─────────────────────▼────────────────────────────────────┐
│                NestJS API — http://localhost:3000          │
└──────────────────────────────────────────────────────────┘
```

---

## Flux d'une requête utilisateur

```
Action utilisateur (clic, formulaire...)
         │
         ▼
[1] Component handler (feature page ou shared component)
         │
         ▼
[2] Service (core/services)
      └── HttpClient.get/post/patch/delete
          withCredentials: true  ← envoie le cookie de session
         │
         ▼
[3] NestJS API — traitement + réponse JSON
         │
         ▼
[4] Service — mapping vers interface TypeScript
         │
         ▼
[5] Component — mise à jour du template
      └── ChangeDetectorRef.detectChanges() ou markForCheck()
         │
         ▼
[6] Angular Renderer — DOM mis à jour
```

---

## Stratégie de Change Detection

Le projet utilise **Zoneless Change Detection** (`provideZonelessChangeDetection()`) combiné à `ChangeDetectionStrategy.OnPush` sur les composants critiques.

```
appConfig
  └── provideZonelessChangeDetection()   ← pas de Zone.js

Composants à fort trafic (OnPush) :
  ContractManagement
  ContractAddModal
  PaymentAddModal
  PaymentCard
  ContractCard
```

Dans les composants `OnPush`, les mises à jour se font via `cdr.markForCheck()` ou `cdr.detectChanges()` après chaque changement de state.

---

## Gestion de l'état

Il n'y a pas de store global (NgRx, Akita...). L'état est géré via des **BehaviorSubjects** dans les services :

```typescript
// AuthService
private userSubject = new BehaviorSubject<User | null>(null);
public  user$       = this.userSubject.asObservable();

// FavoriteService
private favoritedIds = new BehaviorSubject<Set<string>>(new Set());
public  favoritedIds$ = this.favoritedIds.asObservable();
```

Les composants s'abonnent à ces observables via `AsyncPipe` (template) ou `.subscribe()` (TypeScript).

---

## Communication Parent → Enfant

```
Sens          Mécanisme              Exemple
──────────────────────────────────────────────────────────
Parent → Enfant    @Input()          [property]="item"
Enfant → Parent    @Output()         (delete)="onDelete($event)"
Parent → Enfant    @ViewChild()      reservationComp.markSuccess()
Service global     BehaviorSubject   favoritedIds$ | async
```

---

## Architecture des features

Chaque feature est un **composant standalone** avec sa propre logique :

```
features/
├── main-page/          ← Catalogue public + filtres + pagination
├── property-page/      ← Fiche détaillée d'un bien
├── property-form-page/ ← Création / modification d'un bien
├── management-page/    ← Grille d'administration des biens
├── favorites/          ← Favoris de l'utilisateur connecté
├── my-reservations/    ← Réservations de l'utilisateur
├── profile/            ← Profil utilisateur (infos/mdp/suppression)
├── login/              ← Authentification
├── signup/             ← Inscription
├── user-management/    ← Admin : gestion des comptes
├── reservation-management/ ← Agent/Admin : gestion des visites
├── contract-management/    ← Agent/Admin : gestion des contrats
├── payment-management/     ← Agent/Admin : gestion des paiements
└── stats-page/         ← Tableau de bord avec graphiques
```

---

## Architecture des shared components

```
shared/components/
├── alert/              ← Messages d'état (success/error/warning/info)
├── confirm-delete-modal/ ← Modal de confirmation générique
├── filter/             ← Sidebar de filtres pour le catalogue
├── hero/               ← Bannière d'accueil avec recherche
├── image-upload/       ← Upload d'image avec aperçu
├── location-map/       ← Carte OpenStreetMap (iframe)
├── navbar/             ← Navigation principale
├── pagination/         ← Pagination avec ellipsis
├── password-strength/  ← Indicateur de robustesse du mot de passe
├── contract/
│   ├── contract-add-modal/    ← Formulaire de création de contrat
│   ├── contract-card/         ← Carte d'un contrat avec PDF
│   └── unpaid-contracts/      ← Panneau des contrats impayés
├── payment/
│   ├── payment-add-modal/     ← Formulaire de création de paiement
│   └── payment-card/          ← Carte d'un paiement avec reçu
├── profile/
│   ├── profile-sidebar/       ← Navigation et avatar
│   ├── profile-info/          ← Formulaire infos personnelles
│   ├── profile-password/      ← Changement de mot de passe
│   └── profile-delete/        ← Suppression de compte
├── property/
│   ├── property-card/         ← Carte catalogue avec favoris
│   ├── management-card/       ← Carte admin avec edit/delete
│   ├── property-gallery/      ← Galerie + lightbox
│   ├── property-details/      ← Détails complets d'un bien
│   ├── property-comments/     ← Liste + formulaire de commentaires
│   ├── property-reservation/  ← Formulaire de réservation de visite
│   └── property-agent-card/   ← Carte de l'agent responsable
├── property-form/
│   ├── property-form-basic/   ← Champs principaux (titre, prix, type...)
│   ├── property-form-equipment/ ← Gestion des équipements
│   └── property-form-images/  ← Upload multi-images avec drag & drop
├── reservation/
│   ├── reservation-card/      ← Carte (vue utilisateur)
│   └── reservation-admin-card/ ← Carte (vue agent/admin)
├── stats/
│   ├── stats-kpi-cards/       ← Compteurs globaux
│   ├── stats-revenue-chart/   ← Graphique revenus (Line)
│   ├── stats-reservations-chart/ ← Bar + Donut
│   ├── stats-properties-chart/ ← Donut par statut
│   ├── stats-contracts-chart/ ← Bar empilé ventes/locations
│   └── stats-top-rated/       ← Top 5 biens notés
└── user/
    └── user-card/             ← Carte admin avec rôle et activation
```

---

## Génération de PDF

Deux services utilisent `html2pdf.js` pour générer des documents téléchargeables directement dans le navigateur :

**`PaymentReceiptService`** — reçu de paiement A4 (via `download(payment)`)

**`ContractReceiptService`** — contrat de vente ou de location A4 (via `download(contract)`)

Le principe : un HTML complet est construit en mémoire, injecté dans le DOM, converti en PDF via `html2canvas` + `jsPDF`, puis le nœud DOM est supprimé.

---

## Patterns Angular utilisés

| Pattern | Usage |
|---|---|
| **Standalone Components** | Tous les composants (pas de NgModules) |
| **OnPush Change Detection** | Composants à mise à jour fréquente |
| **BehaviorSubject** | État partagé entre services et composants |
| **@ViewChild** | Accès aux méthodes publiques d'enfants |
| **Custom Decorators (Pipe)** | `SafeHtmlPipe` dans la navbar |
| **HostListener** | Scroll (navbar), clavier (lightbox, menu) |
| **forkJoin** | Chargement parallèle des stats |
| **debounceTime + distinctUntilChanged** | Recherche textuelle dans ContractManagement |
| **takeUntil** | Désabonnement propre dans OnDestroy |
