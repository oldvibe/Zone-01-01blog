import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PostService } from './post.service';
import { CommentService, CommentItem } from './comment.service';
import { FollowService } from '../core/services/follow.service';
import { ReportService } from '../core/services/report.service';
import { FileService } from '../core/services/file.service';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './post-detail.component.html',
  styleUrl: './post-detail.component.scss'
})
export class PostDetailComponent implements OnInit {
  post = signal<any | null>(null);
  comments = signal<CommentItem[]>([]);
  loading = signal(false);
  commentsLoading = signal(false);
  errorMessage = signal('');
  form: FormGroup;
  reportForm: FormGroup;
  editForm: FormGroup;
  reporting = signal(false);
  reportMessage = signal('');
  commentReportMessage = signal('');
  followingIds = signal<Set<number>>(new Set());
  replyingToId = signal<number | null>(null);
  editing = signal(false);

  selectedFiles = signal<any[]>([]);
  mediaPreviews = signal<{ url: string; isVideo: boolean; isAudio: boolean }[]>([]);
  uploading = signal(false);

  constructor(
    private route: ActivatedRoute,
    private postService: PostService,
    private commentService: CommentService,
    private followService: FollowService,
    private reportService: ReportService,
    private fileService: FileService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.form = this.fb.group({
      content: ['', Validators.required]
    });
    this.reportForm = this.fb.group({
      reason: ['', Validators.required]
    });
    this.editForm = this.fb.group({
      content: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadFollowing();
    this.loadPost();
  }

  loadFollowing() {
    this.followService.getFollowing().subscribe({
      next: (res) => {
        this.followingIds.set(new Set((res ?? []).map((u) => u.id)));
      },
      error: (err) => console.error(err)
    });
  }

  loadPost() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.errorMessage.set('Post not found.');
      return;
    }
    this.loading.set(true);
    this.errorMessage.set('');
    this.loadComments(id);

    this.postService.getById(id).subscribe({
      next: (res) => {
        this.post.set(res ?? null);
        this.loading.set(false);
        if (!this.post()) {
          this.errorMessage.set('Post not found.');
        } else {
          this.editForm.patchValue({ content: this.post().content });
        }
      },
      error: (err) => {
        console.error(err);
        this.loading.set(false);
        this.errorMessage.set('Failed to load post.');
      }
    });
  }

  startEdit() {
    this.editing.set(true);
    this.editForm.patchValue({ content: this.post().content });
    this.selectedFiles.set(this.post().mediaUrls || []);
    this.mediaPreviews.set((this.post().mediaUrls || []).map((url: string) => ({
      url,
      isVideo: this.isVideo(url),
      isAudio: this.isAudio(url)
    })));
  }

  cancelEdit() {
    this.editing.set(false);
    this.mediaPreviews().forEach(p => {
      if (p.url.startsWith('blob:')) URL.revokeObjectURL(p.url);
    });
    this.mediaPreviews.set([]);
    this.selectedFiles.set([]);
  }

  updatePost() {
    if (this.editForm.invalid || !this.post()?.id) return;
    
    this.uploading.set(true);
    const { content } = this.editForm.value;
    const mediaUrls: string[] = [];

    const submit = () => {
      this.postService.update(this.post().id, content, mediaUrls).subscribe({
        next: (updated) => {
          this.post.set(updated);
          this.editing.set(false);
          this.uploading.set(false);
          this.mediaPreviews().forEach(p => {
            if (p.url.startsWith('blob:')) URL.revokeObjectURL(p.url);
          });
        },
        error: (err) => {
          console.error(err);
          this.uploading.set(false);
        }
      });
    };

    const files = this.selectedFiles();
    if (files.length > 0) {
      let uploadedCount = 0;
      files.forEach(file => {
        if (typeof file === 'string') {
          mediaUrls.push(file);
          uploadedCount++;
          if (uploadedCount === files.length) submit();
          return;
        }

        this.fileService.upload(file).subscribe({
          next: (path: string) => {
            mediaUrls.push(path);
            uploadedCount++;
            if (uploadedCount === files.length) submit();
          },
          error: (err: any) => {
            console.error(err);
            this.uploading.set(false);
          }
        });
      });
    } else {
      submit();
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    
    const remaining = 3 - this.selectedFiles().length;
    if (remaining <= 0) return;

    Array.from(input.files).slice(0, remaining).forEach(file => {
      this.selectedFiles.update(files => [...files, file]);
      const url = URL.createObjectURL(file);
      this.mediaPreviews.update(previews => [...previews, { 
        url, 
        isVideo: file.type.startsWith('video'),
        isAudio: file.type.startsWith('audio')
      }]);
    });
    input.value = '';
  }

  removeMedia(index: number) {
    const removed = this.mediaPreviews()[index];
    if (removed && removed.url.startsWith('blob:')) {
      URL.revokeObjectURL(removed.url);
    }
    this.mediaPreviews.update(previews => previews.filter((_, i) => i !== index));
    this.selectedFiles.update(files => files.filter((_, i) => i !== index));
  }

  deletePost() {
    if (!this.post()?.id) return;
    if (confirm('Are you sure you want to delete this post?')) {
      this.postService.delete(this.post().id).subscribe({
        next: () => this.router.navigate(['/posts']),
        error: (err) => console.error(err)
      });
    }
  }

  loadComments(postId: number) {
    if (!postId) {
      return;
    }
    this.commentsLoading.set(true);
    this.commentService.list(postId).subscribe({
      next: (res) => this.comments.set(res ?? []),
      error: (err) => console.error(err),
      complete: () => {
        this.commentsLoading.set(false);
      }
    });
  }

  setReply(commentId: number | null) {
    this.replyingToId.set(commentId);
    if (commentId) {
      this.form.patchValue({ content: `@Reply to #${commentId}: ` });
    } else {
      this.form.reset();
    }
  }

  addComment() {
    if (this.form.invalid || !this.post()?.id) {
      return;
    }
    const content = this.form.value.content;
    const parentId = this.replyingToId() || undefined;

    const optimistic = {
      id: Date.now(),
      content,
      author: 'You',
      owner: true,
      createdAt: new Date().toISOString(),
      parentId: parentId
    } as CommentItem;
    
    this.comments.update(comments => [optimistic, ...comments]);
    this.form.reset();
    this.replyingToId.set(null);

    this.commentService.add(this.post()!.id, content, parentId).subscribe({
      next: (comment) => {
        this.comments.update(comments => [
          comment,
          ...comments.filter((item) => item.id !== optimistic.id)
        ]);
      },
      error: (err) => {
        console.error(err);
        this.comments.update(comments => comments.filter((item) => item.id !== optimistic.id));
      }
    });
  }

  toggleReport() {
    this.reporting.update(r => !r);
    this.reportMessage.set('');
  }

  submitReport() {
    if (!this.post()?.id || this.reportForm.invalid) {
      this.reportForm.markAllAsTouched();
      return;
    }

    if (!confirm('Are you sure you want to submit this report?')) {
      return;
    }

    const reason = this.reportForm.value.reason;
    this.reportService
      .create({ reason, targetType: 'POST', targetId: this.post()!.id })
      .subscribe({
        next: () => {
          this.reportMessage.set('Report submitted. Thank you.');
          this.reportForm.reset();
          this.reporting.set(false);
        },
        error: (err) => {
          console.error(err);
          this.reportMessage.set('Failed to submit report.');
        }
      });
  }

  reportComment(comment: CommentItem) {
    if (!comment?.id) {
      return;
    }

    if (!confirm('Are you sure you want to report this comment?')) {
      return;
    }

    this.reportService
      .create({ reason: 'Inappropriate comment', targetType: 'COMMENT', targetId: comment.id })
      .subscribe({
        next: () => {
          this.commentReportMessage.set('Comment reported. Thank you.');
        },
        error: (err) => {
          console.error(err);
          this.commentReportMessage.set('Failed to report comment.');
        }
      });
  }

  deleteComment(id: number) {
    const prev = this.comments();
    this.comments.update(comments => comments.filter((item) => item.id !== id));
    this.commentService.remove(id).subscribe({
      next: () => {},
      error: (err) => {
        console.error(err);
        this.comments.set(prev);
      }
    });
  }

  toggleLike() {
    if (!this.post()?.id) {
      return;
    }
    const liked = !!this.post()!.likedByMe;
    
    // Optimistic update
    this.post.update(p => ({
      ...p,
      likedByMe: !liked,
      likes: Math.max(0, (p.likes ?? 0) + (liked ? -1 : 1))
    }));

    this.postService.like(this.post()!.id).subscribe({
      next: () => {},
      error: (err) => {
        console.error(err);
        // Rollback
        this.post.update(p => ({
          ...p,
          likedByMe: liked,
          likes: Math.max(0, (p.likes ?? 0) + (liked ? 1 : -1))
        }));
      }
    });
  }

  toggleFollow() {
    if (!this.post()?.authorId || this.post()?.mine) {
      return;
    }
    const isFollowing = this.followingIds().has(this.post()!.authorId);
    
    this.followingIds.update(ids => {
      const next = new Set(ids);
      if (isFollowing) {
        next.delete(this.post()!.authorId);
      } else {
        next.add(this.post()!.authorId);
      }
      return next;
    });

    this.followService.toggleFollow(this.post()!.authorId).subscribe({
      next: () => {
      },
      error: (err) => {
        console.error(err);
        // Rollback
        this.followingIds.update(ids => {
          const next = new Set(ids);
          if (isFollowing) {
            next.add(this.post()!.authorId);
          } else {
            next.delete(this.post()!.authorId);
          }
          return next;
        });
      },
    });
  }

  isFollowingAuthor() {
    return this.post()?.authorId ? this.followingIds().has(this.post()!.authorId) : false;
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

  isAudio(url: string): boolean {
    const extensions = ['.mp3', '.wav', '.aac', '.m4a', '.flac'];
    return extensions.some(ext => url.toLowerCase().endsWith(ext));
  }
}


