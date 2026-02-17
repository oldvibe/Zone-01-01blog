import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PostService } from './post.service';
import { FollowService } from '../core/services/follow.service';
import { ReportService } from '../core/services/report.service';
import { FileService } from '../core/services/file.service';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-posts',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './posts.component.html',
  styleUrl: './posts.component.scss'
})
export class PostsComponent implements OnInit, OnDestroy {
  posts: any[] = [];
  loading = false;
  errorMessage = '';
  form: FormGroup;
  reportForm: FormGroup;
  selectedFiles: File[] = [];
  mediaPreviews: { url: string; isVideo: boolean }[] = [];
  mediaPreview: string | null = null;
  mediaPreviewIsVideo = false;
  feedMode: 'public' | 'subscriptions' = 'public';
  followingIds = new Set<number>();
  reportingPostId: number | null = null;
  reportMessage = '';

  constructor(
    private postService: PostService,
    private followService: FollowService,
    private reportService: ReportService,
    private fileService: FileService,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router,
    private chdr: ChangeDetectorRef,
  ) {
    this.form = this.fb.group({
      content: ['', Validators.required]
    });
    this.reportForm = this.fb.group({
      reason: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadFollowing();
    this.loadFeed();
  }

  loadFollowing() {
    this.followService.getFollowing().subscribe({
      next: (res) => {
        this.followingIds = new Set((res ?? []).map((user) => user.id));
        this.chdr.markForCheck();
      },
      error: (err) => console.error(err)
    });
  }

  setMode(mode: 'public' | 'subscriptions') {
    if (this.feedMode === mode) {
      return;
    }
    this.feedMode = mode;
    this.loadFeed();
  }

  loadFeed(page = 0) {
    this.loading = true;
    this.errorMessage = '';

    const feedRequest =
      this.feedMode === 'subscriptions'
        ? this.postService.getSubscriptions(page)
        : this.postService.getFeed(page);

    feedRequest.subscribe({
      next: (res) => {
        this.posts = Array.isArray(res?.content) ? res.content : (res ?? []);
        this.loading = false;
        this.chdr.markForCheck();
      },
      error: (err) => {
        this.errorMessage = 'Failed to load posts. Please login first.';
        this.loading = false;
        console.error(err);
        this.chdr.markForCheck();
      }
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }
    
    Array.from(input.files).forEach(file => {
      this.selectedFiles.push(file);
      const url = URL.createObjectURL(file);
      this.mediaPreviews.push({
        url: url,
        isVideo: file.type.startsWith('video')
      });
    });
  }

  createPost() {
    if (this.form.invalid) {
      return;
    }

    const { content } = this.form.value;
    const mediaUrls: string[] = [];

    const submit = () => {
      this.postService.create(content, mediaUrls).subscribe({
        next: (created) => {
          this.form.reset();
          this.selectedFiles = [];
          this.mediaPreviews.forEach(p => URL.revokeObjectURL(p.url));
          this.mediaPreviews = [];
          if (created) {
            this.posts = [created, ...this.posts];
          } else {
            this.loadFeed();
          }
          this.chdr.markForCheck();
        },
        error: (err) => {
          this.errorMessage = 'Failed to create post.';
          console.error(err);
          this.chdr.markForCheck();
        }
      });
    };

    if (this.selectedFiles.length > 0) {
      let uploadedCount = 0;
      this.selectedFiles.forEach(file => {
        this.fileService.upload(file).subscribe({
          next: (path) => {
            mediaUrls.push(path);
            uploadedCount++;
            if (uploadedCount === this.selectedFiles.length) {
              submit();
            }
            this.chdr.markForCheck();
          },
          error: (err) => {
            this.errorMessage = 'Failed to upload media.';
            console.error(err);
            this.chdr.markForCheck();
          }
        });
      });
    } else {
      submit();
    }
  }

  toggleLike(post: any) {
    if (!post?.id) {
      return;
    }
    const liked = !!post.likedByMe;
    post.likedByMe = !liked;
    post.likes = Math.max(0, (post.likes ?? 0) + (liked ? -1 : 1));
    this.postService.like(post.id).subscribe({
      next: () => { },
      error: (err) => {
        console.error(err);
        post.likedByMe = liked;
        post.likes = Math.max(0, (post.likes ?? 0) + (liked ? 1 : -1));
      }
    });
  }

  openReport(post: any) {
    if (!post?.id) {
      return;
    }
    if (this.reportingPostId === post.id) {
      this.reportingPostId = null;
      return;
    }
    this.reportingPostId = post.id;
    this.reportMessage = '';
    this.reportForm.reset();
  }

  submitReport(post: any) {
    if (!post?.id || this.reportForm.invalid) {
      this.reportForm.markAllAsTouched();
      return;
    }
    const reason = this.reportForm.value.reason;
    this.reportService
      .create({ reason, targetType: 'POST', targetId: post.id })
      .subscribe({
        next: () => {
          this.reportMessage = 'Report submitted. Thank you.';
          this.reportingPostId = null;
          this.reportForm.reset();
          this.chdr.markForCheck();
        },
        error: (err) => {
          console.error(err);
          this.reportMessage = 'Failed to submit report.';
          this.chdr.markForCheck();
        }
      });
  }

  deletePost(id: number) {
    if (confirm('Are you sure you want to delete this post?')) {
      this.postService.delete(id).subscribe({
        next: () => {
          this.posts = this.posts.filter(p => p.id !== id);
          this.chdr.markForCheck();
        },
        error: (err) => console.error(err)
      });
    }
  }

  toggleFollow(post: any) {
    if (!post?.authorId || post?.mine) {
      return;
    }
    const isFollowing = this.followingIds.has(post.authorId);
    if (isFollowing) {
      this.followingIds.delete(post.authorId);
    } else {
      this.followingIds.add(post.authorId);
    }
    this.followService.toggleFollow(post.authorId).subscribe({
      next: () => { },
      error: (err) => {
        console.error(err);
        if (isFollowing) {
          this.followingIds.add(post.authorId);
        } else {
          this.followingIds.delete(post.authorId);
        }
      }
    });
  }

  isFollowing(post: any) {
    return post?.authorId ? this.followingIds.has(post.authorId) : false;
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

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  ngOnDestroy() {
    if (this.mediaPreview) {
      URL.revokeObjectURL(this.mediaPreview);
    }
  }
}


