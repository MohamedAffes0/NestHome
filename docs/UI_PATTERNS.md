# Patterns UI — NestHome Frontend

Ce document couvre les patterns visuels transversaux : spinners, modaux, flash messages, animations CSS, timers et transitions.

---

## Timers et auto-dismiss

### Flash messages (3 – 3.5 secondes)

Les messages de succès ou d'erreur disparaissent automatiquement. Le timer est stocké pour être annulable si un nouveau message arrive avant la fin :

```typescript
private flashTimer?: ReturnType<typeof setTimeout>;

private flash(msg: string, type: 'success' | 'error'): void {
  this.flashMsg  = msg;
  this.flashType = type;
  clearTimeout(this.flashTimer);            // annule l'ancien timer
  this.flashTimer = setTimeout(() => {
    this.flashMsg = '';
    this.cdr.markForCheck();
  }, 3500);
  this.cdr.markForCheck();
}
```

Les composants avec `ngOnDestroy` nettoient le timer :

```typescript
ngOnDestroy(): void {
  clearTimeout(this.flashTimer);
}
```

### Messages d'erreur courts (3 secondes)

Dans les formulaires simples (login, signup, profil) :

```typescript
showError(message: string): void {
  this.errorMessage = message;
  setTimeout(() => {
    this.errorMessage = '';
    this.cdr.detectChanges();
  }, 3000);
}
```

---

## Spinner

### Spinner global (rotation CSS)

Défini dans `_auth.css` et réutilisé partout :

```css
.auth-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

### Variante petite (bouton danger)

```css
.spinner--sm {
  width: 14px;
  height: 14px;
  border-width: 2px;
}
```

### Usage dans les boutons

```html
<button type="submit" [disabled]="isLoading">
  <span class="auth-spinner" *ngIf="isLoading"></span>
  <svg *ngIf="!isLoading" ...><!-- icône --></svg>
  {{ isLoading ? 'Enregistrement...' : 'Enregistrer' }}
</button>
```

Le texte change en même temps que le spinner apparaît pour indiquer clairement l'action en cours.

---

## Modaux

### Overlay + modal centré

Tous les modaux suivent la même structure CSS :

```css
/* Overlay */
.cm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(10, 15, 30, 0.55);
  z-index: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  animation: fadeIn .15s ease;
}

/* Modal */
.cm-modal {
  background: var(--white);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-xl);
  animation: scaleIn .2s ease;
}

@keyframes fadeIn  { from { opacity: 0; }              to { opacity: 1; } }
@keyframes scaleIn { from { transform: scale(.95); opacity: 0; }
                     to   { transform: scale(1);   opacity: 1; } }
```

### Fermeture au clic sur l'overlay

Pattern standard dans tous les modaux :

```html
<div class="overlay" (click)="onOverlayClick()">
  <div class="modal" (click)="$event.stopPropagation()">
    <!-- contenu -->
  </div>
</div>
```

```typescript
onOverlayClick(): void {
  if (!this.loading) this.close.emit(); // pas de fermeture pendant une opération
}
```

### Z-index des modaux

```
Navbar             z-index: 100
Dropdowns navbar   z-index: 200
Modaux feature     z-index: 500
Flash messages RM  z-index: 9999
```

---

## Animations CSS globales

Définies dans `src/styles/_animations.css` :

### fadeInUp

```css
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up { animation: fadeInUp 0.5s ease both; }
```

Utilisée pour : modaux, KPI cards (stats page avec `animation-delay` progressif).

### float

```css
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-8px); }
}
.animate-float { animation: float 3s ease-in-out infinite; }
```

Utilisée pour : les cartes flottantes dans le Hero (`hero__float-card`).

### shimmer

```css
@keyframes shimmer {
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
}
```

Utilisée pour : tous les skeletons de chargement.

---

## Transitions des composants interactifs

### Hover sur les cartes

```css
.card {
  transition: transform var(--transition-base), box-shadow var(--transition-base);
}
.card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
}
```

### Hover sur les images dans les cartes

```css
.card__image { transition: transform var(--transition-slow); }
.card:hover .card__image { transform: scale(1.04); }
```

### Boutons

```css
.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-lg);
}
```

### Chevrons (dropdowns, accordéons)

```css
.chevron { transition: transform var(--transition-fast); }
.chevron--open { transform: rotate(180deg); }
```

---

## Variables de transition

```css
--transition-fast: 150ms ease;
--transition-base: 250ms ease;
--transition-slow: 400ms ease;
```

Utilisées systématiquement via `var(--transition-*)` pour une cohérence globale.

---

## Navbar — comportements dynamiques

### Ombre au scroll

```typescript
@HostListener('window:scroll')
onScroll(): void {
  this.isScrolled = window.scrollY > 10;
}
```

```css
.navbar--scrolled { box-shadow: var(--shadow-md); }
```

### Fermeture au clic extérieur

```typescript
@HostListener('document:click', ['$event'])
onDocumentClick(event: MouseEvent): void {
  const t = event.target as HTMLElement;
  if (!t.closest('.navbar__avatar-wrap'))
    this.isProfileDropdownOpen = false;
  if (!t.closest('.navbar__hamburger') && !t.closest('.navbar__mobile-menu'))
    this.isMobileMenuOpen = false;
}
```

---

## Lightbox (galerie photos)

### Ouverture/fermeture avec overflow

```typescript
open():  void { this.lightbox = true;  document.body.style.overflow = 'hidden'; }
close(): void { this.lightbox = false; document.body.style.overflow = ''; }
```

Bloquer le scroll du body empêche le défilement de la page en arrière-plan pendant la lightbox.

### Navigation clavier

```typescript
@HostListener('document:keydown', ['$event'])
onKey(e: KeyboardEvent): void {
  if (!this.lightbox) return;
  if (e.key === 'ArrowLeft')  this.prev();
  if (e.key === 'ArrowRight') this.next();
  if (e.key === 'Escape')     this.close();
}
```

---

## Drag & Drop (réorganisation des images)

Dans `PropertyFormImages`, les images peuvent être réorganisées par glisser-déposer natif HTML5 :

```typescript
dragIndex: number | null = null;

onItemDragStart(i: number): void { this.dragIndex = i; }

onItemDrop(targetIndex: number): void {
  if (this.dragIndex === null || this.dragIndex === targetIndex) return;
  const arr = [...this.items];
  const [moved] = arr.splice(this.dragIndex, 1);
  arr.splice(targetIndex, 0, moved);
  this.items = arr;
  this.dragIndex = null;
  this.emit();
}
```

```html
<div
  draggable="true"
  (dragstart)="onItemDragStart(i)"
  (dragover)="$event.preventDefault()"
  (drop)="onItemDrop(i)"
>
```

```css
.pfi__thumb          { cursor: grab; }
.pfi__thumb:active   { cursor: grabbing; }
```

---

## Indicateur de force du mot de passe

**Composant :** `PasswordStrength`

4 barres colorées progressives calculées en temps réel :

```typescript
get strength(): number {
  let s = 0;
  if (p.length >= 8)           s++;  // longueur
  if (/[A-Z]/.test(p))         s++;  // majuscule
  if (/[0-9]/.test(p))         s++;  // chiffre
  if (/[^A-Za-z0-9]/.test(p))  s++;  // caractère spécial
  return s; // 0 à 4
}
```

```css
.pw-strength__bar--weak   { background: #ef4444; }
.pw-strength__bar--fair   { background: #f97316; }
.pw-strength__bar--good   { background: #eab308; }
.pw-strength__bar--strong { background: #22c55e; }
```

Labels : `Faible` · `Moyen` · `Bon` · `Fort`

---

## Barre de couleur sur les cards de statut

Les cartes de réservation et de contrat utilisent une fine barre colorée sur le bord gauche pour indiquer visuellement le statut sans lire le badge :

```css
/* ReservationCard */
.rc::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 4px;
}
.rc__status--pending::before   { background: var(--gold-500); }
.rc__status--confirmed::before { background: var(--color-success); }
.rc__status--cancelled::before { background: var(--gray-300); }

/* ContractCard */
.cc__accent--rental { background: #2563eb; }
.cc__accent--sale   { background: #16a34a; }
```
