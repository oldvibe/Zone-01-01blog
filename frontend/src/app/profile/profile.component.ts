import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService, UserProfile } from '../core/services/user.service';
import { FollowService, FollowUser } from '../core/services/follow.service';
import { PostService } from '../posts/post.service';
import { ReportService } from '../core/services/report.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  user = signal<UserProfile | undefined>(undefined);
  viewer = signal<UserProfile | undefined>(undefined);
  viewedUsername = signal<string | null>(null);
  isMe = signal(true);
  posts = signal<any[]>([]);
  followers = signal<FollowUser[]>([]);
  following = signal<FollowUser[]>([]);
  loading = signal(false);
  postsLoading = signal(false);
  followersLoading = signal(false);
  followingLoading = signal(false);
  errorMessage = signal('');
  reporting = signal(false);
  reportMessage = signal('');
  reportForm: FormGroup;

  constructor(
    private userService: UserService,
    private followService: FollowService,
    private postService: PostService,
    private reportService: ReportService,
    private fb: FormBuilder,
    private route: ActivatedRoute
  ) {
    this.reportForm = this.fb.group({
      reason: ['', Validators.required]
    });
  }

  ngOnInit() {
    if (!localStorage.getItem('token')) {
      window.location.href = '/';
      return;
    }
    this.loadProfile();
  }

  loadProfile() {
    this.loading.set(true);
    this.errorMessage.set('');
    this.postsLoading.set(true);
    this.followersLoading.set(true);
    this.followingLoading.set(true);
    this.viewedUsername.set(this.route.snapshot.paramMap.get('username'));

    this.userService.me().subscribe({
      next: (me) => {
        this.viewer.set(me);
        if (this.viewedUsername() && this.viewedUsername() !== me.username) {
          this.isMe.set(false);
          this.loadOtherProfile(this.viewedUsername()!);
        } else {
          this.isMe.set(true);
          this.user.set(me);
          this.loading.set(false);
          this.loadMyExtras();
        }
      },
      error: (err) => {
        this.errorMessage.set('Failed to load profile.');
        this.loading.set(false);
        this.postsLoading.set(false);
        this.followersLoading.set(false);
        this.followingLoading.set(false);
        console.error(err);
      }
    });
  }

  loadOtherProfile(username: string) {
    this.userService.getByUsername(username).subscribe({
      next: (user) => {
        this.user.set(user);
        this.loading.set(false);
        this.loadOtherPosts(username);
      },
      error: (err) => {
        this.errorMessage.set('User not found.');
        this.loading.set(false);
        this.postsLoading.set(false);
        console.error(err);
      }
    });
  }

  loadOtherPosts(username: string) {
    this.userService.postsByUsername(username).subscribe({
      next: (res) => {
        this.posts.set(Array.isArray(res?.content) ? res.content : (res ?? []));
        this.postsLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.postsLoading.set(false);
      }
    });
  }

  loadMyExtras() {
    this.userService.myPosts().subscribe({
      next: (res) => {
        this.posts.set(Array.isArray(res?.content) ? res.content : (res ?? []));
        this.postsLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.postsLoading.set(false);
      }
    });

    this.followService.getFollowers().subscribe({
      next: (res) => {
        this.followers.set(res ?? []);
        this.followersLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.followersLoading.set(false);
      }
    });

    this.followService.getFollowing().subscribe({
      next: (res) => {
        this.following.set(res ?? []);
        this.followingLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.followingLoading.set(false);
      }
    });
  }

  toggleFollow(userId: number) {
    if (this.viewer() && userId === this.viewer()!.id) {
      return;
    }
    const isFollowing = this.following().some((user) => user.id === userId);
    
    this.following.update(following => {
      if (isFollowing) {
        return following.filter((user) => user.id !== userId);
      } else {
        const user = this.followers().find((follower) => follower.id === userId);
        return user ? [...following, user] : following;
      }
    });

    this.followService.toggleFollow(userId).subscribe({
      next: () => { },
      error: (err) => {
        console.error(err);
        // Rollback
        this.following.update(following => {
          if (isFollowing) {
            const user = this.followers().find((follower) => follower.id === userId);
            return user ? [...following, user] : following;
          } else {
            return following.filter((user) => user.id !== userId);
          }
        });
      }
    });
  }

  isFollowingUser(userId: number) {
    return this.following().some((user) => user.id === userId);
  }

  canFollowViewedUser() {
    if (!this.user() || !this.viewer()) {
      return false;
    }
    return this.user()!.id !== this.viewer()!.id;
  }

  isFollowingViewedUser() {
    if (!this.user()) {
      return false;
    }
    return this.following().some((user) => user.id === this.user()!.id);
  }

  toggleReport() {
    this.reporting.update(r => !r);
    this.reportMessage.set('');
    this.reportForm.reset();
  }

  submitReport() {
    if (!this.user()?.id || this.reportForm.invalid) {
      this.reportForm.markAllAsTouched();
      return;
    }
    const reason = this.reportForm.value.reason;
    this.reportService
      .create({ reason, targetType: 'USER', targetId: this.user()!.id })
      .subscribe({
        next: () => {
          this.reportMessage.set('Report submitted. Thank you.');
          this.reporting.set(false);
        },
        error: (err) => {
          console.error(err);
          this.reportMessage.set('Failed to submit report.');
        }
      });
  }

  deletePost(id: number) {
    this.postService.delete(id).subscribe({
      next: () => {
        this.posts.update(posts => posts.filter((post) => post.id !== id));
      },
      error: (err) => console.error(err)
    });
  }

  formatDate(value: string) {
    if (!value) {
      return '';
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString();
  }

  isVideo(url: string): boolean {
    const extensions = ['.mp4', '.webm', '.ogg', '.mov'];
    return extensions.some(ext => url.toLowerCase().endsWith(ext));
  }
}

