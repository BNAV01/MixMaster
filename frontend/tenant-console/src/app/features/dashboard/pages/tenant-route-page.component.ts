import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import {
  AppShellHeaderComponent,
  AppShellSidebarComponent,
  BranchSwitcherComponent,
  CommandBarComponent,
  EmptyStateComponent,
  LoadingSkeletonComponent,
  TenantBadgeComponent
} from '@mixmaster/shared/ui-core';
import {
  AnalyticsTileComponent,
  BranchComparisonRow,
  BranchComparisonTableComponent
} from '@mixmaster/shared/ui-data-viz';
import { RealtimeConnectionService } from '@mixmaster/shared/realtime';
import { AvailabilityToggleComponent } from '@mixmaster/tenant/availability';
import { DraftPublishBannerComponent } from '@mixmaster/tenant/menu-editor';
import { SectionPageContent, CommandAction } from '@mixmaster/shared/models';
import { TenantWorkspaceFacade } from '../../../core/facades/tenant-workspace.facade';
import { TenantContextService } from '../../../core/services/tenant-context.service';
import { TENANT_NAVIGATION } from '@mixmaster/tenant/navigation';

@Component({
  selector: 'app-tenant-route-page',
  standalone: true,
  imports: [
    AnalyticsTileComponent,
    AppShellHeaderComponent,
    AppShellSidebarComponent,
    AvailabilityToggleComponent,
    BranchComparisonTableComponent,
    BranchSwitcherComponent,
    CommandBarComponent,
    DatePipe,
    DraftPublishBannerComponent,
    EmptyStateComponent,
    LoadingSkeletonComponent,
    TenantBadgeComponent
  ],
  template: `
    <div class="grid gap-6 xl:grid-cols-[18rem,1fr]">
      <mm-app-shell-sidebar
        eyebrow="Tenant console"
        title="Operacion del local"
        subtitle="Permisos, sucursal activa y flujos administrativos."
        [items]="navigation"
      />

      <section class="space-y-6">
        <mm-app-shell-header
          [eyebrow]="content.eyebrow"
          [title]="content.title"
          [description]="content.description"
        />

        <div class="flex flex-wrap items-center gap-4">
          <mm-tenant-badge tenantName="Grupo Bellavista" [branchName]="tenantContextService.activeBranch() ?? ''" />
          <mm-branch-switcher
            [branches]="tenantContextService.availableBranches()"
            [activeBranchId]="tenantContextService.activeBranch()"
            (branchChange)="tenantContextService.setActiveBranch($event)"
          />
          @if (realtimeConnectionService.status() !== 'idle') {
            <span class="rounded-pill bg-info/15 px-3 py-1 text-sm font-medium text-info">
              Realtime {{ realtimeConnectionService.status() }}
            </span>
          }
        </div>

        @switch (content.pageId) {
          @case ('dashboard') {
            @if (workspaceFacade.dashboardStatus() === 'loading') {
              <mm-loading-skeleton [cards]="4" />
            } @else {
              <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                @for (metric of workspaceFacade.dashboard()?.metrics ?? []; track metric.label) {
                  <mm-analytics-tile [label]="metric.label" [value]="metric.value" [delta]="metric.delta ?? ''" />
                }
              </div>
            }

            <mm-command-bar [actions]="dashboardActions()" />
          }

          @case ('menu-drafts') {
            <mm-draft-publish-banner
              title="Borrador listo para revision"
              description="Separa cambios estructurales de cambios operativos antes de publicar al consumer-web."
            />

            <div class="grid gap-4">
              @for (draft of workspaceFacade.menuDrafts(); track draft.draftId) {
                <article class="mm-surface flex items-center justify-between gap-4 p-4">
                  <div class="space-y-1">
                    <h3 class="text-lg font-semibold text-text">{{ draft.name }}</h3>
                    <p class="text-sm text-muted">Estado {{ draft.status }} · actualizado {{ draft.updatedAt | date: 'short' }}</p>
                  </div>
                  <button type="button" class="mm-button-secondary">Abrir draft</button>
                </article>
              }
            </div>
          }

          @case ('menu-draft-detail') {
            <mm-draft-publish-banner
              title="Draft en edicion"
              description="Esta vista queda preparada para formularios complejos, autosave y guard de cambios sin guardar."
            />
          }

          @case ('menu-published') {
            <section class="mm-surface space-y-4 p-5">
              <p class="mm-eyebrow">Carta publicada</p>
              <h3 class="text-2xl font-semibold text-text">Version visible hoy en mesa y barra</h3>
              <p class="text-sm leading-6 text-muted">Los cambios operativos siguen yendo por disponibilidad para no tocar el snapshot publicado.</p>
            </section>
          }

          @case ('products') {
            <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              @for (draft of workspaceFacade.menuDrafts(); track draft.draftId) {
                <article class="mm-surface space-y-3 p-4">
                  <p class="mm-eyebrow">Producto / catalogo</p>
                  <h3 class="text-lg font-semibold text-text">{{ draft.name }}</h3>
                  <p class="text-sm leading-6 text-muted">Base conectable a categorias, tags, ingredientes y pricing.</p>
                </article>
              }
            </section>
          }

          @case ('availability') {
            @if (workspaceFacade.availabilityStatus() === 'loading') {
              <mm-loading-skeleton [cards]="3" />
            } @else {
              <div class="grid gap-4">
                @for (item of workspaceFacade.availability(); track item.productId) {
                  <article class="mm-surface flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
                    <div class="space-y-1">
                      <h3 class="text-lg font-semibold text-text">{{ item.name }}</h3>
                      <p class="text-sm text-muted">Ultimo cambio {{ item.updatedAt | date: 'short' }}</p>
                    </div>
                    <mm-availability-toggle [label]="'Estado'" [state]="item.state" />
                  </article>
                }
              </div>
            }
          }

          @case ('analytics') {
            <div class="grid gap-4 sm:grid-cols-3">
              <mm-analytics-tile label="Revenue influido" [value]="workspaceFacade.analytics()?.influencedRevenue ?? '$1.8M'" />
              <mm-analytics-tile label="Aceptacion" [value]="workspaceFacade.analytics()?.recommendationAcceptance ?? '42%'" />
              <mm-analytics-tile label="Repeat visit" [value]="workspaceFacade.analytics()?.repeatVisitRate ?? '18%'" />
            </div>
          }

          @case ('analytics-compare') {
            <mm-branch-comparison-table [rows]="branchComparisonRows()" />
          }

          @case ('campaigns') {
            <div class="grid gap-4 lg:grid-cols-2">
              <article class="mm-surface space-y-3 p-4">
                <p class="mm-eyebrow">Campana activa</p>
                <h3 class="text-xl font-semibold text-text">Martes de mocktails</h3>
                <p class="text-sm leading-6 text-muted">Promocion orientada a momentos de baja demanda y ticket combinado con comida.</p>
              </article>
              <article class="mm-surface space-y-3 p-4">
                <p class="mm-eyebrow">Campana programada</p>
                <h3 class="text-xl font-semibold text-text">Weekend signatures</h3>
                <p class="text-sm leading-6 text-muted">Activa el viernes a las 18:00 con foco en mix premium y maridaje.</p>
              </article>
            </div>
          }

          @case ('loyalty') {
            <section class="mm-surface space-y-4 p-5">
              <p class="mm-eyebrow">Loyalty admin</p>
              <h3 class="text-2xl font-semibold text-text">Reglas, niveles y canjes operables</h3>
              <p class="text-sm leading-6 text-muted">Esta pantalla queda lista para conectar benefit rules, ledger y redenciones.</p>
            </section>
          }

          @case ('staff') {
            <section class="mm-surface space-y-4 p-5">
              <p class="mm-eyebrow">Control de acceso</p>
              <h3 class="text-2xl font-semibold text-text">Permisos actuales del usuario</h3>
              <div class="flex flex-wrap gap-2">
                @for (permission of staffPermissions(); track permission) {
                  <span class="mm-chip">{{ permission }}</span>
                }
              </div>
            </section>
          }

          @case ('settings') {
            <section class="grid gap-4 lg:grid-cols-2">
              <article class="mm-surface space-y-3 p-4">
                <p class="mm-eyebrow">Contexto tenant</p>
                <p class="text-sm leading-6 text-muted">Branding, integraciones y politicas operativas futuras.</p>
              </article>
              <article class="mm-surface space-y-3 p-4">
                <p class="mm-eyebrow">Contexto sucursal</p>
                <p class="text-sm leading-6 text-muted">Disponibilidad default, horarios, POS y configuraciones locales.</p>
              </article>
            </section>
          }

          @case ('chain-executive') {
            <mm-branch-comparison-table [rows]="branchComparisonRows()" />
          }

          @default {
            <mm-empty-state
              title="Modulo en consolidacion"
              description="La ruta ya esta definida, pero esta vista todavia no consume un caso de uso especifico."
            />
          }
        }
      </section>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TenantRoutePageComponent {
  private readonly route = inject(ActivatedRoute);
  protected readonly workspaceFacade = inject(TenantWorkspaceFacade);
  protected readonly tenantContextService = inject(TenantContextService);
  protected readonly realtimeConnectionService = inject(RealtimeConnectionService);

  protected readonly navigation = TENANT_NAVIGATION;
  protected readonly content = this.route.snapshot.data as SectionPageContent;

  constructor() {
    switch (this.content.pageId) {
      case 'dashboard':
        this.workspaceFacade.loadDashboard();
        break;
      case 'menu-drafts':
      case 'menu-draft-detail':
      case 'products':
        this.workspaceFacade.loadMenuDrafts();
        break;
      case 'availability':
        this.workspaceFacade.loadAvailability();
        break;
      case 'analytics':
      case 'analytics-compare':
      case 'chain-executive':
        this.workspaceFacade.loadAnalytics();
        break;
      default:
        break;
    }
  }

  protected dashboardActions(): CommandAction[] {
    return [
      { id: 'pause-item', label: 'Pausar producto' },
      { id: 'publish-draft', label: 'Publicar draft' },
      { id: 'view-analytics', label: 'Ir a analitica' }
    ];
  }

  protected branchComparisonRows(): BranchComparisonRow[] {
    return [
      {
        branchName: 'Bellavista',
        recommendationAcceptance: '42%',
        influencedRevenue: '$1.8M',
        availabilityHealth: 'Alta'
      },
      {
        branchName: 'Providencia',
        recommendationAcceptance: '37%',
        influencedRevenue: '$1.2M',
        availabilityHealth: 'Media'
      }
    ];
  }

  protected staffPermissions(): string[] {
    return ['tenant.dashboard.read', 'tenant.menu.write', 'tenant.availability.write', 'tenant.analytics.read'];
  }
}
