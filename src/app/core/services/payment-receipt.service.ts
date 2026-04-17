import { Injectable } from '@angular/core';
import html2pdf from 'html2pdf.js';
import { Payment } from '../models/payment.model';

@Injectable({ providedIn: 'root' })
export class PaymentReceiptService {
  download(payment: Payment): void {
    const html = this.buildHtml(payment);

    const element = document.createElement('div');
    element.innerHTML = html;

    document.body.appendChild(element);

    const opt = {
      margin: 0,
      filename: `recu-${payment.id}.pdf`,
      image: { type: 'jpeg' as const, quality: 1 },
      html2canvas: {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff',
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait' as const,
      },
    };

    html2pdf()
      .set(opt)
      .from(element)
      .save()
      .then(() => {
        document.body.removeChild(element);
      });
  }

  private buildHtml(p: Payment): string {
    return `<!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Reçu de paiement — NestHome</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }

          body {
            font-family: Arial, Helvetica, sans-serif; /* ✅ fiable */
            background: #ffffff;
            color: #111827;
            padding: 20px;
            width: 794px;
          }

          .receipt {
            width: 100%;
            max-width: 620px;
            margin: 0 auto;
            background: #ffffff;
            border: 1px solid #e5e7eb; /* ✅ remplace shadow */
            border-radius: 10px;
          }

          /* ── Header ── */
          .receipt__header {
            background: #1e3a6e; /* ✅ pas de gradient */
            padding: 30px;
          }

          .receipt__logo {
            font-size: 20px;
            font-weight: bold;
            color: #ffffff;
            margin-bottom: 10px;
          }

          .receipt__logo span {
            color: #d4a017;
          }

          .receipt__title {
            font-size: 12px;
            font-weight: bold;
            color: #cbd5e1;
          }

          .receipt__amount {
            font-size: 36px;
            font-weight: bold;
            color: #ffffff;
            margin-top: 10px;
          }

          .receipt__amount span {
            font-size: 16px;
            margin-left: 5px;
          }

          /* ── Badge ── */
          .receipt__badge {
            margin-top: 10px;
            display: inline-block;
            background: #22c55e;
            color: white;
            padding: 4px 10px;
            font-size: 10px;
            border-radius: 20px;
          }

          /* ── Body ── */
          .receipt__body {
            padding: 20px 30px;
          }

          .receipt__ref {
            display: flex;
            justify-content: space-between;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }

          .receipt__ref-label {
            font-size: 10px;
            font-weight: bold;
            color: #6b7280;
          }

          .receipt__ref-value {
            font-size: 12px;
            font-weight: bold;
          }

          .receipt__ref-date {
            font-size: 11px;
            color: #6b7280;
          }

          /* ── Sections ── */
          .receipt__section {
            margin-bottom: 20px;
          }

          .receipt__section-title {
            font-size: 10px;
            font-weight: bold;
            color: #6b7280;
            margin-bottom: 10px;
          }

          .receipt__row {
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
            border-bottom: 1px dashed #e5e7eb;
          }

          .receipt__row-label {
            font-size: 12px;
            color: #6b7280;
          }

          .receipt__row-value {
            font-size: 12px;
            font-weight: bold;
            text-align: right;
            max-width: 60%;
          }

          /* ── Total ── */
          .receipt__total {
            background: #f3f4f6;
            border: 1px solid #e5e7eb;
            padding: 15px;
            display: flex;
            justify-content: space-between;
            margin-top: 10px;
          }

          .receipt__total-label {
            font-weight: bold;
          }

          .receipt__total-value {
            font-size: 20px;
            font-weight: bold;
          }

          /* ── Footer ── */
          .receipt__footer {
            border-top: 1px solid #e5e7eb;
            padding: 15px;
            text-align: center;
            font-size: 10px;
            color: #6b7280;
          }
        </style>
      </head>
      <body>
        <div class="receipt">

          <div class="receipt__header">
            <div class="receipt__logo">Nest<span>Home</span></div>
            <div class="receipt__title">Reçu de paiement</div>
            <div class="receipt__amount">${p.amount}<span>DT</span></div>
            <div class="receipt__badge">
              <span class="receipt__badge-dot"></span>
              Paiement confirmé
            </div>
          </div>

          <div class="receipt__body">

            <div class="receipt__ref">
              <div>
                <div class="receipt__ref-label">Référence</div>
                <div class="receipt__ref-value">#${p.id.toUpperCase().slice(0, 12)}</div>
              </div>
              <div class="receipt__ref-date">${p.date}</div>
            </div>

            <div class="receipt__section">
              <div class="receipt__section-title">Bien immobilier</div>
              <div class="receipt__row">
                <span class="receipt__row-label">Désignation</span>
                <span class="receipt__row-value">${p.realEstate?.title ?? '—'}</span>
              </div>
              ${
                p.realEstate?.address
                  ? `<div class="receipt__row">
                <span class="receipt__row-label">Adresse</span>
                <span class="receipt__row-value">${p.realEstate.address}</span>
              </div>`
                  : ''
              }
            </div>

            <div class="receipt__section">
              <div class="receipt__section-title">Client</div>
              <div class="receipt__row">
                <span class="receipt__row-label">Nom</span>
                <span class="receipt__row-value">${p.user?.name ?? '—'}</span>
              </div>
              ${
                p.user?.email
                  ? `<div class="receipt__row">
                <span class="receipt__row-label">Email</span>
                <span class="receipt__row-value">${p.user.email}</span>
              </div>`
                  : ''
              }
            </div>

            <div class="receipt__total">
              <span class="receipt__total-label">Montant total payé</span>
              <span class="receipt__total-value">${p.amount}<span>DT</span></span>
            </div>

          </div>

          <div class="receipt__footer">
            NestHome — Plateforme immobilière &nbsp;•&nbsp; Ce document constitue un reçu officiel de paiement.<br/>
            Conservez ce reçu pour vos archives. Généré le ${new Date().toLocaleDateString('fr-FR')}.
          </div>

        </div>
      </body>
      </html>`;
  }
}