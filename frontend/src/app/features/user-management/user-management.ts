import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, AuthService } from '../../core/services';
import { User, CreateUserDto } from '../../core/models';
import { Alert } from '../../shared/components/alert/alert';
import { UserCard } from '../../shared/components/user/user-card/user-card';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, UserCard, Alert],
  templateUrl: './user-management.html',
  styleUrls: ['./user-management.css']
})
export class UserManagement implements OnInit {

  users: User[] = [];
  loading  = true;
  errorMsg = '';

  // Current user ID to prevent self-deletion or role change
  currentUserId: string | null = null;

  // Search
  searchQuery = '';

  // Global messages
  successMsg  = '';
  actionError = '';

  // IDs in pending state (role change, activation toggle) to disable interactions until response
  pendingIds = new Set<string>();

  // ── Modal suppression ──────────────────────────────────
  deletingUser: User | null = null;
  deleteLoading = false;

  // ── Modal creation ─────────────────────────────────────
  showCreateModal = false;
  createLoading   = false;
  createError     = '';
  newUser: CreateUserDto = { name: '', email: '', password: '', role: 'user' };
  showPassword = false;

  readonly roleOptions: { value: 'admin' | 'agent' | 'user'; label: string }[] = [
    { value: 'admin', label: 'Admin'  },
    { value: 'agent', label: 'Agent'  },
    { value: 'user',  label: 'Membre' },
  ];

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Get current user ID to exclude from list and prevent self-deletion or role change
    this.authService.user$.subscribe(u => {
      this.currentUserId = u?.id ?? null;
    });
    this.load();
  }

  load(): void {
    this.loading  = true;
    this.errorMsg = '';
    this.cdr.detectChanges();

    this.userService.getAllUsers({}, 1, 200).subscribe({
      next: (res) => {
        this.users   = res.items;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMsg = 'Impossible de charger les utilisateurs.';
        this.loading  = false;
        this.cdr.detectChanges();
      }
    });
  }

  /** Return users except the current user */
  get filtered(): User[] {
    const q = this.searchQuery.trim().toLowerCase();
    return this.users
      .filter(u => u.id !== this.currentUserId)
      .filter(u => !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }

  // ── Role ──────────────────────────────────────────────
  onRoleChange(user: User, role: 'admin' | 'agent' | 'user'): void {
    if (this.pendingIds.has(user.id)) return;
    this.pendingIds.add(user.id);

    this.userService.updateUserRole(user.id, role).subscribe({
      next: (updated) => {
        this.users = this.users.map(u => u.id === updated.id ? updated : u);
        this.pendingIds.delete(user.id);
        this.flash('Rôle mis à jour.');
      },
      error: () => {
        this.pendingIds.delete(user.id);
        this.flashError('Impossible de modifier le rôle.');
      }
    });
  }

  // ── Actif / Inactif ───────────────────────────────────
  onToggleActive(user: User, isActive: boolean): void {
    if (this.pendingIds.has(user.id)) return;
    this.pendingIds.add(user.id);

    this.userService.updateActivateUser(user.id, isActive).subscribe({
      next: (updated) => {
        this.users = this.users.map(u => u.id === updated.id ? updated : u);
        this.pendingIds.delete(user.id);
        this.flash(isActive ? 'Compte activé.' : 'Compte désactivé.');
      },
      error: () => {
        this.pendingIds.delete(user.id);
        this.flashError('Impossible de modifier le statut.');
      }
    });
  }

  // ── Delete ───────────────────────────────────────
  askDelete(user: User): void   { this.deletingUser = user; }
  cancelDelete(): void          { this.deletingUser = null; }

  confirmDelete(): void {
    if (!this.deletingUser) return;
    this.deleteLoading = true;
    this.cdr.detectChanges();

    this.userService.deleteUser(this.deletingUser.id).subscribe({
      next: () => {
        this.users         = this.users.filter(u => u.id !== this.deletingUser!.id);
        this.deletingUser  = null;
        this.deleteLoading = false;
        this.flash('Utilisateur supprimé.');
      },
      error: () => {
        this.deleteLoading = false;
        this.flashError('Impossible de supprimer cet utilisateur.');
        this.cdr.detectChanges();
      }
    });
  }

  // ── Create ──────────────────────────────────────────
  openCreate(): void {
    this.newUser         = { name: '', email: '', password: '', role: 'user' };
    this.createError     = '';
    this.showPassword    = false;
    this.showCreateModal = true;
  }

  closeCreate(): void { this.showCreateModal = false; }

  submitCreate(): void {
    if (!this.newUser.name.trim() || !this.newUser.email.trim() || !this.newUser.password) {
      this.createError = 'Tous les champs sont obligatoires.'; return;
    }
    if (this.newUser.password.length < 8) {
      this.createError = 'Le mot de passe doit contenir au moins 8 caractères.'; return;
    }

    this.createLoading = true;
    this.createError   = '';
    this.cdr.detectChanges();

    this.userService.createUser(this.newUser).subscribe({
      next: (created) => {
        this.users           = [created, ...this.users];
        this.createLoading   = false;
        this.showCreateModal = false;
        this.flash('Utilisateur créé avec succès.');
      },
      error: (err) => {
        this.createLoading = false;
        const msg = err?.error?.message ?? err?.message ?? '';
        this.createError = msg.toLowerCase().includes('exist')
          ? 'Cette adresse e-mail est déjà utilisée.'
          : (msg || 'Erreur lors de la création.');
        this.cdr.detectChanges();
      }
    });
  }

  // ── Flash messages ────────────────────────────────────
  private flash(msg: string): void {
    this.successMsg  = msg;
    this.actionError = '';
    this.cdr.detectChanges();
    setTimeout(() => { this.successMsg = ''; this.cdr.detectChanges(); }, 3000);
  }

  private flashError(msg: string): void {
    this.actionError = msg;
    this.cdr.detectChanges();
    setTimeout(() => { this.actionError = ''; this.cdr.detectChanges(); }, 3000);
  }
}