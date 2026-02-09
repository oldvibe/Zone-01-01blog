import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
  post: any | null = null;
  comments: CommentItem[] = [];
  loading = false;
  commentsLoading = false;
  errorMessage = '';
  form: FormGroup;
  reportForm: FormGroup;
  reporting = false;
  reportMessage = '';
  commentReportMessage = '';
  followingIds = new Set<number>();

  constructor(
    private route: ActivatedRoute,
    private postService: PostService,
    private commentService: CommentService,
    private followService: FollowService,
    private reportService: ReportService,
    private fb: FormBuilder,
    private change : ChangeDetectorRef
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
        this.followingIds = new Set((res ?? []).map((u) => u.id));
      },
      error: (err) => console.error(err)
    });
  }

  loadPost() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.errorMessage = 'Post not found.';
      return;
    }
    this.loading = true;
    this.errorMessage = '';
    this.loadComments(id);

    this.postService.getById(id).subscribe({
      next: (res) => {
        this.post = res ?? null;
        this.loading = false;
        if (this.post) {
        } else {
          this.errorMessage = 'Post not found.';
          this.change.markForCheck();
        }
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.errorMessage = 'Failed to load post.';
        this.change.markForCheck();

      }
    });
  }

  loadComments(postId: number) {
    if (!postId) {
      return;
    }
    this.commentsLoading = true;
    this.commentService.list(postId).subscribe({
      next: (res) => (this.comments = res ?? []),
      error: (err) => console.error(err),
      complete: () => {
        this.commentsLoading = false;
        this.change.markForCheck();
      }
    });
  }

  addComment() {
    if (this.form.invalid || !this.post?.id) {
      return;
    }
    const content = this.form.value.content;
    const optimistic = {
      id: Date.now(),
      content,
      author: 'You',
      owner: true,
      createdAt: new Date().toISOString()
    } as CommentItem;
    this.comments = [optimistic, ...this.comments];
    this.form.reset();
    this.commentService.add(this.post.id, content).subscribe({
      next: (comment) => {
        this.comments = [
          comment,
          ...this.comments.filter((item) => item.id !== optimistic.id)
        ];
      },
      error: (err) => {
        console.error(err);
        this.comments = this.comments.filter((item) => item.id !== optimistic.id);
      }
    });
  }

  toggleReport() {
    this.reporting = !this.reporting;
    this.reportMessage = '';
  }

  submitReport() {
    if (!this.post?.id || this.reportForm.invalid) {
      this.reportForm.markAllAsTouched();
      return;
    }
    const reason = this.reportForm.value.reason;
    this.reportService
      .create({ reason, targetType: 'POST', targetId: this.post.id })
      .subscribe({
        next: () => {
          this.reportMessage = 'Report submitted. Thank you.';
          this.reportForm.reset();
          this.reporting = false;
        },
        error: (err) => {
          console.error(err);
          this.reportMessage = 'Failed to submit report.';
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
          this.commentReportMessage = 'Comment reported. Thank you.';
        },
        error: (err) => {
          console.error(err);
          this.commentReportMessage = 'Failed to report comment.';
        }
      });
  }

  deleteComment(id: number) {
    const prev = this.comments;
    this.comments = this.comments.filter((item) => item.id !== id);
    this.commentService.remove(id).subscribe({
      next: () => {},
      error: (err) => {
        console.error(err);
        this.comments = prev;
      }
    });
  }

  toggleLike() {
    if (!this.post?.id) {
      return;
    }
    const liked = !!this.post.likedByMe;
    this.post = {
      ...this.post,
      likedByMe: !liked,
      likes: Math.max(0, (this.post.likes ?? 0) + (liked ? -1 : 1))
    };
    this.postService.like(this.post.id).subscribe({
      next: () => {},
      error: (err) => {
        console.error(err);
        this.post = {
          ...this.post,
          likedByMe: liked,
          likes: Math.max(0, (this.post.likes ?? 0) + (liked ? 1 : -1))
        };
      }
    });
  }

  toggleFollow() {
    if (!this.post?.authorId || this.post?.mine) {
      return;
    }
    const isFollowing = this.followingIds.has(this.post.authorId);
    if (isFollowing) {
      this.followingIds.delete(this.post.authorId);
    } else {
      this.followingIds.add(this.post.authorId);
    }
    this.followService.toggleFollow(this.post.authorId).subscribe({
      next: () => {
      },
      error: (err) => {
        console.error(err);
        if (isFollowing) {
          this.followingIds.add(this.post.authorId);
        } else {
          this.followingIds.delete(this.post.authorId);
        }
      },
    });
  }

  isFollowingAuthor() {
    return this.post?.authorId ? this.followingIds.has(this.post.authorId) : false;
  }

  formatDate(value: string) {
    if (!value) {
      return '';
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString();
  }
}
