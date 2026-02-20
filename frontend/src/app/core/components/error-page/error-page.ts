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
      <div class="noise-overlay"></div>

      <div class="content-wrapper">
        <main class="error-glass-container">
          <div class="error-card-glass" [ngClass]="{'scary-mode': type === '404'}">
            <div class="card-glow" [ngClass]="typeClass"></div>
            
            <header class="error-header">
              <span class="badge-pill" [ngClass]="typeClass">SYSTEM BREACH: {{ title }}</span>
              <h1 class="display-title glitch" [attr.data-text]="subtitle">{{ subtitle }}</h1>
              <p class="description">{{ description }}</p>
            </header>

            <div class="action-zone">
              <a routerLink="/" class="btn-anime-primary scary-btn">
                <i class="bi bi-shield-slash"></i>
                <span>ESCAPE TO HUB</span>
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
      background: #000;
      font-family: 'Space Grotesk', sans-serif;
    }

    .parallax-bg {
      position: absolute;
      inset: -20px;
      background-size: cover;
      background-position: center;
      filter: saturate(1.5) brightness(0.5) contrast(1.2);
      z-index: 1;
      animation: slowPan 60s linear infinite;
    }

    .overlay-gradient {
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at center, transparent 0%, rgba(0, 0, 0, 0.9) 100%);
      z-index: 2;
    }

    .noise-overlay {
      position: absolute;
      inset: 0;
      background: url('https://media.giphy.com/media/oEI9uWUicGLeU/giphy.gif');
      opacity: 0.05;
      z-index: 3;
      pointer-events: none;
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
      animation: tremble 0.2s infinite;
      animation-play-state: paused;
    }

    .error-glass-container:hover {
      animation-play-state: running;
    }

    .error-card-glass {
      background: rgba(10, 10, 10, 0.85);
      backdrop-filter: blur(25px);
      border: 1px solid rgba(255, 0, 0, 0.2);
      border-radius: 2rem;
      padding: 4rem 3rem;
      text-align: center;
      box-shadow: 0 0 50px rgba(255, 0, 0, 0.1);
      position: relative;
    }

    .scary-mode {
      border-color: rgba(255, 0, 0, 0.5) !important;
      box-shadow: 0 0 60px rgba(255, 0, 0, 0.2) !important;
    }

    .card-glow {
      position: absolute;
      top: 0; left: 0; width: 100%; height: 4px;
      background: linear-gradient(90deg, #6366f1, #a855f7);
      &.warning { background: linear-gradient(90deg, #ff0000, #990000); }
      &.danger { background: linear-gradient(90deg, #ff0000, #000000); }
    }

    .badge-pill {
      display: inline-block;
      padding: 0.35rem 1.25rem;
      background: rgba(255, 0, 0, 0.1);
      border: 1px solid rgba(255, 0, 0, 0.3);
      color: #ff4d4d;
      border-radius: 999px;
      font-size: 0.85rem;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 3px;
      margin-bottom: 2.5rem;
    }

    .display-title {
      font-family: 'Orbitron', sans-serif;
      font-size: 3.5rem;
      font-weight: 900;
      color: #ffffff;
      margin-bottom: 1.5rem;
      letter-spacing: -2px;
      text-shadow: 0 0 20px rgba(255, 0, 0, 0.5);
    }

    .description {
      font-size: 1.15rem;
      color: #e2e8f0;
      line-height: 1.8;
      margin-bottom: 3.5rem;
      font-weight: 600;
    }

    .btn-anime-primary.scary-btn {
      width: 100%;
      height: 64px;
      background: linear-gradient(135deg, #ff0000 0%, #660000 100%);
      border: none;
      border-radius: 16px;
      color: white;
      font-size: 1.1rem;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 3px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      text-decoration: none;
      transition: all 0.3s;
      box-shadow: 0 10px 30px rgba(255, 0, 0, 0.3);

      &:hover {
        transform: scale(1.05);
        box-shadow: 0 0 50px rgba(255, 0, 0, 0.6);
        filter: brightness(1.2);
      }
    }

    // Glitch Effect
    .glitch {
      position: relative;
    }
    .glitch::before, .glitch::after {
      content: attr(data-text);
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      background: transparent;
    }
    .glitch::before {
      left: 2px;
      text-shadow: -2px 0 #ff00c1;
      clip: rect(44px, 450px, 56px, 0);
      animation: glitch-anim 5s infinite linear alternate-reverse;
    }
    .glitch::after {
      left: -2px;
      text-shadow: -2px 0 #00fff9, 2px 2px #ff00c1;
      animation: glitch-anim2 1s infinite linear alternate-reverse;
    }

    @keyframes slowPan {
      from { transform: scale(1.2) translate(0, 0); }
      50% { transform: scale(1.2) translate(-30px, 20px); }
      to { transform: scale(1.2) translate(0, 0); }
    }

    @keyframes tremble {
      0% { transform: translate(0,0); }
      25% { transform: translate(1px, 1px); }
      50% { transform: translate(-1px, -1px); }
      75% { transform: translate(1px, -1px); }
      100% { transform: translate(0,0); }
    }

    @keyframes glitch-anim {
      0% { clip: rect(31px, 9999px, 94px, 0); }
      20% { clip: rect(62px, 9999px, 42px, 0); }
      40% { clip: rect(16px, 9999px, 78px, 0); }
      60% { clip: rect(81px, 9999px, 13px, 0); }
      80% { clip: rect(55px, 9999px, 49px, 0); }
      100% { clip: rect(97px, 9999px, 22px, 0); }
    }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(60px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class ErrorPage implements OnInit {
  type: string = '404';
  title: string = '404';
  subtitle: string = 'VOID DETECTED';
  description: string = "You have wandered into the forbidden sector. The shadows are watching.";
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
        this.subtitle = 'VOID DETECTED';
        this.description = "The data you seek has been consumed by the abyss. Leave now before the link terminates.";
        this.backgroundImage = "url('assets/404error.jpg')";
        this.typeClass = 'warning';
        break;
      case '500':
        this.title = '500';
        this.subtitle = 'SYSTEM COLLAPSE';
        this.description = "The core is melting. The hub's reality is fracturing. Attempting containment...";
        this.backgroundImage = "url('assets/login.jpg')";
        this.typeClass = 'danger';
        break;
      case '403':
        this.title = '403';
        this.subtitle = 'ACCESS DENIED';
        this.description = "Your identity is being purged. Unauthorized presence detected. Security drones deployed.";
        this.backgroundImage = "url('assets/register.jpg')";
        this.typeClass = 'danger';
        break;
    }
  }
}
