import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PostService } from './post.service';
import { CommentService, CommentItem } from './comment.service';
import { FollowService } from '../core/services/follow.service';
import { ReportService } from '../core/services/report.service';

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
  reporting = signal(false);
  reportMessage = signal('');
  commentReportMessage = signal('');
  followingIds = signal<Set<number>>(new Set());
  replyingToId = signal<number | null>(null);

  constructor(
    private route: ActivatedRoute,
    private postService: PostService,
    private commentService: CommentService,
    private followService: FollowService,
    private reportService: ReportService,
    private fb: FormBuilder
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
        }
      },
      error: (err) => {
        console.error(err);
        this.loading.set(false);
        this.errorMessage.set('Failed to load post.');
      }
    });
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
}



