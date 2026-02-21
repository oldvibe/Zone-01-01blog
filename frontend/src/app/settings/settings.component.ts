import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService, UserProfile } from '../core/services/user.service';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
  user = signal<UserProfile | undefined>(undefined);
  loading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  form: FormGroup;
  

  constructor(
    private userService: UserService,
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['']
    });
  }

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.loading.set(true);
    this.errorMessage.set('');
    this.userService.me().subscribe({
      next: (res) => {
        this.user.set(res);
        this.form.patchValue({
          username: res.username,
          email: res.email
        });
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.loading.set(false);
        this.errorMessage.set('Failed to load settings.');
      }
    });
  }

  saveProfile() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.errorMessage.set('');
    this.successMessage.set('');
    
    this.userService.updateMe(this.form.value).subscribe({
      next: (res) => {
        this.user.set(res);
        this.successMessage.set('Profile updated successfully.');
        this.form.patchValue({ password: '' });
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (err) => {
        console.error(err);
        this.errorMessage.set(err?.error?.message || 'Failed to update profile.');
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

