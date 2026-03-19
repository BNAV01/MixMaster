import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CONSUMER_NAVIGATION } from '@mixmaster/consumer/navigation';

@Component({
  selector: 'app-public-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="mm-page-shell px-4 py-4 sm:px-6 lg:px-8">
      <header class="mb-6 flex flex-col gap-4">
        <div class="flex items-center justify-between gap-4">
          <div class="space-y-2">
            <p class="mm-eyebrow">MixMaster consumer</p>
            <div>
              <h1 class="text-2xl font-semibold text-text sm:text-3xl">Descubre mejor que pedir</h1>
              <p class="mt-1 text-sm leading-6 text-muted">Carta viva, recomendaciones y beneficios sin friccion innecesaria.</p>
            </div>
          </div>
          <a routerLink="/register" class="mm-button-secondary hidden sm:inline-flex">Crear cuenta</a>
        </div>

        <nav class="flex gap-2 overflow-x-auto pb-1">
          @for (item of navigation; track item.route) {
            <a
              [routerLink]="item.route"
              routerLinkActive="bg-accent/15 text-text border-accent/25"
              [routerLinkActiveOptions]="{ exact: item.exact ?? false }"
              class="whitespace-nowrap rounded-pill border border-transparent bg-surface/60 px-3.5 py-2 text-sm text-muted transition duration-240 ease-expressive hover:border-border/20 hover:bg-surface-2/80 hover:text-text"
            >
              {{ item.label }}
            </a>
          }
        </nav>
      </header>

      <main class="pb-10">
        <router-outlet />
      </main>
    </div>
  `
})
export class PublicShellComponent {
  protected readonly navigation = CONSUMER_NAVIGATION;
}
