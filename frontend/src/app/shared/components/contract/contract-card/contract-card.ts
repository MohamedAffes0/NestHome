import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Contract } from '../../../../core/models';
import { ContractReceiptService } from '../../../../core/services';

@Component({
  selector: 'app-contract-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contract-card.html',
  styleUrls: ['./contract-card.css'],
})
export class ContractCard {
  @Input() contract!: Contract;
  @Output() delete = new EventEmitter<void>();

  constructor(private receiptService: ContractReceiptService) {}

  get isRental(): boolean {
    return this.contract.endDate !== null;
  }

  get mainImage(): string {
    return this.contract.realEstate?.images?.[0] || 'assets/images/default-property.jpg';
  }

  get clientAvatar(): string {
    if (this.contract.user?.image) return this.contract.user.image;
    const name = this.contract.user?.name ?? 'C';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1e3a6e&color=f2cc6a&bold=true&size=64`;
  }

  private fmtDate(iso: string): { day: string; month: string; year: string } {
    const d = new Date(iso);
    return {
      day:   d.getDate().toString().padStart(2, '0'),
      month: d.toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase(),
      year:  d.getFullYear().toString(),
    };
  }

  get startFmt() { return this.fmtDate(this.contract.startDate); }

  get endDateLabel(): string {
    if (!this.contract.endDate) return '—';
    return new Date(this.contract.endDate).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  }

  onDownload(): void {
    this.receiptService.download(this.contract);
  }
}