# Installation — NestHome Frontend

## Prérequis

| Outil | Version minimale |
|---|---|
| Node.js | 18+ |
| npm | 9+ |
| Angular CLI | 19+ |

Le backend NestHome doit tourner sur `http://localhost:3000` avant de démarrer le frontend.

---

## Installation

```bash
# Cloner le projet
git clone <repo-url>
cd nesthome-frontend

# Installer les dépendances
npm install
```

---

## Démarrage

```bash
# Développement (hot reload)
ng serve
# → http://localhost:4200

# Ou avec npm
npm start
```

---

## Build de production

```bash
ng build
# Fichiers générés dans /dist/
```

---

## Vérifier que tout fonctionne

1. Le backend tourne sur `http://localhost:3000`
2. Ouvrir `http://localhost:4200`
3. Le catalogue de biens s'affiche (appel public `GET /real-estate`)
4. Se connecter avec un compte existant
5. Vérifier que les favoris se chargent et que la navbar affiche l'avatar

---

## Variables de configuration

Les URLs sont définies directement dans le code (pas de fichier `.env` côté Angular) :

```typescript
// src/lib/auth-client.ts
export const BASE_URL = 'http://localhost:3000';

export const authClient = createAuthClient({
  baseURL: 'http://localhost:3000'
});
```

Pour pointer vers un autre backend, modifier `BASE_URL` dans ce fichier et dans `AuthService` (`apiUrl`).

---

## Dépendances principales

```json
{
  "@angular/core": "^19.0.0",
  "better-auth": "latest",
  "chart.js": "latest",
  "html2pdf.js": "latest"
}
```

---

## Scripts disponibles

```bash
ng serve          # Serveur de développement
ng build          # Build de production
ng test           # Tests unitaires (Karma)
ng lint           # ESLint
ng generate ...   # Génération de composants/services
```

---

## Structure des fichiers de configuration

```
nesthome-frontend/
├── angular.json        # Configuration Angular CLI (build, serve, assets)
├── tsconfig.json       # Configuration TypeScript principale
├── tsconfig.app.json   # Config TypeScript pour l'application
├── tsconfig.spec.json  # Config TypeScript pour les tests
└── package.json        # Dépendances et scripts npm
```
