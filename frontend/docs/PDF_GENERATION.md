# Génération de PDF — NestHome Frontend

## Vue d'ensemble

NestHome génère deux types de documents PDF directement dans le navigateur, sans requête serveur supplémentaire, via la librairie **`html2pdf.js`**.

| Document | Service | Déclenché depuis |
|---|---|---|
| Reçu de paiement | `PaymentReceiptService` | Bouton "Reçu" dans `PaymentCard` |
| Contrat vente/location | `ContractReceiptService` | Bouton "Contrat" dans `ContractCard` |

---

## Principe de fonctionnement

```
Clic utilisateur sur "Télécharger"
         │
         ▼
receiptService.download(data)
         │
         ▼
buildHtml(data)          ← construit un string HTML complet
         │
         ▼
element = document.createElement('div')
element.innerHTML = html
document.body.appendChild(element)
         │
         ▼
html2pdf().set(opt).from(element).save()
  ├── html2canvas  → capture le DOM en canvas (scale: 3)
  ├── jsPDF        → convertit le canvas en PDF A4
  └── .save()      → déclenche le téléchargement navigateur
         │
         ▼
document.body.removeChild(element)  ← nettoyage du DOM
```

---

## PaymentReceiptService

**Fichier :** `src/app/core/services/payment-receipt.service.ts`

### Méthode `download(payment: Payment)`

```typescript
download(payment: Payment): void {
  const html = this.buildHtml(payment);
  const element = document.createElement('div');
  element.innerHTML = html;
  document.body.appendChild(element);

  const opt = {
    margin:     0,
    filename:   `recu-${payment.id}.pdf`,
    image:      { type: 'jpeg', quality: 1 },
    html2canvas:{ scale: 3, useCORS: true, backgroundColor: '#ffffff' },
    jsPDF:      { unit: 'mm', format: 'a4', orientation: 'portrait' },
  };

  html2pdf().set(opt).from(element).save()
    .then(() => document.body.removeChild(element));
}
```

### Structure du reçu

```
┌─────────────────────────────────┐
│  [Header navy]                  │
│  NestHome  •  Reçu de paiement  │
│  MONTANT : 1500 DT              │
│  ✅ Paiement confirmé           │
├─────────────────────────────────┤
│  Référence : #ID12345678        │  ← 12 premiers chars de l'UUID en majuscules
│                        Date     │
├─────────────────────────────────┤
│  Bien immobilier                │
│  Désignation : Villa Lac 1      │
│  Adresse : Lac 1, Tunis         │
├─────────────────────────────────┤
│  Client                         │
│  Nom : Mohamed Affes            │
│  Email : med@nesthome.tn        │
├─────────────────────────────────┤
│  [ Montant total payé : 1500 DT ]│
├─────────────────────────────────┤
│  NestHome — Reçu officiel       │
│  Généré le 21/03/2026           │
└─────────────────────────────────┘
```

---

## ContractReceiptService

**Fichier :** `src/app/core/services/contract-receipt.service.ts`

### Méthode `download(contract: Contract)`

Le nom du fichier change selon le type de contrat :

```typescript
const isRental = contract.endDate !== null;
filename: `contrat-${isRental ? 'location' : 'vente'}-${contract.id.slice(0, 8)}.pdf`
```

La couleur du badge de type s'adapte aussi :

```typescript
const typeColor = isRental ? '#2563eb' : '#16a34a'; // bleu location, vert vente
```

### Structure du contrat

```
┌─────────────────────────────────┐
│  [Header navy]                  │
│  NestHome                       │
│  [Badge] Contrat de vente/location │
│  PRIX : 850 000 DT              │
├─────────────────────────────────┤
│  Référence : #ID12345678        │
│                  Généré le ...  │
├─────────────────────────────────┤
│  Bien immobilier                │
│  Désignation · Adresse · Type   │
├─────────────────────────────────┤
│  Informations client            │
│  Nom · Email · CIN/Passeport    │
├─────────────────────────────────┤
│  Période du contrat             │
│  [Date début]   →   [Date fin]  │  ← date fin uniquement si location
├─────────────────────────────────┤
│  Montant total / mensuel        │
│                       850 000 DT│
├─────────────────────────────────┤
│  [Zone signature client]        │
│  [Zone signature agent]         │
├─────────────────────────────────┤
│  NestHome — Contrat officiel    │
└─────────────────────────────────┘
```

---

## Options html2pdf communes

```typescript
{
  margin:      0,
  image:       { type: 'jpeg', quality: 1 },    // qualité max
  html2canvas: {
    scale:           3,       // 3× la résolution pour un rendu net
    useCORS:         true,    // autorise les images cross-origin
    backgroundColor: '#ffffff',
  },
  jsPDF: {
    unit:        'mm',
    format:      'a4',
    orientation: 'portrait',
  },
}
```

---

## Contraintes CSS dans les templates HTML

Les templates HTML utilisés pour la génération PDF évitent délibérément certaines propriétés CSS non supportées par `html2canvas` :

| ❌ À éviter | ✅ Utiliser à la place |
|---|---|
| `box-shadow` | `border: 1px solid #e5e7eb` |
| `background: linear-gradient(...)` | Couleur unie `background: #1e3a6e` |
| Google Fonts (import externe) | `font-family: Arial, Helvetica, sans-serif` |
| `backdrop-filter` | Ne pas utiliser |
| Flexbox gap (certains navigateurs) | `margin` classique |

Les fonts sont forcées en **Arial / Helvetica** car `html2canvas` ne charge pas les fonts Google Fonts de façon fiable lors de la capture.

---

## Intégration dans les composants

### PaymentCard

```typescript
// payment-card.ts
constructor(private receiptService: PaymentReceiptService) {}

onDownload(): void {
  this.receiptService.download(this.payment);
}
```

```html
<!-- payment-card.html -->
<button class="pc__btn pc__btn--download" (click)="onDownload()">
  <svg ...>...</svg>
  Reçu
</button>
```

### ContractCard

```typescript
// contract-card.ts
constructor(private receiptService: ContractReceiptService) {}

onDownload(): void {
  this.receiptService.download(this.contract);
}
```

```html
<!-- contract-card.html -->
<button class="cc__btn cc__btn--download" (click)="onDownload()">
  <svg ...>...</svg>
  Contrat
</button>
```

---

## Données requises

Pour que le PDF soit complet, les objets `Payment` et `Contract` doivent inclure les relations imbriquées. Le service `PaymentService` recharge le paiement complet (`getById`) après création pour s'assurer que `realEstate` et `user` sont présents :

```typescript
// payment-add-modal.ts
this.paymentService.create(dto).subscribe({
  next: (created) => {
    // Recharger avec relations pour le PDF
    this.paymentService.getById(created.id).subscribe({
      next: (full) => this.created.emit(full),
    });
  },
});
```

Pour les contrats, les relations `user`, `agent` et `realEstate` sont incluses dans la réponse de `GET /contracts` et `POST /contracts` via TypeORM `relations: ['user', 'agent', 'realEstate']`.
