import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BASE_URL } from '../../../lib/auth-client';
import { PaginatedResponse } from '../models/pagination.model';
import { ApiComment, CreateCommentDto } from '../models';

@Injectable({ providedIn: 'root' })
export class CommentService {
  private readonly apiUrl = `${BASE_URL}/comments`;

  constructor(private http: HttpClient) {}

  /**
   * GET /comments/:realEstateId?page=1&limit=20
   * Comments paginated for a real estate listing, sorted by most recent first
   */
  getByRealEstate(
    realEstateId: string,
    page  = 1,
    limit = 20,
  ): Observable<PaginatedResponse<ApiComment>> {
    const params = new HttpParams()
      .set('page',  page.toString())
      .set('limit', limit.toString());

    return this.http.get<PaginatedResponse<ApiComment>>(
      `${this.apiUrl}/${realEstateId}`,
      { params }
    );
  }

  /**
   * POST /comments
   * Create a new comment for a real estate listing — authentifié
   */
  create(dto: CreateCommentDto): Observable<ApiComment> {
    return this.http.post<ApiComment>(this.apiUrl, dto, {
      withCredentials: true,
    });
  }

  /**
   * DELETE /comments/:commentId
   * Delete a comment by its ID — only the comment's author or an admin can delete it
   */
  delete(commentId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/${commentId}`,
      { withCredentials: true }
    );
  }
}