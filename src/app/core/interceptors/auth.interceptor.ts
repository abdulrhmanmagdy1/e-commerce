import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenService } from '../services/token.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const tokenStore = inject(TokenService);
    const token = tokenStore.get();
    if (token) {
        req = req.clone({
            setHeaders: { token }
        });
    }
    return next(req);
}; 