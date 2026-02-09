import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService, UserProfile } from '../core/services/user.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
  user?: UserProfile;
  loading = false;
  errorMessage = '';
  compactMode = localStorage.getItem('compactMode') === 'true';
  form: FormGroup;

  constructor(
    private userService: UserService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit() {
    document.body.classList.toggle('compact', this.compactMode);
    this.loadProfile();
  }

  loadProfile() {
    this.loading = true;
    this.errorMessage = '';
    this.userService.me().subscribe({
      next: (res) => {
        this.user = res;
        this.form.patchValue({
          username: res.username,
          email: res.email
        });
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.errorMessage = 'Failed to load settings.';
      }
    });
  }

  saveProfile() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.userService.updateMe(this.form.value).subscribe({
      next: (res) => {
        this.user = res;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Failed to update profile.';
      }
    });
  }

  toggleCompactMode() {
    this.compactMode = !this.compactMode;
    localStorage.setItem('compactMode', String(this.compactMode));
    document.body.classList.toggle('compact', this.compactMode);
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/']);
  }
}
