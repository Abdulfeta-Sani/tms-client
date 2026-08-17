import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  username = '';
  password = '';
  errorMessage = '';

  async login() {
    this.errorMessage = '';

    try {
      await this.authService.login({
        username: this.username,
        password: this.password,
      });

      this.router.navigateByUrl('/dashboard');
    } catch (error) {
      this.errorMessage = 'Invalid username or password.';
    }
  }
}
