import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BASE_URL } from '../../../lib/auth-client';
import { PaginatedResponse } from '../models/pagination.model';
import {
  Reservation,
  CreateReservationDto,
  UpdateReservationDto,
  ReservationFilterDto,
  ReservationStatus,
} from '../models/reservation.model';

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private readonly apiUrl = `${BASE_URL}/reservations`;

  constructor(private http: HttpClient) {}

  /**
   * Create a new reservation for a specific real estate listing — authenticated users only
   * POST /reservations/:realEstateId
   * Request body: { visitDate: string, visitTime: string, clientPhone: string }
   */
  create(realEstateId: string, dto: CreateReservationDto): Observable<Reservation> {
    return this.http.post<Reservation>(
      `${this.apiUrl}/${realEstateId}`,
      dto,
      { withCredentials: true },
    );
  }

  /**
   * GET /reservations?page=1&limit=10&clientPhone=...&status=...&realEstateId=...&userId=...&minVisitDate=...&maxVisitDate=...&sortByVisitDate=asc|desc
   * Get all reservations with optional filters and pagination — agent / admin
   */
  getAll(
    filters: ReservationFilterDto = {},
    page  = 1,
    limit = 10,
  ): Observable<PaginatedResponse<Reservation>> {
    let params = new HttpParams()
      .set('page',  page.toString())
      .set('limit', limit.toString());

    if (filters.clientPhone)     params = params.set('clientPhone',     filters.clientPhone);
    if (filters.status)          params = params.set('status',          filters.status.toString());
    if (filters.realEstateId)    params = params.set('realEstateId',    filters.realEstateId);
    if (filters.userId)          params = params.set('userId',          filters.userId);
    if (filters.minVisitDate)    params = params.set('minVisitDate',    filters.minVisitDate);
    if (filters.maxVisitDate)    params = params.set('maxVisitDate',    filters.maxVisitDate);
    if (filters.sortByVisitDate) params = params.set('sortByVisitDate', filters.sortByVisitDate);

    return this.http.get<PaginatedResponse<Reservation>>(this.apiUrl, {
      params,
      withCredentials: true,
    });
  }

  /** GET /reservations/:id — Get a single reservation by its ID — agent / admin */
  getById(id: string): Observable<Reservation> {
    return this.http.get<Reservation>(`${this.apiUrl}/${id}`, {
      withCredentials: true,
    });
  }

  /**
   * GET /reservations/user/me
   * Réservations de l'utilisateur connecté
   */
  getMyReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}/user/me`, {
      withCredentials: true,
    });
  }

  /**
   * PATCH /reservations/:id
   * Mettre à jour une réservation — agent / admin
   */
  update(id: string, dto: UpdateReservationDto): Observable<Reservation> {
    return this.http.patch<Reservation>(`${this.apiUrl}/${id}`, dto, {
      withCredentials: true,
    });
  }

  /**
   * PATCH /reservations/:id/cancel
   * Cancel reservation — user (only if status is pending)
   */
  cancel(id: string): Observable<Reservation> {
    return this.http.patch<Reservation>(
      `${this.apiUrl}/${id}/cancel`,
      {},
      { withCredentials: true },
    );
  }

  /**
   * PATCH /reservations/:id  avec { status }
   * Changer status (pending, confirmed, cancelled) — agent / admin
   */
  updateStatus(id: string, status: ReservationStatus): Observable<Reservation> {
    return this.update(id, { status });
  }

  /**
   * DELETE /reservations/:id
   * Delete a reservation — admin only (soft delete, status becomes "cancelled" and reservation is hidden from users)
   */
  delete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`, {
      withCredentials: true,
    });
  }
}