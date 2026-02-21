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
  successMessage = signal('');

  // Confirmation Modal State
  showConfirm = signal(false);
  confirmTitle = signal('');
  confirmMessage = signal('');
  confirmAction = signal<() => void>(() => {});
  confirmActionType = signal<'danger' | 'success' | 'warning'>('warning');

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

  // --- Confirmation Helpers ---
  openConfirm(title: string, message: string, type: 'danger' | 'success' | 'warning', action: () => void) {
    this.confirmTitle.set(title);
    this.confirmMessage.set(message);
    this.confirmActionType.set(type);
    this.confirmAction.set(() => {
      action();
      this.closeConfirm();
    });
    this.showConfirm.set(true);
  }

  closeConfirm() {
    this.showConfirm.set(false);
  }

  // --- Actions ---

  banUser(id: number) {
    const user = this.users().find(u => u.id === id);
    const actionLabel = user?.enabled ? 'ban' : 'unban';
    
    this.openConfirm(
      `${actionLabel.toUpperCase()} USER`,
      `Are you sure you want to ${actionLabel} this user?`,
      user?.enabled ? 'danger' : 'success',
      () => {
        this.adminService.toggleUserBan(id).subscribe({
          next: () => {
            this.users.update(users => users.map((u) => (u.id === id ? { ...u, enabled: !u.enabled } : u)));
            this.successMessage.set(`User ${actionLabel}ned successfully.`);
            setTimeout(() => this.successMessage.set(''), 3000);
          },
          error: (err) => {
            console.error(err);
            this.errorMessage.set('Action failed.');
            setTimeout(() => this.errorMessage.set(''), 3000);
          }
        });
      }
    );
  }

  deleteUser(id: number) {
    this.openConfirm(
      'CRITICAL: DELETE USER',
      'Are you sure you want to PERMANENTLY DELETE this user and all their data? This cannot be undone.',
      'danger',
      () => {
        this.adminService.deleteUser(id).subscribe({
          next: () => {
            this.users.update(users => users.filter((u) => u.id !== id));
            this.successMessage.set('User deleted successfully.');
            setTimeout(() => this.successMessage.set(''), 3000);
          },
          error: (err) => {
            console.error(err);
            this.errorMessage.set('Delete failed.');
            setTimeout(() => this.errorMessage.set(''), 3000);
          }
        });
      }
    );
  }

  hidePost(id: number) {
    const post = this.posts().find(p => p.id === id);
    const actionLabel = post?.visible ? 'hide' : 'show';
    
    this.openConfirm(
      `${actionLabel.toUpperCase()} POST`,
      `Are you sure you want to ${actionLabel} this post?`,
      post?.visible ? 'warning' : 'success',
      () => {
        this.adminService.togglePostVisibility(id).subscribe({
          next: () => {
            this.posts.update(posts => posts.map((p) => (p.id === id ? { ...p, visible: !p.visible } : p)));
            this.successMessage.set(`Post ${actionLabel}den successfully.`);
            setTimeout(() => this.successMessage.set(''), 3000);
          },
          error: (err) => {
            console.error(err);
            this.errorMessage.set('Action failed.');
            setTimeout(() => this.errorMessage.set(''), 3000);
          }
        });
      }
    );
  }

  deletePost(id: number) {
    this.openConfirm(
      'DELETE POST',
      'Are you sure you want to PERMANENTLY DELETE this post?',
      'danger',
      () => {
        this.adminService.deletePost(id).subscribe({
          next: () => {
            this.posts.update(posts => posts.filter((post) => post.id !== id));
            this.successMessage.set('Post deleted successfully.');
            setTimeout(() => this.successMessage.set(''), 3000);
          },
          error: (err) => {
            console.error(err);
            this.errorMessage.set('Delete failed.');
            setTimeout(() => this.errorMessage.set(''), 3000);
          }
        });
      }
    );
  }

  resolveReport(id: number) {
    this.openConfirm(
      'RESOLVE REPORT',
      'Mark this report as resolved?',
      'success',
      () => {
        this.adminService.resolveReport(id).subscribe({
          next: () => {
            this.reports.update(reports => reports.filter((report) => report.id !== id));
            this.successMessage.set('Report resolved successfully.');
            setTimeout(() => this.successMessage.set(''), 3000);
          },
          error: (err) => {
            console.error(err);
            this.errorMessage.set('Action failed.');
            setTimeout(() => this.errorMessage.set(''), 3000);
          }
        });
      }
    );
  }

  deleteReport(id: number) {
    this.openConfirm(
      'DISCARD REPORT',
      'Are you sure you want to discard this report?',
      'warning',
      () => {
        this.adminService.deleteReport(id).subscribe({
          next: () => {
            this.reports.update(reports => reports.filter((report) => report.id !== id));
          },
          error: (err) => console.error(err)
        });
      }
    );
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

