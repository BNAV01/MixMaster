import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-platform-route-page',
  imports: [RouterLink],
  template: `
    <section class="page">
      <header>
        <span class="eyebrow">Platform Module</span>
        <h2>{{ title }}</h2>
        <p>{{ description }}</p>
      </header>

      <div class="actions">
        @for (action of actions; track action) {
          <span>{{ action }}</span>
        }
      </div>

      <div class="links">
        <a routerLink="/tenants">Tenants</a>
        <a routerLink="/plans">Planes</a>
        <a routerLink="/onboarding">Onboarding</a>
        <a routerLink="/support">Soporte</a>
      </div>
    </section>
  `,
  styles: [`
    .page { display: grid; gap: 1rem; }
    .eyebrow { color: var(--color-accent-alt); text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.12em; }
    h2 { margin: 0.25rem 0 0.5rem; font-size: clamp(1.6rem, 3vw, 2.3rem); }
    p { margin: 0; color: var(--color-text-muted); max-width: 70ch; }
    .actions {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
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
    .links { display: flex; gap: 0.75rem; flex-wrap: wrap; }
    .links a {
      padding: 0.75rem 1rem;
      border-radius: 999px;
      background: rgba(123, 196, 184, 0.16);
      color: var(--color-accent-alt);
    }
  `]
})
export class PlatformRoutePageComponent {
  private readonly route = inject(ActivatedRoute);

  protected get title(): string {
    return this.route.snapshot.data['title'] ?? 'Platform Route';
  }

  protected get description(): string {
    return this.route.snapshot.data['description'] ?? '';
  }

  protected get actions(): string[] {
    return this.route.snapshot.data['actions'] ?? [];
  }
}
