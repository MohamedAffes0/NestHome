import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthVisual } from '../../shared/components/auth-visual/auth-visual';
import { AuthService } from '../../core/services';

type VerifyState = 'loading' | 'success' | 'error' | 'expired';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterModule, AuthVisual],
  templateUrl: './verify-email.html',
  styleUrls: ['./verify-email.css'],
})
export class VerifyEmail implements OnInit {
  state: VerifyState = 'loading';
  errorMsg = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.state = 'error';
      this.errorMsg = 'Lien de vérification invalide ou manquant.';
      this.cdr.detectChanges();
      return;
    }
    this.verifyEmail(token);
  }

  private verifyEmail(token: string): void {
    this.authService.verifyEmail(token).subscribe({
      next: () => this.handleSuccess(),
      error: (err) => {
        if (err.status === 302 || err.status === 0 || err.status === 200) {
          this.handleSuccess();
          return;
        }
        const msg: string = err?.error?.message ?? err?.error ?? '';
        if (msg.toLowerCase().includes('expired') || msg.toLowerCase().includes('invalid')) {
          this.state = 'expired';
        } else {
          this.state = 'error';
          this.errorMsg = 'Une erreur est survenue lors de la vérification.';
        }
        this.cdr.detectChanges();
      },
    });
  }

  private handleSuccess(): void {
    this.state = 'success';
    this.cdr.detectChanges();

    setTimeout(() => this.router.navigate(['/login']), 2000);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
