import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from './api-config';
import { HttpService } from './http.service';
import { ApiItemResponse } from '../interfaces/api';
import { Address } from '../interfaces/order';

@Injectable({ providedIn: 'root' })
export class AddressesService {
    private readonly http = inject(HttpService);

    getAddresses(): Observable<ApiItemResponse<Address[]>> {
        return this.http.get<ApiItemResponse<Address[]>>(API_CONFIG.endpoints.addresses);
    }

    addAddress(address: Omit<Address, '_id'>): Observable<ApiItemResponse<Address[]>> {
        return this.http.post<ApiItemResponse<Address[]>>(API_CONFIG.endpoints.addresses, address);
    }

    removeAddress(addressId: string): Observable<ApiItemResponse<Address[]>> {
        return this.http.delete<ApiItemResponse<Address[]>>(`${API_CONFIG.endpoints.addresses}/${addressId}`);
    }
} 