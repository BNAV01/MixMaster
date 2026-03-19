import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-platform-shell',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="shell">
      <header class="header">
        <div>
          <span class="eyebrow">MixMaster SaaS</span>
          <h1>Platform Console</h1>
        </div>
        <nav>
          <a routerLink="/tenants" routerLinkActive="active">Tenants</a>
          <a routerLink="/trials" routerLinkActive="active">Trials</a>
          <a routerLink="/plans" routerLinkActive="active">Planes</a>
          <a routerLink="/subscriptions" routerLinkActive="active">Suscripciones</a>
          <a routerLink="/onboarding" routerLinkActive="active">Onboarding</a>
          <a routerLink="/support" routerLinkActive="active">Soporte</a>
        </nav>
      </header>

      <main class="content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .shell { min-height: 100dvh; padding: 1.5rem; }
    .header {
      display: grid;
      gap: 1rem;
      margin-bottom: 1.5rem;
      padding: 1rem;
      border-radius: var(--radius-md);
      border: var(--border-subtle);
      background: rgba(255, 255, 255, 0.03);
    }
    nav { display: flex; gap: 0.75rem; flex-wrap: wrap; }
    nav a {
      padding: 0.65rem 0.95rem;
      border-radius: 999px;
      color: var(--color-text-muted);
      background: rgba(255, 255, 255, 0.03);
    }
    nav a.active {
      color: var(--color-text);
      background: rgba(139, 167, 255, 0.16);
    }
    .eyebrow { color: var(--color-accent-alt); text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.12em; }
    h1 { margin: 0.25rem 0 0; font-size: clamp(1.6rem, 3vw, 2.25rem); }
  `]
})
export class PlatformShellComponent {}
