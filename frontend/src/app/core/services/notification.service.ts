import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';

export interface NotificationItem {
  id: number;
  message: string;
  read: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private api = '/api/notifications';
  private unreadCountSubject = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {}

  list() {
    return this.http.get<NotificationItem[]>(this.api);
  }

  refreshUnreadCount() {
    return this.http.get<number>(`${this.api}/unread-count`).pipe(
      tap((count) => this.unreadCountSubject.next(count ?? 0))
    );
  }

  markRead(id: number) {
    return this.http.post(`${this.api}/${id}/read`, {});
  }
}
