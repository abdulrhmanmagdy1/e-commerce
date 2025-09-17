import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
    private readonly _activeRequests = signal(0);
    public readonly isLoading = signal(false);

    start(): void {
        this._activeRequests.update(v => v + 1);
        this.isLoading.set(true);
    }

    stop(): void {
        this._activeRequests.update(v => Math.max(0, v - 1));
        if (this._activeRequests() === 0) {
            this.isLoading.set(false);
        }
    }

    reset(): void {
        this._activeRequests.set(0);
        this.isLoading.set(false);
    }
} 