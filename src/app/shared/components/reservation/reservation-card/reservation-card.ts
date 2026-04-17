import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Reservation, ReservationStatus } from '../../../../core/models';

@Component({
  selector: 'app-reservation-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reservation-card.html',
  styleUrls: ['./reservation-card.css']
})
export class ReservationCard {
  @Input() reservation!: Reservation;
  @Output() cancel = new EventEmitter<void>();

  get statusLabel(): string {
    switch (this.reservation.status) {
      case ReservationStatus.PENDING:   return 'En attente';
      case ReservationStatus.CONFIRMED: return 'Confirmée';
      case ReservationStatus.CANCELLED: return 'Annulée';
    }
  }

  get statusClass(): string {
    switch (this.reservation.status) {
      case ReservationStatus.PENDING:   return 'rc__status--pending';
      case ReservationStatus.CONFIRMED: return 'rc__status--confirmed';
      case ReservationStatus.CANCELLED: return 'rc__status--cancelled';
    }
  }

  get canCancel(): boolean {
    return this.reservation.status === ReservationStatus.PENDING;
  }

  get mainImage(): string {
    return this.reservation.realEstate?.images?.[0] || 'assets/images/default-property.jpg';
  }

  get formattedDate(): string {
    return new Date(this.reservation.visitDate).toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  }
}