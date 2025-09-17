import { Component, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  @ViewChild('codeInput') codeInput?: ElementRef<HTMLInputElement>;

  step: 1 | 2 | 3 = 1;
  error: string | null = null;
  success: string | null = null;
  loading = signal(false);
  userNotFound = signal(false);

  formEmail: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  formCode: FormGroup = this.fb.group({
    resetCode: ['', [Validators.required, Validators.minLength(4)]]
  });

  formReset: FormGroup = this.fb.group({
    email: [{ value: '', disabled: true }],
    newPassword: ['', [Validators.required, Validators.minLength(6)]]
  });

  requestCode(): void {
    this.error = null; this.success = null;
    if (this.formEmail.invalid) { this.formEmail.markAllAsTouched(); return; }
    const email = this.formEmail.value.email;
    this.loading.set(true);
    this.userNotFound.set(false);
    this.auth.forgotPassword({ email }).subscribe({
      next: (res: any) => {
        this.formReset.get('email')?.setValue(email);
        this.step = 2;
        const apiMsg = res?.message || res?.statusMsg || '';
        this.success = apiMsg || 'Reset code sent to your email';
        this.loading.set(false);
        setTimeout(() => this.codeInput?.nativeElement?.focus(), 0);
      },
      error: (err) => {
        const msg = err?.error?.message || err?.message || 'Could not send reset code.';
        this.error = msg;
        const lower = String(msg).toLowerCase();
        if (err?.status === 404 || /not\s*found/.test(lower) || /no user/.test(lower) || /not registered/.test(lower) || /does not exist/.test(lower)) {
          this.userNotFound.set(true);
        }
        this.loading.set(false);
      }
    });
  }

  verifyCode(): void {
    this.error = null; this.success = null;
    if (this.formCode.invalid) { this.formCode.markAllAsTouched(); return; }
    this.loading.set(true);
    this.auth.verifyResetCode(this.formCode.value).subscribe({
      next: () => { this.step = 3; this.success = 'Code verified. Set a new password.'; this.loading.set(false); },
      error: (err) => { this.error = err?.error?.message || 'Invalid code. Try again.'; this.loading.set(false); }
    });
  }

  resetPassword(): void {
    this.error = null; this.success = null;
    if (this.formReset.invalid) { this.formReset.markAllAsTouched(); return; }
    const payload = { email: this.formReset.getRawValue().email, newPassword: this.formReset.getRawValue().newPassword };
    this.loading.set(true);
    this.auth.resetPassword(payload).subscribe({
      next: (res) => {
        if (res.token) this.auth.setToken(res.token);
        this.success = 'Password updated successfully. You can now sign in.';
        this.loading.set(false);
        this.router.navigateByUrl('/login');
      },
      error: (err) => { this.error = err?.error?.message || 'Could not reset password.'; this.loading.set(false); }
    });
  }

  resendCode(): void { this.requestCode(); }
}
