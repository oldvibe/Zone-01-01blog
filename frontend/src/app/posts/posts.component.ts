import { Component, OnDestroy, OnInit, signal, computed } from '@angular/core';
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
  posts = signal<any[]>([]);
  loading = signal(false);
  errorMessage = signal('');
  form: FormGroup;
  reportForm: FormGroup;
  selectedFiles = signal<File[]>([]);
  mediaPreviews = signal<{ url: string; isVideo: boolean }[]>([]);
  mediaPreview = signal<string | null>(null);
  mediaPreviewIsVideo = signal(false);
  feedMode = signal<'public' | 'subscriptions'>('public');
  followingIds = signal<Set<number>>(new Set());
  reportingPostId = signal<number | null>(null);
  reportMessage = signal('');

  constructor(
    private postService: PostService,
    private followService: FollowService,
    private reportService: ReportService,
    private fileService: FileService,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router
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
        this.followingIds.set(new Set((res ?? []).map((user) => user.id)));
      },
      error: (err) => console.error(err)
    });
  }

  setMode(mode: 'public' | 'subscriptions') {
    if (this.feedMode() === mode) {
      return;
    }
    this.feedMode.set(mode);
    this.loadFeed();
  }

  loadFeed(page = 0) {
    this.loading.set(true);
    this.errorMessage.set('');

    const feedRequest =
      this.feedMode() === 'subscriptions'
        ? this.postService.getSubscriptions(page)
        : this.postService.getFeed(page);

    feedRequest.subscribe({
      next: (res) => {
        this.posts.set(Array.isArray(res?.content) ? res.content : (res ?? []));
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set('Failed to load posts. Please login first.');
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }
    
    const remainingSlots = 3 - this.selectedFiles().length;
    if (remainingSlots <= 0) {
      this.errorMessage.set('You can only upload a maximum of 3 media files.');
      input.value = '';
      return;
    }

    const filesToAdd = Array.from(input.files).slice(0, remainingSlots);
    if (input.files.length > remainingSlots) {
      this.errorMessage.set('Only the first ' + remainingSlots + ' files were added. Max 3 files allowed.');
    } else {
      this.errorMessage.set('');
    }

    filesToAdd.forEach(file => {
      this.selectedFiles.update(files => [...files, file]);
      const url = URL.createObjectURL(file);
      this.mediaPreviews.update(previews => [...previews, {
        url: url,
        isVideo: file.type.startsWith('video')
      }]);
    });
    // Reset input to allow selecting same file again if removed
    input.value = '';
  }

  removeMedia(index: number) {
    const removed = this.mediaPreviews()[index];
    if (removed) {
      URL.revokeObjectURL(removed.url);
      this.mediaPreviews.update(previews => previews.filter((_, i) => i !== index));
    }
    this.selectedFiles.update(files => files.filter((_, i) => i !== index));
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
          this.selectedFiles.set([]);
          this.mediaPreviews().forEach(p => URL.revokeObjectURL(p.url));
          this.mediaPreviews.set([]);
          if (created) {
            this.posts.update(posts => [created, ...posts]);
          } else {
            this.loadFeed();
          }
        },
        error: (err) => {
          this.errorMessage.set('Failed to create post.');
          console.error(err);
        }
      });
    };

    if (this.selectedFiles().length > 0) {
      let uploadedCount = 0;
      const files = this.selectedFiles();
      files.forEach(file => {
        this.fileService.upload(file).subscribe({
          next: (path) => {
            mediaUrls.push(path);
            uploadedCount++;
            if (uploadedCount === files.length) {
              submit();
            }
          },
          error: (err) => {
            this.errorMessage.set('Failed to upload media.');
            console.error(err);
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
    
    // Optimistic update in the signal
    this.posts.update(posts => posts.map(p => {
      if (p.id === post.id) {
        return {
          ...p,
          likedByMe: !liked,
          likes: Math.max(0, (p.likes ?? 0) + (liked ? -1 : 1))
        };
      }
      return p;
    }));

    this.postService.like(post.id).subscribe({
      next: () => { },
      error: (err) => {
        console.error(err);
        // Rollback on error
        this.posts.update(posts => posts.map(p => {
          if (p.id === post.id) {
            return {
              ...p,
              likedByMe: liked,
              likes: Math.max(0, (p.likes ?? 0) + (liked ? 1 : -1))
            };
          }
          return p;
        }));
      }
    });
  }

  openReport(post: any) {
    if (!post?.id) {
      return;
    }
    if (this.reportingPostId() === post.id) {
      this.reportingPostId.set(null);
      return;
    }
    this.reportingPostId.set(post.id);
    this.reportMessage.set('');
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
          this.reportMessage.set('Report submitted. Thank you.');
          this.reportingPostId.set(null);
          this.reportForm.reset();
        },
        error: (err) => {
          console.error(err);
          this.reportMessage.set('Failed to submit report.');
        }
      });
  }

  deletePost(id: number) {
    if (confirm('Are you sure you want to delete this post?')) {
      this.postService.delete(id).subscribe({
        next: () => {
          this.posts.update(posts => posts.filter(p => p.id !== id));
        },
        error: (err) => console.error(err)
      });
    }
  }

  toggleFollow(post: any) {
    if (!post?.authorId || post?.mine) {
      return;
    }
    const isFollowing = this.followingIds().has(post.authorId);
    
    this.followingIds.update(ids => {
      const next = new Set(ids);
      if (isFollowing) {
        next.delete(post.authorId);
      } else {
        next.add(post.authorId);
      }
      return next;
    });

    this.followService.toggleFollow(post.authorId).subscribe({
      next: () => { },
      error: (err) => {
        console.error(err);
        // Rollback
        this.followingIds.update(ids => {
          const next = new Set(ids);
          if (isFollowing) {
            next.add(post.authorId);
          } else {
            next.delete(post.authorId);
          }
          return next;
        });
      }
    });
  }

  isFollowing(post: any) {
    return post?.authorId ? this.followingIds().has(post.authorId) : false;
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
    if (this.mediaPreview()) {
      URL.revokeObjectURL(this.mediaPreview()!);
    }
  }
}





