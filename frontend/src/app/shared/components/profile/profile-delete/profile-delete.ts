import { ChangeDetectorRef, Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from '../../../../core/models';
import { Alert } from '../../alert/alert';
import { UserService } from '../../../../core/services';

@Component({
  selector: 'app-profile-delete',
  standalone: true,
  imports: [CommonModule, FormsModule, Alert],
  templateUrl: './profile-delete.html',
  styleUrls: ['./profile-delete.css']
})
export class ProfileDelete {
  @Input() currentUser: User | null = null;

  // Emit when the account has been successfully deleted, so the parent component can handle logout and redirection
  @Output() accountDeleted = new EventEmitter<void>();

  confirmText = '';
  errorMsg    = '';
  isLoading   = false;

  constructor(
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  get confirmMatch(): boolean {
    return this.confirmText === (this.currentUser?.email ?? '');
  }

  onDelete(): void {
    if (!this.confirmMatch) return;

    this.errorMsg  = '';
    this.isLoading = true;
    this.cdr.detectChanges();

    this.userService.deleteMyProfile().subscribe({
      next: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
        this.accountDeleted.emit();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMsg  = this.mapError(err);
        this.cdr.detectChanges();
        setTimeout(() => {
          this.errorMsg = '';
          this.cdr.detectChanges();
        }, 3000);
      }
    });
  }

  private mapError(err: any): string {
    const status  = err?.status;
    const message = err?.error?.message ?? err?.message ?? '';
    if (status === 401 || status === 403) return 'Session expirée. Veuillez vous reconnecter.';
    if (status === 0 || status >= 500)    return 'Serveur indisponible. Réessayez plus tard.';
    return message || 'Une erreur est survenue lors de la suppression.';
  }
}