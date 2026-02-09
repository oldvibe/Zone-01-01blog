import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class Register {
  form: FormGroup;
  errorMessage = '';
  submitting = false;
  showPassword = false;
  showConfirm = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirm: ['', [Validators.required]],
      agree: [false, [Validators.requiredTrue]]
    });
  }

  register() {
    this.errorMessage = '';
    if (this.form.invalid) {
      this.errorMessage = 'Please fill all fields correctly.';
      this.form.markAllAsTouched();
      return;
    }

    if (this.form.value.password !== this.form.value.confirm) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.submitting = true;
    const payload = {
      username: this.form.value.fullName,
      email: this.form.value.email,
      password: this.form.value.password
    };

    this.authService.register(payload).subscribe({
      next: () => {
        this.submitting = false;
        localStorage.setItem('registrationSuccess', 'true');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = err?.error?.message || 'Registration failed. Please try again.';
        this.submitting = false;
      }
    });
  }

  togglePassword() { this.showPassword = !this.showPassword; }
  toggleConfirm() { this.showConfirm = !this.showConfirm; }
}
