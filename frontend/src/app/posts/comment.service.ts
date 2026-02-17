import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface CommentItem {
  id: number;
  content: string;
  author: string;
  owner: boolean;
  createdAt: string;
  parentId?: number;
}

@Injectable({ providedIn: 'root' })
export class CommentService {
  private api = '/api/posts';

  constructor(private http: HttpClient) {}

  list(postId: number) {
    return this.http.get<CommentItem[]>(`${this.api}/${postId}/comments`);
  }

  add(postId: number, content: string, parentId?: number) {
    return this.http.post<CommentItem>(`${this.api}/${postId}/comments`, { content, parentId });
  }

  remove(commentId: number) {
    return this.http.delete(`${this.api}/comments/${commentId}`);
  }
}
