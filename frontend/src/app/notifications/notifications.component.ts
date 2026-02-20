import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, NotificationItem } from '../core/services/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss'
})
export class NotificationsComponent implements OnInit {
  items = signal<NotificationItem[]>([]);
  loading = signal(false);
  errorMessage = signal('');

  constructor(private notificationService: NotificationService) { }

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.errorMessage.set('');
    this.notificationService.list().subscribe({
      next: (res) => {
        this.items.set(res ?? []);
        this.notificationService.refreshUnreadCount().subscribe();
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set('Failed to load notifications.');
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  markRead(id: number) {
    this.notificationService.markRead(id).subscribe({
      next: () => {
        this.items.update(items => items.map((n) =>
          n.id === id ? { ...n, read: true } : n
        ));
        this.notificationService.refreshUnreadCount().subscribe();
      },
      error: (err) =>  {
        console.error(err);
      },
    });
  }
}

