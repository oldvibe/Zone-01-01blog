import { Component, OnInit, signal } from '@angular/core';
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
  isAdmin = false;
  unreadCount = 0;
  isLoggedIn = false;

  constructor(
    private userService: UserService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.isLoggedIn$.subscribe((status) => {
      this.isLoggedIn = status;
      if (status) {
        this.loadUserData();
      } else {
        this.isAdmin = false;
        this.unreadCount = 0;
      }
    });
  }

  loadUserData() {
    this.userService.me().subscribe({
      next: (user) => {
        this.isAdmin = user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN';
      },
      error: () => {
        this.isAdmin = false;
        this.authService.logout();
      }
    });

    this.notificationService.unreadCount$.subscribe((count) => {
      this.unreadCount = count;
    });
    this.notificationService.refreshUnreadCount().subscribe();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
