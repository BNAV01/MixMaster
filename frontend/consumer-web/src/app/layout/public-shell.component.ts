import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CONSUMER_NAVIGATION } from '@mixmaster/consumer/navigation';
import { DEMO_PUBLISHED_MENU } from '../core/mocks/consumer-demo.data';
import { ConsumerExperienceFacade } from '../core/facades/consumer-experience.facade';
import { ConsumerSessionService } from '../core/services/consumer-session.service';

@Component({
  selector: 'app-public-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="mm-page-shell px-4 py-5 sm:px-6 lg:px-8">
      <header class="grid gap-5 xl:grid-cols-[1.35fr,0.95fr]">
        <section class="mm-surface overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-accent-2/10"></div>
          <div class="relative grid gap-6 p-6 lg:p-8">
            <div class="grid gap-5 lg:grid-cols-[auto,1fr] lg:items-center">
              <div class="flex h-24 w-24 items-center justify-center rounded-[1.8rem] border border-accent/20 bg-surface-2/82 p-3 shadow-panel">
                <img [src]="branding().logoUrl ?? ''" [alt]="activeVenueName()" class="h-full w-full object-contain" />
              </div>

              <div class="space-y-3">
                <p class="mm-eyebrow">MixMaster consumer · barra nocturna</p>
                <div class="space-y-3">
                  <h1 class="font-display text-5xl leading-[0.94] text-text sm:text-6xl">{{ activeVenueName() }}</h1>
                  <p class="max-w-2xl text-base leading-7 text-muted">
                    {{ branding().descriptor }}
                  </p>
                </div>
              </div>
            </div>

            <div class="grid gap-3 sm:grid-cols-3">
              <article class="rounded-[1.3rem] border border-border/16 bg-surface-2/72 p-4">
                <p class="text-xs uppercase tracking-[0.18em] text-muted">Horario</p>
                <p class="mt-2 text-base font-semibold text-text">{{ branding().serviceHoursLabel }}</p>
              </article>
              <article class="rounded-[1.3rem] border border-border/16 bg-surface-2/72 p-4">
                <p class="text-xs uppercase tracking-[0.18em] text-muted">Modo</p>
                <p class="mt-2 text-base font-semibold text-text">{{ branding().serviceModeLabel }}</p>
              </article>
              <article class="rounded-[1.3rem] border border-border/16 bg-surface-2/72 p-4">
                <p class="text-xs uppercase tracking-[0.18em] text-muted">Direccion</p>
                <p class="mt-2 text-base font-semibold text-text">{{ branding().address }}</p>
              </article>
            </div>

            <div class="flex flex-wrap gap-2.5">
              @for (tag of branding().heroTags ?? []; track tag) {
                <span class="rounded-pill border border-border/16 bg-surface/58 px-3 py-1.5 text-sm text-text">{{ tag }}</span>
              }
            </div>
          </div>
        </section>

        <aside class="mm-surface overflow-hidden">
          <div class="relative flex h-full flex-col gap-5 p-6">
            <div class="space-y-3">
              <p class="mm-eyebrow">Contexto activo</p>
              <h2 class="text-2xl font-semibold text-text">{{ activeTableLabel() }}</h2>
              <p class="text-sm leading-6 text-muted">{{ branding().ambienceNote }}</p>
            </div>

            <div class="grid gap-3">
              @for (highlight of highlights(); track highlight.id) {
                <article class="rounded-[1.3rem] border border-border/16 bg-surface-2/72 p-4">
                  <p class="text-sm font-semibold text-text">{{ highlight.title }}</p>
                  <p class="mt-2 text-sm leading-6 text-muted">{{ highlight.description }}</p>
                </article>
              }
            </div>

            <div class="mt-auto flex flex-wrap gap-3">
              <a routerLink="/register" class="mm-button-primary">Crear cuenta</a>
              <a routerLink="/menu" class="mm-button-secondary">Abrir carta</a>
            </div>
          </div>
        </aside>
      </header>

      <section class="mm-surface p-4 sm:p-5">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p class="mm-eyebrow">Navegacion principal</p>
            <h2 class="mt-2 text-2xl font-semibold text-text">Rutas visibles y con peso real en la experiencia</h2>
          </div>

          <div class="flex flex-wrap gap-2">
            @for (link of socialLinks(); track link.id) {
              <a
                [href]="link.url"
                target="_blank"
                rel="noreferrer"
                class="inline-flex items-center gap-2 rounded-pill border border-border/18 bg-surface-2/72 px-3.5 py-2.5 text-sm text-text transition duration-240 ease-expressive hover:border-accent/24 hover:bg-surface-3/82"
              >
                <span class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-accent/12 text-accent">
                  @switch (link.type) {
                    @case ('instagram') {
                      <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8">
                        <rect x="3.5" y="3.5" width="17" height="17" rx="5"></rect>
                        <circle cx="12" cy="12" r="4.2"></circle>
                        <circle cx="17.4" cy="6.6" r="1"></circle>
                      </svg>
                    }
                    @case ('tiktok') {
                      <svg viewBox="0 0 24 24" class="h-4 w-4" fill="currentColor">
                        <path d="M14.2 3h2.7c.4 1.9 1.7 3.3 3.1 3.8v2.9c-1.5-.1-2.9-.7-4-1.6v6.7c0 3.4-2.7 5.8-6 5.8S4 18.2 4 14.9s2.7-5.8 6-5.8c.3 0 .5 0 .8.1v3c-.3-.1-.5-.1-.8-.1-1.6 0-2.9 1.2-2.9 2.8s1.3 2.8 2.9 2.8 3-1.1 3-2.9V3Z"></path>
                      </svg>
                    }
                    @case ('whatsapp') {
                      <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8">
                        <path d="M20 12a8 8 0 1 1-14.8-4.1L4 21l4.2-1.1A8 8 0 0 1 20 12Z"></path>
                        <path d="M9.5 8.8c.3-.8.5-.8.8-.8h.7c.2 0 .5 0 .7.5.3.7.9 2.3 1 2.5.1.2.1.4 0 .6-.1.2-.2.4-.4.6-.2.2-.3.3-.5.5-.2.2-.3.4-.1.7.2.3.8 1.4 1.8 2.2 1.2 1.1 2.1 1.4 2.4 1.5.3.1.5.1.7-.1.2-.2.8-1 1-1.4.2-.4.4-.3.7-.2.3.1 2 .9 2.3 1 .4.2.6.3.7.5.1.2.1 1.2-.3 2.3-.4 1.1-2.1 2.1-2.9 2.2-.8.1-1.7.2-5.5-1.5-3.8-1.8-6.2-6.2-6.4-6.5-.2-.3-1.5-2-.9-3.8Z"></path>
                      </svg>
                    }
                    @default {
                      <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8">
                        <circle cx="12" cy="12" r="9"></circle>
                        <path d="M3 12h18"></path>
                        <path d="M12 3a15 15 0 0 1 0 18"></path>
                        <path d="M12 3a15 15 0 0 0 0 18"></path>
                      </svg>
                    }
                  }
                </span>
                <span>
                  {{ link.label }}
                  @if (link.handle) {
                    <span class="text-muted"> · {{ link.handle }}</span>
                  }
                </span>
              </a>
            }
          </div>
        </div>

        <nav class="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          @for (item of navigation; track item.route) {
            <a
              [routerLink]="item.route"
              routerLinkActive="border-accent/40 bg-accent/12 text-text"
              [routerLinkActiveOptions]="{ exact: item.exact ?? false }"
              class="group rounded-[1.3rem] border border-border/16 bg-surface-2/70 p-4 text-left transition duration-240 ease-expressive hover:border-accent/24 hover:bg-surface-3/84"
            >
              <div class="flex items-start justify-between gap-4">
                <span class="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-surface/72 text-accent transition duration-240 ease-expressive group-hover:bg-accent/12">
                  @switch (item.icon) {
                    @case ('menu') {
                      <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8">
                        <path d="M4 7h16"></path>
                        <path d="M4 12h16"></path>
                        <path d="M4 17h10"></path>
                      </svg>
                    }
                    @case ('star') {
                      <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8">
                        <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9L12 3Z"></path>
                      </svg>
                    }
                    @case ('compass') {
                      <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8">
                        <circle cx="12" cy="12" r="8.5"></circle>
                        <path d="m15.9 8.1-2.4 5.8-5.4 2.2 2.4-5.8 5.4-2.2Z"></path>
                      </svg>
                    }
                    @case ('heart') {
                      <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8">
                        <path d="M12 20s-7-4.4-7-10.1C5 6.8 7 5 9.6 5c1.5 0 2.9.7 3.8 1.9C14.3 5.7 15.8 5 17.3 5 20 5 22 6.8 22 9.9 22 15.6 15 20 15 20H12Z"></path>
                      </svg>
                    }
                    @case ('history') {
                      <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8">
                        <path d="M3 12a9 9 0 1 0 3-6.7"></path>
                        <path d="M3 4v5h5"></path>
                        <path d="M12 7v5l3 2"></path>
                      </svg>
                    }
                    @case ('gift') {
                      <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8">
                        <path d="M20 12v8H4v-8"></path>
                        <path d="M2 7h20v5H2z"></path>
                        <path d="M12 20V7"></path>
                        <path d="M12 7H8.5A2.5 2.5 0 1 1 11 3.5L12 7Z"></path>
                        <path d="M12 7h3.5A2.5 2.5 0 1 0 13 3.5L12 7Z"></path>
                      </svg>
                    }
                    @case ('user') {
                      <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8">
                        <circle cx="12" cy="8" r="3.5"></circle>
                        <path d="M5 20a7 7 0 0 1 14 0"></path>
                      </svg>
                    }
                    @default {
                      <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8">
                        <path d="m12 4 2.2 5.1L20 11l-5.8 1.9L12 18l-2.2-5.1L4 11l5.8-1.9L12 4Z"></path>
                      </svg>
                    }
                  }
                </span>

                @if (item.badge) {
                  <span class="rounded-pill border border-border/16 bg-surface/72 px-2.5 py-1 text-xs uppercase tracking-[0.18em] text-muted">
                    {{ item.badge }}
                  </span>
                }
              </div>

              <div class="mt-5 space-y-1.5">
                <p class="text-lg font-semibold text-text">{{ item.label }}</p>
                <p class="text-sm leading-6 text-muted">
                  @switch (item.route) {
                    @case ('/menu') { Carta completa con categorias, subcategorias y productos con stock. }
                    @case ('/experience/recommendations') { Recomendaciones personalizadas con criterio seguro y exploratorio. }
                    @case ('/experience/explore') { Descubrimiento controlado para salir de lo habitual sin romper contexto. }
                    @case ('/experience/favorites') { Picks guardados para repetir, comparar o llevar a cuenta. }
                    @case ('/experience/history') { Continuidad de la sesion para visitas efimeras y regulares. }
                    @case ('/experience/benefits') { Wallet, puntos y recompensas visibles durante la visita. }
                    @case ('/account') { Perfil registrado, merge y persistencia real entre visitas. }
                    @default { Punto de entrada para arrancar la experiencia. }
                  }
                </p>
              </div>
            </a>
          }
        </nav>
      </section>

      <main class="space-y-8 pb-12">
        <router-outlet />
      </main>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PublicShellComponent {
  private readonly experienceFacade = inject(ConsumerExperienceFacade);
  private readonly consumerSessionService = inject(ConsumerSessionService);

  protected readonly navigation = CONSUMER_NAVIGATION;
  protected readonly branding = computed(() => ({
    ...DEMO_PUBLISHED_MENU.branding!,
    ...(this.experienceFacade.publishedMenu()?.branding ?? {})
  }));
  protected readonly highlights = computed(() =>
    this.experienceFacade.publishedMenu()?.highlights?.length
      ? this.experienceFacade.publishedMenu()?.highlights ?? []
      : DEMO_PUBLISHED_MENU.highlights ?? []
  );
  protected readonly socialLinks = computed(() => this.branding().socialLinks ?? []);

  protected readonly activeVenueName = computed(() =>
    this.consumerSessionService.activeBranchName() ?? this.experienceFacade.qrContext()?.branchName ?? this.branding().venueName
  );

  protected readonly activeTableLabel = computed(() =>
    this.consumerSessionService.activeTableLabel() ?? this.experienceFacade.qrContext()?.tableLabel ?? 'Barra libre'
  );
}
