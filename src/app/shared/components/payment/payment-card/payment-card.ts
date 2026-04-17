import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Payment } from '../../../../core/models';
import { PaymentReceiptService } from '../../../../core/services';

@Component({
  selector: 'app-payment-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-card.html',
  styleUrls: ['./payment-card.css'],
})
export class PaymentCard {
  @Input() payment!: Payment;
  @Output() delete = new EventEmitter<void>();

  constructor(private receiptService: PaymentReceiptService) {}

  get mainImage(): string {
    return this.payment.realEstate?.images?.[0] ?? 'assets/images/default-property.jpg';
  }

  get clientAvatar(): string {
    if (this.payment.user?.image) return this.payment.user.image;
    const name = this.payment.user?.name ?? 'C';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1e3a6e&color=f2cc6a&bold=true&size=64`;
  }

  private get dateObj(): Date {
    return new Date(this.payment.date);
  }

  get day(): string {
    return this.dateObj.getDate().toString().padStart(2, '0');
  }
  get month(): string {
    return this.dateObj.toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase();
  }
  get year(): string {
    return this.dateObj.getFullYear().toString();
  }

  onDownload(): void {
    this.receiptService.download(this.payment);
  }
}
