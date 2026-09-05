import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface TmsUser {
  email: string;
  displayName: string;
  role: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly authUrl = `${environment.apiRoot}/auth`;
  private readonly accessToken = signal<string | null>(null);

  readonly currentUser = signal<TmsUser | null>(null);

  isAuthenticated(): boolean {
    return this.currentUser() !== null && this.accessToken() !== null;
  }

  getAccessToken(): string | null {
    return this.accessToken();
  }

  hasRole(role: string): boolean {
    const user = this.currentUser();

    return user?.role === role || user?.role === 'Admin';
  }

  hasExactRole(role: string): boolean {
    return this.currentUser()?.role === role;
  }

  getDefaultRoute(): string {
    const role = this.currentUser()?.role;

    switch (role) {
      case 'Student':
        return '/student-dashboard';

      case 'Instructor':
      case 'Admin':
        return '/dashboard';

      default:
        return '/unauthorized';
    }
  }

  async login(credentials: LoginRequest): Promise<void> {
    const response = await firstValueFrom(
      this.http.post<AuthResponse>(`${this.authUrl}/login`, credentials),
    );

    this.accessToken.set(response.accessToken);

    const payload = this.decodeJwtPayload(response.accessToken);

    this.currentUser.set({
      email: payload['email'] || payload['sub'] || '',
      displayName: payload['name'] || payload['email'] || 'User',
      role:
        payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
        payload['role'] ||
        'Student',
    });
  }

  async register(request: RegisterRequest): Promise<void> {
    this.http.post<void>(`${this.authUrl}/register`, request);
    await firstValueFrom(this.http.post<void>(`${this.authUrl}/register`, request));
  }

  logout(): void {
    this.accessToken.set(null);
    this.currentUser.set(null);
  }

  private decodeJwtPayload(token: string): Record<string, any> {
    const payload = token.split('.')[1];

    if (!payload) {
      throw new Error('Invalid access token.');
    }

    const normalizedPayload = payload
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(Math.ceil(payload.length / 4) * 4, '=');

    return JSON.parse(atob(normalizedPayload));
  }
}
