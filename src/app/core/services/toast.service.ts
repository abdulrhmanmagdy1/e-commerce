import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
    private toasts = signal<ToastMessage[]>([]);

    getToasts() {
        return this.toasts.asReadonly();
    }

    add(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
        const id = Date.now().toString();
        this.toasts.update(toasts => [...toasts, { id, message, type }]);
        setTimeout(() => this.remove(id), 3000);
    }

    remove(id: string): void {
        this.toasts.update(toasts => toasts.filter(t => t.id !== id));
    }

    success(message: string): void {
        this.add(message, 'success');
    }

    error(message: string): void {
        this.add(message, 'error');
    }

    info(message: string): void {
        this.add(message, 'info');
    }
}
