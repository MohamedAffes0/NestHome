# Skeleton Loading — NestHome Frontend

## Vue d'ensemble

NestHome utilise des **squelettes animés** (skeleton screens) à la place des spinners pour tous les chargements de listes et de pages. Cette approche réduit la perception d'attente en présentant le gabarit de la page avant que les données arrivent.

---

## Principe

```
État loading = true
      │
      ▼
Afficher N éléments skeleton (hauteur fixe, animation shimmer)
      │
      ▼ (données reçues)
État loading = false
      │
      ▼
Afficher les vrais composants
```

Chaque skeleton reproduit approximativement la forme et la taille de l'élément réel qu'il remplace.

---

## Animation shimmer

Définie dans `src/styles/_animations.css` :

```css
@keyframes shimmer {
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
}
```

Appliquée via le gradient qui se déplace de gauche à droite :

```css
.skeleton-element {
  background: linear-gradient(
    90deg,
    var(--gray-100) 25%,
    var(--gray-50)  50%,
    var(--gray-100) 75%
  );
  background-size: 200% center;
  animation: shimmer 1.4s infinite;
  border-radius: var(--radius-xl);
}
```

---

## Inventaire des skeletons

### MainPage — Catalogue

```html
<!-- 6 cartes skeleton en grille 3 colonnes -->
<div class="home__grid" *ngIf="loading">
  <div class="home__skeleton" *ngFor="let i of [1,2,3,4,5,6]"></div>
</div>
```

```css
.home__skeleton {
  height: 340px;
  border-radius: var(--radius-xl);
  /* shimmer */
}
```

### Favorites

```html
<div class="fav-grid" *ngIf="loading">
  <div class="fav-skeleton" *ngFor="let i of [1,2,3,4,5,6]"></div>
</div>
```

```css
.fav-skeleton { height: 340px; border-radius: var(--radius-xl); }
```

### ManagementPage

```html
<div class="gestion-grid" *ngIf="loading">
  <div class="gestion-skeleton" *ngFor="let i of [1,2,3,4,5,6]"></div>
</div>
```

```css
.gestion-skeleton { height: 300px; border-radius: var(--radius-xl); }
```

### MyReservations

```html
<div class="mr-list" *ngIf="loading">
  <div class="mr-skeleton" *ngFor="let i of [1,2,3]"></div>
</div>
```

```css
.mr-skeleton { height: 120px; border-radius: var(--radius-xl); }
```

### PaymentManagement

```html
<div class="pm-list" *ngIf="loading">
  <div class="pm-skeleton" *ngFor="let i of [1,2,3,4,5]"></div>
</div>
```

```css
.pm-skeleton { height: 110px; border-radius: var(--radius-xl); }
```

### UserManagement

```html
<div class="um-grid" *ngIf="loading">
  <div class="um-skeleton" *ngFor="let i of [1,2,3,4,5,6]"></div>
</div>
```

```css
.um-skeleton { height: 170px; border-radius: var(--radius-xl); }
```

### PropertyFormPage — Chargement du bien en mode édition

```html
<div class="pfp-loading" *ngIf="loading">
  <div class="container">
    <div class="pfp-skeleton pfp-skeleton--header"></div>    <!-- 80px  -->
    <div class="pfp-skeleton pfp-skeleton--section"></div>   <!-- 260px -->
    <div class="pfp-skeleton pfp-skeleton--section"></div>   <!-- 260px -->
  </div>
</div>
```

### PropertyPage — Fiche détaillée

```html
<div class="pp-loading" *ngIf="loading">
  <div class="container">
    <div class="pp-skeleton pp-skeleton--breadcrumb"></div>  <!-- 20px  -->
    <div class="pp-skeleton pp-skeleton--gallery"></div>     <!-- 16/9  -->
    <div class="pp-skeleton pp-skeleton--details"></div>     <!-- 300px -->
  </div>
</div>
```

### StatsPage

```html
<!-- Grille de 6 KPI cards -->
<div class="sp__skeleton-grid" *ngIf="loading">
  <div class="sp__skeleton sp__skeleton--kpi" *ngFor="let i of [1,2,3,4,5,6]"></div>
</div>

<!-- 2 graphiques -->
<div class="sp__skeleton-rows" *ngIf="loading">
  <div class="sp__skeleton sp__skeleton--chart"></div>
  <div class="sp__skeleton sp__skeleton--chart"></div>
</div>
```

```css
.sp__skeleton--kpi   { height: 100px; }
.sp__skeleton--chart { height: 280px; }
```

### UnpaidContracts (widget dans ContractManagement)

```html
<div class="uc__skeleton" *ngIf="loading">
  <div class="uc__skeleton-bar"></div>
</div>
```

```css
.uc__skeleton-bar { height: 48px; border-radius: var(--radius-lg); }
```

---

## Pattern dans les composants

Tous les composants suivent le même cycle :

```typescript
export class MyPage implements OnInit {
  loading = true;   // ← true par défaut, skeleton visible immédiatement
  data: Item[] = [];
  errorMsg = '';

  ngOnInit(): void {
    this.myService.getAll().subscribe({
      next: (items) => {
        this.data    = items;
        this.loading = false;   // ← skeleton masqué, données affichées
      },
      error: () => {
        this.loading  = false;  // ← skeleton masqué, erreur affichée
        this.errorMsg = 'Impossible de charger les données.';
      },
    });
  }
}
```

```html
<!-- Skeleton -->
<div *ngIf="loading"> ... </div>

<!-- Erreur -->
<div *ngIf="!loading && errorMsg"> ... </div>

<!-- Contenu -->
<div *ngIf="!loading && !errorMsg && data.length > 0"> ... </div>

<!-- Empty state -->
<div *ngIf="!loading && !errorMsg && data.length === 0"> ... </div>
```

---

## Responsive des skeletons

Les skeletons s'adaptent aux mêmes breakpoints que leurs homologues réels :

```css
/* Catalogue */
@media (max-width: 1024px) { .home__skeleton { height: 300px; } }

/* Favoris */
@media (max-width: 1024px) { .fav-skeleton { height: 300px; } }
```
