import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../../../../core/models';
import { UserService } from '../../../../core/services';
import { Alert } from '../../alert/alert';

export type ActiveTab = 'info' | 'password' | 'danger';

@Component({
  selector: 'app-profile-sidebar',
  standalone: true,
  imports: [CommonModule, Alert],
  templateUrl: './profile-sidebar.html',
  styleUrls: ['./profile-sidebar.css']
})
export class ProfileSidebar {
  @Input() currentUser:   User | null   = null;
  @Input() activeTab:     ActiveTab     = 'info';
  @Input() avatarPreview: string | null = null;

  @Output() tabChange     = new EventEmitter<ActiveTab>();
  @Output() fileSelected  = new EventEmitter<File>();
  @Output() avatarCleared = new EventEmitter<void>();

  deleteLoading = false;
  deleteError   = '';

  constructor(
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  get hasServerImage(): boolean {
    return !!(this.currentUser?.image);
  }

  get showDeleteButton(): boolean {
    return !!(this.avatarPreview || this.hasServerImage);
  }

  setTab(tab: ActiveTab): void {
    this.tabChange.emit(tab);
  }

  onSidebarAvatarChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0];
    if (!file) return;
    input.value = '';
    this.fileSelected.emit(file);
  }

  onDeleteAvatar(): void {
    // Local preview exists but no server image → just clear the preview without API call
    if (this.avatarPreview && !this.hasServerImage) {
      this.avatarCleared.emit();
      return;
    }

    // Server image exists → call API to delete it, then clear the preview
    this.deleteLoading = true;
    this.deleteError   = '';
    this.cdr.detectChanges();

    this.userService.deleteProfileImage().subscribe({
      next: () => {
        this.deleteLoading = false;
        this.cdr.detectChanges();
        this.avatarCleared.emit(); // notif parent to clear preview + show success message
      },
      error: (err) => {
        this.deleteLoading = false;
        this.deleteError   = 'Erreur lors de la suppression de la photo.';
        this.cdr.detectChanges();
        setTimeout(() => { this.deleteError = ''; this.cdr.detectChanges(); }, 3000);
      }
    });
  }

  getAvatar(): string {
    if (this.avatarPreview) return this.avatarPreview;
    if (this.currentUser?.image) return this.currentUser.image;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(this.currentUser?.name ?? 'U')}&background=1e3a6e&color=f2cc6a&bold=true&size=128`;
  }

  formatRole(role: string): string {
    return ({ admin: 'Administrateur', agent: 'Agent', user: 'Membre' } as Record<string, string>)[role] ?? role;
  }
}