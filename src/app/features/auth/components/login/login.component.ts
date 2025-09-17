import { ChangeDetectorRef, Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../../core/services/auth.service';
import { finalize, timeout } from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly cdr = inject(ChangeDetectorRef);

  public readonly registeredMessage = signal(false);

  public readonly form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  public readonly serverError = signal<string | null>(null);
  public readonly successMessage = signal<string | null>(null);
  public readonly loading = signal(false);

  ngOnInit(): void {
    this.registeredMessage.set(this.route.snapshot.queryParamMap.get('registered') === '1');
  }

  private getErrorMessage(err: unknown): string {
    const anyErr: any = err as any;
    if (anyErr?.status === 0) return 'Network error. Please check your connection and try again.';
    const e = anyErr?.error;
    if (Array.isArray(e?.errors) && e.errors[0]?.msg) return String(e.errors[0].msg);
    if (e?.errors && typeof e.errors === 'object' && e.errors.msg) return String(e.errors.msg);
    if (typeof e === 'string' && e.trim()) return e;
    if (e?.message && e.message !== 'fail') return String(e.message);
    if (anyErr?.message) return String(anyErr.message);
    return 'Login failed. Please try again.';
  }

  submit(): void {
    this.serverError.set(null);
    this.successMessage.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const payload = {
      email: String(this.form.value.email || '').trim(),
      password: String(this.form.value.password || '').trim()
    };
    this.loading.set(true);
    this.auth.login(payload).pipe(timeout(15000), finalize(() => { this.loading.set(false); this.cdr.markForCheck(); })).subscribe({
      next: (res) => {
        if (res.token) {
          this.auth.setToken(res.token);
        }
        this.successMessage.set('Signed in successfully.');
        const redirect = this.route.snapshot.queryParamMap.get('redirect') || '/home';
        this.router.navigateByUrl(redirect);
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.serverError.set(this.getErrorMessage(err));
        this.cdr.markForCheck();
      }
    });
  }
}
