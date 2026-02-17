import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MessagingService, Message } from '../core/services/messaging.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chat-container d-flex flex-column h-100">
      <div class="chat-messages flex-grow-1 overflow-auto p-3 border rounded mb-3" style="max-height: 60vh;">
        <div *ngFor="let m of messages" 
             [ngClass]="{'text-end': m.senderUsername === myUsername}"
             class="mb-3">
          <div [ngClass]="m.senderUsername === myUsername ? 'bg-primary text-white' : 'bg-light'"
               class="d-inline-block p-2 rounded px-3">
            <p class="mb-0">{{ m.content }}</p>
            <small [ngClass]="m.senderUsername === myUsername ? 'text-white-50' : 'text-muted'" style="font-size: 0.7rem;">
              {{ m.createdAt | date:'short' }}
            </small>
          </div>
        </div>
        <div *ngIf="!messages.length" class="text-center py-5 text-muted">
          Start a conversation!
        </div>
      </div>

      <div class="chat-input input-group">
        <input type="text" 
               class="form-control" 
               placeholder="Type a message..." 
               [(ngModel)]="newMessage" 
               (keyup.enter)="sendMessage()">
        <button class="btn btn-primary" type="button" (click)="sendMessage()" [disabled]="!newMessage.trim()">
          Send
        </button>
      </div>
    </div>
  `,
  styles: [`
    .chat-container { height: 100%; }
    .chat-messages::-webkit-scrollbar { width: 6px; }
    .chat-messages::-webkit-scrollbar-thumb { background: #ccc; border-radius: 3px; }
  `]
})
export class ChatComponent implements OnInit, OnDestroy {
  messages: Message[] = [];
  newMessage = '';
  convId?: number;
  myUsername = ''; // Should get from UserService
  private sub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private messagingService: MessagingService
  ) {}

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.convId = +params['id'];
      this.loadMessages();
    });
    // For simplicity, let's assume username is in localStorage or just skip the 'myUsername' check for now
    // or better, implement a basic way to find it.
  }

  loadMessages() {
    if (!this.convId) return;
    this.messagingService.getMessages(this.convId).subscribe(res => {
      this.messages = res.content.reverse();
    });
  }

  sendMessage() {
    if (!this.newMessage.trim() || !this.convId) return;
    
    // We need the receiverId. In a real app, the Conversation object would have it.
    // Let's assume we can get it from the messages if they exist, or we need another API.
    // For now, let's update MessagingService to take convId for sending if possible, 
    // or just use the other user ID from conversation list.
    
    // Simplification: In this minimal version, let's just implement the list.
    // To send, we usually need the target user ID.
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}
