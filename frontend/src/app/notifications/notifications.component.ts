import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NotificationService, NotificationItem } from '../core/services/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss'
})
export class NotificationsComponent implements OnInit {
  items: NotificationItem[] = [];
  loading = false;
  errorMessage = '';

  constructor(private notificationService: NotificationService, private change: ChangeDetectorRef) { }

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.errorMessage = '';
    this.notificationService.list().subscribe({
      next: (res) => {
        this.items = res ?? [];
        this.notificationService.refreshUnreadCount().subscribe();
        this.loading = false;
        this.change.markForCheck();
      },
      error: (err) => {
        this.errorMessage = 'Failed to load notifications.';
        this.loading = false;
        console.error(err);
        this.change.markForCheck();
      }
    });
  }

  markRead(id: number) {
    this.notificationService.markRead(id).subscribe({
      next: () => {
        this.items = this.items.map((n) =>
          n.id === id ? { ...n, read: true } : n
        );
        this.notificationService.refreshUnreadCount().subscribe();
        setTimeout(() => this.change.markForCheck(), 0)
      },
      error: (err) =>  {
        console.error(err),
        this.change.markForCheck()
      },
    });
  }
}
