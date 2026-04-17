# Guide de développement — NestHome Frontend

## Conventions de nommage

| Élément | Convention | Exemple |
|---|---|---|
| Fichiers composants | `kebab-case` | `property-card.ts` |
| Classes TypeScript | `PascalCase` | `PropertyCard` |
| Sélecteurs Angular | `app-kebab-case` | `app-property-card` |
| Méthodes | `camelCase` | `toggleFavorite()` |
| Variables | `camelCase` | `currentUser` |
| Interfaces | `PascalCase` | `RealEstateWithStats` |
| Enums | `PascalCase` | `RealEstateStatus` |
| Valeurs enum | `UPPER_SNAKE` | `FOR_SALE` |
| Constantes | `UPPER_SNAKE` | `MAX_PHOTOS` |
| Classes CSS | `kebab-case` BEM | `card__image-wrap` |

---

## Structure d'un composant type

```typescript
@Component({
  selector:    'app-my-component',
  standalone:  true,
  imports:     [CommonModule, FormsModule],
  templateUrl: './my-component.html',
  styleUrls:   ['./my-component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush, // si fréquemment mis à jour
})
export class MyComponent implements OnInit, OnDestroy {

  // ── Inputs / Outputs ─────────────────────────────────
  @Input() data!: SomeModel;
  @Output() deleted = new EventEmitter<void>();

  // ── State ─────────────────────────────────────────────
  loading  = false;
  errorMsg = '';

  // ── Subscriptions ─────────────────────────────────────
  private destroy$ = new Subject<void>();

  constructor(
    private myService: MyService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.myService.getData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.data    = data;
          this.loading = false;
          this.cdr.markForCheck(); // si OnPush
        },
        error: (err) => {
          this.errorMsg = 'Erreur de chargement.';
          this.loading  = false;
          this.cdr.markForCheck();
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

---

## Créer un nouveau composant

```bash
# Composant dans shared
ng generate component shared/components/mon-composant --standalone

# Feature page
ng generate component features/ma-page --standalone
```

Ajouter la route dans `app.routes.ts` si c'est une page :

```typescript
{ path: 'ma-page', component: MaPage }
```

---

## Créer un nouveau service

```bash
ng generate service core/services/mon-service
```

Exporter depuis `src/app/core/services/index.ts` :

```typescript
export * from './mon-service.service';
```

---

## Ajouter un modèle TypeScript

Créer un fichier dans `src/app/core/models/mon-model.model.ts`, puis exporter depuis `src/app/core/models/index.ts` :

```typescript
export * from './mon-model.model';
```

---

## Règles de Change Detection

Les composants qui reçoivent des données via HTTP utilisent `ChangeDetectorRef` :

```typescript
// Après chaque mutation du state
this.data = response;
this.cdr.detectChanges();   // déclenche immédiatement
// ou
this.cdr.markForCheck();    // planifie la vérification (OnPush)
```

Utiliser `markForCheck()` dans les composants `OnPush`, `detectChanges()` dans les composants standard.

---

## Gestion des subscriptions

Toujours désabonner pour éviter les fuites mémoire :

```typescript
// Méthode 1 — takeUntil (recommandé pour plusieurs subs)
private destroy$ = new Subject<void>();

ngOnInit(): void {
  this.service.data$
    .pipe(takeUntil(this.destroy$))
    .subscribe(...);
}

ngOnDestroy(): void {
  this.destroy$.next();
  this.destroy$.complete();
}

// Méthode 2 — stocker la subscription
private sub!: Subscription;

ngOnInit():  void { this.sub = this.service.data$.subscribe(...); }
ngOnDestroy(): void { this.sub?.unsubscribe(); }
```

---

## Uploads de fichiers (FormData)

Pour envoyer des fichiers via HttpClient :

```typescript
const formData = new FormData();
formData.append('images', file);      // fichier
formData.append('title', 'Mon bien'); // champ texte
formData.append('price', '500000');   // toujours string dans FormData

this.http.post<RealEstate>(url, formData, { withCredentials: true });
// Ne pas ajouter Content-Type : HttpClient le détecte automatiquement
```

---

## Flash messages

Le pattern standard pour les messages temporaires :

```typescript
flashMsg  = '';
flashType: 'success' | 'error' = 'success';
private flashTimer?: ReturnType<typeof setTimeout>;

private flash(msg: string, type: 'success' | 'error'): void {
  this.flashMsg  = msg;
  this.flashType = type;
  clearTimeout(this.flashTimer);
  this.flashTimer = setTimeout(() => {
    this.flashMsg = '';
    this.cdr.markForCheck();
  }, 3500);
  this.cdr.markForCheck();
}
```

---

## Pagination locale (côté client)

Pour les listes entièrement chargées (ex: ContractManagement) :

```typescript
currentPage = 1;
readonly pageSize = 10;

get totalPages(): number {
  return Math.max(1, Math.ceil(this.filtered.length / this.pageSize));
}

get pagedItems(): Contract[] {
  const start = (this.currentPage - 1) * this.pageSize;
  return this.filtered.slice(start, start + this.pageSize);
}

goToPage(p: number): void {
  if (p < 1 || p > this.totalPages) return;
  this.currentPage = p;
  this.cdr.markForCheck();
}
```

---

## Recherche avec debounce

```typescript
private search$ = new Subject<string>();
private destroy$ = new Subject<void>();

ngOnInit(): void {
  this.search$
    .pipe(debounceTime(350), distinctUntilChanged(), takeUntil(this.destroy$))
    .subscribe(() => {
      this.currentPage = 1;
      this.cdr.markForCheck();
    });
}

onSearchInput(val: string): void {
  this.searchQuery = val;
  this.search$.next(val);
}
```

---

## Checklist de qualité

Avant de soumettre un composant, vérifier :

- [ ] `takeUntil(this.destroy$)` sur toutes les subscriptions longues
- [ ] `ngOnDestroy()` implémenté si des subscriptions existent
- [ ] `cdr.markForCheck()` ou `cdr.detectChanges()` après chaque mutation dans les composants OnPush
- [ ] `withCredentials: true` sur tous les appels HTTP authentifiés
- [ ] Messages d'erreur utilisateur lisibles (pas de messages techniques)
- [ ] États `loading`, `errorMsg` gérés dans chaque appel HTTP
- [ ] Spinner visible pendant les opérations async
- [ ] Bouton désactivé pendant `loading = true`
- [ ] Pas de `console.log` en production
