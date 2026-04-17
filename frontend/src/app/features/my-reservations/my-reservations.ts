import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReservationService } from '../../core/services';
import { Reservation, ReservationStatus } from '../../core/models';
import { Alert } from '../../shared/components/alert/alert';
import { ReservationCard } from '../../shared/components/reservation/reservation-card/reservation-card';

@Component({
  selector: 'app-my-reservations',
  standalone: true,
  imports: [CommonModule, RouterModule, ReservationCard, Alert],
  templateUrl: './my-reservations.html',
  styleUrls: ['./my-reservations.css']
})
export class MyReservations implements OnInit {

  reservations: Reservation[] = [];
  loading  = true;
  errorMsg = '';

  // Annulation
  cancellingId:   string | null = null;
  cancelLoading   = false;
  cancelError     = '';
  cancelSuccess   = '';

  // Active filters
  activeFilter: 'all' | ReservationStatus = 'all';

  readonly filters: { label: string; value: 'all' | ReservationStatus }[] = [
    { label: 'Toutes',     value: 'all'                        },
    { label: 'En attente', value: ReservationStatus.PENDING    },
    { label: 'Confirmées', value: ReservationStatus.CONFIRMED  },
    { label: 'Annulées',   value: ReservationStatus.CANCELLED  },
  ];

  constructor(
    private reservationService: ReservationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading  = true;
    this.errorMsg = '';
    this.cdr.detectChanges();

    this.reservationService.getMyReservations().subscribe({
      next: (items) => {
        this.reservations = items;
        this.loading      = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMsg = 'Impossible de charger vos réservations.';
        this.loading  = false;
        this.cdr.detectChanges();
      }
    });
  }

  get filtered(): Reservation[] {
    if (this.activeFilter === 'all') return this.reservations;
    return this.reservations.filter(r => r.status === this.activeFilter);
  }

  setFilter(f: 'all' | ReservationStatus): void {
    this.activeFilter = f;
  }

  count(status: 'all' | ReservationStatus): number {
    if (status === 'all') return this.reservations.length;
    return this.reservations.filter(r => r.status === status).length;
  }

  // ── Annulation ────────────────────────────────────────
  askCancel(id: string): void {
    this.cancellingId = id;
    this.cancelError  = '';
  }

  confirmCancel(): void {
    if (!this.cancellingId) return;
    this.cancelLoading = true;
    this.cancelError   = '';
    this.cdr.detectChanges();

    this.reservationService.cancel(this.cancellingId).subscribe({
      next: (updated) => {
        // Merge: we keep the realEstate from the old reservation because the backend
        // does not return it in the response from PATCH /cancel
        this.reservations = this.reservations.map(r =>
          r.id === updated.id
            ? { ...updated, realEstate: r.realEstate }
            : r
        );
        this.cancellingId  = null;
        this.cancelLoading = false;
        this.cancelSuccess = 'Réservation annulée avec succès.';
        this.cdr.detectChanges();
        setTimeout(() => { this.cancelSuccess = ''; this.cdr.detectChanges(); }, 3000);
      },
      error: (err) => {
        this.cancelLoading = false;
        this.cancelError   = err?.error?.message ?? 'Erreur lors de l\'annulation.';
        this.cdr.detectChanges();
      }
    });
  }

  dismissCancel(): void {
    this.cancellingId = null;
  }

  get cancellingReservation(): Reservation | undefined {
    return this.reservations.find(r => r.id === this.cancellingId);
  }
}