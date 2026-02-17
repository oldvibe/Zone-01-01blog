import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
  user?: UserProfile;
  viewer?: UserProfile;
  viewedUsername: string | null = null;
  isMe = true;
  posts: any[] = [];
  followers: FollowUser[] = [];
  following: FollowUser[] = [];
  loading = false;
  postsLoading = false;
  followersLoading = false;
  followingLoading = false;
  errorMessage = '';
  reporting = false;
  reportMessage = '';
  reportForm: FormGroup;

  constructor(
    private userService: UserService,
    private followService: FollowService,
    private postService: PostService,
    private reportService: ReportService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private change: ChangeDetectorRef
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
    this.loading = true;
    this.errorMessage = '';
    this.postsLoading = true;
    this.followersLoading = true;
    this.followingLoading = true;
    this.viewedUsername = this.route.snapshot.paramMap.get('username');

    this.userService.me().subscribe({
      next: (me) => {
        this.viewer = me;
        if (this.viewedUsername && this.viewedUsername !== me.username) {
          this.isMe = false;
          this.loadOtherProfile(this.viewedUsername);
        } else {
          this.isMe = true;
          this.user = me;
          this.loading = false;
          this.loadMyExtras();
        }
        this.change.markForCheck();
      },
      error: (err) => {
        this.errorMessage = 'Failed to load profile.';
        this.loading = false;
        this.postsLoading = false;
        this.followersLoading = false;
        this.followingLoading = false;
        this.change.markForCheck();
        console.error(err);
      }
    });
  }

  loadOtherProfile(username: string) {
    this.userService.getByUsername(username).subscribe({
      next: (user) => {
        this.user = user;
        this.loading = false;
        this.loadOtherPosts(username);
        this.change.markForCheck();
      },
      error: (err) => {
        this.errorMessage = 'User not found.';
        this.loading = false;
        this.postsLoading = false;
        console.error(err);
        this.change.markForCheck();
      }
    });
  }

  loadOtherPosts(username: string) {
    this.userService.postsByUsername(username).subscribe({
      next: (res) => {
        this.posts = Array.isArray(res?.content) ? res.content : (res ?? []);
        this.postsLoading = false;
        this.change.markForCheck();
      },
      error: (err) => {
        console.error(err);
        this.postsLoading = false;
        this.change.markForCheck();
      }
    });
  }

  loadMyExtras() {
    this.userService.myPosts().subscribe({
      next: (res) => {
        this.posts = Array.isArray(res?.content) ? res.content : (res ?? []);
        this.postsLoading = false;
        this.change.markForCheck();
      },
      error: (err) => {
        console.error(err);
        this.postsLoading = false;
        this.change.markForCheck();
      }
    });

    this.followService.getFollowers().subscribe({
      next: (res) => {
        this.followers = res ?? [];
        this.followersLoading = false;
        this.change.markForCheck();
      },
      error: (err) => {
        console.error(err);
        this.followersLoading = false;
        this.change.markForCheck();
      }
    });

    this.followService.getFollowing().subscribe({
      next: (res) => {
        this.following = res ?? [];
        this.followingLoading = false;
        this.change.markForCheck();
      },
      error: (err) => {
        console.error(err);
        this.followingLoading = false;
        this.change.markForCheck();
      }
    });
  }

  toggleFollow(userId: number) {
    const isFollowing = this.following.some((user) => user.id === userId);
    if (isFollowing) {
      this.following = this.following.filter((user) => user.id !== userId);
    } else {
      const user = this.followers.find((follower) => follower.id === userId);
      if (user) {
        this.following = [...this.following, user];
      }
    }
    this.followService.toggleFollow(userId).subscribe({
      next: () => { },
      error: (err) => {
        console.error(err);
        if (isFollowing) {
          const user = this.followers.find((follower) => follower.id === userId);
          if (user) {
            this.following = [...this.following, user];
          }
        } else {
          this.following = this.following.filter((user) => user.id !== userId);
        }
      }
    });
  }

  isFollowingUser(userId: number) {
    return this.following.some((user) => user.id === userId);
  }

  canFollowViewedUser() {
    if (!this.user || !this.viewer) {
      return false;
    }
    return this.user.id !== this.viewer.id;
  }

  isFollowingViewedUser() {
    if (!this.user) {
      return false;
    }
    return this.following.some((user) => user.id === this.user!.id);
  }

  toggleReport() {
    this.reporting = !this.reporting;
    this.reportMessage = '';
    this.reportForm.reset();
  }

  submitReport() {
    if (!this.user?.id || this.reportForm.invalid) {
      this.reportForm.markAllAsTouched();
      return;
    }
    const reason = this.reportForm.value.reason;
    this.reportService
      .create({ reason, targetType: 'USER', targetId: this.user.id })
      .subscribe({
        next: () => {
          this.reportMessage = 'Report submitted. Thank you.';
          this.reporting = false;
        },
        error: (err) => {
          console.error(err);
          this.reportMessage = 'Failed to submit report.';
        }
      });
  }

  deletePost(id: number) {
    this.postService.delete(id).subscribe({
      next: () => {
        this.posts = this.posts.filter((post) => post.id !== id);
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
