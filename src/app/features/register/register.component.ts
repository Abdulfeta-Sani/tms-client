import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm = this.fb.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: [
      '',
      [
        Validators.required,
        Validators.minLength(12),
        Validators.pattern(/[A-Z]/),
        Validators.pattern(/[0-9]/),
        Validators.pattern(/[^a-zA-Z0-9]/),
      ],
    ],
    role: ['Student', [Validators.required]],
  });

  errorMessage = '';
  isSubmitting = false;
  registrationSuccessful = false;

  async onSubmit(): Promise<void> {
    this.errorMessage = '';

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const formValue = this.registerForm.getRawValue();

    try {
      await this.authService.register({
        email: formValue.email!,
        password: formValue.password!,
        firstName: formValue.firstName!,
        lastName: formValue.lastName!,
        role: formValue.role!,
      });

      this.registrationSuccessful = true;
    } catch (error: any) {
      this.errorMessage =
        error?.error?.errors?.join(' ') ?? 'Registration failed. Please try again.';
    } finally {
      this.isSubmitting = false;
    }
  }

  goToLogin(): void {
    this.router.navigateByUrl('/login');
  }
}
