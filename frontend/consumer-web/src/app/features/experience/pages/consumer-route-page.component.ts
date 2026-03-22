import { DOCUMENT, NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  PublishedMenuItemDto,
  PublishedMenuSectionDto,
  PublicApiClient,
  RecommendationItemDto
} from '@mixmaster/shared/api-clients';
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
import {
  DEMO_BENEFITS,
  DEMO_FAVORITE_PRODUCT_IDS,
  DEMO_HISTORY_TIMELINE,
  DEMO_LOYALTY_SNAPSHOT,
  DEMO_PUBLISHED_MENU
} from '../../../core/mocks/consumer-demo.data';
import { ConsumerExperienceFacade } from '../../../core/facades/consumer-experience.facade';
import { ConsumerAuthService } from '../../../core/services/consumer-auth.service';
import { ConsumerSessionService } from '../../../core/services/consumer-session.service';
import { take } from 'rxjs';

interface MenuSubsectionDetailViewModel {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  items: ProductCardViewModel[];
}

interface MenuSectionDetailViewModel extends MenuSectionViewModel {
  description?: string;
  subsections: MenuSubsectionDetailViewModel[];
}

function sortByDisplayOrder<T extends { displayOrder?: number }>(items: ReadonlyArray<T>): T[] {
  return [...items].sort((left, right) => (left.displayOrder ?? 0) - (right.displayOrder ?? 0));
}

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
    NgClass,
    ProductCardComponent,
    RecommendationCardComponent,
    RouterLink,
    TasteChipComponent,
    TenantBadgeComponent
  ],
  template: `
    <section class="space-y-8">
      <mm-app-shell-header
        [eyebrow]="content.eyebrow"
        [title]="content.title"
        [description]="content.description"
      />

      <div class="flex flex-wrap items-center gap-3">
        @if (consumerSessionService.activeBranchName()) {
          <mm-tenant-badge
            [tenantName]="consumerSessionService.activeBranchName() ?? 'Sucursal activa'"
            [branchName]="consumerSessionService.activeTableLabel() ?? ''"
          />
        }

        @if (realtimeConnectionService.status() !== 'idle') {
          <span class="rounded-pill bg-info/15 px-3 py-1 text-sm font-medium text-info">
            Realtime {{ realtimeConnectionService.status() }}
          </span>
        }
      </div>

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
          <div class="grid gap-5 xl:grid-cols-[1.08fr,0.92fr]">
            <section class="space-y-5">
              <div class="grid gap-4 lg:grid-cols-3">
                @for (intent of intents(); track intent.id) {
                  <button
                    type="button"
                    class="mm-surface flex h-full flex-col gap-3 p-5 text-left transition duration-240 ease-expressive hover:border-accent/30 hover:bg-surface-2/88"
                    [ngClass]="selectedIntent() === intent.id ? 'border-accent/40 bg-accent/8' : ''"
                    (click)="selectedIntent.set(intent.id)"
                  >
                    <p class="mm-eyebrow">{{ intent.kicker }}</p>
                    <h3 class="text-xl font-semibold text-text">{{ intent.title }}</h3>
                    <p class="text-sm leading-6 text-muted">{{ intent.description }}</p>
                  </button>
                }
              </div>

              <section class="mm-surface space-y-5 p-6">
                <div class="space-y-2">
                  <p class="mm-eyebrow">Acciones rapidas</p>
                  <h3 class="text-3xl font-semibold text-text">Parte por carta, gustos o recomendaciones</h3>
                  <p class="text-sm leading-6 text-muted">
                    La entrada rapida deja visible el mapa real de la experiencia: carta completa, perfiles efimeros o recurrentes y beneficios.
                  </p>
                </div>

                <mm-command-bar [actions]="startActions()" (actionSelected)="handleStartAction($event)" />
              </section>
            </section>

            <aside class="grid gap-4">
              <section class="mm-surface space-y-5 p-6">
                <div class="space-y-2">
                  <p class="mm-eyebrow">Carta visible</p>
                  <h3 class="text-2xl font-semibold text-text">Categorias que se entienden a primera vista</h3>
                </div>

                <div class="grid gap-3">
                  @for (section of menuPreviewSections(); track section.id) {
                    <article class="rounded-[1.3rem] border border-border/16 bg-surface-2/72 p-4">
                      <div class="flex items-center justify-between gap-3">
                        <p class="font-semibold text-text">{{ section.title }}</p>
                        <span class="rounded-pill bg-surface/72 px-3 py-1 text-xs uppercase tracking-[0.18em] text-muted">
                          {{ section.itemCount }} items
                        </span>
                      </div>
                      <p class="mt-2 text-sm leading-6 text-muted">{{ section.description }}</p>
                    </article>
                  }
                </div>
              </section>

              <section class="mm-surface space-y-5 p-6">
                <div class="space-y-2">
                  <p class="mm-eyebrow">Favoritos, historial y beneficios</p>
                  <h3 class="text-2xl font-semibold text-text">Ahora forman parte visible del flujo</h3>
                </div>

                <div class="grid gap-3 sm:grid-cols-3">
                  <article class="rounded-[1.2rem] border border-border/16 bg-surface-2/72 p-4">
                    <p class="text-sm text-muted">Favoritos</p>
                    <p class="mt-2 text-lg font-semibold text-text">{{ favoriteProducts().length }} guardados</p>
                  </article>
                  <article class="rounded-[1.2rem] border border-border/16 bg-surface-2/72 p-4">
                    <p class="text-sm text-muted">Historial</p>
                    <p class="mt-2 text-lg font-semibold text-text">{{ historyTimeline().length }} hitos</p>
                  </article>
                  <article class="rounded-[1.2rem] border border-border/16 bg-surface-2/72 p-4">
                    <p class="text-sm text-muted">Wallet</p>
                    <p class="mt-2 text-lg font-semibold text-text">{{ loyaltyPoints() }} pts</p>
                  </article>
                </div>
              </section>
            </aside>
          </div>
        }

        @case ('session') {
          <div class="grid gap-5 lg:grid-cols-[1.05fr,0.95fr]">
            <section class="mm-surface space-y-5 p-6">
              <div class="space-y-2">
                <p class="mm-eyebrow">Sesion activa</p>
                <h3 class="text-3xl font-semibold text-text">{{ consumerSessionService.activeBranchName() ?? 'Sucursal pendiente' }}</h3>
              </div>

              <div class="grid gap-3 sm:grid-cols-2">
                <article class="rounded-[1.2rem] border border-border/15 bg-surface-2/72 p-4">
                  <p class="text-sm text-muted">QR activo</p>
                  <p class="mt-2 text-base font-medium text-text">{{ consumerSessionService.activeQrCode() ?? 'Sin QR resuelto' }}</p>
                </article>
                <article class="rounded-[1.2rem] border border-border/15 bg-surface-2/72 p-4">
                  <p class="text-sm text-muted">Mesa o barra</p>
                  <p class="mt-2 text-base font-medium text-text">{{ consumerSessionService.activeTableLabel() ?? 'Consumo libre' }}</p>
                </article>
                <article class="rounded-[1.2rem] border border-border/15 bg-surface-2/72 p-4">
                  <p class="text-sm text-muted">Sesion anonima</p>
                  <p class="mt-2 text-base font-medium text-text">{{ consumerSessionService.sessionId() ?? 'Aun no persistida' }}</p>
                </article>
                <article class="rounded-[1.2rem] border border-border/15 bg-surface-2/72 p-4">
                  <p class="text-sm text-muted">Perfil</p>
                  <p class="mt-2 text-base font-medium text-text">{{ consumerSessionService.anonymousProfileId() ?? 'Aun no asignado' }}</p>
                </article>
              </div>
            </section>

            <section class="mm-surface space-y-5 p-6">
              <div class="space-y-2">
                <p class="mm-eyebrow">Lo que habilita esta sesion</p>
                <h3 class="text-3xl font-semibold text-text">Carta, recomendaciones, feedback y merge sin perder continuidad</h3>
                <p class="text-sm leading-6 text-muted">
                  Esta visita ya puede registrar gustos, picks aceptados y beneficios futuros para visitantes efimeros o usuarios recurrentes.
                </p>
              </div>

              <div class="flex flex-wrap gap-3">
                <a routerLink="/menu" class="mm-button-primary">Ir a la carta</a>
                <a routerLink="/experience/recommendations" class="mm-button-secondary">Pedir recomendaciones</a>
              </div>
            </section>
          </div>
        }

        @case ('menu') {
          @if (experienceFacade.menuStatus() === 'loading') {
            <mm-loading-skeleton [cards]="4" />
          } @else if (!publishedMenu()) {
            <mm-empty-state
              title="Carta aun no publicada"
              description="Esta sucursal todavia no tiene una carta visible para el consumidor. Publicala desde tenant o SaaS para abrir este flujo."
            />
          } @else if (isCatalogOnlyMenu()) {
            <section class="mm-surface overflow-hidden">
              <div class="grid gap-6 xl:grid-cols-[1.02fr,0.98fr]">
                <div class="space-y-5 p-6 lg:p-7">
                  <div class="space-y-3">
                    <p class="mm-eyebrow">Carta PDF + catalogo digital</p>
                    <h2 class="font-display text-4xl leading-[0.96] text-text sm:text-5xl">{{ menuBranding().venueName }}</h2>
                    <p class="max-w-2xl text-sm leading-7 text-muted">{{ menuBranding().descriptor }}</p>
                  </div>

                  <div class="flex flex-wrap gap-2.5">
                    @for (tag of menuBranding().heroTags ?? []; track tag) {
                      <span class="rounded-pill border border-border/16 bg-surface-2/72 px-3 py-1.5 text-sm text-text">{{ tag }}</span>
                    }
                  </div>

                  <div class="grid gap-3 sm:grid-cols-3">
                    <article class="rounded-[1.2rem] border border-border/15 bg-surface-2/72 p-4">
                      <p class="text-sm text-muted">Actualizada</p>
                      <p class="mt-2 text-lg font-semibold text-text">{{ menuUpdatedLabel() }}</p>
                    </article>
                    <article class="rounded-[1.2rem] border border-border/15 bg-surface-2/72 p-4">
                      <p class="text-sm text-muted">Categorias digitales</p>
                      <p class="mt-2 text-lg font-semibold text-text">{{ menuSectionDetails().length }}</p>
                    </article>
                    <article class="rounded-[1.2rem] border border-border/15 bg-surface-2/72 p-4">
                      <p class="text-sm text-muted">Catalogo activo</p>
                      <p class="mt-2 text-lg font-semibold text-text">{{ allMenuProducts().length }} productos</p>
                    </article>
                  </div>

                  <div class="flex flex-wrap gap-3">
                    @if (hasPublishedPdf()) {
                      <button type="button" class="mm-button-primary" (click)="previewPublishedMenuPdf()">Abrir carta PDF</button>
                    }
                    <a routerLink="/experience/recommendations" class="mm-button-secondary">Pedir recomendaciones</a>
                  </div>
                </div>

                <div class="relative min-h-[320px] overflow-hidden xl:min-h-full">
                  <img [src]="menuBranding().heroImageUrl ?? ''" [alt]="menuBranding().venueName" class="absolute inset-0 h-full w-full object-cover" />
                  <div class="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>
                  <div class="relative flex h-full flex-col justify-end gap-3 p-6 lg:p-7">
                    <span class="rounded-pill bg-warning/18 px-3 py-1 text-xs uppercase tracking-[0.18em] text-warning">
                      Catalogo operativo
                    </span>
                    <h3 class="text-3xl font-semibold text-text">La carta completa vive en PDF y aqui queda el catalogo digital para pedir</h3>
                    <p class="max-w-xl text-sm leading-6 text-muted">
                      Este modo deja visible el PDF oficial del local y, al mismo tiempo, mantiene un catalogo de cocteles y productos conectado al motor de recomendaciones.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            @if (menuHighlights().length) {
              <div class="grid gap-4 xl:grid-cols-3">
                @for (highlight of menuHighlights(); track highlight.id) {
                  <article class="mm-surface space-y-3 p-5">
                    <p class="mm-eyebrow">Modo PDF</p>
                    <h3 class="text-2xl font-semibold text-text">{{ highlight.title }}</h3>
                    <p class="text-sm leading-6 text-muted">{{ highlight.description }}</p>
                  </article>
                }
              </div>
            }

            <div class="grid gap-5 xl:grid-cols-[0.96fr,1.04fr]">
              <section class="mm-surface space-y-5 p-6">
                <div class="space-y-2">
                  <p class="mm-eyebrow">Carta oficial</p>
                  <h3 class="text-3xl font-semibold text-text">El PDF manda el formato; el catalogo digital manda la operacion</h3>
                  <p class="text-sm leading-6 text-muted">
                    Usa el PDF como referencia visual completa y este catalogo para pedir rapido, guardar favoritos y recibir recomendaciones sobre lo que el local cargó en MixMaster.
                  </p>
                </div>

                <div class="space-y-3">
                  @for (note of menuNotes(); track note) {
                    <article class="rounded-[1.2rem] border border-border/15 bg-surface-2/72 p-4">
                      <p class="text-sm leading-6 text-muted">{{ note }}</p>
                    </article>
                  }
                </div>
              </section>

              <section class="mm-surface space-y-5 p-6">
                <div class="space-y-2">
                  <p class="mm-eyebrow">Categorias del catalogo</p>
                  <h3 class="text-3xl font-semibold text-text">Saltos rapidos para pedir desde el flujo digital</h3>
                  <p class="text-sm leading-6 text-muted">
                    Las categorias publicadas por el local siguen visibles aqui para ordenar el catalogo que alimenta recomendaciones y seleccion.
                  </p>
                </div>

                <mm-menu-section-list [sections]="menuSections()" (sectionSelected)="scrollToMenuSection($event)" />
              </section>
            </div>

            @for (section of menuSectionDetails(); track section.id) {
              <section [attr.id]="section.id" class="space-y-5">
                <article class="mm-surface space-y-3 p-6">
                  <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div class="space-y-2">
                      <p class="mm-eyebrow">Catalogo digital</p>
                      <h3 class="text-4xl font-semibold text-text">{{ section.title }}</h3>
                      @if (section.description) {
                        <p class="max-w-3xl text-sm leading-7 text-muted">{{ section.description }}</p>
                      }
                    </div>
                    <span class="rounded-pill border border-border/18 bg-surface-2/74 px-4 py-2 text-sm text-text">
                      {{ section.itemCount }} items
                    </span>
                  </div>
                </article>

                <div class="mm-card-grid">
                  @for (item of catalogSectionProducts(section); track item.id) {
                    <mm-product-card [product]="item" (selected)="handleProductSelection($event)" />
                  }
                </div>
              </section>
            }
          } @else {
            <section class="mm-surface overflow-hidden">
              <div class="grid gap-6 xl:grid-cols-[1.08fr,0.92fr]">
                <div class="space-y-5 p-6 lg:p-7">
                  <div class="space-y-3">
                    <p class="mm-eyebrow">Carta publicada</p>
                    <h2 class="font-display text-4xl leading-[0.96] text-text sm:text-5xl">{{ menuBranding().venueName }}</h2>
                    <p class="max-w-2xl text-sm leading-7 text-muted">{{ menuBranding().descriptor }}</p>
                  </div>

                  <div class="flex flex-wrap gap-2.5">
                    @for (tag of menuBranding().heroTags ?? []; track tag) {
                      <span class="rounded-pill border border-border/16 bg-surface-2/72 px-3 py-1.5 text-sm text-text">{{ tag }}</span>
                    }
                  </div>

                  <div class="grid gap-3 sm:grid-cols-3">
                    <article class="rounded-[1.2rem] border border-border/15 bg-surface-2/72 p-4">
                      <p class="text-sm text-muted">Actualizada</p>
                      <p class="mt-2 text-lg font-semibold text-text">{{ menuUpdatedLabel() }}</p>
                    </article>
                    <article class="rounded-[1.2rem] border border-border/15 bg-surface-2/72 p-4">
                      <p class="text-sm text-muted">Secciones</p>
                      <p class="mt-2 text-lg font-semibold text-text">{{ menuSectionDetails().length }}</p>
                    </article>
                    <article class="rounded-[1.2rem] border border-border/15 bg-surface-2/72 p-4">
                      <p class="text-sm text-muted">Stock activo</p>
                      <p class="mt-2 text-lg font-semibold text-text">{{ availabilitySummary().available }} disponibles</p>
                    </article>
                  </div>
                </div>

                <div class="relative min-h-[320px] overflow-hidden xl:min-h-full">
                  <img [src]="menuBranding().heroImageUrl ?? ''" [alt]="menuBranding().venueName" class="absolute inset-0 h-full w-full object-cover" />
                  <div class="absolute inset-0 bg-gradient-to-t from-background via-background/38 to-transparent"></div>
                  <div class="relative flex h-full flex-col justify-end gap-3 p-6 lg:p-7">
                    <span class="rounded-pill bg-accent/14 px-3 py-1 text-xs uppercase tracking-[0.18em] text-accent">
                      Todo hacia abajo
                    </span>
                    <h3 class="text-3xl font-semibold text-text">La carta se despliega completa por categoria y subcategoria</h3>
                    <p class="max-w-xl text-sm leading-6 text-muted">
                      El orden lo define el local y el front respeta esa jerarquia junto con fotos, disponibilidad, descripcion y personalizaciones.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            @if (menuHighlights().length) {
              <div class="grid gap-4 xl:grid-cols-3">
                @for (highlight of menuHighlights(); track highlight.id) {
                  <article class="mm-surface space-y-3 p-5">
                    <p class="mm-eyebrow">Motor del producto</p>
                    <h3 class="text-2xl font-semibold text-text">{{ highlight.title }}</h3>
                    <p class="text-sm leading-6 text-muted">{{ highlight.description }}</p>
                  </article>
                }
              </div>
            }

            <div class="grid gap-5 xl:grid-cols-[1.02fr,0.98fr]">
              <section class="mm-surface space-y-5 p-6">
                <div class="space-y-2">
                  <p class="mm-eyebrow">Navega la carta</p>
                  <h3 class="text-3xl font-semibold text-text">Secciones reales, visibles y con anclas</h3>
                  <p class="text-sm leading-6 text-muted">
                    Usa esta capa para saltar rapido entre signatures, clasicos, zero proof y cocina de barra.
                  </p>
                </div>

                <mm-menu-section-list [sections]="menuSections()" (sectionSelected)="scrollToMenuSection($event)" />
              </section>

              <section class="mm-surface space-y-5 p-6">
                <div class="space-y-2">
                  <p class="mm-eyebrow">Preparado para consola</p>
                  <h3 class="text-3xl font-semibold text-text">El menu ya contempla campos editables por el restaurante</h3>
                </div>

                <div class="space-y-3">
                  @for (note of menuNotes(); track note) {
                    <article class="rounded-[1.2rem] border border-border/15 bg-surface-2/72 p-4">
                      <p class="text-sm leading-6 text-muted">{{ note }}</p>
                    </article>
                  }
                </div>
              </section>
            </div>

            @for (section of menuSectionDetails(); track section.id) {
              <section [attr.id]="section.id" class="space-y-5">
                <article class="mm-surface space-y-3 p-6">
                  <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div class="space-y-2">
                      <p class="mm-eyebrow">{{ section.subtitle || 'Categoria' }}</p>
                      <h3 class="text-4xl font-semibold text-text">{{ section.title }}</h3>
                      @if (section.description) {
                        <p class="max-w-3xl text-sm leading-7 text-muted">{{ section.description }}</p>
                      }
                    </div>
                    <span class="rounded-pill border border-border/18 bg-surface-2/74 px-4 py-2 text-sm text-text">
                      {{ section.itemCount }} items
                    </span>
                  </div>
                </article>

                @for (subsection of section.subsections; track subsection.id) {
                  <article class="space-y-4">
                    <div class="space-y-2">
                      <div class="flex flex-wrap items-center gap-3">
                        <h4 class="text-2xl font-semibold text-text">{{ subsection.title }}</h4>
                        @if (subsection.subtitle) {
                          <span class="rounded-pill bg-accent-2/14 px-3 py-1 text-sm font-medium text-accent-2">{{ subsection.subtitle }}</span>
                        }
                      </div>
                      @if (subsection.description) {
                        <p class="text-sm leading-6 text-muted">{{ subsection.description }}</p>
                      }
                    </div>

                    <div class="mm-card-grid">
                      @for (item of subsection.items; track item.id) {
                        <mm-product-card [product]="item" (selected)="handleProductSelection($event)" />
                      }
                    </div>
                  </article>
                }
              </section>
            }
          }
        }

        @case ('preferences') {
          <div class="grid gap-6 xl:grid-cols-2">
            <section class="mm-surface space-y-4 p-6">
              <p class="mm-eyebrow">Tus gustos</p>
              <h3 class="text-3xl font-semibold text-text">Arranquemos por lo que si quieres repetir</h3>
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

            <section class="mm-surface space-y-4 p-6">
              <p class="mm-eyebrow">Lo que prefieres evitar</p>
              <h3 class="text-3xl font-semibold text-text">Ayudanos a quitar friccion desde el primer pick</h3>
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
            <section class="mm-surface space-y-5 p-6">
              <div class="space-y-2">
                <p class="mm-eyebrow">Resultado actual</p>
                <h3 class="text-3xl font-semibold text-text">{{ recommendationHeadline() }}</h3>
                <p class="text-sm leading-6 text-muted">
                  Recomendaciones explicadas y conectadas con el contexto de mesa para visitantes efimeros y consumidores recurrentes.
                </p>
              </div>

              <div class="flex flex-wrap gap-3">
                <span class="rounded-pill bg-accent/14 px-3 py-1.5 text-sm font-medium text-accent">
                  {{ recommendationCards().length }} resultados principales
                </span>
                <span class="rounded-pill bg-surface-2/72 px-3 py-1.5 text-sm text-text">
                  Modo {{ experienceFacade.recommendations()?.mode ?? 'hybrid' }}
                </span>
              </div>
            </section>

            <div class="mm-card-grid">
              @for (recommendation of recommendationCards(); track recommendation.id) {
                <mm-recommendation-card [recommendation]="recommendation" />
              }
            </div>
          }
        }

        @case ('explore') {
          <div class="space-y-5">
            <section class="mm-surface space-y-5 p-6">
              <div class="space-y-2">
                <p class="mm-eyebrow">Exploracion controlada</p>
                <h3 class="text-3xl font-semibold text-text">Sube novedad sin perder la mano de la carta</h3>
                <p class="text-sm leading-6 text-muted">
                  Este modo empuja categorias nuevas, pairings y cambios de intensidad conservando señales de gustos y rechazos.
                </p>
              </div>

              <mm-command-bar [actions]="exploreActions()" (actionSelected)="handleExploreAction($event)" />
            </section>

            <div class="mm-card-grid">
              @for (recommendation of recommendationCards(); track recommendation.id) {
                <mm-recommendation-card [recommendation]="recommendation" />
              }
            </div>
          </div>
        }

        @case ('refine') {
          <section class="mm-surface space-y-5 p-6">
            <div class="space-y-2">
              <p class="mm-eyebrow">Refina sin reiniciar</p>
              <h3 class="text-3xl font-semibold text-text">Ajusta dulzor, intensidad y pairings en segundos</h3>
              <p class="text-sm leading-6 text-muted">
                Estas acciones representan el control incremental que luego se conectara al motor de recomendacion personalizado.
              </p>
            </div>

            <mm-command-bar [actions]="refineActions()" />
          </section>
        }

        @case ('pairings') {
          <div class="grid gap-5 lg:grid-cols-[1.08fr,0.92fr]">
            <div class="space-y-5">
              <section class="mm-surface space-y-4 p-6">
                <p class="mm-eyebrow">Pairings sugeridos</p>
                <h3 class="text-3xl font-semibold text-text">No solo que pedir, sino con que combinarlo</h3>
                <p class="text-sm leading-6 text-muted">
                  El flujo cruza cocteles, cocina y contexto de mesa para mostrar combinaciones mas faciles de aceptar y volver a pedir.
                </p>
              </section>

              <div class="mm-card-grid">
                @for (recommendation of recommendationCards(); track recommendation.id) {
                  <mm-recommendation-card [recommendation]="recommendation" />
                }
              </div>
            </div>

            <section class="mm-surface space-y-4 p-6">
              <article class="rounded-[1.2rem] border border-border/15 bg-surface-2/72 p-4">
                <p class="text-sm text-muted">Recomendacion segura</p>
                <p class="mt-2 text-xl font-semibold text-text">Garden Spritz + toast de setas</p>
                <p class="mt-2 text-sm leading-6 text-muted">
                  Frescura herbal, umami y una entrada rapida a la mesa para perfiles que quieren decidir sin desgaste.
                </p>
              </article>
              <article class="rounded-[1.2rem] border border-border/15 bg-surface-2/72 p-4">
                <p class="text-sm text-muted">Exploracion nocturna</p>
                <p class="mt-2 text-xl font-semibold text-text">Midnight Negroni + bao de panceta</p>
                <p class="mt-2 text-sm leading-6 text-muted">
                  Subes intensidad, sostienes el amargo y conviertes una segunda ronda en experiencia completa.
                </p>
              </article>
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
          <div class="space-y-5">
            <div class="grid gap-5 xl:grid-cols-[0.95fr,1.05fr]">
              <section class="mm-surface space-y-5 p-6">
                <div class="space-y-2">
                  <p class="mm-eyebrow">Favoritos visibles</p>
                  <h3 class="text-3xl font-semibold text-text">{{ favoriteProducts().length }} picks guardados para repetir o comparar</h3>
                  <p class="text-sm leading-6 text-muted">
                    La experiencia ya separa guardado temporal para sesiones efimeras y persistencia para consumidores que luego crean cuenta.
                  </p>
                </div>

                <div class="grid gap-3 sm:grid-cols-2">
                  <article class="rounded-[1.2rem] border border-border/15 bg-surface-2/72 p-4">
                    <p class="text-sm text-muted">Origen</p>
                    <p class="mt-2 text-lg font-semibold text-text">Carta + recomendaciones</p>
                  </article>
                  <article class="rounded-[1.2rem] border border-border/15 bg-surface-2/72 p-4">
                    <p class="text-sm text-muted">Persistencia</p>
                    <p class="mt-2 text-lg font-semibold text-text">Temporal o en cuenta</p>
                  </article>
                </div>
              </section>

              <section class="mm-surface space-y-5 p-6">
                <div class="space-y-2">
                  <p class="mm-eyebrow">Continuidad</p>
                  <h3 class="text-3xl font-semibold text-text">Lo que hoy te gusto no se pierde cuando decides registrarte</h3>
                  <p class="text-sm leading-6 text-muted">
                    El siguiente paso es conectar estos favoritos con merge de historial, beneficios y recompra por perfil recurrente.
                  </p>
                </div>

                <div class="flex flex-wrap gap-3">
                  <a routerLink="/register" class="mm-button-primary">Guardar en cuenta</a>
                  <a routerLink="/experience/history" class="mm-button-secondary">Ver historial</a>
                </div>
              </section>
            </div>

            <div class="mm-card-grid">
              @for (favorite of favoriteProducts(); track favorite.id) {
                <mm-product-card [product]="favorite" (selected)="handleProductSelection($event)" />
              }
            </div>
          </div>
        }

        @case ('benefits') {
          <div class="grid gap-5 xl:grid-cols-[0.95fr,1.05fr]">
            <section class="mm-surface space-y-6 p-6">
              <div class="space-y-2">
                <p class="mm-eyebrow">Wallet activa</p>
                <h3 class="text-5xl font-semibold text-text">{{ loyaltyPoints() }} pts</h3>
                <p class="text-sm leading-6 text-muted">{{ loyaltyNextReward() }}</p>
              </div>

              <div class="space-y-3">
                <div class="h-3 overflow-hidden rounded-full bg-surface-2/82">
                  <div class="h-full rounded-full bg-gradient-to-r from-accent via-accent to-accent-2" [style.width.%]="benefitProgress()"></div>
                </div>
                <div class="flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
                  <span>Nivel {{ loyaltyLevel() }}</span>
                  <span>{{ benefitProgress() }}% del siguiente upgrade</span>
                </div>
              </div>

              <div class="grid gap-3 sm:grid-cols-2">
                <article class="rounded-[1.2rem] border border-border/15 bg-surface-2/72 p-4">
                  <p class="text-sm text-muted">Canjes activos</p>
                  <p class="mt-2 text-lg font-semibold text-text">{{ benefits().length }}</p>
                </article>
                <article class="rounded-[1.2rem] border border-border/15 bg-surface-2/72 p-4">
                  <p class="text-sm text-muted">Uso ideal</p>
                  <p class="mt-2 text-lg font-semibold text-text">Durante la visita</p>
                </article>
              </div>
            </section>

            <div class="grid gap-4">
              @for (benefit of benefits(); track benefit.id) {
                <mm-benefit-card [benefit]="benefit" />
              }
            </div>
          </div>
        }

        @case ('history') {
          <div class="grid gap-5 xl:grid-cols-[0.92fr,1.08fr]">
            <section class="mm-surface space-y-5 p-6">
              <div class="space-y-2">
                <p class="mm-eyebrow">Historial visible</p>
                <h3 class="text-3xl font-semibold text-text">La sesion ya puede contar una historia entendible</h3>
                <p class="text-sm leading-6 text-muted">
                  Esto evita que historial, merge y feedback queden como rutas abstractas. Aqui se ve que paso y que se puede recuperar.
                </p>
              </div>

              <div class="space-y-3">
                @for (moment of historyTimeline(); track moment.id) {
                  <a
                    [routerLink]="moment.route"
                    class="block rounded-[1.2rem] border border-border/15 bg-surface-2/72 p-4 transition duration-240 ease-expressive hover:border-accent/24 hover:bg-surface-3/82"
                  >
                    <div class="flex items-start justify-between gap-4">
                      <div class="space-y-2">
                        <p class="text-xs uppercase tracking-[0.18em] text-accent-2">{{ moment.stageLabel }}</p>
                        <p class="text-lg font-semibold text-text">{{ moment.title }}</p>
                        <p class="text-sm leading-6 text-muted">{{ moment.description }}</p>
                      </div>
                      <span class="rounded-pill bg-surface/70 px-3 py-1 text-xs uppercase tracking-[0.18em] text-muted">Ruta</span>
                    </div>
                  </a>
                }
              </div>
            </section>

            <section class="space-y-5">
              <section class="mm-surface space-y-4 p-6">
                <p class="mm-eyebrow">Merge y continuidad</p>
                <h3 class="text-3xl font-semibold text-text">Preparado para unir visita efimera con cuenta recurrente</h3>
                <p class="text-sm leading-6 text-muted">
                  Cuando el consumidor decide registrarse, historial, favoritos y feedback se integran a su perfil persistente sin perder contexto.
                </p>
                <div class="flex flex-wrap gap-3">
                  <a routerLink="/register" class="mm-button-primary">Crear cuenta</a>
                  <a routerLink="/account/merge-history" class="mm-button-secondary">Fusionar historial</a>
                </div>
              </section>

              <div class="mm-card-grid">
                @for (product of historyProducts(); track product.id) {
                  <mm-product-card [product]="product" (selected)="handleProductSelection($event)" />
                }
              </div>
            </section>
          </div>
        }

        @case ('login') {
          <section class="mm-surface space-y-5 p-6">
            <p class="mm-eyebrow">Cuenta registrada</p>
            <h3 class="text-3xl font-semibold text-text">Entra para guardar historial, beneficios y favoritos</h3>
            <div class="grid gap-3">
              <input class="rounded-2xl border border-border/20 bg-surface-2/72 px-4 py-3 text-text" placeholder="Correo electronico" />
              <input class="rounded-2xl border border-border/20 bg-surface-2/72 px-4 py-3 text-text" placeholder="Contrasena" type="password" />
              <button type="button" class="mm-button-primary" (click)="simulateConsumerLogin()">Entrar</button>
            </div>
          </section>
        }

        @case ('register') {
          <section class="mm-surface space-y-5 p-6">
            <p class="mm-eyebrow">Cuenta despues de valor</p>
            <h3 class="text-3xl font-semibold text-text">Guarda lo que ya descubriste hoy y vuelve con continuidad real</h3>
            <div class="grid gap-3">
              <input class="rounded-2xl border border-border/20 bg-surface-2/72 px-4 py-3 text-text" placeholder="Nombre" />
              <input class="rounded-2xl border border-border/20 bg-surface-2/72 px-4 py-3 text-text" placeholder="Correo electronico" />
              <button type="button" class="mm-button-primary" (click)="simulateConsumerLogin()">Crear cuenta y seguir</button>
            </div>
          </section>
        }

        @case ('account-overview') {
          <div class="grid gap-5 lg:grid-cols-[1.1fr,0.9fr]">
            <section class="mm-surface space-y-5 p-6">
              <p class="mm-eyebrow">Cuenta activa</p>
              <h3 class="text-4xl font-semibold text-text">{{ consumerAuthService.displayName() ?? 'Consumidor MixMaster' }}</h3>
              <p class="text-sm leading-6 text-muted">
                Tu cuenta concentra historial, favoritos, beneficios y continuidad entre visitas o sucursales afiliadas.
              </p>
              <div class="flex flex-wrap gap-3">
                <a routerLink="/account/history" class="mm-button-primary">Ver historial</a>
                <a routerLink="/account/favorites" class="mm-button-secondary">Ver favoritos</a>
              </div>
            </section>

            <section class="mm-surface space-y-4 p-6">
              <p class="mm-eyebrow">Estado</p>
              <div class="space-y-3">
                <article class="rounded-[1.2rem] border border-border/15 bg-surface-2/72 p-4">
                  <p class="text-sm text-muted">Perfil persistente</p>
                  <p class="mt-2 font-semibold text-text">{{ consumerAuthService.consumerProfileId() ?? 'Pendiente' }}</p>
                </article>
                <article class="rounded-[1.2rem] border border-border/15 bg-surface-2/72 p-4">
                  <p class="text-sm text-muted">Merge potencial</p>
                  <p class="mt-2 font-semibold text-text">{{ consumerSessionService.hasAnonymousProfile() ? 'Disponible para revisar' : 'Sin merge pendiente' }}</p>
                </article>
              </div>
            </section>
          </div>
        }

        @case ('account-history') {
          <section class="space-y-5">
            <div class="mm-card-grid">
              @for (recommendation of recommendationCards(); track recommendation.id) {
                <mm-recommendation-card [recommendation]="recommendation" />
              }
            </div>

            <section class="mm-surface space-y-4 p-6">
              <p class="mm-eyebrow">Continuidad</p>
              <p class="text-sm leading-6 text-muted">
                Aqui quedaran resultados vistos, picks aceptados, feedback y sesiones fusionadas para reordenar mejor futuras visitas.
              </p>
            </section>
          </section>
        }

        @case ('account-favorites') {
          <div class="mm-card-grid">
            @for (favorite of favoriteProducts(); track favorite.id) {
              <mm-product-card [product]="favorite" (selected)="handleProductSelection($event)" />
            }
          </div>
        }

        @case ('account-benefits') {
          <div class="grid gap-5 lg:grid-cols-[1.05fr,0.95fr]">
            <section class="mm-surface space-y-5 p-6">
              <p class="mm-eyebrow">Wallet activa</p>
              <h3 class="text-5xl font-semibold text-text">{{ loyaltyPoints() }} pts</h3>
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
          <section class="mm-surface space-y-5 p-6">
            <p class="mm-eyebrow">Ajustes del perfil</p>
            <h3 class="text-3xl font-semibold text-text">Controla continuidad, consentimiento y preferencias</h3>
            <div class="grid gap-3">
              <label class="rounded-[1.2rem] border border-border/15 bg-surface-2/72 p-4 text-sm text-muted">
                <span class="block font-medium text-text">Idioma preferido</span>
                <span class="mt-1 block">Preparado para configuracion por cuenta y por tenant.</span>
              </label>
              <label class="rounded-[1.2rem] border border-border/15 bg-surface-2/72 p-4 text-sm text-muted">
                <span class="block font-medium text-text">Consentimiento y comunicacion</span>
                <span class="mt-1 block">Base lista para separar marketing, personalizacion y retencion tecnica.</span>
              </label>
              <button type="button" class="mm-button-secondary" (click)="consumerAuthService.logout()">Cerrar sesion</button>
            </div>
          </section>
        }

        @case ('merge-history') {
          <section class="mm-surface space-y-4 p-6">
            <p class="mm-eyebrow">Merge listo</p>
            <h3 class="text-3xl font-semibold text-text">Unimos tu sesion anonima a tu perfil</h3>
            <p class="text-sm leading-6 text-muted">
              Cuando el backend de merge este listo, esta pantalla consumira el contrato dedicado y mostrara resultado, conflictos y resumen.
            </p>
          </section>
        }

        @default {
          <section class="grid gap-5 lg:grid-cols-[1.05fr,0.95fr]">
            <article class="mm-surface space-y-4 p-6">
              <p class="mm-eyebrow">Proximo paso</p>
              <h3 class="text-3xl font-semibold text-text">{{ content.title }}</h3>
              <p class="text-sm leading-6 text-muted">{{ content.description }}</p>
              <mm-command-bar [actions]="genericActions()" />
            </article>

            <article class="mm-surface space-y-4 p-6">
              <p class="mm-eyebrow">Atajos utiles</p>
              @if (content.quickLinks?.length) {
                <div class="grid gap-3">
                  @for (link of content.quickLinks; track link.route) {
                    <a
                      [routerLink]="link.route"
                      class="rounded-[1.2rem] border border-border/15 bg-surface-2/72 px-4 py-4 text-sm font-medium text-text transition duration-240 ease-expressive hover:border-accent/24 hover:bg-surface-3/82"
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
        <section class="mm-surface space-y-4 p-6">
          <div>
            <p class="mm-eyebrow">Navegacion contextual</p>
            <h3 class="text-2xl font-semibold text-text">Sigue el flujo sin perder contexto</h3>
          </div>

          <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            @for (link of content.quickLinks; track link.route) {
              <a
                [routerLink]="link.route"
                class="rounded-[1.2rem] border border-border/15 bg-surface-2/72 px-4 py-4 text-sm font-medium text-text transition duration-240 ease-expressive hover:border-accent/24 hover:bg-surface-3/82"
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
  private readonly document = inject(DOCUMENT);
  private readonly publicApiClient = inject(PublicApiClient);

  protected readonly experienceFacade = inject(ConsumerExperienceFacade);
  protected readonly consumerSessionService = inject(ConsumerSessionService);
  protected readonly realtimeConnectionService = inject(RealtimeConnectionService);
  protected readonly consumerAuthService = inject(ConsumerAuthService);

  protected readonly content = this.route.snapshot.data as SectionPageContent;
  protected readonly selectedIntent = signal<'safe' | 'explore' | 'help-me-decide'>('help-me-decide');
  protected readonly selectedTastes = signal<string[]>(['citrico']);
  protected readonly selectedDislikes = signal<string[]>(['muy amargo']);
  protected readonly feedbackSentiment = signal<string | null>(null);
  protected readonly feedbackAdjustment = signal<string | null>(null);
  protected readonly tastes = signal(['citrico', 'herbal', 'frutal', 'seco', 'espumoso', 'sin alcohol']);
  protected readonly dislikes = signal(['muy dulce', 'muy amargo', 'picante', 'alto alcohol']);

  protected readonly genericActions = computed<CommandAction[]>(() =>
    (this.content.actions ?? []).map((label) => ({
      id: label.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      label
    }))
  );

  protected readonly publishedMenu = computed(() => this.experienceFacade.publishedMenu());

  protected readonly menuBranding = computed(() => ({
    ...DEMO_PUBLISHED_MENU.branding!,
    ...(this.publishedMenu()?.branding ?? {})
  }));

  protected readonly menuNotes = computed(() =>
    this.publishedMenu()?.notes?.length
      ? this.publishedMenu()?.notes ?? []
      : DEMO_PUBLISHED_MENU.notes ?? []
  );

  protected readonly menuHighlights = computed(() =>
    this.publishedMenu()?.highlights?.length
      ? this.publishedMenu()?.highlights ?? []
      : DEMO_PUBLISHED_MENU.highlights ?? []
  );

  protected readonly menuSectionDetails = computed<MenuSectionDetailViewModel[]>(() =>
    sortByDisplayOrder(this.publishedMenu()?.sections ?? []).map((section) => this.toMenuSectionDetail(section))
  );

  protected readonly menuSections = computed<MenuSectionViewModel[]>(() =>
    this.menuSectionDetails().map((section) => ({
      id: section.id,
      title: section.title,
      subtitle: section.subtitle,
      description: section.description,
      itemCount: section.itemCount
    }))
  );

  protected readonly allMenuProducts = computed<ProductCardViewModel[]>(() =>
    this.menuSectionDetails().flatMap((section) => section.subsections.flatMap((subsection) => subsection.items))
  );

  protected readonly isCatalogOnlyMenu = computed(() =>
    this.publishedMenu()?.recommendationMode === 'CATALOG_ONLY' || this.publishedMenu()?.sourceType === 'PDF'
  );

  protected readonly hasPublishedPdf = computed(() => this.publishedMenu()?.hasPdf === true);

  protected readonly recommendationCards = computed<RecommendationCardViewModel[]>(() =>
    (this.experienceFacade.recommendations()?.items ?? []).map((item) => this.toRecommendationCard(item))
  );

  protected readonly favoriteProducts = computed<ProductCardViewModel[]>(() => {
    const products = this.allMenuProducts();

    if (!products.length) {
      return (this.experienceFacade.recommendations()?.items ?? []).map((item) => ({
        id: item.productId,
        name: item.name,
        typeLabel: this.productTypeLabel(item.productType),
        shortDescription: item.summary,
        priceLabel: item.priceLabel,
        imageUrl: item.imageUrl,
        tags: item.tags,
        availabilityState: item.availabilityState,
        highlight: 'Guardado desde el motor de recomendaciones.',
        primaryActionLabel: 'Volver a mirar'
      }));
    }

    return DEMO_FAVORITE_PRODUCT_IDS
      .map((productId) => products.find((product) => product.id === productId))
      .filter((product): product is ProductCardViewModel => !!product)
      .map((product) => ({
        ...product,
        highlight: product.highlight ?? 'Guardado por afinidad o repeticion segura.',
        primaryActionLabel: 'Pedir otra vez'
      }));
  });

  protected readonly historyTimeline = signal(DEMO_HISTORY_TIMELINE);

  protected readonly historyProducts = computed<ProductCardViewModel[]>(() => {
    const products = this.allMenuProducts();

    return this.historyTimeline()
      .filter((entry) => !!entry.productId)
      .map((entry) => products.find((product) => product.id === entry.productId))
      .filter((product): product is ProductCardViewModel => !!product)
      .map((product) => ({
        ...product,
        primaryActionLabel: 'Repetir experiencia'
      }));
  });

  protected readonly benefits = computed<BenefitCardViewModel[]>(() =>
    DEMO_BENEFITS.map((benefit) => ({
      id: benefit.id,
      title: benefit.title,
      description: benefit.description,
      badge: benefit.badge,
      statusLabel: benefit.statusLabel,
      pointsCostLabel: benefit.pointsCostLabel,
      expiresLabel: benefit.expiresLabel,
      ctaLabel: benefit.ctaLabel
    }))
  );

  protected readonly menuPreviewSections = computed<MenuSectionViewModel[]>(() =>
    (this.publishedMenu()?.sections?.length ? this.publishedMenu()?.sections ?? [] : DEMO_PUBLISHED_MENU.sections).slice(0, 3).map((section) => ({
      id: section.id,
      title: section.title,
      subtitle: section.subtitle,
      description: section.description,
      itemCount: section.itemCount
    }))
  );

  protected readonly availabilitySummary = computed(() => {
    const products = this.allMenuProducts();

    return {
      available: products.filter((product) => product.availabilityState === 'available').length,
      lowStock: products.filter((product) => product.availabilityState === 'low-stock').length,
      paused: products.filter((product) => product.availabilityState === 'paused' || product.availabilityState === 'unavailable').length
    };
  });

  protected readonly recommendationHeadline = computed(() =>
    this.experienceFacade.recommendations()?.headline ?? 'Recomendaciones listas para esta visita.'
  );

  protected readonly loyaltyPoints = computed(() =>
    this.experienceFacade.loyaltySnapshot()?.pointsBalance ?? DEMO_LOYALTY_SNAPSHOT.pointsBalance
  );

  protected readonly loyaltyLevel = computed(() =>
    this.experienceFacade.loyaltySnapshot()?.levelName ?? DEMO_LOYALTY_SNAPSHOT.levelName
  );

  protected readonly loyaltyNextReward = computed(() =>
    this.experienceFacade.loyaltySnapshot()?.nextRewardLabel ?? DEMO_LOYALTY_SNAPSHOT.nextRewardLabel ?? 'Siguiente recompensa en progreso.'
  );

  protected readonly benefitProgress = computed(() => Math.min(100, Math.round((this.loyaltyPoints() / 500) * 100)));

  protected readonly menuUpdatedLabel = computed(() => this.formatDateLabel(this.experienceFacade.publishedMenu()?.updatedAt));

  constructor() {
    const qrToken = this.consumerSessionService.activeQrCode() ?? 'demo-negroni-table-12';

    switch (this.content.pageId) {
      case 'menu':
      case 'recommendations':
      case 'explore':
      case 'pairings':
      case 'favorites':
      case 'history':
      case 'account-favorites':
      case 'account-history':
        this.experienceFacade.loadPublishedMenu(qrToken);
        break;
      default:
        break;
    }

    switch (this.content.pageId) {
      case 'recommendations':
      case 'explore':
      case 'refine':
      case 'pairings':
      case 'favorites':
      case 'account-favorites':
      case 'account-history':
        this.experienceFacade.loadRecommendations(this.content.pageId === 'explore' ? 'explore' : 'hybrid');
        break;
      default:
        break;
    }

    switch (this.content.pageId) {
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
      const mode = this.selectedIntent() === 'explore' ? 'explore' : 'hybrid';
      this.experienceFacade.loadRecommendations(mode);
      void this.router.navigateByUrl(this.selectedIntent() === 'explore' ? '/experience/explore' : '/experience/recommendations');
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

  protected handleProductSelection(productId: string): void {
    const targetRoute = this.content.pageId === 'history' ? '/experience/pairings' : '/experience/recommendations';
    void productId;
    void this.router.navigateByUrl(targetRoute);
  }

  protected scrollToMenuSection(sectionId: string): void {
    this.document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  protected previewPublishedMenuPdf(): void {
    const qrToken = this.consumerSessionService.activeQrCode();
    if (!qrToken) {
      return;
    }

    this.publicApiClient.getPublishedMenuPdf(qrToken).pipe(
      take(1)
    ).subscribe((blob) => {
      const objectUrl = URL.createObjectURL(blob);
      this.document.defaultView?.open(objectUrl, '_blank', 'noopener');
      this.document.defaultView?.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    });
  }

  protected catalogSectionProducts(section: MenuSectionDetailViewModel): ProductCardViewModel[] {
    return section.subsections.flatMap((subsection) => subsection.items);
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

  private toMenuSectionDetail(section: PublishedMenuSectionDto): MenuSectionDetailViewModel {
    const subsections = sortByDisplayOrder(section.subsections ?? []).map((subsection) => ({
      id: subsection.id,
      title: subsection.title,
      subtitle: subsection.subtitle,
      description: subsection.description,
      items: subsection.items.map((item) => this.toProductCard(item))
    }));

    return {
      id: section.id,
      title: section.title,
      subtitle: section.subtitle,
      description: section.description,
      itemCount: section.itemCount,
      subsections
    };
  }

  private toProductCard(item: PublishedMenuItemDto): ProductCardViewModel {
    return {
      id: item.id,
      name: item.name,
      typeLabel: this.productTypeLabel(item.productType),
      shortDescription: item.description,
      priceLabel: item.priceLabel,
      imageUrl: item.imageUrl,
      tags: item.tags,
      availabilityState: item.availabilityState,
      highlight: item.preparationNote ?? item.featuredReason,
      customizationGroups: item.customizationGroups?.map((group) => ({
        title: group.title,
        selectionRule: group.selectionRule,
        options: group.options.map((option) => ({
          label: option.label,
          priceDeltaLabel: option.priceDeltaLabel
        }))
      })),
      primaryActionLabel: 'Ver detalle'
    };
  }

  private toRecommendationCard(item: RecommendationItemDto): RecommendationCardViewModel {
    return {
      id: item.productId,
      name: item.name,
      typeLabel: this.productTypeLabel(item.productType),
      summary: item.summary,
      score: item.score,
      priceLabel: item.priceLabel,
      reason: this.content.pageId === 'explore'
        ? 'Esta opcion estira un poco tu perfil sin irse a algo irrelevante.'
        : 'Te lo recomendamos porque cruza tus gustos actuales con el contexto de esta mesa.',
      tags: item.tags,
      imageUrl: item.imageUrl
    };
  }

  private productTypeLabel(type: PublishedMenuItemDto['productType'] | RecommendationItemDto['productType']): string {
    switch (type) {
      case 'cocktail':
        return 'Cocktail';
      case 'mocktail':
        return 'Sin alcohol';
      case 'wine':
        return 'Vino';
      case 'beer':
        return 'Cerveza';
      case 'food':
        return 'Cocina';
      case 'dessert':
        return 'Postre';
      default:
        return 'Producto';
    }
  }

  private formatDateLabel(value: string | undefined): string {
    if (!value) {
      return 'Ahora';
    }

    return new Intl.DateTimeFormat('es-CL', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(value));
  }
}
