import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MessagingService, Conversation } from '../core/services/messaging.service';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  template: `
    <div class="messages-layout container py-4">
      <div class="row">
        <aside class="col-md-4 border-end">
          <h2 class="h4 mb-4">Conversations</h2>
          <div class="list-group">
            <a *ngFor="let c of conversations" 
               [routerLink]="['/messages', c.id]"
               routerLinkActive="active"
               class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
              <div>
                <h6 class="mb-0">{{ c.otherUsername }}</h6>
                <small class="text-muted">Last active: {{ c.lastMessageAt | date:'short' }}</small>
              </div>
            </a>
            <div *ngIf="!conversations.length" class="text-center py-4 text-muted">
              No conversations yet.
            </div>
          </div>
        </aside>
        <main class="col-md-8">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .messages-layout { min-height: 80vh; }
    .list-group-item.active { background-color: var(--primary); border-color: var(--primary); }
  `]
})
export class MessagesComponent implements OnInit {
  conversations: Conversation[] = [];

  constructor(private messagingService: MessagingService) {}

  ngOnInit() {
    this.messagingService.getConversations().subscribe(res => this.conversations = res);
  }
}
