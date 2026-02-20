import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-error-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="error-page-wrapper">
      <div class="parallax-bg" [style.background-image]="backgroundImage"></div>
      <div class="overlay-gradient"></div>

      <div class="content-wrapper">
        <main class="error-glass-container">
          <div class="error-card-glass">
            <div class="card-glow" [ngClass]="typeClass"></div>
            
            <header class="error-header">
              <span class="badge-pill" [ngClass]="typeClass">System Alert: {{ title }}</span>
              <h1 class="display-title">{{ subtitle }}</h1>
              <p class="description">{{ description }}</p>
            </header>

            <div class="action-zone">
              <a routerLink="/" class="btn-anime-primary">
                <i class="bi bi-house-door"></i>
                <span>Return to Hub</span>
              </a>
            </div>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .error-page-wrapper {
      position: relative;
      min-height: 100vh;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      background: #020617;
      font-family: 'Space Grotesk', sans-serif;
    }

    .parallax-bg {
      position: absolute;
      inset: -20px;
      background-size: cover;
      background-position: center;
      filter: saturate(1.2) brightness(0.6);
      z-index: 1;
      animation: backgroundPan 30s linear infinite;
    }

    .overlay-gradient {
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at center, transparent 0%, rgba(2, 6, 23, 0.8) 100%),
                  linear-gradient(to bottom, rgba(99, 102, 241, 0.1) 0%, transparent 100%);
      z-index: 2;
    }

    .content-wrapper {
      position: relative;
      z-index: 10;
      width: 100%;
      padding: 2rem;
      display: flex;
      justify-content: center;
    }

    .error-glass-container {
      width: 100%;
      max-width: 520px;
      animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .error-card-glass {
      background: rgba(15, 23, 42, 0.8);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 2rem;
      padding: 4rem 3rem;
      text-align: center;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }

    .card-glow {
      position: absolute;
      top: 0; left: 0; width: 100%; height: 4px;
      background: var(--primary-gradient);
      &.danger { background: linear-gradient(90deg, #ef4444, #f87171); }
    }

    .badge-pill {
      display: inline-block;
      padding: 0.35rem 1.25rem;
      background: rgba(99, 102, 241, 0.1);
      border: 1px solid rgba(99, 102, 241, 0.3);
      color: var(--primary);
      border-radius: 999px;
      font-size: 0.85rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 2rem;
      &.danger {
        color: #ef4444;
        background: rgba(239, 68, 68, 0.1);
        border-color: rgba(239, 68, 68, 0.3);
      }
    }

    .display-title {
      font-family: 'Orbitron', sans-serif;
      font-size: 2.5rem;
      font-weight: 900;
      color: #ffffff;
      margin-bottom: 1rem;
      letter-spacing: -1px;
    }

    .description {
      font-size: 1.1rem;
      color: #cbd5e1;
      line-height: 1.6;
      margin-bottom: 3rem;
    }

    .btn-anime-primary {
      width: 100%;
      height: 64px;
      background: var(--primary-gradient);
      border: none;
      border-radius: 16px;
      color: white;
      font-size: 1.1rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 2px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      text-decoration: none;
      transition: all 0.3s;
      box-shadow: 0 10px 20px -5px rgba(99, 102, 241, 0.4);

      &:hover {
        transform: translateY(-3px) scale(1.02);
        box-shadow: 0 20px 30px -10px rgba(99, 102, 241, 0.6);
      }
    }

    @keyframes backgroundPan {
      from { transform: scale(1.1) translate(0, 0); }
      50% { transform: scale(1.1) translate(-20px, -20px); }
      to { transform: scale(1.1) translate(0, 0); }
    }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(40px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class ErrorPage implements OnInit {
  type: string = '404';
  title: string = '404';
  subtitle: string = 'Out of Bounds';
  description: string = "Neural link broken. The coordinate you're seeking doesn't exist in our hub.";
  backgroundImage: string = "url('assets/404error.jpg')";
  typeClass: string = 'warning';

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
        this.subtitle = 'Coordinate Lost';
        this.description = "The intel you're seeking has been moved or purged from the neural network.";
        this.backgroundImage = "url('assets/404error.jpg')";
        this.typeClass = 'warning';
        break;
      case '500':
        this.title = '500';
        this.subtitle = 'System Crash';
        this.description = "Critical hub failure detected. Our technicians are currently stabilizing the reactor.";
        this.backgroundImage = "url('assets/login.jpg')";
        this.typeClass = 'danger';
        break;
      case '403':
        this.title = '403';
        this.subtitle = 'Access Denied';
        this.description = "Your identity protocol does not have clearance for this high-level intel sector.";
        this.backgroundImage = "url('assets/register.jpg')";
        this.typeClass = 'danger';
        break;
    }
  }
}
