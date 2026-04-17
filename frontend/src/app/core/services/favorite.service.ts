import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { BASE_URL } from '../../../lib/auth-client';
import { Favorite } from '../models';

@Injectable({ providedIn: 'root' })
export class FavoriteService {
  private readonly apiUrl = `${BASE_URL}/favorites`;

  // Set of favorited realEstateIds for O(1) lookup
  private favoritedIds = new BehaviorSubject<Set<string>>(new Set());
  public favoritedIds$ = this.favoritedIds.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Load current user's favorites and populate favoritedIds set.
   * Call once after login (e.g. from AuthService or AppComponent).
   */
  loadUserFavorites(): void {
    this.getUserFavorites().subscribe({
      next: (favorites) => {
        const ids = new Set(favorites.map(f => f.realEstateId));
        this.favoritedIds.next(ids);
      },
      error: () => this.favoritedIds.next(new Set()),
    });
  }

  /** Clear favorites state on logout */
  clearFavorites(): void {
    this.favoritedIds.next(new Set());
  }

  /** Check if a property is favorited */
  isFavorited(realEstateId: string): boolean {
    return this.favoritedIds.value.has(realEstateId);
  }

  /** GET /favorites/user */
  getUserFavorites(): Observable<Favorite[]> {
    return this.http.get<Favorite[]>(`${this.apiUrl}/user`, {
      withCredentials: true,
    });
  }

  /** POST /favorites/switch — toggle and update local state */
  switchFavorite(realEstateId: string): Observable<{ message: string }> {
    return this.http
      .post<{ message: string }>(
        `${this.apiUrl}/switch`,
        { realEstateId },
        { withCredentials: true },
      )
      .pipe(
        tap(() => {
          const current = new Set(this.favoritedIds.value);
          if (current.has(realEstateId)) {
            current.delete(realEstateId);
          } else {
            current.add(realEstateId);
          }
          this.favoritedIds.next(current);
        }),
      );
  }

  /** POST /favorites */
  addFavorite(realEstateId: string): Observable<Favorite> {
    return this.http
      .post<Favorite>(this.apiUrl, { realEstateId }, { withCredentials: true })
      .pipe(
        tap(() => {
          const current = new Set(this.favoritedIds.value);
          current.add(realEstateId);
          this.favoritedIds.next(current);
        }),
      );
  }

  /** DELETE /favorites/:favoriteId */
  deleteFavorite(favoriteId: string, realEstateId: string): Observable<{ message: string }> {
    return this.http
      .delete<{ message: string }>(`${this.apiUrl}/${favoriteId}`, {
        withCredentials: true,
      })
      .pipe(
        tap(() => {
          const current = new Set(this.favoritedIds.value);
          current.delete(realEstateId);
          this.favoritedIds.next(current);
        }),
      );
  }

  /** GET /favorites (admin) */
  getAllFavorites(): Observable<Favorite[]> {
    return this.http.get<Favorite[]>(this.apiUrl, { withCredentials: true });
  }

  /** Total count of user favorites */
  get count(): number {
    return this.favoritedIds.value.size;
  }
}