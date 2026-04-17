import { ChangeDetectorRef, Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from '../../../../core/models';
import { Alert } from '../../alert/alert';
import { ImageUpload } from '../../image-upload/image-upload';
import { UserService } from '../../../../core/services';

@Component({
  selector: 'app-profile-info',
  standalone: true,
  imports: [CommonModule, FormsModule, Alert, ImageUpload],
  templateUrl: './profile-info.html',
  styleUrls: ['./profile-info.css']
})
export class ProfileInfo implements OnInit, OnChanges {
  @Input() currentUser:   User | null   = null;
  @Input() avatarPreview: string | null = null;

  // Receives a pending file from the sidebar
  @Input() pendingFile: File | null = null;

  @Output() avatarChanged = new EventEmitter<{ file: File; preview: string } | null>();

  form         = { name: '', email: '' };
  selectedFile: File | null = null;
  successMsg   = '';
  infoMsg      = '';
  errorMsg     = '';
  isLoading    = false;

  constructor(
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (this.currentUser) {
      this.form.name  = this.currentUser.name;
      this.form.email = this.currentUser.email;
    }
    // If there's already a pending file on init (unlikely but just in case), sync it
    if (this.pendingFile) {
      this.selectedFile = this.pendingFile;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Sync currentUser → form fields
    if (changes['currentUser'] && this.currentUser) {
      this.form.name  = this.currentUser.name;
      this.form.email = this.currentUser.email;
    }

    // Sync file changes from the sidebar or info form → selectedFile + avatarPreview
    if (changes['pendingFile']) {
      if (this.pendingFile) {
        this.selectedFile = this.pendingFile;
      } else {
        this.selectedFile  = null;
        this.avatarPreview = null;
      }
    }

    // If the avatarPreview is cleared (either from sidebar or info form), make sure to clear the selectedFile as well
    if (changes['avatarPreview'] && !changes['avatarPreview'].firstChange) {
      if (!this.avatarPreview) {
        this.selectedFile = null;
      }
    }
  }

  onAvatarFileSelected(file: File): void {
    this.selectedFile  = file;
    const preview = URL.createObjectURL(file);
    this.avatarPreview = preview;
    this.avatarChanged.emit({ file, preview });
  }

  onAvatarCleared(): void {
    this.selectedFile  = null;
    this.avatarPreview = null;
    this.avatarChanged.emit(null);
  }

  onSubmit(): void {
    this.errorMsg = this.successMsg = this.infoMsg = '';

    if (!this.form.name.trim() || !this.form.email.trim()) {
      this.errorMsg = "Le nom et l'email sont obligatoires.";
      return;
    }

    this.isLoading = true;
    this.cdr.detectChanges();

    if (this.selectedFile) {
      // 1. Upload image → 2. Save profile data (name/email)
      this.userService.updateProfileImage(this.selectedFile).subscribe({
        next: () => this.saveProfileData(true),
        error: (err) => {
          this.isLoading = false;
          this.errorMsg  = this.mapError(err, "Erreur lors de l'upload de la photo.");
          this.cdr.detectChanges();
        }
      });
    } else {
      // No image to upload, just save the profile data
      this.saveProfileData(false);
    }
  }

  private saveProfileData(imageWasUploaded: boolean): void {
    const hasNameChanged  = this.form.name.trim()  !== (this.currentUser?.name  ?? '');
    const hasEmailChanged = this.form.email.trim() !== (this.currentUser?.email ?? '');

    if (!hasNameChanged && !hasEmailChanged) {
      // No changes to save, just update the UI accordingly
      this.isLoading    = false;
      this.selectedFile = null;
      // Show a success message if an image was uploaded, otherwise just an info message since no profile data changed
      if (imageWasUploaded) {
        this.successMsg = 'Photo de profil mise à jour avec succès.';
      } else {
        this.infoMsg = 'Aucune modification détectée.';
      }
      this.cdr.detectChanges();
      return;
    }

    this.userService.updateProfile({
      name:  this.form.name.trim(),
      email: this.form.email.trim(),
    }).subscribe({
      next: (user) => {
        this.isLoading    = false;
        this.successMsg   = imageWasUploaded
          ? 'Profil et photo mis à jour avec succès.'
          : 'Profil mis à jour avec succès.';
        this.selectedFile = null;
        this.form.name    = user.name;
        this.form.email   = user.email;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMsg  = this.mapError(err, 'Erreur lors de la mise à jour du profil.');
        this.cdr.detectChanges();
      }
    });
    setTimeout(() => {
      this.errorMsg = '';
      this.cdr.detectChanges();
    }, 3000);
  }

  private mapError(err: any, fallback: string): string {
    const status  = err?.status;
    const message = err?.error?.message ?? err?.message ?? '';
    if (status === 409 || message.toLowerCase().includes('email')) return 'Cette adresse e-mail est déjà utilisée.';
    if (status === 400) return 'Données invalides. Vérifiez les champs.';
    if (status === 401 || status === 403) return 'Session expirée. Veuillez vous reconnecter.';
    if (status === 0 || status >= 500) return 'Serveur indisponible. Réessayez plus tard.';
    return message || fallback;
  }
}