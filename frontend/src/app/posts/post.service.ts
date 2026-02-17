import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PostService {

  api = '/api/posts';

  constructor(private http: HttpClient) {}

  getFeed(page = 0) {
    return this.http.get<any>(`${this.api}?page=${page}`);
  }

  getById(id: number) {
    return this.http.get<any>(`${this.api}/${id}`);
  }

  getSubscriptions(page = 0) {
    return this.http.get<any>(`${this.api}/subscriptions?page=${page}`);
  }

  create(content: string, mediaUrls?: string[]) {
    return this.http.post(this.api, { content, mediaUrls });
  }

  update(id: number, content: string, mediaUrls?: string[]) {
    return this.http.put(`${this.api}/${id}`, { content, mediaUrls });
  }

  delete(id: number) {
    return this.http.delete(`${this.api}/${id}`);
  }

  like(id: number) {
    return this.http.post(`${this.api}/${id}/like`, {});
  }
}
