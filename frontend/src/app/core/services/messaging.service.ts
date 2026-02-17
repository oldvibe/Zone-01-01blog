import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface Conversation {
  id: number;
  otherUserId: number;
  otherUsername: string;
  lastMessageAt: string;
}

export interface Message {
  id: number;
  senderId: number;
  senderUsername: string;
  content: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class MessagingService {
  private api = '/api/messages';

  constructor(private http: HttpClient) {}

  getConversations() {
    return this.http.get<Conversation[]>(`${this.api}/conversations`);
  }

  getMessages(convId: number, page = 0) {
    return this.http.get<any>(`${this.api}/conversations/${convId}?page=${page}&size=20`);
  }

  sendMessage(receiverId: number, content: string) {
    return this.http.post<Message>(`${this.api}/send/${receiverId}`, { content });
  }
}
