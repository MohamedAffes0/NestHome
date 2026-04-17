import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ReservationService } from '../../core/services';
import { Reservation, ReservationStatus } from '../../core/models';
import { ReservationAdminCard } from '../../shared/components/reservation/reservation-admin-card/reservation-admin-card';

type FilterTab = 'all' | 'pending' | 'confirmed' | 'cancelled';

interface Flash { id: string; message: string; type: 'success' | 'error'; }

@Component({
  selector: 'app-reservation-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReservationAdminCard],
  templateUrl: './reservation-management.html',
  styleUrls: ['./reservation-management.css']
})
export class ReservationManagement implements OnInit {

  reservations: Reservation[] = [];
  loading    = true;
  errorMsg   = '';
  searchQuery = '';
  activeTab: FilterTab = 'all';

  // Delete modal
  deleteTarget: Reservation | null = null;
  deleteLoading = false;

  // Flash messages
  flashes: Flash[] = [];

  // Tracking des boutons en cours
  pendingIds = new Set<string>();

  readonly tabs: { key: FilterTab; label: string }[] = [
    { key: 'all',       label: 'Toutes'      },
    { key: 'pending',   label: 'En attente'  },
    { key: 'confirmed', label: 'Confirmées'  },
    { key: 'cancelled', label: 'Annulées'    },
  ];

  constructor(
    private reservationService: ReservationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.load();
  }

  // ── Chargement ──────────────────────────────────────────────
  load(): void {
    this.loading  = true;
    this.errorMsg = '';
    this.reservationService.getAll({}, 1, 200).subscribe({
      next: (res) => {
        this.reservations = res.items;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMsg = 'Erreur lors du chargement des réservations.';
        this.loading  = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ── Filtres ──────────────────────────────────────────────────
  get filtered(): Reservation[] {
    let list = [...this.reservations];

    // Filtre par onglet
    if (this.activeTab !== 'all') {
      const map: Record<FilterTab, ReservationStatus | null> = {
        all:       null,
        pending:   ReservationStatus.PENDING,
        confirmed: ReservationStatus.CONFIRMED,
        cancelled: ReservationStatus.CANCELLED,
      };
      list = list.filter(r => r.status === map[this.activeTab]);
    }

    // Filtre recherche (titre du bien ou téléphone client)
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(r =>
        r.realEstate?.title?.toLowerCase().includes(q) ||
        r.clientPhone?.toLowerCase().includes(q)       ||
        r.cinPassport?.toLowerCase().includes(q)
      );
    }

    return list;
  }

  countByStatus(tab: FilterTab): number {
    if (tab === 'all') return this.reservations.length;
    const map: Record<FilterTab, ReservationStatus | null> = {
      all:       null,
      pending:   ReservationStatus.PENDING,
      confirmed: ReservationStatus.CONFIRMED,
      cancelled: ReservationStatus.CANCELLED,
    };
    return this.reservations.filter(r => r.status === map[tab]).length;
  }

  // ── Actions ──────────────────────────────────────────────────
  updateStatus(r: Reservation, status: ReservationStatus): void {
    if (this.pendingIds.has(r.id)) return;
    this.pendingIds.add(r.id);

    this.reservationService.update(r.id, { status }).subscribe({
      next: (updated) => {
        this.reservations = this.reservations.map(x =>
          x.id === r.id ? { ...updated, realEstate: x.realEstate } : x
        );
        this.pendingIds.delete(r.id);
        this.showFlash('Réservation '+ (status === ReservationStatus.CONFIRMED ? 'confirmée.' : 'annulée.'), 'success');
        this.cdr.detectChanges();
      },
      error: () => {
        this.pendingIds.delete(r.id);
        this.showFlash('Erreur lors de la ' + (status === ReservationStatus.CONFIRMED ? 'confirmation.' : 'annulation.'), 'error');
        this.cdr.detectChanges();
      }
    });
  }

  onConfirm(r: Reservation): void {
    this.updateStatus(r, ReservationStatus.CONFIRMED);
  }

  onCancel(r: Reservation): void {
    this.updateStatus(r, ReservationStatus.CANCELLED);
  }

  // ── Suppression ──────────────────────────────────────────────
  openDelete(r: Reservation): void {
    this.deleteTarget = r;
  }

  closeDelete(): void {
    this.deleteTarget  = null;
    this.deleteLoading = false;
  }

  confirmDelete(): void {
    if (!this.deleteTarget || this.deleteLoading) return;
    this.deleteLoading = true;

    this.reservationService.delete(this.deleteTarget.id).subscribe({
      next: () => {
        this.reservations = this.reservations.filter(r => r.id !== this.deleteTarget!.id);
        this.closeDelete();
        this.showFlash('Réservation supprimée.', 'success');
        this.cdr.detectChanges();
      },
      error: () => {
        this.deleteLoading = false;
        this.showFlash('Erreur lors de la suppression.', 'error');
        this.cdr.detectChanges();
      }
    });
  }

  // ── Flash messages ───────────────────────────────────────────
  private showFlash(message: string, type: 'success' | 'error'): void {
    const id = Date.now().toString();
    this.flashes.push({ id, message, type });
    setTimeout(() => {
      this.flashes = this.flashes.filter(f => f.id !== id);
      this.cdr.detectChanges();
    }, 3000);
  }

  trackById(_: number, item: Reservation): string { return item.id; }
}