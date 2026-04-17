import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Alert } from '../../alert/alert';
import { PasswordStrength } from '../../password-strength/password-strength';
import { UserService } from '../../../../core/services';

@Component({
  selector: 'app-profile-password',
  standalone: true,
  imports: [CommonModule, FormsModule, Alert, PasswordStrength],
  templateUrl: './profile-password.html',
  styleUrls: ['./profile-password.css']
})
export class ProfilePassword {

  form = { current: '', next: '', confirm: '' };
  showCurrent = false;
  showNext    = false;
  showConfirm = false;
  successMsg  = '';
  errorMsg    = '';
  isLoading   = false;

  constructor(
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  onSubmit(): void {
    this.errorMsg = this.successMsg = '';

    if (!this.form.current || !this.form.next || !this.form.confirm) {
      this.errorMsg = 'Tous les champs sont obligatoires.'; return;
    }
    if (this.form.next.length < 8) {
      this.errorMsg = 'Le nouveau mot de passe doit contenir au moins 8 caractères.'; return;
    }
    if (this.form.next !== this.form.confirm) {
      this.errorMsg = 'Les nouveaux mots de passe ne correspondent pas.'; return;
    }

    this.isLoading = true;
    this.cdr.detectChanges();

    this.userService.changePassword({
      currentPassword: this.form.current,
      newPassword:     this.form.next,
    }).subscribe({
      next: () => {
        this.isLoading  = false;
        this.successMsg = 'Mot de passe modifié avec succès.';
        this.form = { current: '', next: '', confirm: '' };
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMsg  = this.mapError(err);
        this.cdr.detectChanges();
      }
    });
    setTimeout(() => {
      this.errorMsg = '';
      this.cdr.detectChanges();
    }, 3000);
  }

  private mapError(err: any): string {
    const status  = err?.status;
    const message = err?.error?.message ?? err?.message ?? '';
    if (status === 400 || message.toLowerCase().includes('incorrect') || message.toLowerCase().includes('invalid') || message.toLowerCase().includes('wrong')) {
      return 'Mot de passe actuel incorrect.';
    }
    if (status === 401 || status === 403) return 'Session expirée. Veuillez vous reconnecter.';
    if (status === 0 || status >= 500)    return 'Serveur indisponible. Réessayez plus tard.';
    return message || 'Une erreur est survenue. Veuillez réessayer.';
  }
}