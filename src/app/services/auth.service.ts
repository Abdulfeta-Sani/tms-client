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
  private readonly accessTokenKey = 'tms.accessToken';
  private readonly refreshTokenKey = 'tms.refreshToken';

  private readonly accessToken = signal<string | null>(null);

  readonly currentUser = signal<TmsUser | null>(null);

  constructor() {
    this.restoreSession();
  }

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

    this.storeSession(response);
  }

  async refreshSession(): Promise<boolean> {
    const refreshToken = this.getStoredRefreshToken();

    if (!refreshToken) {
      this.clearSession();
      return false;
    }

    try {
      const response = await firstValueFrom(
        this.http.post<AuthResponse>(`${this.authUrl}/refresh`, { refreshToken }),
      );

      this.storeSession(response);
      return true;
    } catch {
      this.clearSession();
      return false;
    }
  }

  async register(request: RegisterRequest): Promise<void> {
    await firstValueFrom(this.http.post<void>(`${this.authUrl}/register`, request));
  }

  logout(): void {
    this.clearSession();
  }

  private restoreSession(): void {
    const storedAccessToken = this.getStoredAccessToken();
    const storedRefreshToken = this.getStoredRefreshToken();

    if (!storedAccessToken || !storedRefreshToken) {
      return;
    }

    try {
      this.setCurrentUser(storedAccessToken);
      this.accessToken.set(storedAccessToken);
    } catch {
      this.clearSession();
    }
  }

  private storeSession(response: AuthResponse): void {
    localStorage.setItem(this.accessTokenKey, response.accessToken);

    localStorage.setItem(this.refreshTokenKey, response.refreshToken);

    this.accessToken.set(response.accessToken);
    this.setCurrentUser(response.accessToken);
  }

  private clearSession(): void {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);

    this.accessToken.set(null);
    this.currentUser.set(null);
  }

  private getStoredAccessToken(): string | null {
    return localStorage.getItem(this.accessTokenKey);
  }

  private getStoredRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  private setCurrentUser(token: string): void {
    const payload = this.decodeJwtPayload(token);

    const email =
      payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ??
      payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/emailaddress'] ??
      payload['email'] ??
      '';

    const displayName = payload['FirstName'] ?? payload['name'] ?? email ?? 'User';

    const role =
      payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ??
      payload['role'] ??
      'Student';

    this.currentUser.set({
      email,
      displayName,
      role,
    });
  }

  private decodeJwtPayload(token: string): Record<string, string> {
    const payload = token.split('.')[1];

    if (!payload) {
      throw new Error('Invalid access token.');
    }

    const normalizedPayload = payload
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(Math.ceil(payload.length / 4) * 4, '=');

    return JSON.parse(atob(normalizedPayload)) as Record<string, string>;
  }
}
