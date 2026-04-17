import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from '../../../../core/models';

@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-card.html',
  styleUrls: ['./user-card.css']
})
export class UserCard implements OnChanges {
  @Input() user!: User;
  @Output() toggleRole   = new EventEmitter<'admin' | 'agent' | 'user'>();
  @Output() toggleActive = new EventEmitter<boolean>();
  @Output() delete       = new EventEmitter<void>();

  selectedRole: 'admin' | 'agent' | 'user' = 'user';

  readonly roles: { value: 'admin' | 'agent' | 'user'; label: string }[] = [
    { value: 'admin', label: 'Admin'  },
    { value: 'agent', label: 'Agent'  },
    { value: 'user',  label: 'Membre' },
  ];

  ngOnChanges(changes: SimpleChanges): void {
    // Sync selectedRole when user input changes (e.g. after an update from server)
    if (changes['user'] && this.user) {
      this.selectedRole = this.user.role;
    }
  }

  onRoleChange(): void {
    if (this.selectedRole !== this.user.role) {
      this.toggleRole.emit(this.selectedRole);
    }
  }

  get avatarUrl(): string {
    if (this.user.image) return this.user.image;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(this.user.name)}&background=1e3a6e&color=f2cc6a&bold=true&size=80`;
  }

  get roleBadgeClass(): string {
    return { admin: 'uc__role--admin', agent: 'uc__role--agent', user: 'uc__role--user' }[this.user.role] ?? '';
  }

  get roleLabel(): string {
    return { admin: 'Admin', agent: 'Agent', user: 'Membre' }[this.user.role] ?? this.user.role;
  }
}