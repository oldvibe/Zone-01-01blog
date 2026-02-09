import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface FollowUser {
  id: number;
  username: string;
}

@Injectable({ providedIn: 'root' })
export class FollowService {
  private api = '/api/users';

  constructor(private http: HttpClient) {}

  getFollowing() {
    return this.http.get<FollowUser[]>(`${this.api}/me/following`);
  }

  getFollowers() {
    return this.http.get<FollowUser[]>(`${this.api}/me/followers`);
  }

  toggleFollow(userId: number) {
    return this.http.post(`${this.api}/${userId}/follow`, {});
  }
}
