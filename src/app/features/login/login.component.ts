import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  readonly loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  errorMessage = '';
  isSubmitting = false;

  async onSubmit(): Promise<void> {
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const { email, password } = this.loginForm.getRawValue();

    try {
      await this.authService.login({
        email: email!,
        password: password!,
      });

      const returnUrl = this.activatedRoute.snapshot.queryParamMap.get('returnUrl');

      const safeReturnUrl =
        returnUrl && returnUrl.startsWith('/') ? returnUrl : this.authService.getDefaultRoute();

      await this.router.navigateByUrl(safeReturnUrl);
    } catch {
      this.errorMessage = 'Invalid email or password.';
    } finally {
      this.isSubmitting = false;
    }
  }
}
