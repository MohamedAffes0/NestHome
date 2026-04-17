import {
  Component, Output, EventEmitter, ChangeDetectorRef, ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ContractService, RealEstateService, UserService } from '../../../../core/services';
import { Contract, CreateContractDto, RealEstate, User } from '../../../../core/models';

@Component({
  selector: 'app-contract-add-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contract-add-modal.html',
  styleUrls: ['./contract-add-modal.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContractAddModal {
  @Output() close   = new EventEmitter<void>();
  @Output() created = new EventEmitter<Contract>();

  // ── Real estate picker ─────────────────────────────────
  reSearch    = '';
  availableRE: RealEstate[] = [];
  filteredRE:  RealEstate[] = [];
  selectedRE:  RealEstate | null = null;
  reLoading   = false;

  // ── User picker ────────────────────────────────────────
  userSearch    = '';
  filteredUsers: User[] = [];
  allUsers:      User[] = [];
  selectedUser:  User | null = null;
  usersLoading  = false;

  // ── Form ──────────────────────────────────────────────
  form = { cinPassport: '', startDate: '', endDate: '' };
  creating = false;
  error    = '';

  constructor(
    private contractService:   ContractService,
    private realEstateService: RealEstateService,
    private userService:       UserService,
    private cdr:               ChangeDetectorRef,
  ) {
    this.loadRE();
    this.loadUsers();
  }

  // ── Load data ──────────────────────────────────────────
  private loadRE(): void {
    this.reLoading = true;
    this.realEstateService.getAll({}, 1, 100).subscribe({
      next: res => {
        this.availableRE = res.items.filter((re: RealEstate) => re.status === 0 || re.status === 1);
        this.filteredRE  = [...this.availableRE];
        this.reLoading   = false;
        this.cdr.markForCheck();
      },
      error: () => { this.reLoading = false; this.cdr.markForCheck(); },
    });
  }

  private loadUsers(): void {
    this.usersLoading = true;
    this.userService.getAllUsers({}, 1, 200).subscribe({
      next: res => {
        this.allUsers      = res.items.filter((u: User) => u.role === 'user');
        this.filteredUsers = [...this.allUsers];
        this.usersLoading  = false;
        this.cdr.markForCheck();
      },
      error: () => { this.usersLoading = false; this.cdr.markForCheck(); },
    });
  }

  // ── RE search ──────────────────────────────────────────
  onRESearch(val: string): void {
    this.reSearch   = val;
    const q         = val.toLowerCase();
    this.filteredRE = q
      ? this.availableRE.filter(re =>
          re.title?.toLowerCase().includes(q) || re.address?.toLowerCase().includes(q))
      : [...this.availableRE];
    this.cdr.markForCheck();
  }

  selectRE(re: RealEstate): void {
    this.selectedRE = re;
    this.reSearch   = re.title ?? '';
    this.filteredRE = [];
    this.cdr.markForCheck();
  }

  clearRE(): void {
    this.selectedRE = null;
    this.reSearch   = '';
    this.filteredRE = [...this.availableRE];
    this.cdr.markForCheck();
  }

  reStatusLabel(re: RealEstate): string { return re.status === 1 ? 'Location' : 'Vente'; }

  get isRentalSelected(): boolean { return this.selectedRE?.status === 1; }

  // ── User search ────────────────────────────────────────
  onUserSearch(val: string): void {
    this.userSearch    = val;
    const q            = val.toLowerCase();
    this.filteredUsers = q
      ? this.allUsers.filter(u =>
          u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q))
      : [...this.allUsers];
    this.cdr.markForCheck();
  }

  selectUser(u: User): void {
    this.selectedUser  = u;
    this.userSearch    = u.name ?? '';
    this.filteredUsers = [];
    this.cdr.markForCheck();
  }

  clearUser(): void {
    this.selectedUser  = null;
    this.userSearch    = '';
    this.filteredUsers = [...this.allUsers];
    this.cdr.markForCheck();
  }

  userAvatar(u: User): string {
    return u.image
      || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name ?? 'U')}&background=1e3a6e&color=f2cc6a&bold=true&size=64`;
  }

  // ── Validation ─────────────────────────────────────────
  get canCreate(): boolean {
    return !!this.selectedRE
      && !!this.selectedUser
      && !!this.form.cinPassport.trim()
      && !!this.form.startDate
      && (this.isRentalSelected ? !!this.form.endDate : true);
  }

  // ── Submit ─────────────────────────────────────────────
  submit(): void {
    if (!this.canCreate || this.creating) return;
    this.creating = true;
    this.error    = '';
    this.cdr.markForCheck();

    const dto: CreateContractDto = {
      realEstateId: this.selectedRE!.id,
      userId:       this.selectedUser!.id,
      cinPassport:  this.form.cinPassport.trim(),
      startDate:    this.form.startDate,
      ...(this.isRentalSelected && this.form.endDate ? { endDate: this.form.endDate } : {}),
    };

    this.contractService.create(dto).subscribe({
      next: contract => {
        this.creating = false;
        this.created.emit(contract);
      },
      error: err => {
        this.creating = false;
        this.error = err?.error?.message ?? 'Erreur lors de la création du contrat.';
        this.cdr.markForCheck();
      },
    });
  }

  onOverlayClick(): void {
    if (!this.creating) this.close.emit();
  }
}