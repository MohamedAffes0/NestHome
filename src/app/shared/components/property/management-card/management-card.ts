import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RealEstateWithStats, RealEstateStatus } from '../../../../core/models';

@Component({
  selector: 'app-gestion-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './management-card.html',
  styleUrls: ['./management-card.css'],
})
export class ManagementCard {
  @Input() property!: RealEstateWithStats;
  @Output() edit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

  get mainImage(): string {
    return this.property.images?.[0] ?? 'assets/images/default-property.jpg';
  }

  get typeLabel(): string {
    return ['Maison', 'Appartement', 'Terrain', 'Commerce'][this.property.type] ?? '—';
  }

  get statusLabel(): string {
    return ['À Vendre', 'À Louer', 'Vendu', 'Loué'][this.property.status] ?? '—';
  }

  get isSale(): boolean {
    return (
      this.property.status === RealEstateStatus.FOR_SALE ||
      this.property.status === RealEstateStatus.SOLD
    );
  }
}
