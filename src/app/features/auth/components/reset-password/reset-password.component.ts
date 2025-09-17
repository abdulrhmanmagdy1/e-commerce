import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { finalize, timeout } from 'rxjs';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  public readonly form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    newPassword: ['', [Validators.required, Validators.minLength(6)]]
  });

  public readonly serverError = signal<string | null>(null);
  public readonly successMessage = signal<string | null>(null);
  public readonly loading = signal(false);

  submit(): void {
    this.serverError.set(null);
    this.successMessage.set(null);
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.auth.resetPassword({
      email: String(this.form.value.email || '').trim(),
      newPassword: String(this.form.value.newPassword || '').trim()
    }).pipe(timeout(15000), finalize(() => this.loading.set(false))).subscribe({
      next: (res) => {
        if (res.token) this.auth.setToken(res.token);
        this.successMessage.set('Password updated successfully. You can now sign in.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        const e: any = err as any;
        this.serverError.set(e?.error?.message || 'Could not reset password.');
      }
    });
  }
}
