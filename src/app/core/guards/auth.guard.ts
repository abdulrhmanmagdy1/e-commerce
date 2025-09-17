import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { TokenService } from '../services/token.service';

export const authGuard: CanActivateFn = (route, state) => {
    const tokenService = inject(TokenService);
    const router = inject(Router);
    const token = tokenService.get();
    if (token) return true;
    router.navigate(['/login'], { queryParams: { redirect: state.url } });
    return false;
}; 