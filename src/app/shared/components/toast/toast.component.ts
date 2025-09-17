import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from '../../../core/services/toast.service';

@Component({
    selector: 'app-toast',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="fixed top-4 right-4 z-50 space-y-2">
      @for (toast of toasts(); track toast.id) {
        <div class="flex items-center gap-3 p-4 rounded-lg shadow-lg max-w-sm transition-all duration-300"
             [class]="getToastClass(toast.type)">
          <i [class]="getIconClass(toast.type)"></i>
          <span class="flex-1">{{ toast.message }}</span>
          <button type="button" (click)="toastService.remove(toast.id)" class="text-current opacity-70 hover:opacity-100">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      }
    </div>
  `,
    styles: []
})
export class ToastComponent {
    protected readonly toastService = inject(ToastService);
    protected readonly toasts = this.toastService.getToasts();

    getToastClass(type: string): string {
        switch (type) {
            case 'success': return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
            case 'error': return 'bg-red-100 text-red-800 border border-red-200';
            case 'info': return 'bg-blue-100 text-blue-800 border border-blue-200';
            default: return 'bg-gray-100 text-gray-800 border border-gray-200';
        }
    }

    getIconClass(type: string): string {
        switch (type) {
            case 'success': return 'fa-solid fa-check-circle text-emerald-600';
            case 'error': return 'fa-solid fa-exclamation-circle text-red-600';
            case 'info': return 'fa-solid fa-info-circle text-blue-600';
            default: return 'fa-solid fa-info-circle text-gray-600';
        }
    }
}
