import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BASE_URL } from '../../../lib/auth-client';
import { PaginatedResponse } from '../models/pagination.model';
import {
  Contract,
  CreateContractDto,
  UpdateContractDto,
  ContractFilterDto,
  UnpaidContractsResponse,
} from '../models/contract.model';

@Injectable({ providedIn: 'root' })
export class ContractService {
  private readonly apiUrl = `${BASE_URL}/contracts`;

  constructor(private http: HttpClient) {}

  /**
   * POST /contracts
   * Create a contract (sale or rental) — agent / admin
   */
  create(dto: CreateContractDto): Observable<Contract> {
    return this.http.post<Contract>(this.apiUrl, dto, {
      withCredentials: true,
    });
  }

  /**
   * GET /contracts?page=1&limit=10&...filters
   * List of contracts with pagination and filters — agent / admin
   */
  getAll(
    filters: ContractFilterDto = {},
    page  = 1,
    limit = 10,
  ): Observable<PaginatedResponse<Contract>> {
    let params = new HttpParams()
      .set('page',  page.toString())
      .set('limit', limit.toString());

    if (filters.userId)       params = params.set('userId',       filters.userId);
    if (filters.agentId)      params = params.set('agentId',      filters.agentId);
    if (filters.realEstateId) params = params.set('realEstateId', filters.realEstateId);
    if (filters.startDate)    params = params.set('startDate',    filters.startDate);
    if (filters.endDate)      params = params.set('endDate',      filters.endDate);

    return this.http.get<PaginatedResponse<Contract>>(this.apiUrl, {
      params,
      withCredentials: true,
    });
  }

  /**
   * GET /contracts/unpaid/expired
   * Unpaid contracts (unsold sales + rentals without payment this month) — agent / admin
   */
  getUnpaidExpired(): Observable<UnpaidContractsResponse> {
    return this.http.get<UnpaidContractsResponse>(
      `${this.apiUrl}/unpaid/expired`,
      { withCredentials: true },
    );
  }

  /**
   * GET /contracts/:id
   * Detail of a contract with user, agent and real estate — agent / admin
   */
  getById(id: string): Observable<Contract> {
    return this.http.get<Contract>(`${this.apiUrl}/${id}`, {
      withCredentials: true,
    });
  }

  /**
   * PATCH /contracts/:id
   * Modify cinPassport, startDate or endDate — agent / admin
   */
  update(id: string, dto: UpdateContractDto): Observable<Contract> {
    return this.http.patch<Contract>(`${this.apiUrl}/${id}`, dto, {
      withCredentials: true,
    });
  }

  /**
   * DELETE /contracts/:id
   * Delete a contract — agent / admin
   */
  delete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`, {
      withCredentials: true,
    });
  }

  // ── Helpers ───────────────────────────────────────────────

  /** True if it's a rental contract (endDate is present) */
  isRental(contract: Contract): boolean {
    return contract.endDate !== null;
  }

  /** True if it's a sale contract (no endDate) */
  isSale(contract: Contract): boolean {
    return contract.endDate === null;
  }
}