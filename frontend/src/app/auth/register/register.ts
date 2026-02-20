import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class Register {
  form: FormGroup;
  errorMessage = signal('');
  submitting = signal(false);
  showPassword = signal(false);
  showConfirm = signal(false);

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
    this.errorMessage.set('');
    if (this.form.invalid) {
      this.errorMessage.set('Please fill all fields correctly.');
      this.form.markAllAsTouched();
      return;
    }

    if (this.form.value.password !== this.form.value.confirm) {
      this.errorMessage.set('Passwords do not match.');
      return;
    }

    this.submitting.set(true);
    const payload = {
      username: this.form.value.fullName,
      email: this.form.value.email,
      password: this.form.value.password
    };

    this.authService.register(payload).subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigate(['/login'], { queryParams: { registered: 'true' } });
      },
      error: (err) => {
        console.error(err);
        this.errorMessage.set(err?.error?.message || err?.message || 'Registration failed. Please try again.');
        this.submitting.set(false);
      }
    });
  }

  togglePassword() { this.showPassword.update(v => !v); }
  toggleConfirm() { this.showConfirm.update(v => !v); }
}


