import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const TOKEN_KEY = 'auth_token';

@Injectable({ providedIn: 'root' })
export class TokenService {
    constructor(@Inject(PLATFORM_ID) private readonly platformId: Object) { }

    private isBrowser(): boolean {
        return isPlatformBrowser(this.platformId);
    }

    get(): string | null {
        try {
            if (!this.isBrowser()) return null;
            return localStorage.getItem(TOKEN_KEY);
        } catch {
            return null;
        }
    }

    set(token: string): void {
        try {
            if (!this.isBrowser()) return;
            localStorage.setItem(TOKEN_KEY, token);
        } catch {
            /* ignore */
        }
    }

    clear(): void {
        try {
            if (!this.isBrowser()) return;
            localStorage.removeItem(TOKEN_KEY);
        } catch {
            /* ignore */
        }
    }
} 