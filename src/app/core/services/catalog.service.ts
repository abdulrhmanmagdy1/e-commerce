import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from './api-config';
import { HttpService } from './http.service';
import { ApiItemResponse, ApiListResponse } from '../interfaces/api';
import { Brand, Category, Product, Review } from '../interfaces/catalog';

@Injectable({ providedIn: 'root' })
export class CatalogService {
    private readonly http = inject(HttpService);

    getProducts(params?: Record<string, string | number | boolean>): Observable<ApiListResponse<Product>> {
        return this.http.get<ApiListResponse<Product>>(API_CONFIG.endpoints.products, { params });
    }

    getProduct(id: string): Observable<ApiItemResponse<Product>> {
        return this.http.get<ApiItemResponse<Product>>(`${API_CONFIG.endpoints.products}/${id}`);
    }

    getCategories(): Observable<ApiListResponse<Category>> {
        return this.http.get<ApiListResponse<Category>>(API_CONFIG.endpoints.categories);
    }

    getBrands(): Observable<ApiListResponse<Brand>> {
        return this.http.get<ApiListResponse<Brand>>(API_CONFIG.endpoints.brands);
    }

    getBrand(id: string): Observable<ApiItemResponse<Brand>> {
        return this.http.get<ApiItemResponse<Brand>>(`${API_CONFIG.endpoints.brands}/${id}`);
    }

    getProductReviews(productId: string): Observable<ApiListResponse<Review>> {
        return this.http.get<ApiListResponse<Review>>(`${API_CONFIG.endpoints.reviews}?product=${productId}`);
    }
}
