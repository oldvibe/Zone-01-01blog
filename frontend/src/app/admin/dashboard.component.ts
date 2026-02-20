import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { AdminService, AdminPost, AdminReport, AdminUser } from '../core/services/admin.service';
import { UserService } from '../core/services/user.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  users = signal<AdminUser[]>([]);
  posts = signal<AdminPost[]>([]);
  reports = signal<AdminReport[]>([]);
  currentUser = signal<any>(null);
  loading = signal(false);
  errorMessage = signal('');

  constructor(
    private adminService: AdminService, 
    private userService: UserService
  ) {}

  ngOnInit() {
    this.userService.me().subscribe((user: any) => this.currentUser.set(user));
    this.loadAll();
  }

  loadAll() {
    this.loading.set(true);
    this.errorMessage.set('');
    
    forkJoin({
      users: this.adminService.getUsers(),
      posts: this.adminService.getPosts(),
      reports: this.adminService.getReports()
    }).subscribe({
      next: (res) => {
        this.users.set(res.users ?? []);
        this.posts.set(res.posts ?? []);
        this.reports.set(res.reports ?? []);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.loading.set(false);
        this.errorMessage.set('Failed to load admin data.');
      }
    });
  }

  banUser(id: number) {
    this.adminService.toggleUserBan(id).subscribe({
      next: () => {
        this.users.update(users => users.map((u) => (u.id === id ? { ...u, enabled: !u.enabled } : u)));
      },
      error: (err) => console.error(err)
    });
  }

  deleteUser(id: number) {
    this.adminService.deleteUser(id).subscribe({
      next: () => {
        this.users.update(users => users.filter((u) => u.id !== id));
      },
      error: (err) => console.error(err)
    });
  }

  hidePost(id: number) {
    this.adminService.togglePostVisibility(id).subscribe({
      next: () => {
        this.posts.update(posts => posts.map((p) => (p.id === id ? { ...p, visible: !p.visible } : p)));
      },
      error: (err) => console.error(err)
    });
  }

  deletePost(id: number) {
    this.adminService.deletePost(id).subscribe({
      next: () => {
        this.posts.update(posts => posts.filter((post) => post.id !== id));
      },
      error: (err) => console.error(err)
    });
  }

  resolveReport(id: number) {
    this.adminService.resolveReport(id).subscribe({
      next: () => {
        this.reports.update(reports => reports.map((report) => (report.id === id ? { ...report, resolved: true } : report)));
      },
      error: (err) => console.error(err)
    });
  }

  deleteReport(id: number) {
    this.adminService.deleteReport(id).subscribe({
      next: () => {
        this.reports.update(reports => reports.filter((report) => report.id !== id));
      },
      error: (err) => console.error(err)
    });
  }

  formatDate(value: string) {
    if (!value) {
      return '';
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString();
  }
  formatStatus(enabled: boolean) {
    return enabled ? 'Active' : 'Banned';
  }
  statusClass(enabled: boolean) {
    return enabled ? 'status-active' : 'status-banned';
  }
  statusAction(enabled: boolean) {
    return enabled ? 'Ban' : 'Unban';
  }
  statusActionClass(enabled: boolean) {
    return enabled ? 'btn-ban' : 'btn-unban';
  }
}

