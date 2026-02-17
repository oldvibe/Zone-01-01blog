import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { UserService } from './core/services/user.service';
import { NotificationService } from './core/services/notification.service';

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

  constructor(
    private userService: UserService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    if (this.isLoggedIn()) {
      this.userService.me().subscribe({
        next: (user) => {
          this.isAdmin = user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN';
        },
        error: () => {
          this.isAdmin = false;
        }
      });
      this.notificationService.unreadCount$.subscribe((count) => {
        this.unreadCount = count;
      });
      this.notificationService.refreshUnreadCount().subscribe();
    }
  }

  isLoggedIn() {
    return !!(localStorage.getItem('token') || sessionStorage.getItem('token'));
  }
}
