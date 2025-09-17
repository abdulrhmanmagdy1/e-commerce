import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from './api-config';
import { TokenService } from './token.service';

export type RequestOptions = {
    headers?: HttpHeaders | { [header: string]: string | string[] };
    params?: HttpParams | { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> };
    context?: HttpContext;
};

@Injectable({ providedIn: 'root' })
export class HttpService {
    private readonly http = inject(HttpClient);
    private readonly base = API_CONFIG.baseUrl;
    private readonly tokenStore = inject(TokenService);

    private getAuthHeaders(): HttpHeaders {
        let headers = new HttpHeaders();
        const token = this.tokenStore.get();
        if (token) {
            headers = headers.set('token', token);
        }
        return headers;
    }

    get<T>(url: string, options: RequestOptions = {}): Observable<T> {
        options.headers = this.getAuthHeaders();
        return this.http.get<T>(this.base + url, options);
    }

    post<T>(url: string, body: unknown, options: RequestOptions = {}): Observable<T> {
        options.headers = this.getAuthHeaders();
        return this.http.post<T>(this.base + url, body, options);
    }

    put<T>(url: string, body: unknown, options: RequestOptions = {}): Observable<T> {
        options.headers = this.getAuthHeaders();
        return this.http.put<T>(this.base + url, body, options);
    }

    patch<T>(url: string, body: unknown, options: RequestOptions = {}): Observable<T> {
        options.headers = this.getAuthHeaders();
        return this.http.patch<T>(this.base + url, body, options);
    }

    delete<T>(url: string, options: RequestOptions = {}): Observable<T> {
        options.headers = this.getAuthHeaders();
        return this.http.delete<T>(this.base + url, options);
    }
}
