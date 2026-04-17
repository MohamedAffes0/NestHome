# Styles — NestHome Frontend

## Organisation

```
src/styles/
├── _variables.css    ← Design tokens (couleurs, typo, espacement, ombres)
├── _reset.css        ← Reset CSS + import Google Fonts
├── _animations.css   ← Keyframes globaux
├── _buttons.css      ← Classes boutons réutilisables
├── _badges.css       ← Badges, chips et filtres
├── _forms.css        ← Inputs, selects, labels
├── _utilities.css    ← Container, sections, helpers texte
└── _auth.css         ← Layout pages login/signup
```

Le fichier `src/styles.css` importe tous ces fichiers dans l'ordre.

Chaque composant possède son propre fichier CSS pour les styles scoped (`:host`, classes BEM).

---

## Design tokens (`_variables.css`)

### Couleurs

**Marine (Navy) — couleur principale :**

```css
--navy-900: #0a0f1e;
--navy-800: #111827;
--navy-700: #1a2744;
--navy-600: #1e3a6e;   /* ← couleur primaire */
--navy-500: #254f96;
--navy-400: #3b6ab5;
--navy-100: #dce8f8;
--navy-50:  #f0f5fd;
```

**Or (Gold) — couleur accent :**

```css
--gold-700: #8a6200;
--gold-600: #b07d00;
--gold-500: #d4a017;   /* ← accent principal */
--gold-400: #e8b830;
--gold-300: #f2cc6a;
--gold-100: #fdf3d0;
--gold-50:  #fffdf5;
```

**Neutrals :**

```css
--white:    #ffffff;
--gray-50:  #f8f9fb;
--gray-100: #f1f3f7;
--gray-200: #e2e6ee;
--gray-300: #c8cfdb;
--gray-400: #9aa3b2;
--gray-500: #6b7585;
--gray-600: #4a5264;
```

**Sémantiques :**

```css
--color-bg:           var(--gray-50);
--color-primary:      var(--navy-600);
--color-accent:       var(--gold-500);
--color-text-primary: var(--navy-800);
--color-text-muted:   var(--gray-400);
--color-border:       var(--gray-200);
--color-success:      #1a7f4e;
--color-danger:       #c0392b;
```

---

### Typographie

```css
--font-display: 'Playfair Display', Georgia, serif;  /* titres */
--font-body:    'Inter', system-ui, sans-serif;       /* corps */

--text-xs:   0.75rem;   /* 12px */
--text-sm:   0.875rem;  /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg:   1.125rem;  /* 18px */
--text-xl:   1.25rem;   /* 20px */
--text-2xl:  1.5rem;    /* 24px */
--text-3xl:  1.875rem;  /* 30px */
--text-4xl:  2.25rem;   /* 36px */
```

---

### Espacement

Échelle basée sur `0.25rem` (4px) :

```css
--space-1:  0.25rem;   /* 4px  */
--space-2:  0.5rem;    /* 8px  */
--space-3:  0.75rem;   /* 12px */
--space-4:  1rem;      /* 16px */
--space-5:  1.25rem;   /* 20px */
--space-6:  1.5rem;    /* 24px */
--space-8:  2rem;      /* 32px */
--space-10: 2.5rem;    /* 40px */
--space-12: 3rem;      /* 48px */
--space-16: 4rem;      /* 64px */
--space-20: 5rem;      /* 80px */
```

---

### Rayons de bordure

```css
--radius-sm:   4px;
--radius-md:   8px;
--radius-lg:   12px;
--radius-xl:   16px;
--radius-2xl:  24px;
--radius-full: 9999px;
```

---

### Ombres

```css
--shadow-sm:   0 1px 3px rgba(10, 15, 30, 0.08);
--shadow-md:   0 4px 16px rgba(10, 15, 30, 0.10);
--shadow-lg:   0 8px 32px rgba(10, 15, 30, 0.14);
--shadow-xl:   0 20px 60px rgba(10, 15, 30, 0.18);
--shadow-gold: 0 4px 20px rgba(212, 160, 23, 0.35);
```

---

### Layout

```css
--container-max: 1280px;
--navbar-height: 72px;
```

---

## Classes utilitaires (`_utilities.css`)

```css
.container          /* max-width + padding responsive */
.section            /* padding vertical 5rem */
.section-sm         /* padding vertical 3rem */
.section-eyebrow    /* Label en majuscules doré */
.section-title      /* Grand titre Playfair Display */
.section-subtitle   /* Sous-titre Inter gris */
.divider            /* Ligne dégradée gold → transparent */
```

---

## Classes boutons (`_buttons.css`)

```css
.btn              /* Base — flex, font, transitions */
.btn-primary      /* Navy 600 + ombre */
.btn-accent       /* Gold 500 + ombre gold */
.btn-ghost        /* Transparent avec bordure navy */
.btn-outline-light/* Pour fonds sombres */
.btn-danger       /* Rouge transparent */
.btn-sm           /* Petit */
.btn-lg           /* Grand */
.btn-login        /* Navbar — transparent avec bordure */
.btn-signup       /* Navbar — gold + ombre */
.btn-delete       /* Rouge plein + ombre rouge */
```

---

## Classes formulaires (`_forms.css`)

```css
.input            /* Input de base */
.input-group      /* Wrapper input + icône */
.input-clear      /* Bouton d'effacement dans input-group */
.select           /* Select natif stylé */
.label            /* Label uppercase xs bold */
.field            /* Wrapper label + contrôle */
```

---

## Classes badges et chips (`_badges.css`)

```css
.badge            /* Base badge */
.badge-sale       /* Navy + or — "À Vendre" / "Vendu" */
.badge-rent       /* Or + navy — "À Louer" / "Loué" */
.badge-count      /* Compteur circulaire gold */
.chip             /* Filtre cliquable avec border */
.chip--active     /* Chip activé navy */
```

---

## Animations (`_animations.css`)

```css
@keyframes fadeInUp   /* Entrée depuis le bas */
@keyframes float      /* Flottement doux (cards hero) */
@keyframes shimmer    /* Effet skeleton loading */

.animate-fade-in-up
.animate-float
```

---

## Conventions CSS par composant

Chaque composant suit la convention **BEM** avec un préfixe court :

```css
/* PropertyCard */
.card { ... }
.card__image-wrap { ... }
.card__title { ... }
.card__favorite--active { ... }

/* ContractManagement */
.cm { ... }
.cm__header { ... }
.cm__flash--success { ... }

/* Pagination */
.pag { ... }
.pag__btn--active { ... }
```

---

## Responsive

Le projet utilise 3 breakpoints principaux :

| Breakpoint | Largeur | Comportement |
|---|---|---|
| Desktop | > 1024px | Layout multi-colonnes |
| Tablet | ≤ 1024px | Réduction du nombre de colonnes |
| Mobile | ≤ 768px | Layout mono-colonne, sidebar masquée |
| Small | ≤ 480px | Padding réduit, boutons pleine largeur |

La navbar passe en mode hamburger en dessous de **1510px** (breakpoint personnalisé pour accueillir tous les liens manager).
