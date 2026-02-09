import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  role: string;
  enabled: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private api = '/api/users';

  constructor(private http: HttpClient) {}

  me() {
    return this.http.get<UserProfile>(`${this.api}/me`);
  }

  getByUsername(username: string) {
    return this.http.get<UserProfile>(`${this.api}/${username}`);
  }

  myPosts(page = 0, size = 10) {
    return this.http.get<any>(`${this.api}/me/posts?page=${page}&size=${size}`);
  }

  postsByUsername(username: string, page = 0, size = 10) {
    return this.http.get<any>(`${this.api}/${username}/posts?page=${page}&size=${size}`);
  }

  updateMe(data: { username?: string; email?: string }) {
    return this.http.put<UserProfile>(`${this.api}/me`, data);
  }
}
