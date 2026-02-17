import { ChangeDetectorRef , Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService, UserProfile } from '../core/services/user.service';
import { AuthService } from '../auth/auth.service';

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
  form: FormGroup;
  

  constructor(
    private userService: UserService,
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService,
    private change: ChangeDetectorRef,
  ) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit() {
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
        this.change.markForCheck();
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.errorMessage = 'Failed to load settings.';
         this.change.markForCheck();
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
         this.change.markForCheck();
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Failed to update profile.';
         this.change.markForCheck();
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
