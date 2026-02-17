import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
  users: AdminUser[] = [];
  posts: AdminPost[] = [];
  reports: AdminReport[] = [];
  currentUser: any = null;
  loading = false;
  errorMessage = '';

  constructor(
    private adminService: AdminService, 
    private userService: UserService,
    private change: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.userService.me().subscribe((user: any) => this.currentUser = user);
    this.loadAll();
  }

  loadAll() {
    this.loading = true;
    this.errorMessage = '';
    
    forkJoin({
      users: this.adminService.getUsers(),
      posts: this.adminService.getPosts(),
      reports: this.adminService.getReports()
    }).subscribe({
      next: (res) => {
        this.users = res.users ?? [];
        this.posts = res.posts ?? [];
        this.reports = res.reports ?? [];
        this.loading = false;
        this.change.markForCheck();
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.errorMessage = 'Failed to load admin data.';
        this.change.markForCheck();
      }
    });
  }

  banUser(id: number) {
    this.adminService.banUser(id).subscribe({
      next: () => {
        this.users = this.users.map((u) => (u.id === id ? { ...u, enabled: false } : u));
        this.change.markForCheck();
      },
      error: (err) => console.error(err)
    });
  }

  deleteUser(id: number) {
    this.adminService.deleteUser(id).subscribe({
      next: () => (this.users = this.users.filter((u) => u.id !== id), this.change.markForCheck()),
      error: (err) => console.error(err)
    });
  }

  hidePost(id: number) {
    this.adminService.hidePost(id).subscribe({
      next: () => {},
      error: (err) => console.error(err)
    });
  }

  deletePost(id: number) {
    this.adminService.deletePost(id).subscribe({
      next: () => (this.posts = this.posts.filter((post) => post.id !== id), this.change.markForCheck()),
      error: (err) => console.error(err)
    });
  }

  resolveReport(id: number) {
    this.adminService.resolveReport(id).subscribe({
      next: () => {
        this.reports = this.reports.map((report) => (report.id === id ? { ...report, resolved: true } : report));
      },
      error: (err) => console.error(err)
    });
  }

  deleteReport(id: number) {
    this.adminService.deleteReport(id).subscribe({
      next: () => (this.reports = this.reports.filter((report) => report.id !== id)),
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
