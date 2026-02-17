import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
  posts: any[] = [];
  authors: { id: number; username: string }[] = [];
  followingIds = new Set<number>();
  currentUser?: UserProfile;
  loading = false;
  errorMessage = '';

  constructor(
    private postService: PostService,
    private followService: FollowService,
    private userService: UserService,
    private change: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loadCurrentUser();
    this.loadFollowing();
    this.loadPosts();
  }

  loadCurrentUser() {
    this.userService.me().subscribe({
      next: (user) => {
        this.currentUser = user;
        this.change.markForCheck();
      },
      error: (err) => {
        console.error(err);
        this.change.markForCheck();
      }
    });
  }

  loadFollowing() {
    this.followService.getFollowing().subscribe({
      next: (res) => {
        this.followingIds = new Set((res ?? []).map((user) => user.id));
        this.change.markForCheck();
      },
      error: (err) => {
        console.error(err);
        this.change.markForCheck();
      }
    });
  }

  loadPosts(page = 0) {
    this.loading = true;
    this.errorMessage = '';
    this.change.markForCheck();
    this.postService.getFeed(page).subscribe({
      next: (res) => {
        this.posts = Array.isArray(res?.content) ? res.content : (res ?? []);
        this.authors = this.buildAuthors(this.posts);
        this.loading = false;
        this.change.markForCheck();
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.errorMessage = 'Failed to load explore feed.';
        this.change.markForCheck();
      }
    });
  }

  buildAuthors(posts: any[]) {
    const map = new Map<number, string>();
    posts.forEach((post) => {
      if (post?.authorId && post?.authorUsername) {
        // Filter out current user from authors list
        if (this.currentUser && post.authorId === this.currentUser.id) {
          return;
        }
        map.set(post.authorId, post.authorUsername);
      }
    });
    return Array.from(map.entries()).map(([id, username]) => ({ id, username }));
  }

  toggleFollow(userId: number) {
    const isFollowing = this.followingIds.has(userId);
    if (isFollowing) {
      this.followingIds.delete(userId);
    } else {
      this.followingIds.add(userId);
    }
    this.followService.toggleFollow(userId).subscribe({
      next: () => { },
      error: (err) => {
        console.error(err);
        if (isFollowing) {
          this.followingIds.add(userId);
        } else {
          this.followingIds.delete(userId);
        }
      }
    });
  }

  isFollowing(userId: number) {
    return this.followingIds.has(userId);
  }

  formatDate(value: string) {
    if (!value) {
      return '';
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString();
  }
}
