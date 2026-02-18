import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-error-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="error-container d-flex align-items-center justify-content-center min-vh-100 bg-light p-4">
      <div class="error-card text-center card p-5 shadow-lg border-0" style="max-width: 500px; border-radius: 24px;">
        <div class="error-icon-wrap mb-4 mx-auto" [ngClass]="typeClass">
          <i class="bi" [ngClass]="iconClass"></i>
        </div>
        <h1 class="display-4 fw-bold mb-2">{{ title }}</h1>
        <h3 class="h5 text-muted mb-4">{{ subtitle }}</h3>
        <p class="text-secondary mb-5">{{ description }}</p>
        <div class="d-grid gap-2">
          <a routerLink="/" class="btn btn-primary py-3 rounded-pill fw-bold">
            <i class="bi bi-house-door me-2"></i>Back to Safety
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .error-icon-wrap {
      width: 100px;
      height: 100px;
      display: grid;
      place-items: center;
      font-size: 3rem;
      border-radius: 50%;
    }
    .bg-soft-warning { background-color: #fff3cd; color: #856404; }
    .bg-soft-danger { background-color: #f8d7da; color: #721c24; }
    .bg-soft-primary { background-color: #cfe2ff; color: #084298; }
  `]
})
export class ErrorPage implements OnInit {
  type: string = '404';
  title: string = '404';
  subtitle: string = 'Page Not Found';
  description: string = "Oops! The page you're looking for doesn't exist or has been moved.";
  iconClass: string = 'bi-exclamation-triangle-fill';
  typeClass: string = 'bg-soft-warning';

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.type = data['type'] || '404';
      this.setupPage();
    });
  }

  setupPage() {
    switch (this.type) {
      case '404':
        this.title = '404';
        this.subtitle = 'Page Not Found';
        this.description = "We couldn't find the page you're looking for.";
        this.iconClass = 'bi-search';
        this.typeClass = 'bg-soft-warning';
        break;
      case '500':
        this.title = '500';
        this.subtitle = 'Server Error';
        this.description = "Something went wrong on our end. We're working on it!";
        this.iconClass = 'bi-gear-wide-connected';
        this.typeClass = 'bg-soft-danger';
        break;
      case '403':
        this.title = '403';
        this.subtitle = 'Access Denied';
        this.description = "You don't have permission to view this resource.";
        this.iconClass = 'bi-shield-lock-fill';
        this.typeClass = 'bg-soft-danger';
        break;
    }
  }
}
