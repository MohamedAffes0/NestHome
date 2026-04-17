import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { authClient, FRONTEND_URL } from '../../../lib/auth-client';
import { Session, SessionResponse, SignUpDto, SignUpResponse, User } from '../models';
import { FavoriteService } from './favorite.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:3000';

  private userSubject    = new BehaviorSubject<User | null>(null);
  public  user$          = this.userSubject.asObservable();

  // Observable for session state
  private sessionSubject = new BehaviorSubject<Session | null>(null);
  public  session$       = this.sessionSubject.asObservable();

  constructor(
    private http:            HttpClient,
    private favoriteService: FavoriteService,
  ) {
    this.loadSession();
  }

  get currentUser() {
    return this.userSubject.value;
  }

  /**
   * Fetches the current session from the API.
   */
  getSession(): Observable<SessionResponse | null> {
    return this.http
      .get<SessionResponse>(`${this.apiUrl}/api/auth/get-session`, {
        withCredentials: true,
      })
      .pipe(
        tap((response) => {
          if (response?.user && response?.session) {
            this.userSubject.next(response.user);
            this.sessionSubject.next(response.session);
            // Load favorites once session is confirmed
            this.favoriteService.loadUserFavorites();
          } else {
            this.userSubject.next(null);
            this.sessionSubject.next(null);
            this.favoriteService.clearFavorites();
          }
        }),
        catchError((err) => {
          console.error('Failed to load session:', err);
          this.userSubject.next(null);
          this.sessionSubject.next(null);
          this.favoriteService.clearFavorites();
          return of(null);
        })
      );
  }

  /**
   * Loads the session on service initialization.
   */
  loadSession(): void {
    if (typeof window === 'undefined') return;
    this.getSession().subscribe();
  }

  /**
   * Logs the user out and clears all session data.
   */
  async logout() {
    this.userSubject.next(null);
    this.sessionSubject.next(null);
    // Clear favorites state on logout
    this.favoriteService.clearFavorites();
    await authClient.signOut();
  }

  /**
   * Logs in a user with email and password.
   */
  async login(email: string, password: string) {
    const res = await authClient.signIn.email({ email, password });
    if (res.data) {
      this.getSession().subscribe(); // will also load favorites
    }
    return res.data || res.error;
  }

  async signInWithGoogle(errorCallbackPath: '/login' | '/signup' = '/login'): Promise<void> {
    await authClient.signIn.social({
      provider: 'google',
      callbackURL: `${FRONTEND_URL}/`,
      errorCallbackURL: `${FRONTEND_URL}${errorCallbackPath}`,
      newUserCallbackURL: `${FRONTEND_URL}/`,
    });
  }

  /**
   * Signs up a new user.
   */
  signUp(data: SignUpDto): Observable<SignUpResponse> {
    return this.http.post<SignUpResponse>(`${this.apiUrl}/api/auth/sign-up/email`, data, {
      withCredentials: true,
    });
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/api/auth/reset-password`,
      { token, newPassword },
      { withCredentials: true }
    );
  }

  verifyEmail(token: string): Observable<any> {
    const url = `${this.apiUrl}/api/auth/verify-email?token=${encodeURIComponent(token)}&callbackURL=${encodeURIComponent(FRONTEND_URL)}`;
    return this.http.get(url, {
      withCredentials: true,
      observe: 'response',
      responseType: 'text',
    });
  }

  requestPasswordReset(email: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/api/auth/request-password-reset`,
      { email, redirectTo: `${FRONTEND_URL}/reset-password` },
      { withCredentials: true }
    );
  }
}
