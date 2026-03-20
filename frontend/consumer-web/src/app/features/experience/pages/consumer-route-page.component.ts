import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BenefitCardComponent, BenefitCardViewModel } from '@mixmaster/consumer/loyalty';
import { FeedbackPromptComponent } from '@mixmaster/consumer/feedback';
import { DislikeChipComponent, TasteChipComponent } from '@mixmaster/consumer/preferences';
import { RecommendationCardComponent, RecommendationCardViewModel } from '@mixmaster/consumer/recommendations';
import {
  MenuSectionListComponent,
  MenuSectionViewModel,
  ProductCardComponent,
  ProductCardViewModel
} from '@mixmaster/consumer/menu-viewer';
import { CommandAction, SectionPageContent } from '@mixmaster/shared/models';
import {
  AppShellHeaderComponent,
  CommandBarComponent,
  EmptyStateComponent,
  LoadingSkeletonComponent,
  TenantBadgeComponent
} from '@mixmaster/shared/ui-core';
import { RealtimeConnectionService } from '@mixmaster/shared/realtime';
import { ConsumerExperienceFacade } from '../../../core/facades/consumer-experience.facade';
import { ConsumerAuthService } from '../../../core/services/consumer-auth.service';
import { ConsumerSessionService } from '../../../core/services/consumer-session.service';

@Component({
  selector: 'app-consumer-route-page',
  standalone: true,
  imports: [
    AppShellHeaderComponent,
    BenefitCardComponent,
    CommandBarComponent,
    DislikeChipComponent,
    EmptyStateComponent,
    FeedbackPromptComponent,
    LoadingSkeletonComponent,
    MenuSectionListComponent,
    ProductCardComponent,
    RecommendationCardComponent,
    RouterLink,
    TasteChipComponent,
    TenantBadgeComponent
  ],
  template: `
    <section class="space-y-6">
      <mm-app-shell-header
        [eyebrow]="content.eyebrow"
        [title]="content.title"
        [description]="content.description"
      />

      @if (consumerSessionService.activeBranchName()) {
        <div class="flex flex-wrap items-center gap-3">
          <mm-tenant-badge
            [tenantName]="consumerSessionService.activeBranchName() ?? 'Sucursal activa'"
            [branchName]="consumerSessionService.activeTableLabel() ?? ''"
          />
          @if (realtimeConnectionService.status() !== 'idle') {
            <span class="rounded-pill bg-info/15 px-3 py-1 text-sm font-medium text-info">
              Realtime {{ realtimeConnectionService.status() }}
            </span>
          }
        </div>
      }

      @if (content.metrics?.length) {
        <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          @for (metric of content.metrics; track metric.label) {
            <article class="mm-surface space-y-2 p-4">
              <p class="text-sm text-muted">{{ metric.label }}</p>
              <p class="text-2xl font-semibold text-text">{{ metric.value }}</p>
            </article>
          }
        </div>
      }

      @switch (content.pageId) {
        @case ('start') {
          <div class="grid gap-4 lg:grid-cols-3">
            @for (intent of intents(); track intent.id) {
              <button
                type="button"
                class="mm-surface flex flex-col gap-3 p-5 text-left transition duration-240 ease-expressive hover:border-accent/25 hover:bg-surface-2/90"
                (click)="selectedIntent.set(intent.id)"
              >
                <p class="mm-eyebrow">{{ intent.kicker }}</p>
                <h3 class="text-xl font-semibold text-text">{{ intent.title }}</h3>
                <p class="text-sm leading-6 text-muted">{{ intent.description }}</p>
              </button>
            }
          </div>

          <mm-command-bar [actions]="startActions()" (actionSelected)="handleStartAction($event)" />
        }

        @case ('session') {
          <div class="grid gap-4 lg:grid-cols-[1.1fr,0.9fr]">
            <section class="mm-surface space-y-4 p-5">
              <p class="mm-eyebrow">Sesion activa</p>
              <h3 class="text-2xl font-semibold text-text">{{ consumerSessionService.activeBranchName() ?? 'Sucursal pendiente' }}</h3>
              <div class="grid gap-3 sm:grid-cols-2">
                <article class="rounded-2xl border border-border/15 bg-surface-2/70 p-4">
                  <p class="text-sm text-muted">QR activo</p>
                  <p class="mt-1 text-base font-medium text-text">{{ consumerSessionService.activeQrCode() ?? 'Sin QR resuelto' }}</p>
                </article>
                <article class="rounded-2xl border border-border/15 bg-surface-2/70 p-4">
                  <p class="text-sm text-muted">Mesa o barra</p>
                  <p class="mt-1 text-base font-medium text-text">{{ consumerSessionService.activeTableLabel() ?? 'Consumo libre' }}</p>
                </article>
                <article class="rounded-2xl border border-border/15 bg-surface-2/70 p-4">
                  <p class="text-sm text-muted">Sesion anonima</p>
                  <p class="mt-1 text-base font-medium text-text">{{ consumerSessionService.sessionId() ?? 'Aun no persistida' }}</p>
                </article>
                <article class="rounded-2xl border border-border/15 bg-surface-2/70 p-4">
                  <p class="text-sm text-muted">Perfil</p>
                  <p class="mt-1 text-base font-medium text-text">{{ consumerSessionService.anonymousProfileId() ?? 'Aun no asignado' }}</p>
                </article>
              </div>
            </section>

            <section class="mm-surface space-y-4 p-5">
              <p class="mm-eyebrow">Siguiente paso</p>
              <h3 class="text-2xl font-semibold text-text">La sesion ya puede alimentar carta, recomendaciones y merge</h3>
              <p class="text-sm leading-6 text-muted">
                Esta pantalla sirve como punto de control para diagnostico, continuidad y futuras mejoras de rehidratacion del flujo consumidor.
              </p>
              <div class="flex flex-wrap gap-3">
                <a routerLink="/menu" class="mm-button-primary">Ir a la carta</a>
                <a routerLink="/experience/recommendations" class="mm-button-secondary">Pedir recomendaciones</a>
              </div>
            </section>
          </div>
        }

        @case ('menu') {
          @if (experienceFacade.menuStatus() === 'loading') {
            <mm-loading-skeleton [cards]="3" />
          } @else {
            <mm-menu-section-list [sections]="menuSections()" />
          }
        }

        @case ('preferences') {
          <div class="grid gap-6 xl:grid-cols-2">
            <section class="mm-surface space-y-4 p-5">
              <p class="mm-eyebrow">Tus gustos</p>
              <h3 class="text-2xl font-semibold text-text">Arranquemos por lo que si te gusta</h3>
              <div class="flex flex-wrap gap-3">
                @for (taste of tastes(); track taste) {
                  <mm-taste-chip
                    [label]="taste"
                    [selected]="selectedTastes().includes(taste)"
                    (toggled)="toggleTaste(taste)"
                  />
                }
              </div>
            </section>

            <section class="mm-surface space-y-4 p-5">
              <p class="mm-eyebrow">Lo que prefieres evitar</p>
              <h3 class="text-2xl font-semibold text-text">Ayudanos a no hacerte perder tiempo</h3>
              <div class="flex flex-wrap gap-3">
                @for (dislike of dislikes(); track dislike) {
                  <mm-dislike-chip
                    [label]="dislike"
                    [selected]="selectedDislikes().includes(dislike)"
                    (toggled)="toggleDislike(dislike)"
                  />
                }
              </div>
            </section>
          </div>
        }

        @case ('recommendations') {
          @if (experienceFacade.recommendationsStatus() === 'loading') {
            <mm-loading-skeleton [cards]="3" />
          } @else {
            <div class="mm-card-grid">
              @for (recommendation of recommendationCards(); track recommendation.id) {
                <mm-recommendation-card [recommendation]="recommendation" />
              }
            </div>
          }
        }

        @case ('explore') {
          <div class="space-y-4">
            <mm-command-bar [actions]="exploreActions()" (actionSelected)="handleExploreAction($event)" />
            <div class="mm-card-grid">
              @for (recommendation of recommendationCards(); track recommendation.id) {
                <mm-recommendation-card [recommendation]="recommendation" />
              }
            </div>
          </div>
        }

        @case ('refine') {
          <section class="mm-surface space-y-5 p-5">
            <div class="space-y-2">
              <p class="mm-eyebrow">Refina sin reiniciar</p>
              <h3 class="text-2xl font-semibold text-text">Ajusta el rumbo en segundos</h3>
              <p class="text-sm leading-6 text-muted">Estas acciones luego se conectaran al motor de recomendacion y regeneracion incremental.</p>
            </div>

            <mm-command-bar [actions]="refineActions()" />
          </section>
        }

        @case ('pairings') {
          <div class="grid gap-4 lg:grid-cols-[1.15fr,0.85fr]">
            <div class="space-y-4">
              <div class="mm-card-grid">
                @for (recommendation of recommendationCards(); track recommendation.id) {
                  <mm-recommendation-card [recommendation]="recommendation" />
                }
              </div>
            </div>

            <section class="mm-surface space-y-4 p-5">
              <p class="mm-eyebrow">Pairings sugeridos</p>
              <h3 class="text-2xl font-semibold text-text">No solo que pedir, sino con que combinarlo</h3>
              <div class="space-y-3">
                <article class="rounded-2xl border border-border/15 bg-surface-2/70 p-4">
                  <p class="text-sm text-muted">Recomendacion segura</p>
                  <p class="mt-1 font-semibold text-text">Spritz citrico + tabla fresca</p>
                  <p class="mt-2 text-sm leading-6 text-muted">Pensado para una mesa que quiere algo compartible, ligero y facil de repetir.</p>
                </article>
                <article class="rounded-2xl border border-border/15 bg-surface-2/70 p-4">
                  <p class="text-sm text-muted">Exploracion controlada</p>
                  <p class="mt-1 font-semibold text-text">Highball herbal + tapas saladas</p>
                  <p class="mt-2 text-sm leading-6 text-muted">Sube novedad sin perder compatibilidad con tus gustos actuales y el momento de consumo.</p>
                </article>
              </div>
            </section>
          </div>
        }

        @case ('feedback') {
          <mm-feedback-prompt
            (sentimentSelected)="feedbackSentiment.set($event)"
            (adjustmentSelected)="feedbackAdjustment.set($event)"
          />
        }

        @case ('favorites') {
          <div class="mm-card-grid">
            @for (favorite of favoriteProducts(); track favorite.id) {
              <mm-product-card [product]="favorite" />
            }
          </div>
        }

        @case ('benefits') {
          <div class="grid gap-4 lg:grid-cols-[1.25fr,1fr]">
            <section class="mm-surface space-y-4 p-5">
              <p class="mm-eyebrow">Tu progreso</p>
              <h3 class="text-3xl font-semibold text-text">{{ experienceFacade.loyaltySnapshot()?.pointsBalance ?? 120 }} pts</h3>
              <p class="text-sm leading-6 text-muted">{{ experienceFacade.loyaltySnapshot()?.nextRewardLabel ?? '200 pts para desbloquear tu primer upgrade.' }}</p>
            </section>

            <div class="grid gap-4">
              @for (benefit of benefits(); track benefit.id) {
                <mm-benefit-card [benefit]="benefit" />
              }
            </div>
          </div>
        }

        @case ('history') {
          <section class="mm-surface space-y-4 p-5">
            <p class="mm-eyebrow">Historial recuperable</p>
            <h3 class="text-2xl font-semibold text-text">Tu sesion ya esta lista para fusionarse si creas cuenta</h3>
            <p class="text-sm leading-6 text-muted">
              Guardamos tus preferencias, resultados vistos y feedback con un perfil anonimo persistente cuando corresponde.
            </p>
            <div class="flex flex-wrap gap-3">
              <a routerLink="/register" class="mm-button-primary">Crear cuenta</a>
              <a routerLink="/account/merge-history" class="mm-button-secondary">Fusionar historial</a>
            </div>
          </section>
        }

        @case ('login') {
          <section class="mm-surface space-y-5 p-5">
            <p class="mm-eyebrow">Cuenta registrada</p>
            <h3 class="text-2xl font-semibold text-text">Entra para guardar historial y favoritos</h3>
            <div class="grid gap-3">
              <input class="rounded-lg border border-border/20 bg-surface-2/70 px-4 py-3 text-text" placeholder="Correo electronico" />
              <input class="rounded-lg border border-border/20 bg-surface-2/70 px-4 py-3 text-text" placeholder="Contrasena" type="password" />
              <button type="button" class="mm-button-primary" (click)="simulateConsumerLogin()">Entrar</button>
            </div>
          </section>
        }

        @case ('register') {
          <section class="mm-surface space-y-5 p-5">
            <p class="mm-eyebrow">Cuenta despues de valor</p>
            <h3 class="text-2xl font-semibold text-text">Guarda lo que ya descubriste hoy</h3>
            <div class="grid gap-3">
              <input class="rounded-lg border border-border/20 bg-surface-2/70 px-4 py-3 text-text" placeholder="Nombre" />
              <input class="rounded-lg border border-border/20 bg-surface-2/70 px-4 py-3 text-text" placeholder="Correo electronico" />
              <button type="button" class="mm-button-primary" (click)="simulateConsumerLogin()">Crear cuenta y seguir</button>
            </div>
          </section>
        }

        @case ('account-overview') {
          <div class="grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
            <section class="mm-surface space-y-4 p-5">
              <p class="mm-eyebrow">Cuenta activa</p>
              <h3 class="text-3xl font-semibold text-text">{{ consumerAuthService.displayName() ?? 'Consumidor MixMaster' }}</h3>
              <p class="text-sm leading-6 text-muted">
                Tu cuenta concentra historial, favoritos, beneficios y continuidad entre visitas o sucursales afiliadas.
              </p>
              <div class="flex flex-wrap gap-3">
                <a routerLink="/account/history" class="mm-button-primary">Ver historial</a>
                <a routerLink="/account/favorites" class="mm-button-secondary">Ver favoritos</a>
              </div>
            </section>

            <section class="mm-surface space-y-4 p-5">
              <p class="mm-eyebrow">Estado</p>
              <div class="space-y-3">
                <article class="rounded-2xl border border-border/15 bg-surface-2/70 p-4">
                  <p class="text-sm text-muted">Perfil persistente</p>
                  <p class="mt-1 font-semibold text-text">{{ consumerAuthService.consumerProfileId() ?? 'Pendiente' }}</p>
                </article>
                <article class="rounded-2xl border border-border/15 bg-surface-2/70 p-4">
                  <p class="text-sm text-muted">Merge potencial</p>
                  <p class="mt-1 font-semibold text-text">{{ consumerSessionService.hasAnonymousProfile() ? 'Disponible para revisar' : 'Sin merge pendiente' }}</p>
                </article>
              </div>
            </section>
          </div>
        }

        @case ('account-history') {
          <section class="space-y-4">
            <div class="mm-card-grid">
              @for (recommendation of recommendationCards(); track recommendation.id) {
                <mm-recommendation-card [recommendation]="recommendation" />
              }
            </div>

            <section class="mm-surface space-y-4 p-5">
              <p class="mm-eyebrow">Continuidad</p>
              <p class="text-sm leading-6 text-muted">
                Aqui quedaran tus resultados vistos, picks aceptados, feedback y sesiones fusionadas para reordenar mejor la experiencia futura.
              </p>
            </section>
          </section>
        }

        @case ('account-favorites') {
          <div class="mm-card-grid">
            @for (favorite of favoriteProducts(); track favorite.id) {
              <mm-product-card [product]="favorite" />
            }
          </div>
        }

        @case ('account-benefits') {
          <div class="grid gap-4 lg:grid-cols-[1.25fr,1fr]">
            <section class="mm-surface space-y-4 p-5">
              <p class="mm-eyebrow">Wallet activa</p>
              <h3 class="text-3xl font-semibold text-text">{{ experienceFacade.loyaltySnapshot()?.pointsBalance ?? 120 }} pts</h3>
              <p class="text-sm leading-6 text-muted">Tu cuenta ya puede acumular, canjear y reutilizar beneficios en proximas visitas.</p>
            </section>

            <div class="grid gap-4">
              @for (benefit of benefits(); track benefit.id) {
                <mm-benefit-card [benefit]="benefit" />
              }
            </div>
          </div>
        }

        @case ('account-settings') {
          <section class="mm-surface space-y-5 p-5">
            <p class="mm-eyebrow">Ajustes del perfil</p>
            <h3 class="text-2xl font-semibold text-text">Controla continuidad, consentimiento y preferencias</h3>
            <div class="grid gap-3">
              <label class="rounded-2xl border border-border/15 bg-surface-2/70 p-4 text-sm text-muted">
                <span class="block font-medium text-text">Idioma preferido</span>
                <span class="mt-1 block">Preparado para configuracion por cuenta y por tenant.</span>
              </label>
              <label class="rounded-2xl border border-border/15 bg-surface-2/70 p-4 text-sm text-muted">
                <span class="block font-medium text-text">Consentimiento y comunicacion</span>
                <span class="mt-1 block">Base lista para separar marketing, personalizacion y retencion tecnica.</span>
              </label>
              <button type="button" class="mm-button-secondary" (click)="consumerAuthService.logout()">Cerrar sesion</button>
            </div>
          </section>
        }

        @case ('merge-history') {
          <section class="mm-surface space-y-4 p-5">
            <p class="mm-eyebrow">Merge listo</p>
            <h3 class="text-2xl font-semibold text-text">Unimos tu sesion anonima a tu perfil</h3>
            <p class="text-sm leading-6 text-muted">Cuando el backend de merge este listo, esta pantalla consumira el contrato dedicado y mostrara resultado, conflictos y resumen.</p>
          </section>
        }

        @default {
          <section class="grid gap-4 lg:grid-cols-[1.15fr,0.85fr]">
            <article class="mm-surface space-y-4 p-5">
              <p class="mm-eyebrow">Proximo paso</p>
              <h3 class="text-2xl font-semibold text-text">{{ content.title }}</h3>
              <p class="text-sm leading-6 text-muted">{{ content.description }}</p>
              <mm-command-bar [actions]="genericActions()" />
            </article>

            <article class="mm-surface space-y-4 p-5">
              <p class="mm-eyebrow">Atajos utiles</p>
              @if (content.quickLinks?.length) {
                <div class="grid gap-3">
                  @for (link of content.quickLinks; track link.route) {
                    <a
                      [routerLink]="link.route"
                      class="rounded-2xl border border-border/15 bg-surface-2/70 px-4 py-3 text-sm font-medium text-text transition duration-240 ease-expressive hover:border-accent/20 hover:bg-surface-2"
                    >
                      {{ link.label }}
                    </a>
                  }
                </div>
              } @else {
                <mm-empty-state
                  title="Ruta registrada"
                  description="La vista ya forma parte del mapa de producto y puede recibir layout especifico en la siguiente iteracion."
                />
              }
            </article>
          </section>
        }
      }

      @if (content.quickLinks?.length && content.pageId !== 'merge-history') {
        <section class="mm-surface space-y-4 p-5">
          <div>
            <p class="mm-eyebrow">Navegacion contextual</p>
            <h3 class="text-xl font-semibold text-text">Sigue el flujo sin perder contexto</h3>
          </div>

          <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            @for (link of content.quickLinks; track link.route) {
              <a
                [routerLink]="link.route"
                class="rounded-2xl border border-border/15 bg-surface-2/70 px-4 py-4 text-sm font-medium text-text transition duration-240 ease-expressive hover:border-accent/20 hover:bg-surface-2"
              >
                {{ link.label }}
              </a>
            }
          </div>
        </section>
      }
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConsumerRoutePageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly experienceFacade = inject(ConsumerExperienceFacade);
  protected readonly consumerSessionService = inject(ConsumerSessionService);
  protected readonly realtimeConnectionService = inject(RealtimeConnectionService);
  protected readonly consumerAuthService = inject(ConsumerAuthService);

  protected readonly selectedIntent = signal<'safe' | 'explore' | 'help-me-decide'>('help-me-decide');
  protected readonly selectedTastes = signal<string[]>(['citrico']);
  protected readonly selectedDislikes = signal<string[]>(['muy amargo']);
  protected readonly feedbackSentiment = signal<string | null>(null);
  protected readonly feedbackAdjustment = signal<string | null>(null);

  protected readonly content = this.route.snapshot.data as SectionPageContent;
  protected readonly tastes = signal(['citrico', 'herbal', 'frutal', 'seco', 'espumoso', 'sin alcohol']);
  protected readonly dislikes = signal(['muy dulce', 'muy amargo', 'picante', 'alto alcohol']);

  protected readonly genericActions = computed<CommandAction[]>(() =>
    (this.content.actions ?? []).map((label) => ({
      id: label.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      label
    }))
  );

  protected readonly menuSections = computed<MenuSectionViewModel[]>(() =>
    (this.experienceFacade.publishedMenu()?.sections ?? []).map((section) => ({
      id: section.id,
      title: section.title,
      subtitle: section.subtitle,
      itemCount: section.itemCount
    }))
  );

  protected readonly recommendationCards = computed<RecommendationCardViewModel[]>(() =>
    (this.experienceFacade.recommendations()?.items ?? []).map((item) => ({
      id: item.productId,
      name: item.name,
      summary: item.summary,
      score: item.score,
      priceLabel: item.priceLabel,
      reason: this.content.pageId === 'explore'
        ? 'Esta opcion estira un poco tu perfil sin irse a algo irrelevante.'
        : 'Te lo recomendamos porque cruza tus gustos actuales con el contexto de esta mesa.',
      tags: item.tags
    }))
  );

  protected readonly favoriteProducts = computed<ProductCardViewModel[]>(() =>
    (this.experienceFacade.recommendations()?.items ?? []).map((item) => ({
      id: item.productId,
      name: item.name,
      typeLabel: item.productType,
      shortDescription: item.summary,
      priceLabel: item.priceLabel,
      tags: item.tags,
      availabilityState: item.availabilityState
    }))
  );

  protected readonly benefits = signal<BenefitCardViewModel[]>([
    {
      id: 'benefit-bday',
      title: 'Beneficio de cumpleanos',
      description: 'Desbloquea un upgrade de bienvenida cuando celebras con nosotros.',
      badge: 'Bronce'
    },
    {
      id: 'benefit-discovery',
      title: 'Explora una nueva categoria',
      description: 'Gana puntos extra si pruebas una categoria nueva esta semana.',
      badge: 'Explora'
    }
  ]);

  constructor() {
    const qrToken = this.consumerSessionService.activeQrCode() ?? 'demo-negroni-table-12';

    switch (this.content.pageId) {
      case 'menu':
        this.experienceFacade.loadPublishedMenu(qrToken);
        break;
      case 'recommendations':
      case 'explore':
      case 'refine':
      case 'pairings':
      case 'favorites':
      case 'account-favorites':
      case 'account-history':
        this.experienceFacade.loadRecommendations(this.content.pageId === 'explore' ? 'explore' : 'hybrid');
        break;
      case 'benefits':
      case 'account-benefits':
      case 'account-overview':
        this.experienceFacade.loadLoyaltySnapshot();
        break;
      default:
        break;
    }
  }

  protected intents(): Array<{ id: 'safe' | 'explore' | 'help-me-decide'; kicker: string; title: string; description: string }> {
    return [
      { id: 'safe', kicker: 'Seguro', title: 'Quiero algo que me guste', description: 'Partimos por opciones faciles de amar y rapidas de decidir.' },
      { id: 'help-me-decide', kicker: 'Guiado', title: 'No se que pedir', description: 'Te hacemos un par de preguntas y ordenamos la carta por ti.' },
      { id: 'explore', kicker: 'Descubrir', title: 'Quiero explorar', description: 'Subimos novedad con control para que no sea un salto al vacio.' }
    ];
  }

  protected startActions(): CommandAction[] {
    return [
      { id: 'go-preferences', label: 'Ajustar gustos', shortcut: 'G' },
      { id: 'go-menu', label: 'Ver carta', shortcut: 'M' },
      { id: 'go-recommendations', label: 'Dame opciones', shortcut: 'R' }
    ];
  }

  protected exploreActions(): CommandAction[] {
    return [
      { id: 'safe', label: 'Volver a seguro' },
      { id: 'pairing', label: 'Ver maridaje' },
      { id: 'refresh', label: 'Dame otra tanda' }
    ];
  }

  protected refineActions(): CommandAction[] {
    return [
      { id: 'less-sweet', label: 'Menos dulce' },
      { id: 'more-intense', label: 'Mas intenso' },
      { id: 'food-pairing', label: 'Sumar comida' }
    ];
  }

  protected toggleTaste(taste: string): void {
    this.selectedTastes.update((current) =>
      current.includes(taste) ? current.filter((item) => item !== taste) : [...current, taste]
    );
  }

  protected toggleDislike(dislike: string): void {
    this.selectedDislikes.update((current) =>
      current.includes(dislike) ? current.filter((item) => item !== dislike) : [...current, dislike]
    );
  }

  protected handleStartAction(actionId: string): void {
    if (actionId === 'go-recommendations') {
      this.experienceFacade.loadRecommendations(this.selectedIntent() === 'explore' ? 'explore' : 'hybrid');
      void this.router.navigateByUrl('/experience/recommendations');
    }

    if (actionId === 'go-menu') {
      this.experienceFacade.loadPublishedMenu(this.consumerSessionService.activeQrCode() ?? 'demo-negroni-table-12');
      void this.router.navigateByUrl('/menu');
    }

    if (actionId === 'go-preferences') {
      void this.router.navigateByUrl('/experience/preferences');
    }
  }

  protected handleExploreAction(actionId: string): void {
    if (actionId === 'refresh') {
      this.experienceFacade.loadRecommendations('explore');
    }

    if (actionId === 'pairing') {
      void this.router.navigateByUrl('/experience/pairings');
    }

    if (actionId === 'safe') {
      void this.router.navigateByUrl('/experience/recommendations');
    }
  }

  protected simulateConsumerLogin(): void {
    this.consumerAuthService.markAuthenticated({
      accessToken: 'consumer-demo-token',
      consumerAccountId: 'consumer-account-demo',
      consumerProfileId: 'consumer-profile-demo',
      displayName: 'Invitado MixMaster'
    });

    void this.router.navigateByUrl(this.route.snapshot.queryParamMap.get('redirectTo') ?? '/account');
  }
}
