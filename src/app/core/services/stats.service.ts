import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BASE_URL }   from '../../../lib/auth-client';
import { ContractStats, OverviewStats, PropertyStats, ReservationStats, RevenueStats } from '../models';

@Injectable({ providedIn: 'root' })
export class StatsService {
  private readonly api = `${BASE_URL}/stats`;

  constructor(private http: HttpClient) {}

  /** GET /stats/overview */
  getOverview(): Observable<OverviewStats> {
    return this.http.get<OverviewStats>(`${this.api}/overview`, { withCredentials: true });
  }

  /** GET /stats/revenue */
  getRevenue(): Observable<RevenueStats> {
    return this.http.get<RevenueStats>(`${this.api}/revenue`, { withCredentials: true });
  }

  /** GET /stats/reservations */
  getReservations(): Observable<ReservationStats> {
    return this.http.get<ReservationStats>(`${this.api}/reservations`, { withCredentials: true });
  }

  /** GET /stats/properties */
  getProperties(): Observable<PropertyStats> {
    return this.http.get<PropertyStats>(`${this.api}/properties`, { withCredentials: true });
  }

  /** GET /stats/contracts */
  getContracts(): Observable<ContractStats> {
    return this.http.get<ContractStats>(`${this.api}/contracts`, { withCredentials: true });
  }
}