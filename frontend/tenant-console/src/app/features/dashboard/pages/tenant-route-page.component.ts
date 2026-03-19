import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-tenant-route-page',
  imports: [RouterLink],
  template: `
    <section class="page">
      <header>
        <span class="eyebrow">Tenant Module</span>
        <h2>{{ title }}</h2>
        <p>{{ description }}</p>
      </header>

      <div class="actions">
        @for (action of actions; track action) {
          <span>{{ action }}</span>
        }
      </div>

      <div class="quick-links">
        <a routerLink="/dashboard">Dashboard</a>
        <a routerLink="/menu">Carta</a>
        <a routerLink="/availability">Disponibilidad</a>
        <a routerLink="/analytics">Analítica</a>
      </div>
    </section>
  `,
  styles: [`
    .page { display: grid; gap: 1rem; }
    .eyebrow { color: var(--color-accent-alt); text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.12em; }
    h2 { margin: 0.25rem 0 0.5rem; font-size: clamp(1.7rem, 3vw, 2.4rem); }
    p { margin: 0; color: var(--color-text-muted); max-width: 70ch; }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      padding: 1rem;
      border-radius: var(--radius-md);
      border: var(--border-subtle);
      background: rgba(255, 255, 255, 0.03);
    }
    .actions span {
      padding: 0.55rem 0.85rem;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.04);
    }
    .quick-links { display: flex; gap: 0.75rem; flex-wrap: wrap; }
    .quick-links a {
      padding: 0.75rem 1rem;
      border-radius: 999px;
      background: rgba(207, 162, 107, 0.14);
      color: var(--color-accent-alt);
    }
  `]
})
export class TenantRoutePageComponent {
  private readonly route = inject(ActivatedRoute);

  protected get title(): string {
    return this.route.snapshot.data['title'] ?? 'Tenant Route';
  }

  protected get description(): string {
    return this.route.snapshot.data['description'] ?? '';
  }

  protected get actions(): string[] {
    return this.route.snapshot.data['actions'] ?? [];
  }
}
