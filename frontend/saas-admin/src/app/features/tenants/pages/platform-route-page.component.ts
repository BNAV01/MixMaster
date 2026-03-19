import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PLATFORM_NAVIGATION } from '@mixmaster/platform/navigation';
import { SectionPageContent } from '@mixmaster/shared/models';
import {
  AppShellHeaderComponent,
  AppShellSidebarComponent,
  EmptyStateComponent,
  LoadingSkeletonComponent
} from '@mixmaster/shared/ui-core';
import { AnalyticsTileComponent } from '@mixmaster/shared/ui-data-viz';
import { PlatformWorkspaceFacade } from '../../../core/facades/platform-workspace.facade';

@Component({
  selector: 'app-platform-route-page',
  standalone: true,
  imports: [
    AnalyticsTileComponent,
    AppShellHeaderComponent,
    AppShellSidebarComponent,
    DatePipe,
    EmptyStateComponent,
    NgClass,
    LoadingSkeletonComponent
  ],
  template: `
    <div class="grid gap-6 xl:grid-cols-[18rem,1fr]">
      <mm-app-shell-sidebar
        eyebrow="SaaS control"
        title="Platform admin"
        subtitle="Tenants, billing, onboarding y soporte."
        [items]="navigation"
      />

      <section class="space-y-6">
        <mm-app-shell-header
          [eyebrow]="content.eyebrow"
          [title]="content.title"
          [description]="content.description"
        />

        @switch (content.pageId) {
          @case ('tenants') {
            @if (workspaceFacade.tenantsStatus() === 'loading') {
              <mm-loading-skeleton [cards]="3" />
            } @else {
              <div class="grid gap-4">
                @for (tenant of workspaceFacade.tenants(); track tenant.tenantId) {
                  <article class="mm-surface flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                    <div class="space-y-2">
                      <p class="mm-eyebrow">{{ tenant.planName }}</p>
                      <h3 class="text-xl font-semibold text-text">{{ tenant.name }}</h3>
                      <p class="text-sm text-muted">Estado {{ tenant.status }} · sucursales {{ tenant.branchCount }} · onboarding {{ tenant.onboardingState }}</p>
                    </div>
                    <button type="button" class="mm-button-secondary">Abrir detalle</button>
                  </article>
                }
              </div>
            }
          }

          @case ('tenant-detail') {
            <div class="grid gap-4 md:grid-cols-3">
              <mm-analytics-tile label="Sucursales" [value]="workspaceFacade.tenantDetail()?.branchCount?.toString() ?? '3'" />
              <mm-analytics-tile label="Marcas" [value]="workspaceFacade.tenantDetail()?.brandCount?.toString() ?? '2'" />
              <mm-analytics-tile label="Plan" [value]="workspaceFacade.tenantDetail()?.planName ?? 'Pro'" />
            </div>

            <section class="mm-surface space-y-3 p-5">
              <p class="mm-eyebrow">Detalle tenant</p>
              <h3 class="text-2xl font-semibold text-text">{{ workspaceFacade.tenantDetail()?.name ?? 'Tenant demo' }}</h3>
              <p class="text-sm leading-6 text-muted">
                Ultima actividad {{ workspaceFacade.tenantDetail()?.lastActivityAt ? (workspaceFacade.tenantDetail()?.lastActivityAt | date: 'short') : 'reciente' }}.
              </p>
            </section>
          }

          @case ('trials') {
            <div class="grid gap-4">
              @for (trial of workspaceFacade.trials(); track trial.tenantId) {
                <article class="mm-surface flex items-center justify-between gap-4 p-4">
                  <div class="space-y-1">
                    <h3 class="text-lg font-semibold text-text">{{ trial.tenantName }}</h3>
                    <p class="text-sm text-muted">Termina {{ trial.endsAt | date: 'shortDate' }} · estado {{ trial.status }}</p>
                  </div>
                  <span class="rounded-pill bg-warning/15 px-3 py-1 text-sm font-semibold text-warning">{{ trial.status }}</span>
                </article>
              }
            </div>
          }

          @case ('plans') {
            <section class="grid gap-4 lg:grid-cols-3">
              <article class="mm-surface space-y-3 p-5">
                <p class="mm-eyebrow">Basic</p>
                <h3 class="text-2xl font-semibold text-text">$ por sucursal</h3>
                <p class="text-sm leading-6 text-muted">Carta viva, QR y feedback.</p>
              </article>
              <article class="mm-surface space-y-3 border border-accent/20 p-5">
                <p class="mm-eyebrow">Pro</p>
                <h3 class="text-2xl font-semibold text-text">Plan principal</h3>
                <p class="text-sm leading-6 text-muted">Loyalty, analytics y multi-sucursal liviano.</p>
              </article>
              <article class="mm-surface space-y-3 p-5">
                <p class="mm-eyebrow">Enterprise</p>
                <h3 class="text-2xl font-semibold text-text">Cadena y gobierno</h3>
                <p class="text-sm leading-6 text-muted">Benchmark, soporte dedicado y control avanzado.</p>
              </article>
            </section>
          }

          @case ('subscriptions') {
            <div class="grid gap-4">
              @for (subscription of workspaceFacade.subscriptions(); track subscription.subscriptionId) {
                <article class="mm-surface flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
                  <div class="space-y-1">
                    <h3 class="text-lg font-semibold text-text">{{ subscription.tenantName }}</h3>
                    <p class="text-sm text-muted">{{ subscription.planName }} · {{ subscription.status }}</p>
                  </div>
                  <p class="text-sm text-muted">Renueva {{ subscription.renewalDate | date: 'shortDate' }}</p>
                </article>
              }
            </div>
          }

          @case ('onboarding') {
            <section class="mm-surface space-y-4 p-5">
              <p class="mm-eyebrow">Implementacion guiada</p>
              <h3 class="text-2xl font-semibold text-text">La carga inicial de carta sigue siendo una etapa controlada</h3>
              <p class="text-sm leading-6 text-muted">Esta vista queda preparada para milestones, checklist de menu y handoff a soporte.</p>
            </section>
          }

          @case ('support') {
            <section class="mm-surface space-y-4 p-5">
              <p class="mm-eyebrow">Support desk</p>
              <h3 class="text-2xl font-semibold text-text">Casos, incidencias y acompanamiento</h3>
              <p class="text-sm leading-6 text-muted">La siguiente iteracion puede conectar tickets, notas internas y SLA.</p>
            </section>
          }

          @case ('feature-flags') {
            <div class="grid gap-4">
              @for (flag of workspaceFacade.featureFlags(); track flag.key) {
                <article class="mm-surface flex items-center justify-between gap-4 p-4">
                  <div class="space-y-1">
                    <h3 class="text-lg font-semibold text-text">{{ flag.key }}</h3>
                    <p class="text-sm text-muted">Scope {{ flag.scope }}</p>
                  </div>
                  <span
                    class="rounded-pill px-3 py-1 text-sm font-semibold"
                    [ngClass]="{
                      'bg-success/15 text-success': flag.enabled,
                      'bg-danger/15 text-danger': !flag.enabled
                    }"
                  >
                    {{ flag.enabled ? 'Enabled' : 'Disabled' }}
                  </span>
                </article>
              }
            </div>
          }

          @default {
            <mm-empty-state
              title="Ruta SaaS en consolidacion"
              description="La consola ya tiene navegacion y contratos base, pero esta vista todavia no recibe datos especificos."
            />
          }
        }
      </section>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlatformRoutePageComponent {
  private readonly route = inject(ActivatedRoute);
  protected readonly workspaceFacade = inject(PlatformWorkspaceFacade);

  protected readonly navigation = PLATFORM_NAVIGATION;
  protected readonly content = this.route.snapshot.data as SectionPageContent;

  constructor() {
    this.workspaceFacade.loadSupportData();

    switch (this.content.pageId) {
      case 'tenants':
        this.workspaceFacade.loadTenants();
        break;
      case 'tenant-detail': {
        const tenantId = this.route.snapshot.paramMap.get('tenantId') ?? 'tenant-demo';
        this.workspaceFacade.loadTenants();
        this.workspaceFacade.loadTenantDetail(tenantId);
        break;
      }
      default:
        break;
    }
  }
}
