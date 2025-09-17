import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from './api-config';
import { HttpService } from './http.service';
import { ApiItemResponse } from '../interfaces/api';
import { Order } from '../interfaces/order';

export interface ShippingAddress {
    details: string;
    phone: string;
    city: string;
}

export interface CheckoutSessionResponse {
    status: 'success' | 'fail' | string;
    session: { url: string };
    success_url?: string;
    cancel_url?: string;
}

@Injectable({ providedIn: 'root' })
export class OrdersService {
    private readonly http = inject(HttpService);

    createCashOrder(cartId: string, addressId: string): Observable<ApiItemResponse<Order>> {
        return this.http.post<ApiItemResponse<Order>>(`${API_CONFIG.endpoints.orders}/${cartId}`, { shippingAddress: addressId });
    }

    createCheckoutSession(cartId: string, url: string, shippingAddress: ShippingAddress): Observable<CheckoutSessionResponse> {
        const endpoint = `${API_CONFIG.endpoints.orders}/checkout-session/${cartId}?url=${encodeURIComponent(url)}`;
        return this.http.post<CheckoutSessionResponse>(endpoint, { shippingAddress });
    }

    getUserOrders(userId: string): Observable<Order[]> {
        const url = `${API_CONFIG.endpoints.orders}/user/${userId}`;
        console.log('Fetching orders from URL:', url);
        console.log('Full API URL:', `${API_CONFIG.baseUrl}${url}`);
        return this.http.get<Order[]>(url);
    }

    getOrder(orderId: string): Observable<ApiItemResponse<Order>> {
        return this.http.get<ApiItemResponse<Order>>(`${API_CONFIG.endpoints.orders}/${orderId}`);
    }
} 