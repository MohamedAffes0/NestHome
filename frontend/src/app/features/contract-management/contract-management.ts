import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

import { Contract, UnpaidContractsResponse } from '../../core/models';
import { Pagination } from '../../shared/components/pagination/pagination';
import { ContractCard } from '../../shared/components/contract/contract-card/contract-card';
import { UnpaidContracts } from '../../shared/components/contract/unpaid-contracts/unpaid-contracts';
import { ContractAddModal } from '../../shared/components/contract/contract-add-modal/contract-add-modal';
import { ConfirmDeleteModal } from '../../shared/components/confirm-delete-modal/confirm-delete-modal';
import { ContractService } from '../../core/services';

type FilterType = 'all' | 'sale' | 'rental';

@Component({
  selector: 'app-contract-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ContractCard,
    UnpaidContracts,
    ContractAddModal,
    ConfirmDeleteModal,
    Pagination,
  ],
  templateUrl: './contract-management.html',
  styleUrls: ['./contract-management.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContractManagement implements OnInit, OnDestroy {
  allContracts: Contract[] = [];
  loading = true;

  currentPage = 1;
  readonly pageSize = 10;

  searchQuery = '';
  filterType: FilterType = 'all';

  private search$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  flashMsg = '';
  flashType: 'success' | 'error' = 'success';
  private flashTimer?: ReturnType<typeof setTimeout>;

  // Unpaid
  unpaidSale: Contract[] = [];
  unpaidRental: Contract[] = [];
  unpaidTotal = 0;
  unpaidLoading = true;

  // Modals
  showAddModal = false;
  contractToDelete: Contract | null = null;
  deleteLoading = false;

  constructor(
    private contractService: ContractService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadContracts();
    this.loadUnpaid();

    this.search$
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.currentPage = 1;
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    clearTimeout(this.flashTimer);
  }

  // ── Load ──────────────────────────────────────────────────
  loadContracts(): void {
    this.loading = true;
    this.contractService
      .getAll({}, 1, 500)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.allContracts = res.items;
          this.currentPage = 1;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.loading = false;
          this.flash('Erreur lors du chargement des contrats.', 'error');
          this.cdr.markForCheck();
        },
      });
  }

  loadUnpaid(): void {
    this.unpaidLoading = true;
    this.contractService
      .getUnpaidExpired()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: UnpaidContractsResponse) => {
          this.unpaidSale = res.sale;
          this.unpaidRental = res.rental;
          this.unpaidTotal = res.total;
          this.unpaidLoading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.unpaidLoading = false;
          this.cdr.markForCheck();
        },
      });
  }

  // ── Delete ────────────────────────────────────────────────
  get deleteMessage(): string {
    const c = this.contractToDelete;
    if (!c) return '';
    const property = c.realEstate?.title ?? '—';
    const client   = c.user?.name        ?? '—';
    return `Supprimer le contrat de <strong>${property}</strong> pour <strong>${client}</strong> ?`;
  }

  confirmDelete(): void {
    if (!this.contractToDelete || this.deleteLoading) return;
    this.deleteLoading = true;
    this.cdr.markForCheck();

    this.contractService.delete(this.contractToDelete.id).subscribe({
      next: () => {
        this.allContracts = this.allContracts.filter(c => c.id !== this.contractToDelete!.id);
        this.deleteLoading = false;
        this.contractToDelete = null;
        this.loadUnpaid();
        this.flash('Contrat supprimé.', 'success');
        this.cdr.markForCheck();
      },
      error: () => {
        this.deleteLoading = false;
        this.contractToDelete = null;
        this.flash('Erreur lors de la suppression.', 'error');
        this.cdr.markForCheck();
      },
    });
  }

  // ── Filters ───────────────────────────────────────────────
  get filtered(): Contract[] {
    let list = [...this.allContracts];
    if (this.filterType === 'sale')   list = list.filter(c => c.endDate === null);
    if (this.filterType === 'rental') list = list.filter(c => c.endDate !== null);
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(c =>
        c.realEstate?.title?.toLowerCase().includes(q) ||
        c.user?.name?.toLowerCase().includes(q)       ||
        c.cinPassport?.toLowerCase().includes(q),
      );
    }
    return list;
  }

  get totalSales():   number { return this.allContracts.filter(c => c.endDate === null).length; }
  get totalRentals(): number { return this.allContracts.filter(c => c.endDate !== null).length; }

  // ── Pagination ────────────────────────────────────────────
  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filtered.length / this.pageSize));
  }

  get pagedContracts(): Contract[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
  }

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.currentPage = p;
    this.cdr.markForCheck();
  }

  onSearchInput(val: string): void {
    this.searchQuery = val;
    this.currentPage = 1;
    this.search$.next(val);
  }

  setFilter(type: FilterType): void {
    this.filterType = type;
    this.currentPage = 1;
    this.cdr.markForCheck();
  }

  // ── Modal callbacks ───────────────────────────────────────
  onContractCreated(contract: Contract): void {
    this.showAddModal = false;
    this.loadContracts();
    this.loadUnpaid();
    this.flash('Contrat créé avec succès.', 'success');
  }

  // ── Flash ─────────────────────────────────────────────────
  private flash(msg: string, type: 'success' | 'error'): void {
    this.flashMsg = msg;
    this.flashType = type;
    clearTimeout(this.flashTimer);
    this.flashTimer = setTimeout(() => {
      this.flashMsg = '';
      this.cdr.markForCheck();
    }, 3500);
    this.cdr.markForCheck();
  }
}