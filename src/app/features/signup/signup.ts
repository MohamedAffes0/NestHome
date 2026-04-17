import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Alert } from '../../shared/components/alert/alert';
import { PasswordStrength } from '../../shared/components/password-strength/password-strength';
import { AuthService } from '../../core/services';
import { AuthVisual } from '../../shared/components/auth-visual/auth-visual';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Alert, PasswordStrength, AuthVisual],
  templateUrl: './signup.html',
  styleUrls: ['./signup.css']
})
export class Signup {

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  form = {
    firstName: '',
    lastName:  '',
    email:     '',
    password:  '',
    confirm:   '',
    terms:     false,
  };

  showPassword = false;
  showConfirm  = false;
  isLoading    = false;
  errorMessage = '';

  togglePassword(): void { this.showPassword = !this.showPassword; }
  toggleConfirm():  void { this.showConfirm  = !this.showConfirm;  }

  onSubmit(): void {
    this.errorMessage = '';

    // ── Validation ──────────────────────────────────────────
    if (!this.form.firstName.trim() || !this.form.lastName.trim()) {
      this.showError('Le prénom et le nom sont obligatoires.'); return;
    }
    if (!this.form.email.trim()) {
      this.showError("L'adresse e-mail est obligatoire."); return;
    }
    if (!this.form.password) {
      this.showError('Le mot de passe est obligatoire.'); return;
    }
    if (this.form.password.length < 8) {
      this.showError('Le mot de passe doit contenir au moins 8 caractères.'); return;
    }
    if (this.form.password !== this.form.confirm) {
      this.showError('Les mots de passe ne correspondent pas.'); return;
    }
    if (!this.form.terms) {
      this.showError("Vous devez accepter les conditions d'utilisation."); return;
    }

    this.isLoading = true;
    this.cdr.detectChanges();

    const name = `${this.form.firstName.trim()} ${this.form.lastName.trim()}`;

    this.authService.signUp({
      name,
      email:    this.form.email.trim(),
      password: this.form.password,
    }).subscribe({
      next: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
        this.router.navigate(['/check-email']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = this.mapError(err);
        this.cdr.detectChanges();
      }
    });
  }

  private mapError(err: any): string {
    const status  = err?.status;
    const message = err?.error?.message ?? err?.message ?? '';

    if (status === 409 || message.toLowerCase().includes('exist') || message.toLowerCase().includes('already')) {
      return 'Un compte avec cette adresse e-mail existe déjà.';
    }
    if (status === 400) {
      return 'Données invalides. Vérifiez les champs et réessayez.';
    }
    if (status === 429) {
      return 'Trop de tentatives. Veuillez patienter quelques minutes.';
    }
    if (status === 0 || status >= 500) {
      return 'Le serveur est indisponible. Veuillez réessayer plus tard.';
    }
    return message || 'Une erreur est survenue. Veuillez réessayer.';
  }

  showError(message: string): void {
    this.errorMessage = message;
    setTimeout(() => {
      this.errorMessage = '';
      this.cdr.detectChanges();
    }, 3000);
    this.cdr.detectChanges();
  }

  async onGoogleSignIn(): Promise<void> {
    this.errorMessage = '';

    try {
      await this.authService.signInWithGoogle('/signup');
    } catch {
      this.showError('Impossible de continuer avec Google. Veuillez reessayer.');
    }
  }
}
