import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-tenant-shell',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="shell">
      <aside class="sidebar">
        <h1>Tenant Console</h1>
        <nav>
          <a routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
          <a routerLink="/menu" routerLinkActive="active">Carta</a>
          <a routerLink="/availability" routerLinkActive="active">Disponibilidad</a>
          <a routerLink="/analytics" routerLinkActive="active">Analítica</a>
          <a routerLink="/campaigns" routerLinkActive="active">Campañas</a>
          <a routerLink="/loyalty" routerLinkActive="active">Loyalty</a>
          <a routerLink="/staff" routerLinkActive="active">Staff</a>
          <a routerLink="/settings" routerLinkActive="active">Settings</a>
        </nav>
      </aside>

      <main class="content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .shell { display: grid; grid-template-columns: 260px 1fr; min-height: 100dvh; }
    .sidebar {
      padding: 1.5rem;
      border-right: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(255, 255, 255, 0.02);
    }
    .sidebar h1 { margin: 0 0 1rem; font-size: 1.3rem; }
    nav { display: grid; gap: 0.5rem; }
    nav a {
      padding: 0.75rem 0.9rem;
      border-radius: 0.9rem;
      color: var(--color-text-muted);
      background: transparent;
    }
    nav a.active {
      color: var(--color-text);
      background: rgba(123, 196, 184, 0.16);
    }
    .content { padding: 1.5rem; }
    @media (max-width: 980px) {
      .shell { grid-template-columns: 1fr; }
      .sidebar { border-right: 0; border-bottom: 1px solid rgba(255, 255, 255, 0.08); }
    }
  `]
})
export class TenantShellComponent {}
