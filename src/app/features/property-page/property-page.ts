import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RealEstateService, CommentService, ReservationService, AuthService } from '../../core/services';
import { RealEstateDetail, RealEstateStatus, ApiComment, User } from '../../core/models';

import { PropertyGallery }       from '../../shared/components/property/property-gallery/property-gallery';
import { LocationMap, MapLocation } from '../../shared/components/location-map/location-map';
import { PropertyComments } from '../../shared/components/property/property-comments/property-comments';
import { PropertyDetails } from '../../shared/components/property/property-details/property-details';
import { PropertyAgentCard } from '../../shared/components/property/property-agent-card/property-agent-card';
import { PropertyReservation, ReservationDto } from '../../shared/components/property/property-reservation/property-reservation';

@Component({
  selector: 'app-property-page',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    PropertyGallery, PropertyDetails,
    LocationMap, PropertyComments,
    PropertyReservation, PropertyAgentCard,
  ],
  templateUrl: './property-page.html',
  styleUrls:   ['./property-page.css'],
})
export class PropertyPage implements OnInit {

  @ViewChild('reservationRef') reservationComp!: PropertyReservation;

  property:    RealEstateDetail | null = null;
  currentUser: User | null = null;
  comments:    ApiComment[] = [];
  loading      = true;
  errorMsg     = '';
  commentError = '';

  constructor(
    private route:               ActivatedRoute,
    private router:              Router,
    private auth:                AuthService,
    private realEstateService:   RealEstateService,
    private reservationService:  ReservationService,
    private commentService:      CommentService,
    private cdr:                 ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.auth.user$.subscribe(u => { this.currentUser = u; });

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.router.navigate(['/catalogue']); return; }

    this.realEstateService.getById(id).subscribe({
      next: (data) => {
        this.property = data;
        this.comments = data.comments ?? [];
        this.loading  = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMsg = 'Impossible de charger ce bien.';
        this.loading  = false;
        this.cdr.detectChanges();
      },
    });
  }

  isAvailable(property: RealEstateDetail): boolean {
    return this.property?.status === RealEstateStatus.FOR_RENT || this.property?.status === RealEstateStatus.FOR_SALE;
  }

  // ── Map ───────────────────────────────────────────────────
  get mapLocation(): MapLocation | null {
    const p = this.property as any;
    if (!p || p.lat == null || p.lng == null) return null;
    return { lat: p.lat, lng: p.lng, label: p.title, address: p.address };
  }

  // ── Reservation ───────────────────────────────────────────
  onReservationSubmit(data: ReservationDto): void {
    if (!this.property) return;

    this.reservationService
      .create(this.property.id, {
        clientPhone: data.clientPhone,
        cinPassport: data.cinPassport,
        visitDate:   data.visitDate,
        visitTime:   data.visitTime,
      })
      .subscribe({
        next: () => {
            // Notify child component → display success screen
          this.reservationComp?.markSuccess();
          this.cdr.detectChanges();
        },
        error: (err) => {
          const msg = this.mapReservationError(err);
          this.reservationComp?.markError(msg);
          this.cdr.detectChanges();
        },
      });
  }

  private mapReservationError(err: any): string {
    const status = err?.status;

    const raw     = err?.error?.message ?? err?.message ?? '';
    const message = Array.isArray(raw) ? raw.join(', ') : String(raw);
    const lower   = message.toLowerCase();

    if (status === 401 || status === 403) {
      return 'Session expirée. Veuillez vous reconnecter.';
    }
    if (status === 404) {
      return 'Ce bien immobilier est introuvable.';
    }
    if (status === 409 || lower.includes('exist')) {
      return 'Vous avez déjà une réservation en attente pour ce bien.';
    }
    if (status === 400) {
      return message || 'Données invalides. Vérifiez les champs du formulaire.';
    }
    if (status === 0 || status >= 500) {
      return 'Serveur indisponible. Veuillez réessayer plus tard.';
    }
    return message || 'Une erreur est survenue lors de la réservation.';
  }

  // ── Comments ──────────────────────────────────────────────
  onCommentSubmit(data: { rating: number; content: string }): void {
    if (!this.currentUser || !this.property) return;

    // API call to create the comment, then optimistic update of the UI with the new comment (including user info from auth state)
    this.commentService.create({
      realEstateId: this.property.id,
      content:      data.content,
      rating:       data.rating,
    }).subscribe({
      next: (created) => {
        // Optimistic update : add the new comment to the top of the list with user info from auth state (since API doesn't return it)
        const newComment: ApiComment = {
          ...created,
          user: {
            name:  this.currentUser!.name,
            image: this.currentUser!.image,
          },
        };
        this.comments = [newComment, ...this.comments];
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.commentError = err.error?.message || 'Impossible de publier votre commentaire.';
        this.cdr.detectChanges();
      },
    });
  }

  // ── Navigation ────────────────────────────────────────────
  goBack(): void { this.router.navigate(['/catalogue']); }
}