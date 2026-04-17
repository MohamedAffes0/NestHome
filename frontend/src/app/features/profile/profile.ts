import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services';
import { User } from '../../core/models';
import { ActiveTab, ProfileSidebar } from '../../shared/components/profile/profile-sidebar/profile-sidebar';
import { ProfileInfo } from '../../shared/components/profile/profile-info/profile-info';
import { ProfilePassword } from '../../shared/components/profile/profile-password/profile-password';
import { ProfileDelete } from '../../shared/components/profile/profile-delete/profile-delete';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ProfileSidebar, ProfileInfo, ProfilePassword, ProfileDelete],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class Profile implements OnInit {

  activeTab:     ActiveTab    = 'info';
  currentUser:   User | null  = null;
  avatarPreview: string | null = null;

  // Selected file from either sidebar or info form, waiting to be saved.
  pendingFile: File | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.currentUser = user;
    });
  }

  onTabChange(tab: ActiveTab): void {
    this.activeTab = tab;
  }

  /** Triggered by the sidebar: receives a raw File → create the preview */
  onSidebarFileSelected(file: File): void {
    this.pendingFile   = file;
    this.avatarPreview = URL.createObjectURL(file);
  }

  /** Triggered by the info form: receives { file, preview } | null */
  onInfoAvatarChanged(event: { file: File; preview: string } | null): void {
    this.avatarPreview = event?.preview ?? null;
    this.pendingFile   = event?.file ?? null;
  }

  /** Triggered by the sidebar: receives a null value when the avatar is cleared */
  onAvatarCleared(): void {
    this.avatarPreview = null;
    this.pendingFile   = null;
  }

  onAccountDeleted(): void {
    this.authService.logout().then(() => {
      this.router.navigate(['/']);
    });
  }
}