import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PostService } from './post.service';
import { FollowService } from '../core/services/follow.service';
import { ReportService } from '../core/services/report.service';
import { FileService } from '../core/services/file.service';

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
  selectedFile?: File;
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
    private fb: FormBuilder,
    private router: Router,
    private chdr: ChangeDetectorRef,
  ) {
    this.form = this.fb.group({
      content: ['', Validators.required],
      mediaUrl: ['']
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
      }
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.selectedFile = undefined;
      this.mediaPreview = null;
      this.mediaPreviewIsVideo = false;
      return;
    }
    if (this.mediaPreview) {
      URL.revokeObjectURL(this.mediaPreview);
    }
    this.selectedFile = input.files[0];
    this.mediaPreview = URL.createObjectURL(this.selectedFile);
    this.mediaPreviewIsVideo = this.selectedFile.type.startsWith('video');
  }

  createPost() {
    if (this.form.invalid) {
      return;
    }

    const { content, mediaUrl } = this.form.value;
    const submit = (finalUrl?: string) => {
      this.postService.create(content, finalUrl ?? mediaUrl).subscribe({
        next: (created) => {
          this.form.reset();
          this.selectedFile = undefined;
          this.mediaPreview = null;
          this.mediaPreviewIsVideo = false;
          if (created) {
            this.posts = [created, ...this.posts];
          } else {
            this.loadFeed();
          }
        },
        error: (err) => {
          this.errorMessage = 'Failed to create post.';
          console.error(err);
        }
      });
    };

    if (this.selectedFile) {
      this.fileService.upload(this.selectedFile).subscribe({
        next: (path) => submit(path),
        error: (err) => {
          this.errorMessage = 'Failed to upload media.';
          console.error(err);
        }
      });
    } else {
      submit(mediaUrl);
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
        },
        error: (err) => {
          console.error(err);
          this.reportMessage = 'Failed to submit report.';
        }
      });
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

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/']);
  }

  ngOnDestroy() {
    if (this.mediaPreview) {
      URL.revokeObjectURL(this.mediaPreview);
    }
  }
}
