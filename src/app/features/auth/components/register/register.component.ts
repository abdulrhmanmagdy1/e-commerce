import { ChangeDetectorRef, Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../../core/services/auth.service';
import { finalize, timeout } from 'rxjs';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

const matchPasswords: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const pass = group.get('password')?.value;
  const repass = group.get('rePassword')?.value;
  return pass === repass ? null : { passwordMismatch: true };
};

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  public readonly form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', []],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rePassword: ['', [Validators.required]]
  }, { validators: [matchPasswords] });

  public readonly serverError = signal<string | null>(null);
  public readonly loading = signal(false);



  submit(): void {
    this.serverError.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const payload = {
      name: String(this.form.value.name || '').trim(),
      email: String(this.form.value.email || '').trim(),
      phone: this.form.value.phone,
      password: String(this.form.value.password || '').trim(),
      rePassword: String(this.form.value.rePassword || '').trim()
    } as any;
    this.loading.set(true);
    this.auth.register(payload).pipe(timeout(15000), finalize(() => { this.loading.set(false); this.cdr.markForCheck(); })).subscribe({
      next: () => { this.router.navigate(['/login'], { queryParams: { registered: '1' } }); this.cdr.markForCheck(); },
      error: (err) => {
        const anyErr: any = err as any;
        if (anyErr?.status === 0) {
          this.serverError.set('Network error. Please check your connection and try again.');
        } else if (Array.isArray(anyErr?.error?.errors) && anyErr.error.errors[0]?.msg) {
          this.serverError.set(String(anyErr.error.errors[0].msg));
        } else if (anyErr?.error?.errors && typeof anyErr.error.errors === 'object' && anyErr.error.errors.msg) {
          this.serverError.set(String(anyErr.error.errors.msg));
        } else if (typeof anyErr?.error === 'string' && anyErr.error.trim()) {
          this.serverError.set(anyErr.error);
        } else if (anyErr?.error?.message && anyErr.error.message !== 'fail') {
          this.serverError.set(String(anyErr.error.message));
        } else if (anyErr?.message) {
          this.serverError.set(String(anyErr.message));
        } else {
          this.serverError.set('Registration failed. Please try again.');
        }
        this.cdr.markForCheck();
      }
    });
  }
}
