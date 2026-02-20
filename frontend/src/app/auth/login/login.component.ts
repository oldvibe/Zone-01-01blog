import { Component, signal, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {

  form: FormGroup;
  errorMessage = signal('');
  successMessage = signal('');
  showPassword = signal(false);
  submitting = signal(false);

  private route = inject(ActivatedRoute);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/posts']);
    }

    this.route.queryParams.subscribe(params => {
      if (params['registered'] === 'true') {
        this.successMessage.set('Account created successfully! Please sign in.');
      }
    });

    // form initialization
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      remember: [true]
    });
  }

  login() {
    if (this.form.invalid) {
      this.errorMessage.set('Please enter a valid email and password.');
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage.set('');
    this.submitting.set(true);
    const { email, password, remember } = this.form.value;
    
    this.authService.login({ email, password }, remember)
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.router.navigate(['/posts']);
        },
        error: (err) => {
          this.submitting.set(false);
          this.errorMessage.set('Invalid email or password');
          console.error(err);
        }
      });
  }

  togglePassword() {
    this.showPassword.update(v => !v);
  }
}

