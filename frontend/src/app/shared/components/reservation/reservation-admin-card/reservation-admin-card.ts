import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Reservation, ReservationStatus } from '../../../../core/models';

@Component({
  selector: 'app-reservation-admin-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reservation-admin-card.html',
  styleUrls: ['./reservation-admin-card.css']
})
export class ReservationAdminCard {
  @Input() reservation!: Reservation;
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel  = new EventEmitter<void>();
  @Output() remove  = new EventEmitter<void>();

  readonly ReservationStatus = ReservationStatus;

  get statusLabel(): string {
    switch (this.reservation.status) {
      case ReservationStatus.PENDING:   return 'En attente';
      case ReservationStatus.CONFIRMED: return 'Confirmée';
      case ReservationStatus.CANCELLED: return 'Annulée';
    }
  }

  get statusMod(): string {
    switch (this.reservation.status) {
      case ReservationStatus.PENDING:   return 'pending';
      case ReservationStatus.CONFIRMED: return 'confirmed';
      case ReservationStatus.CANCELLED: return 'cancelled';
    }
  }

  get mainImage(): string {
    return this.reservation.realEstate?.images?.[0] || 'assets/images/default-property.jpg';
  }

  get formattedDate(): string {
    return new Date(this.reservation.visitDate).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  }
}