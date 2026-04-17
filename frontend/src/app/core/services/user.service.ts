import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ChangePasswordDto, CreateUserDto, ProfileUpdateResponse, UpdateProfileDto, User, UserFilterDto, UserResponse } from '../models';
import { Observable, tap } from 'rxjs';
import { AuthService } from './auth.service';
import { BASE_URL } from '../../../lib/auth-client';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = `${BASE_URL}/users`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Fetches a paginated list of users with optional filtering
   */
  getAllUsers(filter?: UserFilterDto, page: number = 1, limit: number = 100) {
    let params = new HttpParams().set('page', page.toString()).set('limit', limit.toString());

    if (filter) {
      Object.keys(filter).forEach((key) => {
        const value = (filter as any)[key];
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<UserResponse>(this.apiUrl, { params, withCredentials: true });
  }

  /**
   * Deletes a user by ID
   */
  deleteUser(userId: string) {
    return this.http.delete<any>(this.apiUrl + `/${userId}`, { withCredentials: true });
  }

  /**
   * Deletes the authenticated user's profile
   */
  deleteMyProfile() {
    return this.http.delete<any>(this.apiUrl + '/me', { withCredentials: true });
  }

    /**
   * Updates user profile information (name, email, location, image URL)
   */
  updateProfile(data: UpdateProfileDto): Observable<ProfileUpdateResponse> {
    return this.http.patch<ProfileUpdateResponse>(
      `${this.apiUrl}/profile/me`,
      data,
      { withCredentials: true }
    ).pipe(
      tap(response => {
        // Update the user in AuthService after successful profile update
        if (response) {
          this.authService['userSubject'].next(response);
        }
      })
    );
  }

  /**
   * Uploads a profile image file
   */
  updateProfileImage(imageFile: File): Observable<ProfileUpdateResponse> {
    const formData = new FormData();
    formData.append('profileImage', imageFile);

    return this.http.patch<ProfileUpdateResponse>(
      `${this.apiUrl}/profile/me/image`,
      formData,
      { withCredentials: true }
    ).pipe(
      tap(response => {
        // Update the user in AuthService after successful image upload
        if (response) {
          this.authService['userSubject'].next(response);
        }
      })
    );
  }

  /**
   * Changes the user's password
   */
  changePassword(data: ChangePasswordDto): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(
      `${this.apiUrl}/profile/password`,
      data,
      { withCredentials: true }
    );
  }

  /**
   * Deletes the user's profile image
   */
  deleteProfileImage(): Observable<ProfileUpdateResponse> {
    return this.http.delete<ProfileUpdateResponse>(
      `${this.apiUrl}/profile/me/image`,
      { withCredentials: true }
    ).pipe(
      tap(response => {
        // Update the user in AuthService after successful image deletion
        if (response) {
          this.authService['userSubject'].next(response);
        }
      })
    );
  }

    /**
   * Updates only the activation status of a user
   */
  updateActivateUser(userId: string, isActive: boolean) {
    return this.http.patch<User>(
      `${this.apiUrl}/isActive/${userId}`,
      { isActive },
      { withCredentials: true }
    );
  }

  /**
   * Updates only the role of a user
   */
  updateUserRole(userId: string, role: 'admin' | 'agent' | 'user') {
    return this.http.patch<User>(
      `${this.apiUrl}/role/${userId}`,
      { role },
      { withCredentials: true }
    );
  }

  /**   
   * Creates a new user (admin only)
   */
  createUser(userData: CreateUserDto) {
    return this.http.post<User>(
      `${this.apiUrl}/admin`,
      userData,
      { withCredentials: true }
    );
  }
}