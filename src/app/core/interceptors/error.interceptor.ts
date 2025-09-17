import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';

function extractMessage(err: HttpErrorResponse): string {
  if (err.status === 0) return 'Network error. Please check your connection and try again.';
  const e: any = err?.error;
  if (Array.isArray(e?.errors) && e.errors[0]?.msg) return String(e.errors[0].msg);
  if (e?.errors && typeof e.errors === 'object' && e.errors.msg) return String(e.errors.msg);
  if (typeof e === 'string' && e.trim()) return e;
  if (e?.message && e.message !== 'fail') return String(e.message);
  if (err.message) return String(err.message);
  return 'Unexpected error occurred. Please try again.';
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  const isBrowser = isPlatformBrowser(platformId);
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse) {
        const msg = extractMessage(err);
        // Avoid spamming for auth endpoints while navigating on 401
        const isAuthEndpoint = /\/api\/v1\/auth\//.test(req.url);
        if (!(err.status === 401 && !isAuthEndpoint)) {
          toast.error(msg);
        }
        if (isBrowser && err.status === 401 && !isAuthEndpoint) {
          const redirectPath = (globalThis as any)?.location?.pathname || '/home';
          router.navigate(['/login'], { queryParams: { redirect: redirectPath } });
        }
        // Optional: concise console for devs
        console.error(`HTTP ${err.status} on ${req.url}: ${msg}`);
      } else {
        console.error('Unknown Error');
        if (isBrowser) toast.error('Unexpected error occurred. Please try again.');
      }
      return throwError(() => err);
    })
  );
};
