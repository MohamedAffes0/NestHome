import { Injectable } from '@angular/core';
import html2pdf from 'html2pdf.js';
import { Contract } from '../models/contract.model';

@Injectable({ providedIn: 'root' })
export class ContractReceiptService {
  download(contract: Contract): void {
    const html = this.buildHtml(contract);

    const element = document.createElement('div');
    element.innerHTML = html;
    document.body.appendChild(element);

    const isRental = contract.endDate !== null;
    const opt = {
      margin: 0,
      filename: `contrat-${isRental ? 'location' : 'vente'}-${contract.id.slice(0, 8)}.pdf`,
      image: { type: 'jpeg' as const, quality: 1 },
      html2canvas: { scale: 3, useCORS: true, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
    };

    html2pdf()
      .set(opt)
      .from(element)
      .save()
      .then(() => document.body.removeChild(element));
  }

  private fmt(iso: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'long', year: 'numeric',
    });
  }

  private buildHtml(c: Contract): string {
    const isRental  = c.endDate !== null;
    const typeLabel = isRental ? 'Contrat de location' : 'Contrat de vente';
    const typeColor = isRental ? '#2563eb' : '#16a34a';
    const price     = c.realEstate?.price ?? '—';

    return `<!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8" />
        <title>${typeLabel} — NestHome</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: Arial, Helvetica, sans-serif;
            background: #ffffff;
            color: #111827;
            padding: 20px;
            width: 794px;
          }
          .doc { width: 100%; max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 10px; }

          /* Header */
          .doc__header { background: #1e3a6e; padding: 30px; }
          .doc__logo   { font-size: 20px; font-weight: bold; color: #ffffff; margin-bottom: 6px; }
          .doc__logo span { color: #d4a017; }
          .doc__type   { display: inline-block; background: ${typeColor}; color: #fff; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: bold; margin-bottom: 10px; }
          .doc__price  { font-size: 34px; font-weight: bold; color: #ffffff; margin-top: 4px; }
          .doc__price span { font-size: 15px; margin-left: 4px; }

          /* Ref bar */
          .doc__ref { display: flex; justify-content: space-between; align-items: center; padding: 14px 30px; background: #f9fafb; border-bottom: 1px solid #e5e7eb; }
          .doc__ref-label { font-size: 10px; font-weight: bold; color: #6b7280; }
          .doc__ref-value { font-size: 12px; font-weight: bold; }
          .doc__ref-date  { font-size: 11px; color: #6b7280; text-align: right; }

          /* Body */
          .doc__body { padding: 20px 30px; }
          .doc__section { margin-bottom: 20px; }
          .doc__section-title { font-size: 10px; font-weight: bold; color: #6b7280; text-transform: uppercase; letter-spacing: .05em; margin-bottom: 10px; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }
          .doc__row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed #e5e7eb; }
          .doc__row-label { font-size: 12px; color: #6b7280; }
          .doc__row-value { font-size: 12px; font-weight: bold; text-align: right; max-width: 60%; }

          /* Period block */
          .doc__period { display: flex; gap: 16px; margin-top: 10px; }
          .doc__period-box { flex: 1; background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px; text-align: center; }
          .doc__period-box-label { font-size: 10px; color: #6b7280; margin-bottom: 4px; }
          .doc__period-box-date  { font-size: 13px; font-weight: bold; color: #111827; }

          /* Total */
          .doc__total { background: #f3f4f6; border: 1px solid #e5e7eb; padding: 15px; display: flex; justify-content: space-between; align-items: center; margin-top: 10px; border-radius: 6px; }
          .doc__total-label { font-weight: bold; font-size: 13px; }
          .doc__total-value { font-size: 22px; font-weight: bold; color: #1e3a6e; }
          .doc__total-value span { font-size: 13px; margin-left: 4px; }

          /* Signatures */
          .doc__sigs { display: flex; gap: 20px; margin-top: 20px; }
          .doc__sig  { flex: 1; border: 1px dashed #d1d5db; border-radius: 6px; padding: 12px; text-align: center; }
          .doc__sig-label { font-size: 10px; color: #6b7280; margin-bottom: 40px; }
          .doc__sig-line  { border-top: 1px solid #9ca3af; padding-top: 4px; font-size: 10px; color: #9ca3af; }

          /* Footer */
          .doc__footer { border-top: 1px solid #e5e7eb; padding: 15px; text-align: center; font-size: 10px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="doc">

          <div class="doc__header">
            <div class="doc__logo">Nest<span>Home</span></div>
            <div class="doc__type">${typeLabel}</div>
            <div class="doc__price">${price}<span>DT</span></div>
          </div>

          <div class="doc__ref">
            <div>
              <div class="doc__ref-label">Référence contrat</div>
              <div class="doc__ref-value">#${c.id.toUpperCase().slice(0, 12)}</div>
            </div>
            <div class="doc__ref-date">Généré le ${new Date().toLocaleDateString('fr-FR')}</div>
          </div>

          <div class="doc__body">

            <!-- Bien immobilier -->
            <div class="doc__section">
              <div class="doc__section-title">Bien immobilier</div>
              <div class="doc__row">
                <span class="doc__row-label">Désignation</span>
                <span class="doc__row-value">${c.realEstate?.title ?? '—'}</span>
              </div>
              ${c.realEstate?.address ? `
              <div class="doc__row">
                <span class="doc__row-label">Adresse</span>
                <span class="doc__row-value">${c.realEstate.address}</span>
              </div>` : ''}
              <div class="doc__row">
                <span class="doc__row-label">Type de contrat</span>
                <span class="doc__row-value">${isRental ? 'Location' : 'Vente'}</span>
              </div>
            </div>

            <!-- Client -->
            <div class="doc__section">
              <div class="doc__section-title">Informations client</div>
              <div class="doc__row">
                <span class="doc__row-label">Nom complet</span>
                <span class="doc__row-value">${c.user?.name ?? '—'}</span>
              </div>
              ${c.user?.email ? `
              <div class="doc__row">
                <span class="doc__row-label">Email</span>
                <span class="doc__row-value">${c.user.email}</span>
              </div>` : ''}
              <div class="doc__row">
                <span class="doc__row-label">CIN / Passeport</span>
                <span class="doc__row-value">${c.cinPassport}</span>
              </div>
            </div>

            <!-- Période -->
            <div class="doc__section">
              <div class="doc__section-title">Période du contrat</div>
              <div class="doc__period">
                <div class="doc__period-box">
                  <div class="doc__period-box-label">Date de début</div>
                  <div class="doc__period-box-date">${this.fmt(c.startDate)}</div>
                </div>
                ${isRental ? `
                <div class="doc__period-box">
                  <div class="doc__period-box-label">Date de fin</div>
                  <div class="doc__period-box-date">${this.fmt(c.endDate)}</div>
                </div>` : ''}
              </div>
            </div>

            <!-- Montant -->
            <div class="doc__total">
              <span class="doc__total-label">Montant ${isRental ? 'mensuel' : 'total'}</span>
              <span class="doc__total-value">${price}<span>DT</span></span>
            </div>

            <!-- Signatures -->
            <div class="doc__sigs">
              <div class="doc__sig">
                <div class="doc__sig-label">Signature du client</div>
                <div class="doc__sig-line">${c.user?.name ?? 'Client'}</div>
              </div>
              <div class="doc__sig">
                <div class="doc__sig-label">Signature de l'agent</div>
                <div class="doc__sig-line">${c.agent?.name ?? 'Agent NestHome'}</div>
              </div>
            </div>

          </div>

          <div class="doc__footer">
            NestHome — Plateforme immobilière &nbsp;•&nbsp; Ce document constitue un contrat officiel.
            <br/>Conservez ce document pour vos archives. CIN/Passeport : ${c.cinPassport}
          </div>

        </div>
      </body>
      </html>`;
  }
}
