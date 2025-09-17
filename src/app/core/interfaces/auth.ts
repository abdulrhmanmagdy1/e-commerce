export interface User {
    _id: string;
    name: string;
    email: string;
    role?: 'user' | 'admin';
    phone?: string;
}

export interface AuthResponse {
    message?: string;
    token: string;
    user?: User;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    rePassword: string;
    phone?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface VerifyResetCodeRequest {
    resetCode: string;
}

export interface ResetPasswordRequest {
    email: string;
    newPassword: string;
} 