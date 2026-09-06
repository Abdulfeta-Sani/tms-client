import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, from, switchMap, throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth = inject(AuthService);

  const isAuthRequest = req.url.endsWith('/auth/login') || req.url.endsWith('/auth/refresh');

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401 || isAuthRequest) {
        return throwError(() => error);
      }

      return from(auth.refreshSession()).pipe(
        switchMap((refreshed) => {
          if (!refreshed) {
            void router.navigate(['/login']);
            return throwError(() => error);
          }

          return next(req);
        }),
        catchError((refreshError) => {
          void router.navigate(['/login']);
          return throwError(() => refreshError);
        }),
      );
    }),
  );
};
