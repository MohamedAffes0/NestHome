# Gestion des erreurs — NestHome Frontend

## Vue d'ensemble

NestHome centralise la gestion des erreurs à trois niveaux : le composant `Alert`, les méthodes `mapError()` locales dans chaque composant, et les états visuels dédiés (pages d'erreur, messages inline).

---

## Composant Alert

**Fichier :** `src/app/shared/components/alert/alert.ts`

Composant générique réutilisé dans toute l'application pour afficher des messages d'état.

```typescript
@Input() type:    AlertType = 'info';   // 'success' | 'error' | 'warning' | 'info' | 'time'
@Input() message: string    = '';
@Input() show:    boolean   = true;
```

### Variantes visuelles

| Type | Fond | Bordure | Usage |
|---|---|---|---|
| `success` | Vert clair `#f0fdf4` | `#bbf7d0` | Opération réussie |
| `error` | Rouge clair `#fef2f2` | `#fecaca` | Erreur HTTP, validation |
| `warning` | Orange clair `#fff7ed` | `#fed7aa` | Avertissement (suppression compte) |
| `info` | Navy clair | `--navy-100` | Information neutre |
| `time` | Gold clair | `--gold-100` | Créneau horaire de réservation |

### Utilisation

```html
<app-alert type="error"   [message]="errorMsg"   />
<app-alert type="success" [message]="successMsg" />
<app-alert type="warning" message="Action irréversible." />
```

L'alerte n'est rendue que si `message` est non vide et `show` est `true` — pas besoin de `*ngIf` dans le parent.

---

## Pattern d'erreur dans les composants

### 1. Erreur de chargement initial

Affiché à la place du contenu lorsque l'appel HTTP initial échoue :

```html
<!-- Erreur de chargement (page entière) -->
<div class="home__error" *ngIf="!loading && errorMsg">
  <svg ...><!-- icône --></svg>
  <h3>Erreur de chargement</h3>
  <p>{{ errorMsg }}</p>
  <button class="btn btn-primary" (click)="loadProperties()">
    Réessayer
  </button>
</div>
```

### 2. Erreur d'action (formulaire, suppression...)

Affiché dans la section concernée, disparaît après 3 secondes :

```typescript
private showError(msg: string): void {
  this.errorMsg = msg;
  setTimeout(() => {
    this.errorMsg = '';
    this.cdr.detectChanges();
  }, 3000);
}
```

### 3. Flash message d'erreur (management pages)

Pour les actions non bloquantes (suppression, mise à jour de statut) :

```typescript
private flash(msg: string, type: 'success' | 'error'): void {
  this.flashMsg  = msg;
  this.flashType = type;
  clearTimeout(this.flashTimer);
  this.flashTimer = setTimeout(() => {
    this.flashMsg = '';
    this.cdr.markForCheck();
  }, 3500);
}
```

---

## Mapping des codes HTTP

Chaque composant implémente sa propre méthode `mapError()` qui traduit les codes HTTP en messages lisibles par l'utilisateur :

```typescript
private mapError(err: any, fallback = 'Une erreur est survenue.'): string {
  const status  = err?.status;
  const raw     = err?.error?.message ?? err?.message ?? '';
  const message = Array.isArray(raw) ? raw.join(', ') : String(raw);

  if (status === 401 || status === 403)
    return 'Session expirée. Veuillez vous reconnecter.';
  if (status === 404)
    return 'Ressource introuvable.';
  if (status === 409 || message.toLowerCase().includes('exist'))
    return 'Un enregistrement avec ces informations existe déjà.';
  if (status === 400)
    return message || 'Données invalides. Vérifiez les champs.';
  if (status === 0 || status >= 500)
    return 'Serveur indisponible. Réessayez plus tard.';
  return message || fallback;
}
```

### Codes HTTP et messages associés

| Code HTTP | Message utilisateur |
|---|---|
| `400` | Message de validation du backend, ou "Données invalides" |
| `401` | "Session expirée. Veuillez vous reconnecter." |
| `403` | "Session expirée. Veuillez vous reconnecter." |
| `404` | "Ressource introuvable." |
| `409` | "Un enregistrement avec ces informations existe déjà." |
| `429` | "Trop de tentatives. Veuillez patienter." |
| `0` | "Serveur indisponible. Réessayez plus tard." |
| `5xx` | "Serveur indisponible. Réessayez plus tard." |

---

## Erreurs spécifiques par contexte

### Réservations (PropertyPage)

```typescript
private mapReservationError(err: any): string {
  const lower = message.toLowerCase();
  if (status === 409 || lower.includes('exist'))
    return 'Vous avez déjà une réservation en attente pour ce bien.';
  // ...
}
```

### Authentification (Login / Signup)

```typescript
// Signup — email déjà utilisé
if (status === 409 || message.toLowerCase().includes('exist') || message.toLowerCase().includes('already'))
  return 'Un compte avec cette adresse e-mail existe déjà.';

// Changement de mot de passe — ancien mdp incorrect
if (message.toLowerCase().includes('incorrect') || message.toLowerCase().includes('wrong'))
  return 'Mot de passe actuel incorrect.';
```

### Formulaire de bien (PropertyFormPage)

```typescript
private mapError(err: any, fallback: string): string {
  if (status === 400) return message || 'Données invalides. Vérifiez les champs.';
  // ...
}
```

---

## États visuels d'erreur

### Page d'erreur complète (non trouvé)

Utilisée dans `PropertyFormPage` quand le bien à éditer est introuvable :

```html
<div class="pfp-load-error" *ngIf="!loading && loadError">
  <div class="pfp-load-error__card">
    <svg ...><!-- icône --></svg>
    <p>{{ loadError }}</p>
    <button class="btn btn-primary" (click)="goBack()">Retour</button>
  </div>
</div>
```

### Erreur inline dans les modaux

Les modaux (ContractAddModal, PaymentAddModal...) affichent l'erreur directement dans le footer du modal sans le fermer :

```html
<p class="cam__error" *ngIf="error">{{ error }}</p>

<div class="cam__footer">
  <button (click)="close.emit()">Annuler</button>
  <button [disabled]="!canCreate || creating" (click)="submit()">
    Créer
  </button>
</div>
```

### Empty state vs erreur

Chaque liste distingue clairement les trois états :

```html
<!-- 1. Chargement -->
<div *ngIf="loading"><!-- skeleton --></div>

<!-- 2. Erreur réseau -->
<div *ngIf="!loading && errorMsg">
  <svg><!-- icône danger --></svg>
  <p>{{ errorMsg }}</p>
  <button (click)="load()">Réessayer</button>
</div>

<!-- 3. Liste vide (succès mais aucun résultat) -->
<div *ngIf="!loading && !errorMsg && items.length === 0">
  <svg><!-- icône neutre --></svg>
  <p>Aucun élément.</p>
</div>

<!-- 4. Contenu -->
<div *ngIf="!loading && !errorMsg && items.length > 0">
  <!-- cards -->
</div>
```

---

## Validation côté frontend

Avant tout appel HTTP, les formulaires valident les données localement pour éviter des appels inutiles :

```typescript
// Exemple : Signup
onSubmit(): void {
  if (!this.form.firstName.trim())
    { this.showError('Le prénom est obligatoire.'); return; }
  if (this.form.password.length < 8)
    { this.showError('Le mot de passe doit contenir au moins 8 caractères.'); return; }
  if (this.form.password !== this.form.confirm)
    { this.showError('Les mots de passe ne correspondent pas.'); return; }
  if (!this.form.terms)
    { this.showError("Vous devez accepter les conditions d'utilisation."); return; }

  // → appel HTTP seulement si tout est valide
  this.authService.signUp(...).subscribe(...);
}
```

### Indicateur visuel des champs invalides

La classe `input-group--error` est appliquée conditionnellement pour colorer la bordure en rouge :

```html
<div
  class="input-group"
  [class.input-group--error]="emailField.invalid && emailField.touched"
  [class.input-group--success]="emailField.valid && emailField.touched"
>
```

```css
.input-group--error   { border-color: var(--color-danger) !important; }
.input-group--success { border-color: var(--color-success) !important; }
```
