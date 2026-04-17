import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BASE_URL } from '../../../lib/auth-client';
import { PaginatedResponse } from '../models/pagination.model';
import {
  Payment,
  CreatePaymentDto,
  UpdatePaymentDto,
  PaymentFilterDto,
} from '../models';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly apiUrl = `${BASE_URL}/payments`;

  constructor(private http: HttpClient) {}

  /**
   * POST /payments
   * Create a payment — agent / admin
   */
  create(dto: CreatePaymentDto): Observable<Payment> {
    return this.http.post<Payment>(this.apiUrl, dto, {
      withCredentials: true,
    });
  }

  /**
   * GET /payments
   * List of payments with optional filters and pagination
   */
  getAll(
    filters: PaymentFilterDto = {},
    page  = 1,
    limit = 10,
  ): Observable<PaginatedResponse<Payment>> {
    let params = new HttpParams()
      .set('page',  page.toString())
      .set('limit', limit.toString());

    if (filters.userId)        params = params.set('userId',       filters.userId);
    if (filters.realEstateId)  params = params.set('realEstateId', filters.realEstateId);
    if (filters.sortByDate)    params = params.set('sortByDate',   filters.sortByDate);

    return this.http.get<PaginatedResponse<Payment>>(this.apiUrl, {
      params,
      withCredentials: true,
    });
  }

  /**
   * GET /payments/:id
   * Payment details — agent / admin
   */
  getById(id: string): Observable<Payment> {
    return this.http.get<Payment>(`${this.apiUrl}/${id}`, {
      withCredentials: true,
    });
  }

  /**
   * PATCH /payments/:id
   * Update a payment — agent / admin
   */
  update(id: string, dto: UpdatePaymentDto): Observable<Payment> {
    return this.http.patch<Payment>(`${this.apiUrl}/${id}`, dto, {
      withCredentials: true,
    });
  }

  /**
   * DELETE /payments/:id
   * Delete a payment — agent / admin
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      withCredentials: true,
    });
  }

  /**
   * Get list of payments for a specific real estate listing
   */
  getByRealEstate(
    realEstateId: string,
    page  = 1,
    limit = 10,
  ): Observable<PaginatedResponse<Payment>> {
    return this.getAll({ realEstateId, sortByDate: 'desc' }, page, limit);
  }

  /**
   * Get list of payments for a specific user
   */
  getByUser(
    userId: string,
    page  = 1,
    limit = 10,
  ): Observable<PaginatedResponse<Payment>> {
    return this.getAll({ userId, sortByDate: 'desc' }, page, limit);
  }
}