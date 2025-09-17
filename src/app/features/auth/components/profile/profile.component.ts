import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { TokenService } from '../../../../core/services/token.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Router } from '@angular/router';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, RouterLink, ReactiveFormsModule],
    templateUrl: './profile.component.html',
    styleUrl: './profile.component.scss'
})
export class ProfileComponent {
    private readonly tokenService = inject(TokenService);
    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);
    private readonly fb = inject(FormBuilder);
    private readonly toast = inject(ToastService);

    user = this.getUserFromToken();

    changeOpen = signal(false);
    changeForm: FormGroup = this.fb.group({
        currentPassword: ['', [Validators.required, Validators.minLength(6)]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        rePassword: ['', [Validators.required, Validators.minLength(6)]]
    });

    openChangePassword() { this.changeOpen.set(true); }
    closeChangePassword() { this.changeOpen.set(false); this.changeForm.reset(); }

    submitChangePassword() {
        if (this.changeForm.invalid) { this.changeForm.markAllAsTouched(); return; }
        const payload = this.changeForm.value as { currentPassword: string; password: string; rePassword: string };
        this.authService.changeMyPassword(payload).subscribe({
            next: (res: any) => {
                if (res?.token) this.authService.setToken(res.token);
                this.toast.success('Password changed successfully');
                this.closeChangePassword();
            },
            error: (err) => {
                const msg = err?.error?.message || 'Failed to change password';
                this.toast.error(msg);
            }
        });
    }

    private getUserFromToken() {
        const token = this.tokenService.get();
        if (!token) return null;
        try {
            const payload = JSON.parse(atob(token.split('.')[1] || ''));
            return {
                _id: payload?.id || payload?._id || '',
                name: payload?.name || 'User',
                email: payload?.email || '',
                phone: payload?.phone || '',
                role: payload?.role || 'user'
            };
        } catch {
            return null;
        }
    }

    getUserInitials(): string {
        if (!this.user?.name) return 'JD';
        return this.user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
    }

    logout(): void {
        this.authService.clearToken();
        this.router.navigate(['/home']);
    }
}
