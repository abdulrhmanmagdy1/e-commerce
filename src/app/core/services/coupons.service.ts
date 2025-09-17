import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from './api-config';
import { HttpService } from './http.service';
import { ApiItemResponse, ApiListResponse } from '../interfaces/api';

export interface Coupon { _id: string; name: string; expire: string; discount: number; }

@Injectable({ providedIn: 'root' })
export class CouponsService {
    private readonly http = inject(HttpService);

    getCoupons(): Observable<ApiListResponse<Coupon>> {
        return this.http.get<ApiListResponse<Coupon>>(API_CONFIG.endpoints.coupons);
    }

    applyCoupon(name: string): Observable<ApiItemResponse<unknown>> {
        return this.http.post<ApiItemResponse<unknown>>(API_CONFIG.endpoints.coupons, { name });
    }
} 