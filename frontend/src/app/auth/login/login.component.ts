import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {

  form: FormGroup;
  errorMessage = '';
  showPassword = false;
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/posts']);
    }
    // form initialization
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      remember: [true]
    });
  }

  login() {
    if (this.form.invalid) {
      this.errorMessage = 'Please enter a valid email and password.';
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage = '';
    this.submitting = true;
    const { email, password, remember } = this.form.value;
    
    this.authService.login({ email, password }, remember)
      .subscribe({
        next: () => {
          this.submitting = false;
          this.router.navigate(['/posts']);
        },
        error: (err) => {
          this.submitting = false;
          this.errorMessage = 'Invalid email or password';
          console.error(err);
        }
      });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}
