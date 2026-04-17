import { Component, OnInit, OnDestroy, HostListener, ChangeDetectorRef, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AuthService, FavoriteService } from '../../../core/services';
import { User } from '../../../core/models';
import { Observable, Subscription } from 'rxjs';

export interface NavLink {
  label:      string;
  routerLink: string;
  icon:       string;
  badge?:     boolean;
  exact?:     boolean;
  role?:      'manager' | 'admin';
}

/// Pipe to safely render SVG icons from strings
@Pipe({ name: 'safeHtml', standalone: true })
export class SafeHtmlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}
  transform(value: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(value);
  }
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink, RouterLinkActive, SafeHtmlPipe],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
})
export class Navbar implements OnInit, OnDestroy {
  currentUser$: Observable<User | null>;
  favoritesCount = 0;

  isMobileMenuOpen      = false;
  isProfileDropdownOpen = false;
  isScrolled            = false;

  private favSub!: Subscription;

  // ── Public links ──────────────────────────────────────
  readonly navLinks: NavLink[] = [
    {
      label: 'Accueil', routerLink: '/', exact: true,
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
    },
    {
      label: 'Favoris', routerLink: '/favoris', badge: true,
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
    },
  ];

  // ── Manager/Admin links ──
  readonly managerLinks: NavLink[] = [
    {
      label: 'Gestion', routerLink: '/management', role: 'manager',
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>`,
    },
    {
      label: 'Réservations', routerLink: 'reservations/manage', role: 'manager',
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="15" x2="16" y2="15"/><line x1="8" y1="19" x2="12" y2="19"/></svg>`,
    },
    {
      label: 'Admin', routerLink: '/admin/users', role: 'admin',
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    },
    {
      label: 'Paiements', routerLink: '/payments/manage', role: 'manager',
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
    },
    {
      label: 'Contrats', routerLink: '/contracts/manage', role: 'manager',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-receipt-text-icon lucide-receipt-text"><path d="M13 16H8"/><path d="M14 8H8"/><path d="M16 12H8"/><path d="M4 3a1 1 0 0 1 1-1 1.3 1.3 0 0 1 .7.2l.933.6a1.3 1.3 0 0 0 1.4 0l.934-.6a1.3 1.3 0 0 1 1.4 0l.933.6a1.3 1.3 0 0 0 1.4 0l.933-.6a1.3 1.3 0 0 1 1.4 0l.934.6a1.3 1.3 0 0 0 1.4 0l.933-.6A1.3 1.3 0 0 1 19 2a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1 1.3 1.3 0 0 1-.7-.2l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.934.6a1.3 1.3 0 0 1-1.4 0l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-1.4 0l-.934-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-.7.2 1 1 0 0 1-1-1z"/></svg>`,
    },
    {
      label: 'Stats', routerLink: '/stats', role: 'admin',
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>`,
    }
  ];

  // ── Dropdown links ──
  readonly dropdownLinks: NavLink[] = [
    {
      label: 'Mon profil', routerLink: '/profile',
      icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    },
    {
      label: 'Mes favoris', routerLink: '/favoris', badge: true,
      icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
    },
    {
      label: 'Mes réservations', routerLink: '/reservations/my',
      icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
    },
  ];

  constructor(
    private authService:     AuthService,
    private favoriteService: FavoriteService,
    private router:          Router,
    private cdr:             ChangeDetectorRef,
  ) {
    this.currentUser$ = this.authService.user$;
  }

  ngOnInit(): void {
    this.favSub = this.favoriteService.favoritedIds$.subscribe(ids => {
      this.favoritesCount = ids.size;
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void { this.favSub?.unsubscribe(); }

  // ── Helpers ──────────────────────────────────────────────

  isActive(user: User | null): boolean {
    return user?.isActive !== false;
  }

  isManager(user: User | null): boolean {
    if (!this.isActive(user)) return false;
    return user?.role === 'agent' || user?.role === 'admin';
  }

  isAdmin(user: User | null): boolean {
    if (!this.isActive(user)) return false;
    return user?.role === 'admin';
  }

  visibleManagerLinks(user: User | null): NavLink[] {
    return this.managerLinks.filter(link =>
      link.role === 'admin' ? this.isAdmin(user) : this.isManager(user)
    );
  }

  visibleDropdownLinks(user: User | null): NavLink[] {
    return this.dropdownLinks.filter(link =>
      link.routerLink === '/reservations' ? !this.isManager(user) : true
    );
  }

  // ── Events ───────────────────────────────────────────────

  @HostListener('window:scroll')
  onScroll(): void { this.isScrolled = window.scrollY > 10; }

  // ── Close menus if click outside ───────────────────
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const t = event.target as HTMLElement;
    if (!t.closest('.navbar__avatar-wrap'))  this.isProfileDropdownOpen = false;
    if (!t.closest('.navbar__hamburger') && !t.closest('.navbar__mobile-menu')) {
      this.isMobileMenuOpen = false;
    }
  }

  async logout(): Promise<void> {
    await this.authService.logout();
    this.isProfileDropdownOpen = false;
    this.isMobileMenuOpen      = false;
    this.router.navigate(['/']);
  }

  /** Toggle profile dropdown */
  toggleProfileDropdown(e: MouseEvent): void {
    e.stopPropagation();
    this.isProfileDropdownOpen = !this.isProfileDropdownOpen;
  }

  /** Toggle mobile menu and prevent document click listener from immediately closing it */
  toggleMobileMenu(e: MouseEvent): void {
    e.stopPropagation();
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  /** Close mobile menu after navigation */
  closeMobileMenu(): void {
    this.isMobileMenuOpen      = false;
    this.isProfileDropdownOpen = false;
  }
}