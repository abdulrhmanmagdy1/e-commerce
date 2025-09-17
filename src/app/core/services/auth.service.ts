import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from './api-config';
import { HttpService } from './http.service';
import { AuthResponse, ForgotPasswordRequest, LoginRequest, RegisterRequest, ResetPasswordRequest, VerifyResetCodeRequest } from '../interfaces/auth';
import { ApiItemResponse } from '../interfaces/api';
import { TokenService } from './token.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly http = inject(HttpService);
    private readonly tokenStore = inject(TokenService);

    register(payload: RegisterRequest): Observable<AuthResponse | ApiItemResponse<unknown>> {
        return this.http.post<AuthResponse | ApiItemResponse<unknown>>(API_CONFIG.endpoints.auth.register, payload);
    }

    login(payload: LoginRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(API_CONFIG.endpoints.auth.login, payload);
    }

    forgotPassword(payload: ForgotPasswordRequest): Observable<ApiItemResponse<unknown>> {
        return this.http.post<ApiItemResponse<unknown>>(API_CONFIG.endpoints.auth.forgotPassword, payload);
    }

    verifyResetCode(payload: VerifyResetCodeRequest): Observable<ApiItemResponse<unknown>> {
        return this.http.post<ApiItemResponse<unknown>>(API_CONFIG.endpoints.auth.verifyResetCode, payload);
    }

    resetPassword(payload: ResetPasswordRequest): Observable<AuthResponse> {
        return this.http.put<AuthResponse>(API_CONFIG.endpoints.auth.resetPassword, payload);
    }

    changeMyPassword(payload: { currentPassword: string; password: string; rePassword: string; }): Observable<AuthResponse | ApiItemResponse<unknown>> {
        const endpoint = '/api/v1/users/changeMyPassword';
        return this.http.put<AuthResponse | ApiItemResponse<unknown>>(endpoint, payload);
    }

    setToken(token: string): void { this.tokenStore.set(token); }
    getToken(): string | null { return this.tokenStore.get(); }
    clearToken(): void { this.tokenStore.clear(); }
}
