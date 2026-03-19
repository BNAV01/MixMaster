import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-public-shell',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="shell">
      <header class="shell__header">
        <div>
          <span class="eyebrow">MixMaster</span>
          <h1>Consumer Web</h1>
        </div>
        <nav class="shell__nav">
          <a routerLink="/experience/start" routerLinkActive="active">Inicio</a>
          <a routerLink="/experience/recommendations" routerLinkActive="active">Para ti</a>
          <a routerLink="/experience/explore" routerLinkActive="active">Explorar</a>
          <a routerLink="/experience/benefits" routerLinkActive="active">Beneficios</a>
        </nav>
      </header>

      <main class="shell__content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .shell {
      min-height: 100dvh;
      padding: 1.5rem;
    }

    .shell__header {
      display: grid;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .shell__nav {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .shell__nav a {
      padding: 0.6rem 0.95rem;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.04);
      color: var(--color-text-muted);
    }

    .shell__nav a.active {
      background: rgba(217, 167, 95, 0.16);
      color: var(--color-accent);
    }

    .eyebrow {
      color: var(--color-accent-alt);
      font-size: 0.75rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }

    h1 {
      margin: 0.25rem 0 0;
      font-size: clamp(1.75rem, 3vw, 2.5rem);
    }
  `]
})
export class PublicShellComponent {}
