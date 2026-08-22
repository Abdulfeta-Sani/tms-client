import { Injectable, Service, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface TmsUser {
  displayName: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
}

@Service()
export class AuthService {
  private http = inject(HttpClient);

  currentUser = signal<TmsUser | null>(null);

  hasRole(role: string): boolean {
    const user = this.currentUser();

    return user?.role === role || user?.role === 'Admin';
  }

  async login(credentials: LoginRequest): Promise<void> {
    await firstValueFrom(this.http.post<void>('/api/auth/login', credentials));
  }

  async register(request: RegisterRequest): Promise<void> {
    await firstValueFrom(this.http.post<void>('/api/auth/register', request));
  }
}
