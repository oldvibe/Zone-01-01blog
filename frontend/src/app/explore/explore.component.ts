import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PostService } from '../posts/post.service';
import { FollowService } from '../core/services/follow.service';
import { UserProfile, UserService } from '../core/services/user.service';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './explore.component.html',
  styleUrl: './explore.component.scss'
})
export class ExploreComponent implements OnInit {
  posts = signal<any[]>([]);
  followingIds = signal<Set<number>>(new Set());
  currentUser = signal<UserProfile | undefined>(undefined);
  loading = signal(false);
  errorMessage = signal('');

  authors = computed(() => {
    const map = new Map<number, string>();
    const postsList = this.posts();
    const user = this.currentUser();
    
    postsList.forEach((post) => {
      if (post?.authorId && post?.authorUsername) {
        // Filter out current user from authors list
        if (user && post.authorId === user.id) {
          return;
        }
        map.set(post.authorId, post.authorUsername);
      }
    });
    return Array.from(map.entries()).map(([id, username]) => ({ id, username }));
  });

  constructor(
    private postService: PostService,
    private followService: FollowService,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.loadCurrentUser();
    this.loadFollowing();
    this.loadPosts();
  }

  loadCurrentUser() {
    this.userService.me().subscribe({
      next: (user) => {
        this.currentUser.set(user);
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  loadFollowing() {
    this.followService.getFollowing().subscribe({
      next: (res) => {
        this.followingIds.set(new Set((res ?? []).map((user) => user.id)));
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  loadPosts(page = 0) {
    this.loading.set(true);
    this.errorMessage.set('');
    this.postService.getFeed(page).subscribe({
      next: (res) => {
        this.posts.set(Array.isArray(res?.content) ? res.content : (res ?? []));
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.loading.set(false);
        this.errorMessage.set('Failed to load explore feed.');
      }
    });
  }

  toggleFollow(userId: number) {
    const isFollowing = this.followingIds().has(userId);
    
    this.followingIds.update(ids => {
      const next = new Set(ids);
      if (isFollowing) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });

    this.followService.toggleFollow(userId).subscribe({
      next: () => { },
      error: (err) => {
        console.error(err);
        // Rollback
        this.followingIds.update(ids => {
          const next = new Set(ids);
          if (isFollowing) {
            next.add(userId);
          } else {
            next.delete(userId);
          }
          return next;
        });
      }
    });
  }

  isFollowing(userId: number) {
    return this.followingIds().has(userId);
  }

  formatDate(value: string) {
    if (!value) {
      return '';
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString();
  }
}

