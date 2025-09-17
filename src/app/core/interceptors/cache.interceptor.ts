import { HttpContextToken, HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { HttpCacheService } from '../services/http-cache.service';

// Allow opting-out per request if needed: this.http.get(url, { context: new HttpContext().set(BYPASS_CACHE, true) })
export const BYPASS_CACHE = new HttpContextToken<boolean>(() => false);

function cacheKey(req: HttpRequest<unknown>): string {
  // Use full URL with params and headers that affect response (keep simple: urlWithParams only)
  return req.urlWithParams;
}

export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  const cache = inject(HttpCacheService);

  // Only cache GET requests and when not explicitly bypassed
  if (req.method === 'GET' && !req.context.get(BYPASS_CACHE)) {
    const key = cacheKey(req);
    const cached = cache.get(key) as HttpResponse<any> | null;
    if (cached) {
      // Serve from cache without hitting the network or triggering loading spinner
      return of(cached);
    }

    // No cache: proceed and cache the successful response
    return next(req).pipe(
      tap((event) => {
        if (event instanceof HttpResponse) {
          cache.set(key, event);
        }
      })
    );
  }

  // On mutating requests, clear cache to keep data fresh
  if (req.method !== 'GET') {
    cache.clear();
  }

  return next(req);
};
