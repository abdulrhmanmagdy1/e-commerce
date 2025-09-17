import { Injectable, inject } from '@angular/core';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { API_CONFIG } from './api-config';
import { HttpService } from './http.service';
import { ApiItemResponse } from '../interfaces/api';
import { Product } from '../interfaces/catalog';
import { TokenService } from './token.service';

@Injectable({ providedIn: 'root' })
export class WishlistService {
    private readonly http = inject(HttpService);
    private readonly _ids = new BehaviorSubject<Set<string>>(new Set<string>());
    public readonly ids$ = this._ids.asObservable();
    private _isInitialized = false;

    private readonly tokenStore = inject(TokenService);

    // Helper method to get current value
    public ids(): Set<string> {
        return this._ids.value;
    }

    // Initialize wishlist on app start
    public initializeWishlist(): void {
        if (this._isInitialized) return;

        const token = this.tokenStore.get();
        if (!token) {
            this._isInitialized = true;
            return;
        }

        console.log('WishlistService - Starting wishlist initialization...');
        this.getWishlist().subscribe({
            next: (res) => {
                console.log('WishlistService - Successfully initialized wishlist:', res);
                this._isInitialized = true;
            },
            error: (error) => {
                console.error('WishlistService - Failed to initialize wishlist:', error);
                this._isInitialized = true;
            }
        });
    }

    // Force reload wishlist (useful for refresh)
    public reloadWishlist(): void {
        console.log('WishlistService - Force reloading wishlist...');
        this._isInitialized = false;
        this.initializeWishlist();
    }

    getWishlist(): Observable<ApiItemResponse<Product[]>> {
        return this.http.get<ApiItemResponse<Product[]>>(API_CONFIG.endpoints.wishlist).pipe(
            tap(res => this._ids.next(new Set((res.data || []).map(p => p._id))))
        );
    }

    add(productId: string): Observable<ApiItemResponse<Product[]>> {
        // Update immediately for instant UI feedback
        const currentIds = this.ids();
        const newIds = new Set(currentIds);
        newIds.add(productId);
        console.log('WishlistService - Adding productId:', productId, 'newIds:', newIds);
        this._ids.next(newIds);

        return this.http.post<ApiItemResponse<Product[]>>(API_CONFIG.endpoints.wishlist, { productId }).pipe(
            tap(res => {
                console.log('WishlistService - API response for add:', res);
                // Don't override the optimistic update, just confirm it worked
                // The optimistic update already has the correct state
            }),
            tap({
                error: (error) => {
                    console.log('WishlistService - API error for add, reverting:', error);
                    // Revert on error
                    const revertedIds = new Set(currentIds);
                    this._ids.next(revertedIds);
                }
            })
        );
    }

    remove(productId: string): Observable<ApiItemResponse<Product[]>> {
        // Update immediately for instant UI feedback
        const currentIds = this.ids();
        const newIds = new Set(currentIds);
        newIds.delete(productId);
        console.log('WishlistService - Removing productId:', productId, 'newIds:', newIds);
        this._ids.next(newIds);

        return this.http.delete<ApiItemResponse<Product[]>>(`${API_CONFIG.endpoints.wishlist}/${productId}`).pipe(
            tap(res => {
                console.log('WishlistService - API response for remove:', res);
                // Don't override the optimistic update, just confirm it worked
                // The optimistic update already has the correct state
            }),
            tap({
                error: (error) => {
                    console.log('WishlistService - API error for remove, reverting:', error);
                    // Revert on error
                    const revertedIds = new Set(currentIds);
                    this._ids.next(revertedIds);
                }
            })
        );
    }
}
