import { Component, OnInit, signal, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { UserService } from './core/services/user.service';
import { NotificationService } from './core/services/notification.service';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App implements OnInit {
  protected readonly title = signal('frontend');
  isAdmin = signal(false);
  unreadCount = signal(0);
  mobileMenuOpen = signal(false);
  
  private authService = inject(AuthService);
  isLoggedIn = this.authService.isLoggedIn;

  constructor(
    private userService: UserService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    effect(() => {
      const status = this.isLoggedIn();
      if (status) {
        this.loadUserData();
      } else {
        this.isAdmin.set(false);
        this.unreadCount.set(0);
      }
    });

    // Close menu on navigation
    this.router.events.subscribe(() => {
      this.mobileMenuOpen.set(false);
    });
  }

  toggleMobileMenu() {
    this.mobileMenuOpen.update(v => !v);
  }

  ngOnInit() {
    this.notificationService.unreadCount$.subscribe((count) => {
      this.unreadCount.set(count);
    });
  }

  loadUserData() {
    this.userService.me().subscribe({
      next: (user) => {
        if (user && user.enabled === false) {
          this.logout();
          return;
        }
        this.isAdmin.set(user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN');
      },
      error: () => {
        this.isAdmin.set(false);
        this.authService.logout();
      }
    });

    this.notificationService.refreshUnreadCount().subscribe();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

