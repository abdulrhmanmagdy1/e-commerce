import { Injectable, inject, signal, Inject, PLATFORM_ID } from '@angular/core';
import { HttpContext } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable, of, tap, catchError } from 'rxjs';
import { API_CONFIG } from './api-config';
import { HttpService } from './http.service';
import { ApiItemResponse } from '../interfaces/api';
import { Cart } from '../interfaces/catalog';
import { SKIP_LOADING } from '../interceptors/loading.interceptor';
import { BYPASS_CACHE } from '../interceptors/cache.interceptor';

const COUNT_KEY = 'cart_count';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly http = inject(HttpService);
  constructor(@Inject(PLATFORM_ID) private readonly platformId: Object) {
    if (this.isBrowser()) {
      const saved = Number(localStorage.getItem(COUNT_KEY) || '0');
      if (!Number.isNaN(saved)) this.count.set(saved);
    }
  }

  public readonly count = signal<number>(0);

  private isBrowser(): boolean { return isPlatformBrowser(this.platformId); }

  private setCount(n: number): void {
    this.count.set(n);
    if (this.isBrowser()) {
      try { localStorage.setItem(COUNT_KEY, String(n)); } catch { /* ignore */ }
    }
  }

  private extractCount(res: ApiItemResponse<Cart>): number {
    return res.data?.products?.reduce((sum, it) => sum + (it.count || 0), 0) || 0;
  }

  getCart(): Observable<ApiItemResponse<Cart>> {
    return this.http.get<ApiItemResponse<Cart>>(API_CONFIG.endpoints.cart).pipe(
      tap(res => this.setCount(this.extractCount(res)))
    );
  }

  // Silent refresh used on app startup to populate badge without spinner
  refreshCount(silent = true): Observable<ApiItemResponse<Cart>> {
    const ctx = new HttpContext();
    if (silent) ctx.set(SKIP_LOADING, true);
    ctx.set(BYPASS_CACHE, true);
    return this.http.get<ApiItemResponse<Cart>>(API_CONFIG.endpoints.cart, { context: ctx }).pipe(
      tap(res => this.setCount(this.extractCount(res))),
      catchError(() => of({} as any))
    );
  }

  addToCart(productId: string): Observable<ApiItemResponse<Cart>> {
    return this.http.post<ApiItemResponse<Cart>>(API_CONFIG.endpoints.cart, { productId }).pipe(
      tap(res => this.setCount(this.extractCount(res)))
    );
  }

  updateItemQuantity(productId: string, count: number): Observable<ApiItemResponse<Cart>> {
    return this.http.put<ApiItemResponse<Cart>>(`${API_CONFIG.endpoints.cart}/${productId}`, { count }).pipe(
      tap(res => this.setCount(this.extractCount(res)))
    );
  }

  removeItem(productId: string): Observable<ApiItemResponse<Cart>> {
    return this.http.delete<ApiItemResponse<Cart>>(`${API_CONFIG.endpoints.cart}/${productId}`).pipe(
      tap(res => this.setCount(this.extractCount(res)))
    );
  }

  clearCart(): Observable<ApiItemResponse<Cart>> {
    return this.http.delete<ApiItemResponse<Cart>>(API_CONFIG.endpoints.cart).pipe(
      tap(() => this.setCount(0))
    );
  }
}
