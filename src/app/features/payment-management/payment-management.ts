import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { PaymentService } from '../../core/services';
import { Payment } from '../../core/models';

import { Alert } from '../../shared/components/alert/alert';
import { Pagination } from '../../shared/components/pagination/pagination';
import { PaymentAddModal } from '../../shared/components/payment/payment-add-modal/payment-add-modal';
import { PaymentCard } from '../../shared/components/payment/payment-card/payment-card';
import { ConfirmDeleteModal } from '../../shared/components/confirm-delete-modal/confirm-delete-modal';

@Component({
  selector: 'app-payment-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PaymentCard,
    Alert,
    PaymentAddModal,
    ConfirmDeleteModal,
    Pagination,
  ],
  templateUrl: './payment-management.html',
  styleUrls: ['./payment-management.css'],
})
export class PaymentManagement implements OnInit {
  payments: Payment[] = [];
  loading = true;
  errorMsg = '';
  successMsg = '';

  searchQuery = '';
  sortDir: 'asc' | 'desc' = 'desc';

  currentPage = 1;
  readonly pageSize = 10;

  // Modals
  showAddModal = false;
  paymentToDelete: Payment | null = null;
  deleteLoading = false;

  constructor(
    private paymentService: PaymentService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.errorMsg = '';
    this.cdr.detectChanges();

    this.paymentService.getAll({ sortByDate: 'desc' }, 1, 500).subscribe({
      next: (res) => {
        this.payments = res.items;
        this.currentPage = 1;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMsg = 'Impossible de charger les paiements.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  // ── Delete ────────────────────────────────────────────────
  get deleteMessage(): string {
    const p = this.paymentToDelete;
    if (!p) return '';
    const amount   = p.amount;
    const property = p.realEstate?.title ?? 'ce bien';
    return `Paiement de <strong>${amount} DT</strong> pour <strong>${property}</strong>.`;
  }

  confirmDelete(): void {
    if (!this.paymentToDelete || this.deleteLoading) return;
    this.deleteLoading = true;
    this.cdr.detectChanges();

    this.paymentService.delete(this.paymentToDelete.id).subscribe({
      next: () => {
        this.payments = this.payments.filter(p => p.id !== this.paymentToDelete!.id);
        if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
        this.deleteLoading = false;
        this.paymentToDelete = null;
        this.flash('Paiement supprimé.');
        this.cdr.detectChanges();
      },
      error: () => {
        this.deleteLoading = false;
        this.paymentToDelete = null;
        this.flashError('Erreur lors de la suppression.');
        this.cdr.detectChanges();
      },
    });
  }

  // ── Computed ──────────────────────────────────────────────
  get filtered(): Payment[] {
    let list = [...this.payments];
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(p =>
        p.realEstate?.title?.toLowerCase().includes(q)   ||
        p.realEstate?.address?.toLowerCase().includes(q) ||
        p.user?.name?.toLowerCase().includes(q)          ||
        p.user?.email?.toLowerCase().includes(q),
      );
    }
    list.sort((a, b) => {
      const da = new Date(a.date).getTime();
      const db = new Date(b.date).getTime();
      return this.sortDir === 'desc' ? db - da : da - db;
    });
    return list;
  }

  get totalRevenue(): number { return this.payments.reduce((s, p) => s + Number(p.amount), 0); }
  get avgPayment():   number { return this.payments.length ? this.totalRevenue / this.payments.length : 0; }

  get totalPages(): number { return Math.max(1, Math.ceil(this.filtered.length / this.pageSize)); }

  get pagedPayments(): Payment[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
  }

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.currentPage = p;
    this.cdr.detectChanges();
  }

  setSort(dir: 'asc' | 'desc'): void {
    this.sortDir = dir;
    this.currentPage = 1;
    this.cdr.detectChanges();
  }

  trackById(_: number, p: Payment): string { return p.id; }

  // ── Modal callbacks ────────────────────────────────────────
  onPaymentCreated(payment: Payment): void {
    this.payments = [payment, ...this.payments];
    this.showAddModal = false;
    this.currentPage = 1;
    this.flash('Paiement enregistré avec succès.');
  }

  // ── Flash ─────────────────────────────────────────────────
  private flash(msg: string): void {
    this.successMsg = msg;
    this.errorMsg = '';
    this.cdr.detectChanges();
    setTimeout(() => { this.successMsg = ''; this.cdr.detectChanges(); }, 3000);
  }

  private flashError(msg: string): void {
    this.errorMsg = msg;
    this.successMsg = '';
    this.cdr.detectChanges();
    setTimeout(() => { this.errorMsg = ''; this.cdr.detectChanges(); }, 3000);
  }
}