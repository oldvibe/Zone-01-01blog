import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface AdminReport {
  id: number;
  reason: string;
  targetType: string;
  targetId: number;
  reporterUsername: string;
  resolved: boolean;
  createdAt: string;
}

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: string;
  enabled: boolean;
  createdAt: string;
}

export interface AdminPost {
  id: number;
  content: string;
  mediaUrl?: string;
  authorId: number;
  authorUsername: string;
  createdAt: string;
  likes: number;
  likedByMe: boolean;
  mine: boolean;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private api = '/api/admin';

  constructor(private http: HttpClient) {}

  getReports() {
    return this.http.get<AdminReport[]>(`${this.api}/reports`);
  }

  resolveReport(id: number) {
    return this.http.post(`${this.api}/reports/${id}/resolve`, {});
  }

  deleteReport(id: number) {
    return this.http.delete(`${this.api}/reports/${id}`);
  }

  getPosts() {
    return this.http.get<AdminPost[]>(`${this.api}/posts`);
  }

  hidePost(id: number) {
    return this.http.post(`${this.api}/posts/${id}/hide`, {});
  }

  deletePost(id: number) {
    return this.http.delete(`${this.api}/posts/${id}`);
  }

  getUsers() {
    return this.http.get<AdminUser[]>(`${this.api}/users`);
  }

  banUser(id: number) {
    return this.http.post(`${this.api}/users/${id}/ban`, {});
  }

  deleteUser(id: number) {
    return this.http.delete(`${this.api}/users/${id}`);
  }
}
