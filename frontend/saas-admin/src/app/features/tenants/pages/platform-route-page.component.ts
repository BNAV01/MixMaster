import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PLATFORM_NAVIGATION } from '@mixmaster/platform/navigation';
import {
  PlatformAdminApiClient,
  PlatformSubscriptionStatusDto,
  PlatformSupportTicketPriorityDto,
  PlatformSupportTicketStatusDto,
  PlatformTenantOnboardingStageDto,
  PlatformTenantStatusDto,
  TenantDetailDto,
  TenantSummaryDto
} from '@mixmaster/shared/api-clients';
import { NavigationItem, SectionPageContent } from '@mixmaster/shared/models';
import {
  AppShellHeaderComponent,
  AppShellSidebarComponent,
  EmptyStateComponent,
  LoadingSkeletonComponent
} from '@mixmaster/shared/ui-core';
import { take } from 'rxjs';
import { PlatformWorkspaceFacade } from '../../../core/facades/platform-workspace.facade';
import { PlatformSessionService } from '../../../core/services/platform-session.service';

type TenantCreateForm = {
  name: string;
  ownerEmail: string;
  ownerFullName: string;
  subscriptionPlanCode: string;
};

type TenantDetailForm = {
  tenantId: string | null;
  primaryBranchId: string | null;
  name: string;
  code: string;
  timezone: string;
  status: PlatformTenantStatusDto;
  legalName: string;
  taxId: string;
  billingEmail: string;
  billingPhone: string;
  economicActivity: string;
  siiActivityCode: string;
  taxAddress: string;
  taxCommune: string;
  taxCity: string;
  legalRepresentativeName: string;
  legalRepresentativeTaxId: string;
  subscriptionPlanCode: string;
  subscriptionStatus: PlatformSubscriptionStatusDto;
  trialEndsAt: string;
  onboardingStage: PlatformTenantOnboardingStageDto;
  siiStartActivitiesVerified: boolean;
  primaryBranchName: string;
  primaryBranchCode: string;
  currencyCode: string;
  primaryBranchAddressLine1: string;
  primaryBranchCommune: string;
  primaryBranchCity: string;
};

type TenantSortKey = 'name' | 'readiness' | 'tickets' | 'staff' | 'snapshot' | 'trial';
type SupportStatusFilter = 'ALL' | PlatformSupportTicketStatusDto;
type SupportPriorityFilter = 'ALL' | PlatformSupportTicketPriorityDto;

@Component({
  selector: 'app-platform-route-page',
  standalone: true,
  imports: [
    AppShellHeaderComponent,
    AppShellSidebarComponent,
    DatePipe,
    EmptyStateComponent,
    FormsModule,
    LoadingSkeletonComponent,
    RouterLink
  ],
  template: `
    <div class="grid gap-6 xl:grid-cols-[18rem,1fr]">
      <mm-app-shell-sidebar
        eyebrow="SaaS control"
        title="Platform admin"
        subtitle="Gobierno diario consolidado, refresh manual puntual y operación completa de tenants."
        [items]="navigation()"
      />

      <section class="space-y-6">
        <mm-app-shell-header
          [eyebrow]="content.eyebrow"
          [title]="content.title"
          [description]="content.description"
        />

        <article class="mm-surface flex flex-col gap-4 p-5 xl:flex-row xl:items-center xl:justify-between">
          <div class="space-y-1">
            <p class="mm-eyebrow">Cuenta raíz activa</p>
            <h2 class="text-xl font-semibold text-text">{{ platformSessionService.displayName() }}</h2>
            <p class="text-sm text-muted">{{ platformSessionService.actor()?.roleCode }} · {{ platformSessionService.actor()?.email }}</p>
          </div>

          <div class="flex flex-wrap gap-3">
            @if (showsWorkspaceControls()) {
              <button type="button" class="mm-button-secondary" (click)="refreshWorkspace()">
                {{ workspaceFacade.workspaceStatus() === 'loading' ? 'Actualizando...' : 'Refrescar todo ahora' }}
              </button>
            }
            <button type="button" class="mm-button-secondary" (click)="logout()">Cerrar sesión</button>
          </div>
        </article>

        @if (workspaceFacade.workspace()?.overview) {
          <article class="rounded-3xl border border-line/70 bg-panel/70 p-4 text-sm text-muted">
            Última consolidación diaria:
            <strong class="text-text">{{ workspaceFacade.workspace()?.overview?.capturedAt | date: 'medium' }}</strong>
            · modelo de carga 24h con refresh manual por tenant y global.
          </article>
        }

        @if (workspaceFacade.errorMessage()) {
          <p class="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
            {{ workspaceFacade.errorMessage() }}
          </p>
        }

        @if (downloadLabel()) {
          <p class="rounded-2xl border border-line/60 bg-panel/70 px-4 py-3 text-sm text-muted">
            Generando descarga: {{ downloadLabel() }}
          </p>
        }

        @switch (content.pageId) {
          @case ('dashboard') {
            @if (workspaceFacade.workspaceStatus() === 'loading') {
              <mm-loading-skeleton [cards]="8" />
            } @else if (workspaceFacade.workspace()) {
              <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <article class="mm-surface p-4">
                  <p class="text-sm text-muted">Tenants activos</p>
                  <p class="mt-2 text-3xl font-semibold text-text">{{ workspaceFacade.workspace()?.overview?.activeTenants }}</p>
                </article>
                <article class="mm-surface p-4">
                  <p class="text-sm text-muted">Readiness promedio</p>
                  <p class="mt-2 text-3xl font-semibold text-text">{{ workspaceFacade.workspace()?.overview?.averageReadinessScore }}/100</p>
                </article>
                <article class="mm-surface p-4">
                  <p class="text-sm text-muted">Tickets abiertos</p>
                  <p class="mt-2 text-3xl font-semibold text-text">{{ workspaceFacade.workspace()?.overview?.openTickets }}</p>
                </article>
                <article class="mm-surface p-4">
                  <p class="text-sm text-muted">Tickets urgentes</p>
                  <p class="mt-2 text-3xl font-semibold text-text">{{ workspaceFacade.workspace()?.overview?.urgentTickets }}</p>
                </article>
                <article class="mm-surface p-4">
                  <p class="text-sm text-muted">Staff total</p>
                  <p class="mt-2 text-3xl font-semibold text-text">{{ workspaceFacade.workspace()?.overview?.totalStaffUsers }}</p>
                </article>
                <article class="mm-surface p-4">
                  <p class="text-sm text-muted">Owners con reset pendiente</p>
                  <p class="mt-2 text-3xl font-semibold text-text">{{ workspaceFacade.workspace()?.overview?.ownersPendingPasswordReset }}</p>
                </article>
                <article class="mm-surface p-4">
                  <p class="text-sm text-muted">Tenants nuevos 24h</p>
                  <p class="mt-2 text-3xl font-semibold text-text">{{ workspaceFacade.workspace()?.overview?.newTenantsLast24h }}</p>
                </article>
                <article class="mm-surface p-4">
                  <p class="text-sm text-muted">SII verificado</p>
                  <p class="mt-2 text-3xl font-semibold text-text">{{ workspaceFacade.workspace()?.overview?.siiVerifiedTenants }}</p>
                </article>
              </div>

              <div class="grid gap-5 xl:grid-cols-[1.3fr,1fr]">
                <section class="space-y-4">
                  <article class="mm-surface space-y-4 p-5">
                    <div class="flex items-center justify-between gap-3">
                      <div class="space-y-1">
                        <p class="mm-eyebrow">Portafolio crítico</p>
                        <h3 class="text-2xl font-semibold text-text">Tenants que requieren atención</h3>
                      </div>
                      <a class="mm-button-secondary" routerLink="/tenants">Abrir gestor</a>
                    </div>

                    @if (riskTenants().length === 0) {
                      <mm-empty-state title="Sin riesgos mayores" description="No hay tenants con backlog crítico en la última consolidación." />
                    } @else {
                      <div class="space-y-3">
                        @for (tenant of riskTenants(); track tenant.tenantId) {
                          <article class="rounded-3xl border border-line/70 bg-panel/70 p-4">
                            <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                              <div>
                                <p class="mm-eyebrow">{{ tenant.code }} · {{ tenant.subscriptionPlanCode }}</p>
                                <h4 class="text-lg font-semibold text-text">{{ tenant.name }}</h4>
                                <p class="text-sm text-muted">
                                  readiness {{ tenant.readinessScore }}/100 · tickets {{ tenant.openTicketCount }} · captura {{ tenant.telemetryCapturedAt | date: 'short' }}
                                </p>
                              </div>
                              <div class="flex flex-wrap gap-2">
                                <button type="button" class="mm-button-secondary" (click)="refreshTenant(tenant.tenantId)">Actualizar tenant</button>
                                <a class="mm-button-secondary" [routerLink]="['/tenants', tenant.tenantId]">Detalle</a>
                              </div>
                            </div>
                          </article>
                        }
                      </div>
                    }
                  </article>

                  <article class="mm-surface space-y-4 p-5">
                    <div class="flex items-center justify-between gap-3">
                      <div class="space-y-1">
                        <p class="mm-eyebrow">Soporte y onboarding</p>
                        <h3 class="text-2xl font-semibold text-text">Backlog operativo</h3>
                      </div>
                      <a class="mm-button-secondary" routerLink="/support">Ir a soporte</a>
                    </div>
                    <div class="grid gap-3 lg:grid-cols-2">
                      @for (alert of topAlerts(); track alert.tenantId + alert.title) {
                        <article class="rounded-3xl border border-line/70 bg-panel/70 p-4">
                          <p class="mm-eyebrow">{{ alert.severity }}</p>
                          <h4 class="mt-2 text-lg font-semibold text-text">{{ alert.tenantName }}</h4>
                          <p class="mt-1 text-sm font-medium text-text">{{ alert.title }}</p>
                          <p class="mt-2 text-sm text-muted">{{ alert.description }}</p>
                        </article>
                      }
                    </div>
                  </article>
                </section>

                <section class="space-y-4">
                  <article class="mm-surface space-y-4 p-5">
                    <div class="flex items-center justify-between gap-3">
                      <div class="space-y-1">
                        <p class="mm-eyebrow">Pipeline comercial</p>
                        <h3 class="text-2xl font-semibold text-text">Distribución por plan</h3>
                      </div>
                      <a class="mm-button-secondary" routerLink="/plans">Planes</a>
                    </div>
                    <div class="space-y-3">
                      @for (plan of workspaceFacade.workspace()?.planSummaries || []; track plan.planCode) {
                        <article class="rounded-3xl border border-line/70 bg-panel/70 p-4">
                          <p class="mm-eyebrow">{{ plan.planCode }}</p>
                          <h4 class="text-2xl font-semibold text-text">{{ plan.tenantCount }}</h4>
                          <p class="text-sm text-muted">activos {{ plan.activeCount }} · trial {{ plan.trialCount }} · legal ready {{ plan.legalReadyCount }}</p>
                        </article>
                      }
                    </div>
                  </article>

                  <article class="mm-surface space-y-4 p-5">
                    <div class="flex items-center justify-between gap-3">
                      <div class="space-y-1">
                        <p class="mm-eyebrow">Exportables</p>
                        <h3 class="text-2xl font-semibold text-text">Operación Chile 2026</h3>
                      </div>
                      <button type="button" class="mm-button-primary" (click)="downloadTenantRegistry()">Registro maestro XLSX</button>
                    </div>
                    <div class="space-y-3">
                      @for (report of workspaceFacade.workspace()?.reportCatalog || []; track report.reportCode) {
                        <article class="rounded-3xl border border-line/70 bg-panel/70 p-4">
                          <p class="mm-eyebrow">{{ report.scope }}</p>
                          <h4 class="text-lg font-semibold text-text">{{ report.name }}</h4>
                          <p class="mt-2 text-sm text-muted">{{ report.description }}</p>
                        </article>
                      }
                    </div>
                  </article>
                </section>
              </div>
            }
          }

          @case ('tenants') {
            <div class="grid gap-5 xl:grid-cols-[minmax(0,24rem),1fr]">
              <form class="mm-surface space-y-4 p-5" (ngSubmit)="createTenant()">
                <div class="space-y-2">
                  <p class="mm-eyebrow">Alta mínima</p>
                  <h3 class="text-2xl font-semibold text-text">Crear tenant</h3>
                  <p class="text-sm leading-6 text-muted">
                    El alta crea tenant, marca, sucursal y la credencial del owner. La ficha legal y tributaria se completa después en el detalle.
                  </p>
                </div>

                <div class="grid gap-4 md:grid-cols-2">
                  <label class="grid gap-2">
                    <span class="text-sm font-medium text-text">Nombre comercial</span>
                    <input class="mm-input" type="text" name="name" [(ngModel)]="createForm.name" required />
                  </label>
                  <label class="grid gap-2">
                    <span class="text-sm font-medium text-text">Plan inicial</span>
                    <select class="mm-input" name="subscriptionPlanCode" [(ngModel)]="createForm.subscriptionPlanCode">
                      @for (plan of planOptions; track plan) {
                        <option [value]="plan">{{ plan }}</option>
                      }
                    </select>
                  </label>
                  <label class="grid gap-2 md:col-span-2">
                    <span class="text-sm font-medium text-text">Owner email</span>
                    <input class="mm-input" type="email" name="ownerEmail" [(ngModel)]="createForm.ownerEmail" required />
                  </label>
                  <label class="grid gap-2 md:col-span-2">
                    <span class="text-sm font-medium text-text">Owner nombre</span>
                    <input class="mm-input" type="text" name="ownerFullName" [(ngModel)]="createForm.ownerFullName" required />
                  </label>
                </div>

                <p class="rounded-2xl border border-line/60 bg-panel/70 px-4 py-3 text-sm text-muted">
                  El sistema genera automáticamente: código tenant, marca inicial con el mismo nombre comercial, sucursal inicial "Casa Matriz",
                  zona horaria America/Santiago, moneda CLP, estado TRIAL y contraseña temporal del owner con cambio obligatorio en el primer ingreso.
                </p>

                <button type="submit" class="mm-button-primary w-full" [disabled]="workspaceFacade.createStatus() === 'loading'">
                  {{ workspaceFacade.createStatus() === 'loading' ? 'Creando...' : 'Crear tenant y owner' }}
                </button>
              </form>

              <section class="space-y-4">
                @if (workspaceFacade.lastProvisionedTenant()) {
                  <article class="mm-surface space-y-3 border border-success/20 p-5">
                    <div class="space-y-1">
                      <p class="mm-eyebrow">Credencial bootstrap</p>
                      <h3 class="text-xl font-semibold text-text">{{ workspaceFacade.lastProvisionedTenant()?.name }}</h3>
                    </div>
                    <p class="text-sm text-muted">
                      Owner: {{ workspaceFacade.lastProvisionedTenant()?.bootstrapCredential?.email }}
                    </p>
                    <p class="rounded-2xl border border-line/60 bg-panel/70 px-4 py-3 text-sm text-text">
                      Password temporal: <strong>{{ workspaceFacade.lastProvisionedTenant()?.bootstrapCredential?.temporaryPassword }}</strong>
                    </p>
                  </article>
                }

                <article class="mm-surface space-y-4 p-5">
                  <div class="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                    <div class="space-y-2">
                      <p class="mm-eyebrow">Gestor ordenado</p>
                      <h3 class="text-2xl font-semibold text-text">Tenants consolidados</h3>
                    </div>

                    <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      <label class="grid gap-2">
                        <span class="text-sm font-medium text-text">Buscar</span>
                        <input class="mm-input" type="text" name="tenantSearch" [ngModel]="tenantSearch()" (ngModelChange)="tenantSearch.set($event)" />
                      </label>
                      <label class="grid gap-2">
                        <span class="text-sm font-medium text-text">Estado</span>
                        <select class="mm-input" name="tenantStatusFilter" [ngModel]="tenantStatusFilter()" (ngModelChange)="tenantStatusFilter.set($event)">
                          <option value="ALL">Todos</option>
                          @for (status of tenantStatuses; track status) {
                            <option [value]="status">{{ status }}</option>
                          }
                        </select>
                      </label>
                      <label class="grid gap-2">
                        <span class="text-sm font-medium text-text">Orden</span>
                        <select class="mm-input" name="tenantSortKey" [ngModel]="tenantSortKey()" (ngModelChange)="tenantSortKey.set($event)">
                          <option value="name">Nombre</option>
                          <option value="readiness">Readiness</option>
                          <option value="tickets">Tickets</option>
                          <option value="staff">Staff</option>
                          <option value="snapshot">Última captura</option>
                          <option value="trial">Trial</option>
                        </select>
                      </label>
                      <div class="flex items-end">
                        <button type="button" class="mm-button-secondary w-full" (click)="refreshWorkspace()">Actualizar todo</button>
                      </div>
                    </div>
                  </div>

                  @if (workspaceFacade.workspaceStatus() === 'loading') {
                    <mm-loading-skeleton [cards]="4" />
                  } @else if (sortedTenants().length === 0) {
                    <mm-empty-state title="Sin tenants registrados" description="Todavía no hay tenants en el portafolio." />
                  } @else {
                    <div class="space-y-4">
                      @for (tenant of sortedTenants(); track tenant.tenantId) {
                        <article class="mm-surface flex flex-col gap-4 border border-line/60 p-5">
                          <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                            <div class="space-y-2">
                              <p class="mm-eyebrow">{{ tenant.code }} · {{ tenant.subscriptionPlanCode }} · {{ tenant.timezone }}</p>
                              <h3 class="text-xl font-semibold text-text">{{ tenant.name }}</h3>
                              <p class="text-sm text-muted">
                                {{ tenant.legalName || 'Razón social pendiente' }} · owner {{ tenant.ownerEmail || 'sin owner' }}
                              </p>
                            </div>
                            <div class="flex flex-wrap gap-2">
                              <button type="button" class="mm-button-secondary" (click)="refreshTenant(tenant.tenantId)">Actualizar tenant</button>
                              <a class="mm-button-secondary" [routerLink]="['/tenants', tenant.tenantId]">Detalle</a>
                            </div>
                          </div>

                          <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
                            <article class="rounded-3xl border border-line/70 bg-panel/70 p-4">
                              <p class="text-sm text-muted">Estado</p>
                              <p class="mt-2 text-lg font-semibold text-text">{{ tenant.status }}</p>
                            </article>
                            <article class="rounded-3xl border border-line/70 bg-panel/70 p-4">
                              <p class="text-sm text-muted">Readiness</p>
                              <p class="mt-2 text-lg font-semibold text-text">{{ tenant.readinessScore }}/100</p>
                            </article>
                            <article class="rounded-3xl border border-line/70 bg-panel/70 p-4">
                              <p class="text-sm text-muted">Tickets</p>
                              <p class="mt-2 text-lg font-semibold text-text">{{ tenant.openTicketCount }}</p>
                            </article>
                            <article class="rounded-3xl border border-line/70 bg-panel/70 p-4">
                              <p class="text-sm text-muted">Urgentes</p>
                              <p class="mt-2 text-lg font-semibold text-text">{{ tenant.urgentTicketCount }}</p>
                            </article>
                            <article class="rounded-3xl border border-line/70 bg-panel/70 p-4">
                              <p class="text-sm text-muted">Staff</p>
                              <p class="mt-2 text-lg font-semibold text-text">{{ tenant.activeStaffUserCount }}/{{ tenant.staffUserCount }}</p>
                            </article>
                            <article class="rounded-3xl border border-line/70 bg-panel/70 p-4">
                              <p class="text-sm text-muted">Última captura</p>
                              <p class="mt-2 text-sm font-semibold text-text">{{ tenant.telemetryCapturedAt | date: 'short' }}</p>
                            </article>
                          </div>
                        </article>
                      }
                    </div>
                  }
                </article>
              </section>
            </div>
          }

          @case ('tenant-detail') {
            @if (workspaceFacade.detailStatus() === 'loading') {
              <mm-loading-skeleton [cards]="4" />
            } @else if (workspaceFacade.tenantDetail()) {
              <div class="space-y-5">
                <article class="mm-surface space-y-5 p-6">
                  <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div class="space-y-2">
                      <p class="mm-eyebrow">{{ workspaceFacade.tenantDetail()?.code }}</p>
                      <h3 class="text-3xl font-semibold text-text">{{ workspaceFacade.tenantDetail()?.name }}</h3>
                      <p class="text-sm text-muted">
                        {{ workspaceFacade.tenantDetail()?.legalName || 'Razón social pendiente' }} · {{ workspaceFacade.tenantDetail()?.status }} · {{ workspaceFacade.tenantDetail()?.subscriptionPlanCode }}
                      </p>
                    </div>
                    <div class="flex flex-wrap gap-3">
                      <button type="button" class="mm-button-secondary" (click)="refreshTenant(workspaceFacade.tenantDetail()?.tenantId || '')">Actualizar tenant</button>
                      <button type="button" class="mm-button-secondary" (click)="downloadTenantReadiness('xlsx')">Pack SII XLSX</button>
                      <button type="button" class="mm-button-secondary" (click)="downloadTenantReadiness('pdf')">Pack SII PDF</button>
                      <button type="button" class="mm-button-secondary" (click)="downloadTenantF29('xlsx')">F29 XLSX</button>
                      <button type="button" class="mm-button-secondary" (click)="downloadTenantF29('pdf')">F29 PDF</button>
                    </div>
                  </div>

                  <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
                    <article class="rounded-3xl border border-line/70 bg-panel/70 p-4">
                      <p class="text-sm text-muted">Readiness</p>
                      <p class="mt-2 text-3xl font-semibold text-text">{{ workspaceFacade.tenantDetail()?.readinessScore }}/100</p>
                    </article>
                    <article class="rounded-3xl border border-line/70 bg-panel/70 p-4">
                      <p class="text-sm text-muted">Tickets</p>
                      <p class="mt-2 text-3xl font-semibold text-text">{{ workspaceFacade.tenantDetail()?.openTicketCount }}</p>
                    </article>
                    <article class="rounded-3xl border border-line/70 bg-panel/70 p-4">
                      <p class="text-sm text-muted">Urgentes</p>
                      <p class="mt-2 text-3xl font-semibold text-text">{{ workspaceFacade.tenantDetail()?.urgentTicketCount }}</p>
                    </article>
                    <article class="rounded-3xl border border-line/70 bg-panel/70 p-4">
                      <p class="text-sm text-muted">Staff activo</p>
                      <p class="mt-2 text-3xl font-semibold text-text">{{ workspaceFacade.tenantDetail()?.activeStaffUserCount }}/{{ workspaceFacade.tenantDetail()?.staffUserCount }}</p>
                    </article>
                    <article class="rounded-3xl border border-line/70 bg-panel/70 p-4">
                      <p class="text-sm text-muted">Última captura</p>
                      <p class="mt-2 text-lg font-semibold text-text">{{ workspaceFacade.tenantDetail()?.telemetryCapturedAt | date: 'medium' }}</p>
                    </article>
                    <article class="rounded-3xl border border-line/70 bg-panel/70 p-4">
                      <p class="text-sm text-muted">Owner</p>
                      <p class="mt-2 text-lg font-semibold text-text">{{ workspaceFacade.tenantDetail()?.ownerEmail }}</p>
                    </article>
                  </div>

                  @if (workspaceFacade.tenantDetail()?.bootstrapCredential) {
                    <p class="rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-text">
                      Credencial bootstrap vigente: {{ workspaceFacade.tenantDetail()?.bootstrapCredential?.email }} /
                      <strong>{{ workspaceFacade.tenantDetail()?.bootstrapCredential?.temporaryPassword }}</strong>
                    </p>
                  }

                  @if ((workspaceFacade.tenantDetail()?.missingComplianceItems?.length || 0) > 0) {
                    <article class="rounded-3xl border border-danger/30 bg-danger/10 p-4">
                      <p class="mm-eyebrow">Brechas legales</p>
                      <div class="mt-3 flex flex-wrap gap-2">
                        @for (item of workspaceFacade.tenantDetail()?.missingComplianceItems || []; track item) {
                          <span class="rounded-full border border-danger/40 px-3 py-1 text-xs text-danger">{{ item }}</span>
                        }
                      </div>
                    </article>
                  }
                </article>

                <form class="mm-surface space-y-5 p-6" (ngSubmit)="saveTenantProfile()">
                  <div class="space-y-2">
                    <p class="mm-eyebrow">Ficha detallada</p>
                    <h3 class="text-2xl font-semibold text-text">Identidad legal, tributaria y comercial</h3>
                  </div>

                  <div class="grid gap-4 md:grid-cols-2">
                    <label class="grid gap-2">
                      <span class="text-sm font-medium text-text">Nombre comercial</span>
                      <input class="mm-input" type="text" name="detailName" [(ngModel)]="detailForm.name" required />
                    </label>
                    <label class="grid gap-2">
                      <span class="text-sm font-medium text-text">Código tenant</span>
                      <input class="mm-input" type="text" name="detailCode" [(ngModel)]="detailForm.code" required />
                    </label>
                    <label class="grid gap-2">
                      <span class="text-sm font-medium text-text">Razón social</span>
                      <input class="mm-input" type="text" name="detailLegalName" [(ngModel)]="detailForm.legalName" />
                    </label>
                    <label class="grid gap-2">
                      <span class="text-sm font-medium text-text">RUT</span>
                      <input class="mm-input" type="text" name="detailTaxId" [(ngModel)]="detailForm.taxId" />
                    </label>
                    <label class="grid gap-2">
                      <span class="text-sm font-medium text-text">Zona horaria</span>
                      <input class="mm-input" type="text" name="detailTimezone" [(ngModel)]="detailForm.timezone" />
                    </label>
                    <label class="grid gap-2">
                      <span class="text-sm font-medium text-text">Estado</span>
                      <select class="mm-input" name="detailStatus" [(ngModel)]="detailForm.status">
                        @for (status of tenantStatuses; track status) {
                          <option [value]="status">{{ status }}</option>
                        }
                      </select>
                    </label>
                    <label class="grid gap-2">
                      <span class="text-sm font-medium text-text">Plan</span>
                      <select class="mm-input" name="detailPlan" [(ngModel)]="detailForm.subscriptionPlanCode">
                        @for (plan of planOptions; track plan) {
                          <option [value]="plan">{{ plan }}</option>
                        }
                      </select>
                    </label>
                    <label class="grid gap-2">
                      <span class="text-sm font-medium text-text">Suscripción</span>
                      <select class="mm-input" name="detailSubscriptionStatus" [(ngModel)]="detailForm.subscriptionStatus">
                        @for (status of subscriptionStatuses; track status) {
                          <option [value]="status">{{ status }}</option>
                        }
                      </select>
                    </label>
                    <label class="grid gap-2">
                      <span class="text-sm font-medium text-text">Trial ends at</span>
                      <input class="mm-input" type="datetime-local" name="detailTrialEndsAt" [(ngModel)]="detailForm.trialEndsAt" />
                    </label>
                    <label class="grid gap-2">
                      <span class="text-sm font-medium text-text">Onboarding</span>
                      <select class="mm-input" name="detailOnboardingStage" [(ngModel)]="detailForm.onboardingStage">
                        @for (stage of onboardingStages; track stage) {
                          <option [value]="stage">{{ stage }}</option>
                        }
                      </select>
                    </label>
                  </div>

                  <div class="grid gap-4 md:grid-cols-2">
                    <label class="grid gap-2">
                      <span class="text-sm font-medium text-text">Correo facturación</span>
                      <input class="mm-input" type="email" name="detailBillingEmail" [(ngModel)]="detailForm.billingEmail" />
                    </label>
                    <label class="grid gap-2">
                      <span class="text-sm font-medium text-text">Teléfono facturación</span>
                      <input class="mm-input" type="text" name="detailBillingPhone" [(ngModel)]="detailForm.billingPhone" />
                    </label>
                    <label class="grid gap-2">
                      <span class="text-sm font-medium text-text">Actividad económica</span>
                      <input class="mm-input" type="text" name="detailEconomicActivity" [(ngModel)]="detailForm.economicActivity" />
                    </label>
                    <label class="grid gap-2">
                      <span class="text-sm font-medium text-text">Código actividad SII</span>
                      <input class="mm-input" type="text" name="detailSiiActivityCode" [(ngModel)]="detailForm.siiActivityCode" />
                    </label>
                    <label class="grid gap-2 md:col-span-2">
                      <span class="text-sm font-medium text-text">Domicilio tributario</span>
                      <input class="mm-input" type="text" name="detailTaxAddress" [(ngModel)]="detailForm.taxAddress" />
                    </label>
                    <label class="grid gap-2">
                      <span class="text-sm font-medium text-text">Comuna tributaria</span>
                      <input class="mm-input" type="text" name="detailTaxCommune" [(ngModel)]="detailForm.taxCommune" />
                    </label>
                    <label class="grid gap-2">
                      <span class="text-sm font-medium text-text">Ciudad tributaria</span>
                      <input class="mm-input" type="text" name="detailTaxCity" [(ngModel)]="detailForm.taxCity" />
                    </label>
                    <label class="grid gap-2">
                      <span class="text-sm font-medium text-text">Representante legal</span>
                      <input class="mm-input" type="text" name="detailLegalRepresentativeName" [(ngModel)]="detailForm.legalRepresentativeName" />
                    </label>
                    <label class="grid gap-2">
                      <span class="text-sm font-medium text-text">RUT representante</span>
                      <input class="mm-input" type="text" name="detailLegalRepresentativeTaxId" [(ngModel)]="detailForm.legalRepresentativeTaxId" />
                    </label>
                  </div>

                  <div class="grid gap-4 md:grid-cols-2">
                    <label class="grid gap-2">
                      <span class="text-sm font-medium text-text">Sucursal principal</span>
                      <input class="mm-input" type="text" name="detailPrimaryBranchName" [(ngModel)]="detailForm.primaryBranchName" />
                    </label>
                    <label class="grid gap-2">
                      <span class="text-sm font-medium text-text">Código sucursal</span>
                      <input class="mm-input" type="text" name="detailPrimaryBranchCode" [(ngModel)]="detailForm.primaryBranchCode" />
                    </label>
                    <label class="grid gap-2">
                      <span class="text-sm font-medium text-text">Moneda</span>
                      <input class="mm-input" type="text" name="detailCurrencyCode" [(ngModel)]="detailForm.currencyCode" />
                    </label>
                    <label class="grid gap-2">
                      <span class="text-sm font-medium text-text">Dirección sucursal</span>
                      <input class="mm-input" type="text" name="detailPrimaryBranchAddressLine1" [(ngModel)]="detailForm.primaryBranchAddressLine1" />
                    </label>
                    <label class="grid gap-2">
                      <span class="text-sm font-medium text-text">Comuna sucursal</span>
                      <input class="mm-input" type="text" name="detailPrimaryBranchCommune" [(ngModel)]="detailForm.primaryBranchCommune" />
                    </label>
                    <label class="grid gap-2">
                      <span class="text-sm font-medium text-text">Ciudad sucursal</span>
                      <input class="mm-input" type="text" name="detailPrimaryBranchCity" [(ngModel)]="detailForm.primaryBranchCity" />
                    </label>
                  </div>

                  <label class="flex items-center gap-3 rounded-2xl border border-line/60 bg-panel/70 px-4 py-3">
                    <input type="checkbox" name="detailSiiStartActivitiesVerified" [(ngModel)]="detailForm.siiStartActivitiesVerified" />
                    <span class="text-sm text-muted">Inicio de actividades verificado</span>
                  </label>

                  <button type="submit" class="mm-button-primary" [disabled]="workspaceFacade.updateStatus() === 'loading'">
                    {{ workspaceFacade.updateStatus() === 'loading' ? 'Guardando...' : 'Guardar cambios' }}
                  </button>
                </form>
              </div>
            } @else {
              <mm-empty-state title="Tenant no encontrado" description="El identificador solicitado no existe o ya no está disponible." />
            }
          }

          @case ('trials') {
            @if (workspaceFacade.workspaceStatus() === 'loading') {
              <mm-loading-skeleton [cards]="3" />
            } @else if (trialTenants().length === 0) {
              <mm-empty-state title="Sin trials" description="No hay tenants en trial o con vencimiento cercano." />
            } @else {
              <section class="space-y-4">
                @for (tenant of trialTenants(); track tenant.tenantId) {
                  <article class="mm-surface flex flex-col gap-3 p-5 lg:flex-row lg:items-center lg:justify-between">
                    <div class="space-y-2">
                      <p class="mm-eyebrow">{{ tenant.subscriptionPlanCode }} · {{ tenant.subscriptionStatus }}</p>
                      <h3 class="text-xl font-semibold text-text">{{ tenant.name }}</h3>
                      <p class="text-sm text-muted">
                        Trial ends {{ tenant.trialEndsAt | date: 'medium' }} · readiness {{ tenant.readinessScore }}/100
                      </p>
                    </div>
                    <div class="flex flex-wrap gap-2">
                      <button type="button" class="mm-button-secondary" (click)="refreshTenant(tenant.tenantId)">Actualizar</button>
                      <a class="mm-button-secondary" [routerLink]="['/tenants', tenant.tenantId]">Abrir detalle</a>
                    </div>
                  </article>
                }
              </section>
            }
          }

          @case ('plans') {
            @if (workspaceFacade.workspaceStatus() === 'loading') {
              <mm-loading-skeleton [cards]="3" />
            } @else {
              <div class="grid gap-4 xl:grid-cols-3">
                @for (plan of workspaceFacade.workspace()?.planSummaries || []; track plan.planCode) {
                  <article class="mm-surface space-y-3 p-5">
                    <p class="mm-eyebrow">{{ plan.planCode }}</p>
                    <h3 class="text-3xl font-semibold text-text">{{ plan.tenantCount }}</h3>
                    <p class="text-sm text-muted">
                      activos {{ plan.activeCount }} · trial {{ plan.trialCount }} · legal ready {{ plan.legalReadyCount }}
                    </p>
                  </article>
                }
              </div>
            }
          }

          @case ('subscriptions') {
            @if (workspaceFacade.workspaceStatus() === 'loading') {
              <mm-loading-skeleton [cards]="4" />
            } @else {
              <section class="space-y-4">
                @for (subscription of workspaceFacade.workspace()?.subscriptionSummaries || []; track subscription.tenantId) {
                  <article class="mm-surface flex flex-col gap-3 p-5 lg:flex-row lg:items-center lg:justify-between">
                    <div class="space-y-2">
                      <p class="mm-eyebrow">{{ subscription.planCode }} · {{ subscription.subscriptionStatus }}</p>
                      <h3 class="text-xl font-semibold text-text">{{ subscription.tenantName }}</h3>
                      <p class="text-sm text-muted">
                        Trial ends {{ subscription.trialEndsAt | date: 'medium' }} · legal ready {{ subscription.legalReady ? 'sí' : 'no' }}
                      </p>
                    </div>
                    <a class="mm-button-secondary" [routerLink]="['/tenants', subscription.tenantId]">Abrir detalle</a>
                  </article>
                }
              </section>
            }
          }

          @case ('onboarding') {
            @if (workspaceFacade.workspaceStatus() === 'loading') {
              <mm-loading-skeleton [cards]="4" />
            } @else {
              <section class="space-y-4">
                @for (item of workspaceFacade.workspace()?.onboardingQueue || []; track item.tenantId) {
                  <article class="mm-surface space-y-3 p-5">
                    <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div class="space-y-2">
                        <p class="mm-eyebrow">{{ item.stage }} · owner {{ item.ownerEmail || 'sin owner' }}</p>
                        <h3 class="text-xl font-semibold text-text">{{ item.tenantName }}</h3>
                        <p class="text-sm text-muted">{{ item.nextAction }}</p>
                      </div>
                      <a class="mm-button-secondary" [routerLink]="['/tenants', item.tenantId]">Abrir detalle</a>
                    </div>
                    <p class="text-sm text-muted">Readiness {{ item.readinessScore }}/100 · legal ready {{ item.legalReady ? 'sí' : 'no' }}</p>
                  </article>
                }
              </section>
            }
          }

          @case ('support') {
            <div class="grid gap-5 xl:grid-cols-[minmax(0,26rem),1fr]">
              <section class="mm-surface space-y-4 p-5">
                <div class="space-y-2">
                  <p class="mm-eyebrow">Bandeja SaaS</p>
                  <h3 class="text-2xl font-semibold text-text">Tickets de tenants</h3>
                </div>

                <div class="grid gap-3">
                  <label class="grid gap-2">
                    <span class="text-sm font-medium text-text">Buscar</span>
                    <input class="mm-input" type="text" name="supportSearch" [ngModel]="supportSearch()" (ngModelChange)="supportSearch.set($event)" />
                  </label>
                  <label class="grid gap-2">
                    <span class="text-sm font-medium text-text">Estado</span>
                    <select class="mm-input" name="supportStatusFilter" [ngModel]="supportStatusFilter()" (ngModelChange)="supportStatusFilter.set($event)">
                      <option value="ALL">Todos</option>
                      @for (status of supportStatuses; track status) {
                        <option [value]="status">{{ status }}</option>
                      }
                    </select>
                  </label>
                  <label class="grid gap-2">
                    <span class="text-sm font-medium text-text">Prioridad</span>
                    <select class="mm-input" name="supportPriorityFilter" [ngModel]="supportPriorityFilter()" (ngModelChange)="supportPriorityFilter.set($event)">
                      <option value="ALL">Todas</option>
                      @for (priority of supportPriorities; track priority) {
                        <option [value]="priority">{{ priority }}</option>
                      }
                    </select>
                  </label>
                </div>

                @if (workspaceFacade.supportTicketsStatus() === 'loading') {
                  <mm-loading-skeleton [cards]="4" />
                } @else if (filteredSupportTickets().length === 0) {
                  <mm-empty-state title="Sin tickets" description="No hay tickets que coincidan con los filtros actuales." />
                } @else {
                  <div class="space-y-3">
                    @for (ticket of filteredSupportTickets(); track ticket.ticketId) {
                      <button
                        type="button"
                        class="w-full rounded-3xl border border-line/70 bg-panel/70 p-4 text-left"
                        (click)="openSupportTicket(ticket.ticketId)"
                      >
                        <p class="mm-eyebrow">{{ ticket.priority }} · {{ ticket.status }}</p>
                        <h4 class="mt-2 text-lg font-semibold text-text">{{ ticket.tenantName || ticket.tenantId }}</h4>
                        <p class="mt-1 text-sm font-medium text-text">{{ ticket.subject }}</p>
                        <p class="mt-2 text-sm text-muted">{{ ticket.lastMessageAt | date: 'short' }}</p>
                      </button>
                    }
                  </div>
                }
              </section>

              <section class="space-y-4">
                @if (workspaceFacade.supportTicketDetail()) {
                  <article class="mm-surface space-y-4 p-5">
                    <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div class="space-y-2">
                        <p class="mm-eyebrow">
                          {{ workspaceFacade.supportTicketDetail()?.summary?.priority }} · {{ workspaceFacade.supportTicketDetail()?.summary?.status }}
                        </p>
                        <h3 class="text-2xl font-semibold text-text">{{ workspaceFacade.supportTicketDetail()?.summary?.subject }}</h3>
                        <p class="text-sm text-muted">
                          {{ workspaceFacade.supportTicketDetail()?.summary?.tenantName || workspaceFacade.supportTicketDetail()?.summary?.tenantId }}
                          · {{ workspaceFacade.supportTicketDetail()?.summary?.requestedByEmail }}
                        </p>
                      </div>
                      <div class="grid gap-3 sm:grid-cols-2">
                        <label class="grid gap-2">
                          <span class="text-sm font-medium text-text">Estado</span>
                          <select class="mm-input" name="ticketStatus" [(ngModel)]="ticketStatus">
                            @for (status of supportStatuses; track status) {
                              <option [value]="status">{{ status }}</option>
                            }
                          </select>
                        </label>
                        <label class="grid gap-2">
                          <span class="text-sm font-medium text-text">Prioridad</span>
                          <select class="mm-input" name="ticketPriority" [(ngModel)]="ticketPriority">
                            @for (priority of supportPriorities; track priority) {
                              <option [value]="priority">{{ priority }}</option>
                            }
                          </select>
                        </label>
                      </div>
                    </div>

                    <label class="grid gap-2">
                      <span class="text-sm font-medium text-text">Resumen de resolución</span>
                      <textarea class="mm-input min-h-28" name="ticketResolution" [(ngModel)]="ticketResolutionSummary"></textarea>
                    </label>

                    <div class="flex flex-wrap gap-2">
                      <button type="button" class="mm-button-secondary" (click)="saveSupportTicketState()">Guardar estado</button>
                      @if (workspaceFacade.supportTicketDetail()?.summary?.tenantId) {
                        <a class="mm-button-secondary" [routerLink]="['/tenants', workspaceFacade.supportTicketDetail()?.summary?.tenantId]">Abrir tenant</a>
                      }
                    </div>
                  </article>

                  <article class="mm-surface space-y-4 p-5">
                    <div class="space-y-2">
                      <p class="mm-eyebrow">Conversación</p>
                      <h3 class="text-2xl font-semibold text-text">Mensajes</h3>
                    </div>

                    <div class="space-y-3">
                      @for (message of workspaceFacade.supportTicketDetail()?.messages || []; track message.messageId) {
                        <article class="rounded-3xl border border-line/70 bg-panel/70 p-4">
                          <div class="flex items-center justify-between gap-3">
                            <p class="text-sm font-medium text-text">{{ message.authorDisplayName }}</p>
                            <p class="text-xs uppercase tracking-[0.18em] text-accent">{{ message.authorAudience }}</p>
                          </div>
                          <p class="mt-2 whitespace-pre-wrap text-sm leading-6 text-text">{{ message.body }}</p>
                          <p class="mt-3 text-xs text-muted">
                            {{ message.createdAt | date: 'medium' }} @if (message.internalNote) { · nota interna }
                          </p>
                        </article>
                      }
                    </div>

                    <label class="grid gap-2">
                      <span class="text-sm font-medium text-text">Responder</span>
                      <textarea class="mm-input min-h-32" name="supportReplyBody" [(ngModel)]="supportReplyBody"></textarea>
                    </label>

                    <label class="flex items-center gap-3 text-sm text-text">
                      <input type="checkbox" name="supportInternalNote" [(ngModel)]="supportInternalNote" />
                      <span>Guardar como nota interna</span>
                    </label>

                    <button type="button" class="mm-button-primary" (click)="replySupportTicket()">
                      {{ workspaceFacade.supportTicketSaveStatus() === 'loading' ? 'Guardando...' : 'Enviar respuesta' }}
                    </button>
                  </article>
                } @else {
                  <mm-empty-state title="Selecciona un ticket" description="Abre un ticket de la bandeja para responder o cambiar su estado." />
                }
              </section>
            </div>
          }

          @case ('feature-flags') {
            @if (workspaceFacade.workspaceStatus() === 'loading') {
              <mm-loading-skeleton [cards]="4" />
            } @else {
              <div class="grid gap-4 xl:grid-cols-2">
                @for (flag of workspaceFacade.workspace()?.featureFlags || []; track flag.code) {
                  <article class="mm-surface space-y-3 p-5">
                    <p class="mm-eyebrow">{{ flag.code }}</p>
                    <h3 class="text-xl font-semibold text-text">{{ flag.name }}</h3>
                    <p class="text-sm text-muted">{{ flag.description }}</p>
                    <p class="text-sm text-muted">Rollout: {{ flag.rolloutPolicy }}</p>
                    <p class="text-sm text-muted">Planes: {{ flag.eligiblePlans.join(', ') }}</p>
                    <p class="text-sm text-muted">Default: {{ flag.enabledByDefault ? 'Activo' : 'Desactivado' }}</p>
                  </article>
                }
              </div>
            }
          }

          @case ('reports') {
            <div class="space-y-5">
              <article class="mm-surface flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                <div class="space-y-2">
                  <p class="mm-eyebrow">Export</p>
                  <h3 class="text-2xl font-semibold text-text">Registro maestro de tenants</h3>
                  <p class="text-sm text-muted">Descarga consolidada con owner, plan, onboarding y readiness tributario.</p>
                </div>
                <button type="button" class="mm-button-primary" (click)="downloadTenantRegistry()">Descargar XLSX</button>
              </article>

              <div class="grid gap-4 xl:grid-cols-3">
                @for (report of workspaceFacade.workspace()?.reportCatalog || []; track report.reportCode) {
                  <article class="mm-surface space-y-3 p-5">
                    <p class="mm-eyebrow">{{ report.scope }}</p>
                    <h3 class="text-xl font-semibold text-text">{{ report.name }}</h3>
                    <p class="text-sm text-muted">{{ report.description }}</p>
                    <p class="text-sm text-muted">Formatos: {{ report.formats.join(', ') }}</p>
                  </article>
                }
              </div>
            </div>
          }

          @case ('account') {
            <div class="grid gap-5 xl:grid-cols-[minmax(0,26rem),1fr]">
              <article class="mm-surface space-y-4 p-5">
                <div class="space-y-2">
                  <p class="mm-eyebrow">Cuenta raíz</p>
                  <h3 class="text-2xl font-semibold text-text">Perfil SaaS Admin</h3>
                </div>

                @if (workspaceFacade.accountStatus() === 'loading') {
                  <mm-loading-skeleton [cards]="2" />
                } @else if (workspaceFacade.accountProfile()) {
                  <div class="space-y-3">
                    <article class="rounded-3xl border border-line/70 bg-panel/70 p-4">
                      <p class="text-sm text-muted">Correo</p>
                      <p class="mt-2 text-lg font-semibold text-text">{{ workspaceFacade.accountProfile()?.email }}</p>
                    </article>
                    <article class="rounded-3xl border border-line/70 bg-panel/70 p-4">
                      <p class="text-sm text-muted">Nombre</p>
                      <p class="mt-2 text-lg font-semibold text-text">{{ workspaceFacade.accountProfile()?.fullName }}</p>
                    </article>
                    <article class="rounded-3xl border border-line/70 bg-panel/70 p-4">
                      <p class="text-sm text-muted">Último acceso</p>
                      <p class="mt-2 text-lg font-semibold text-text">{{ workspaceFacade.accountProfile()?.lastLoginAt | date: 'medium' }}</p>
                    </article>
                    <article class="rounded-3xl border border-line/70 bg-panel/70 p-4">
                      <p class="text-sm text-muted">Clave vigente desde</p>
                      <p class="mt-2 text-lg font-semibold text-text">{{ workspaceFacade.accountProfile()?.passwordSetAt | date: 'medium' }}</p>
                    </article>
                    <article class="rounded-3xl border border-line/70 bg-panel/70 p-4">
                      <p class="text-sm text-muted">Sesiones activas</p>
                      <p class="mt-2 text-lg font-semibold text-text">{{ workspaceFacade.accountProfile()?.activeSessions }}</p>
                    </article>
                  </div>
                }
              </article>

              <form class="mm-surface space-y-4 p-5" (ngSubmit)="changePassword()">
                <div class="space-y-2">
                  <p class="mm-eyebrow">Seguridad</p>
                  <h3 class="text-2xl font-semibold text-text">Cambiar contraseña</h3>
                  <p class="text-sm text-muted">Al guardar se revocan las sesiones activas y se exige nuevo login.</p>
                </div>

                <label class="grid gap-2">
                  <span class="text-sm font-medium text-text">Contraseña actual</span>
                  <input class="mm-input" type="password" name="currentPassword" [(ngModel)]="currentPassword" required />
                </label>
                <label class="grid gap-2">
                  <span class="text-sm font-medium text-text">Nueva contraseña</span>
                  <input class="mm-input" type="password" name="newPassword" [(ngModel)]="newPassword" required />
                </label>
                <label class="grid gap-2">
                  <span class="text-sm font-medium text-text">Confirmar nueva contraseña</span>
                  <input class="mm-input" type="password" name="confirmPassword" [(ngModel)]="confirmPassword" required />
                </label>

                @if (passwordFormMessage()) {
                  <p class="rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-text">
                    {{ passwordFormMessage() }}
                  </p>
                }

                <button type="submit" class="mm-button-primary" [disabled]="workspaceFacade.passwordStatus() === 'loading'">
                  {{ workspaceFacade.passwordStatus() === 'loading' ? 'Actualizando...' : 'Actualizar contraseña' }}
                </button>
              </form>
            </div>
          }

          @default {
            <mm-empty-state title="Bloque no disponible" description="Esta sección todavía no tiene una vista asociada." />
          }
        }
      </section>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlatformRoutePageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly platformAdminApiClient = inject(PlatformAdminApiClient);

  protected readonly workspaceFacade = inject(PlatformWorkspaceFacade);
  protected readonly platformSessionService = inject(PlatformSessionService);

  protected readonly content = this.route.snapshot.data as SectionPageContent;
  protected readonly navigation = computed<NavigationItem[]>(() => PLATFORM_NAVIGATION.filter(
    (item) => !item.requiredPermission || this.platformSessionService.hasPermission(item.requiredPermission)
  ));
  protected readonly trialTenants = computed(() => this.workspaceFacade.tenants().filter(
    (tenant) => tenant.subscriptionStatus === 'TRIAL'
  ));
  protected readonly downloadLabel = signal<string | null>(null);

  protected readonly tenantStatuses: PlatformTenantStatusDto[] = ['TRIAL', 'ACTIVE', 'SUSPENDED', 'ARCHIVED'];
  protected readonly subscriptionStatuses: PlatformSubscriptionStatusDto[] = ['TRIAL', 'ACTIVE', 'PAST_DUE', 'SUSPENDED', 'ARCHIVED'];
  protected readonly onboardingStages: PlatformTenantOnboardingStageDto[] = [
    'OWNER_BOOTSTRAPPED',
    'LEGAL_SETUP',
    'MENU_BUILD',
    'BILLING_REVIEW',
    'READY_TO_LAUNCH',
    'LIVE'
  ];
  protected readonly supportStatuses: PlatformSupportTicketStatusDto[] = ['OPEN', 'WAITING_ON_PLATFORM', 'WAITING_ON_TENANT', 'RESOLVED', 'CLOSED'];
  protected readonly supportPriorities: PlatformSupportTicketPriorityDto[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
  protected readonly planOptions = ['FOUNDATION', 'PREMIUM', 'ENTERPRISE'];

  protected createForm: TenantCreateForm = this.createFormDefaults();
  protected detailForm: TenantDetailForm = this.detailFormDefaults();

  protected readonly tenantSearch = signal('');
  protected readonly tenantStatusFilter = signal<'ALL' | PlatformTenantStatusDto>('ALL');
  protected readonly tenantSortKey = signal<TenantSortKey>('name');
  protected readonly supportSearch = signal('');
  protected readonly supportStatusFilter = signal<SupportStatusFilter>('ALL');
  protected readonly supportPriorityFilter = signal<SupportPriorityFilter>('ALL');
  protected supportReplyBody = '';
  protected supportInternalNote = false;
  protected ticketStatus: PlatformSupportTicketStatusDto = 'OPEN';
  protected ticketPriority: PlatformSupportTicketPriorityDto = 'MEDIUM';
  protected ticketResolutionSummary = '';
  protected currentPassword = '';
  protected newPassword = '';
  protected confirmPassword = '';
  protected readonly passwordFormMessage = signal<string | null>(null);
  private readonly logoutAfterPasswordChange = signal(false);

  protected readonly sortedTenants = computed(() => {
    const search = this.tenantSearch().trim().toLowerCase();
    const filtered = this.workspaceFacade.tenants().filter((tenant) => {
      const matchesSearch = search.length === 0
        || tenant.name.toLowerCase().includes(search)
        || tenant.code.toLowerCase().includes(search)
        || (tenant.ownerEmail ?? '').toLowerCase().includes(search)
        || (tenant.legalName ?? '').toLowerCase().includes(search);
      const matchesStatus = this.tenantStatusFilter() === 'ALL' || tenant.status === this.tenantStatusFilter();
      return matchesSearch && matchesStatus;
    });

    return [...filtered].sort((left, right) => {
      switch (this.tenantSortKey()) {
        case 'readiness':
          return right.readinessScore - left.readinessScore;
        case 'tickets':
          return right.openTicketCount - left.openTicketCount;
        case 'staff':
          return right.staffUserCount - left.staffUserCount;
        case 'snapshot':
          return (right.telemetryCapturedAt ?? '').localeCompare(left.telemetryCapturedAt ?? '');
        case 'trial':
          return (right.trialEndsAt ?? '').localeCompare(left.trialEndsAt ?? '');
        default:
          return left.name.localeCompare(right.name);
      }
    });
  });

  protected readonly filteredSupportTickets = computed(() => {
    const search = this.supportSearch().trim().toLowerCase();
    return this.workspaceFacade.supportTickets().filter((ticket) => {
      const matchesSearch = search.length === 0
        || ticket.subject.toLowerCase().includes(search)
        || (ticket.tenantName ?? '').toLowerCase().includes(search)
        || ticket.requestedByEmail.toLowerCase().includes(search);
      const matchesStatus = this.supportStatusFilter() === 'ALL' || ticket.status === this.supportStatusFilter();
      const matchesPriority = this.supportPriorityFilter() === 'ALL' || ticket.priority === this.supportPriorityFilter();
      return matchesSearch && matchesStatus && matchesPriority;
    });
  });

  protected readonly riskTenants = computed(() => this.workspaceFacade.tenants()
    .filter((tenant) => tenant.readinessScore < 80 || tenant.openTicketCount > 0 || !tenant.siiStartActivitiesVerified)
    .sort((left, right) => (right.openTicketCount * 100 + (100 - right.readinessScore)) - (left.openTicketCount * 100 + (100 - left.readinessScore)))
    .slice(0, 5)
  );

  protected readonly topAlerts = computed(() => (this.workspaceFacade.workspace()?.supportAlerts || []).slice(0, 6));

  constructor() {
    this.loadCurrentPageData();

    effect(() => {
      const detail = this.workspaceFacade.tenantDetail();
      if (detail) {
        this.hydrateDetailForm(detail);
      }
    });

    effect(() => {
      if (this.workspaceFacade.createStatus() === 'success') {
        this.createForm = this.createFormDefaults();
      }
    });

    effect(() => {
      const ticket = this.workspaceFacade.supportTicketDetail();
      if (ticket) {
        this.ticketStatus = ticket.summary.status;
        this.ticketPriority = ticket.summary.priority;
        this.ticketResolutionSummary = ticket.summary.resolutionSummary ?? '';
      }
    });

    effect(() => {
      if (this.content.pageId === 'support'
        && !this.workspaceFacade.supportTicketDetail()
        && this.filteredSupportTickets().length > 0
        && this.workspaceFacade.supportTicketDetailStatus() !== 'loading') {
        this.openSupportTicket(this.filteredSupportTickets()[0].ticketId);
      }
    });

    effect(() => {
      if (this.logoutAfterPasswordChange() && this.workspaceFacade.passwordStatus() === 'success') {
        this.logoutAfterPasswordChange.set(false);
        this.passwordFormMessage.set('Contraseña actualizada. Debes iniciar sesión nuevamente.');
        this.logout();
      }
    });
  }

  protected showsWorkspaceControls(): boolean {
    return this.content.pageId !== 'account';
  }

  protected refreshWorkspace(): void {
    this.workspaceFacade.refreshWorkspace();
    if (this.content.pageId === 'support') {
      this.workspaceFacade.loadSupportTickets();
    }
  }

  protected refreshTenant(tenantId: string): void {
    if (!tenantId) {
      return;
    }
    this.workspaceFacade.refreshTenant(tenantId);
  }

  protected createTenant(): void {
    const tenantName = this.createForm.name.trim();
    const tenantCode = this.slugify(tenantName, 'tenant');
    const primaryBrandName = tenantName;
    const primaryBranchName = 'Casa Matriz';

    this.workspaceFacade.createTenant({
      name: tenantName,
      code: tenantCode,
      timezone: 'America/Santiago',
      primaryBrandName,
      primaryBrandCode: tenantCode,
      primaryBranchName,
      primaryBranchCode: 'casa-matriz',
      currencyCode: 'CLP',
      primaryBranchAddressLine1: null,
      primaryBranchCommune: null,
      primaryBranchCity: null,
      ownerEmail: this.createForm.ownerEmail.trim(),
      ownerFullName: this.createForm.ownerFullName.trim(),
      ownerPassword: null,
      legalName: null,
      taxId: null,
      billingEmail: null,
      billingPhone: null,
      economicActivity: null,
      siiActivityCode: null,
      taxAddress: null,
      taxCommune: null,
      taxCity: null,
      legalRepresentativeName: null,
      legalRepresentativeTaxId: null,
      subscriptionPlanCode: this.normalizeEmpty(this.createForm.subscriptionPlanCode),
      onboardingStage: null,
      siiStartActivitiesVerified: false,
      status: 'TRIAL'
    });
  }

  protected saveTenantProfile(): void {
    if (!this.detailForm.tenantId) {
      return;
    }

    this.workspaceFacade.updateTenantProfile(this.detailForm.tenantId, {
      name: this.normalizeEmpty(this.detailForm.name),
      code: this.normalizeEmpty(this.detailForm.code),
      timezone: this.normalizeEmpty(this.detailForm.timezone),
      status: this.detailForm.status,
      legalName: this.normalizeEmpty(this.detailForm.legalName),
      taxId: this.normalizeEmpty(this.detailForm.taxId),
      billingEmail: this.normalizeEmpty(this.detailForm.billingEmail),
      billingPhone: this.normalizeEmpty(this.detailForm.billingPhone),
      economicActivity: this.normalizeEmpty(this.detailForm.economicActivity),
      siiActivityCode: this.normalizeEmpty(this.detailForm.siiActivityCode),
      taxAddress: this.normalizeEmpty(this.detailForm.taxAddress),
      taxCommune: this.normalizeEmpty(this.detailForm.taxCommune),
      taxCity: this.normalizeEmpty(this.detailForm.taxCity),
      legalRepresentativeName: this.normalizeEmpty(this.detailForm.legalRepresentativeName),
      legalRepresentativeTaxId: this.normalizeEmpty(this.detailForm.legalRepresentativeTaxId),
      subscriptionPlanCode: this.normalizeEmpty(this.detailForm.subscriptionPlanCode),
      subscriptionStatus: this.detailForm.subscriptionStatus,
      trialEndsAt: this.toIsoDateTime(this.detailForm.trialEndsAt),
      onboardingStage: this.detailForm.onboardingStage,
      siiStartActivitiesVerified: this.detailForm.siiStartActivitiesVerified,
      primaryBranchId: this.detailForm.primaryBranchId,
      primaryBranchName: this.normalizeEmpty(this.detailForm.primaryBranchName),
      primaryBranchCode: this.normalizeEmpty(this.detailForm.primaryBranchCode),
      currencyCode: this.normalizeEmpty(this.detailForm.currencyCode),
      primaryBranchAddressLine1: this.normalizeEmpty(this.detailForm.primaryBranchAddressLine1),
      primaryBranchCommune: this.normalizeEmpty(this.detailForm.primaryBranchCommune),
      primaryBranchCity: this.normalizeEmpty(this.detailForm.primaryBranchCity)
    });
  }

  protected openSupportTicket(ticketId: string): void {
    this.workspaceFacade.loadSupportTicket(ticketId);
  }

  protected saveSupportTicketState(): void {
    const ticketId = this.workspaceFacade.supportTicketDetail()?.summary.ticketId;
    if (!ticketId) {
      return;
    }

    this.workspaceFacade.updateSupportTicket(ticketId, {
      status: this.ticketStatus,
      priority: this.ticketPriority,
      assignedPlatformUserId: null,
      resolutionSummary: this.normalizeEmpty(this.ticketResolutionSummary)
    });
  }

  protected replySupportTicket(): void {
    const ticketId = this.workspaceFacade.supportTicketDetail()?.summary.ticketId;
    if (!ticketId || !this.supportReplyBody.trim()) {
      return;
    }

    this.workspaceFacade.replySupportTicket(ticketId, {
      body: this.supportReplyBody.trim(),
      internalNote: this.supportInternalNote
    });
    this.supportReplyBody = '';
    this.supportInternalNote = false;
  }

  protected changePassword(): void {
    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.passwordFormMessage.set('Completa los tres campos de contraseña.');
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.passwordFormMessage.set('La confirmación de la nueva contraseña no coincide.');
      return;
    }

    this.passwordFormMessage.set(null);
    this.logoutAfterPasswordChange.set(true);
    this.workspaceFacade.changePassword({
      currentPassword: this.currentPassword,
      newPassword: this.newPassword
    });
  }

  protected downloadTenantRegistry(): void {
    this.downloadLabel.set('Registro maestro de tenants');
    this.platformAdminApiClient.exportTenantRegistryWorkbook().pipe(take(1)).subscribe({
      next: (blob) => this.downloadBlob(blob, 'tenant-registry.xlsx'),
      error: () => this.downloadLabel.set(null)
    });
  }

  protected downloadTenantReadiness(format: 'xlsx' | 'pdf'): void {
    const tenantId = this.workspaceFacade.tenantDetail()?.tenantId;
    if (!tenantId) {
      return;
    }

    this.downloadLabel.set(format === 'xlsx' ? 'Pack SII XLSX' : 'Pack SII PDF');
    const request$ = format === 'xlsx'
      ? this.platformAdminApiClient.exportTenantReadinessWorkbook(tenantId)
      : this.platformAdminApiClient.exportTenantReadinessPdf(tenantId);
    request$.pipe(take(1)).subscribe({
      next: (blob) => this.downloadBlob(blob, `sii-readiness-${tenantId}.${format}`),
      error: () => this.downloadLabel.set(null)
    });
  }

  protected downloadTenantF29(format: 'xlsx' | 'pdf'): void {
    const tenantId = this.workspaceFacade.tenantDetail()?.tenantId;
    if (!tenantId) {
      return;
    }

    this.downloadLabel.set(format === 'xlsx' ? 'Workbook F29 XLSX' : 'Workbook F29 PDF');
    const request$ = format === 'xlsx'
      ? this.platformAdminApiClient.exportTenantF29Workbook(tenantId)
      : this.platformAdminApiClient.exportTenantF29Pdf(tenantId);
    request$.pipe(take(1)).subscribe({
      next: (blob) => this.downloadBlob(blob, `f29-support-${tenantId}.${format}`),
      error: () => this.downloadLabel.set(null)
    });
  }

  protected logout(): void {
    this.platformSessionService.logout().pipe(take(1)).subscribe(() => {
      void this.router.navigateByUrl('/login');
    });
  }

  private loadCurrentPageData(): void {
    switch (this.content.pageId) {
      case 'tenant-detail': {
        const tenantId = this.route.snapshot.paramMap.get('tenantId');
        if (tenantId) {
          this.workspaceFacade.loadTenantDetail(tenantId);
        }
        this.workspaceFacade.loadWorkspace();
        return;
      }
      case 'support':
        this.workspaceFacade.loadWorkspace();
        this.workspaceFacade.loadSupportTickets();
        return;
      case 'account':
        this.workspaceFacade.loadAccountProfile();
        return;
      default:
        this.workspaceFacade.loadWorkspace();
        return;
    }
  }

  private hydrateDetailForm(detail: TenantDetailDto): void {
    const primaryBranch = detail.branches[0];
    this.detailForm = {
      tenantId: detail.tenantId,
      primaryBranchId: primaryBranch?.branchId ?? null,
      name: detail.name ?? '',
      code: detail.code ?? '',
      timezone: detail.timezone ?? 'America/Santiago',
      status: detail.status,
      legalName: detail.legalName ?? '',
      taxId: detail.taxId ?? '',
      billingEmail: detail.billingEmail ?? '',
      billingPhone: detail.billingPhone ?? '',
      economicActivity: detail.economicActivity ?? '',
      siiActivityCode: detail.siiActivityCode ?? '',
      taxAddress: detail.taxAddress ?? '',
      taxCommune: detail.taxCommune ?? '',
      taxCity: detail.taxCity ?? '',
      legalRepresentativeName: detail.legalRepresentativeName ?? '',
      legalRepresentativeTaxId: detail.legalRepresentativeTaxId ?? '',
      subscriptionPlanCode: detail.subscriptionPlanCode ?? 'FOUNDATION',
      subscriptionStatus: detail.subscriptionStatus,
      trialEndsAt: this.toDateTimeLocal(detail.trialEndsAt),
      onboardingStage: detail.onboardingStage,
      siiStartActivitiesVerified: detail.siiStartActivitiesVerified,
      primaryBranchName: primaryBranch?.name ?? '',
      primaryBranchCode: primaryBranch?.code ?? '',
      currencyCode: primaryBranch?.currencyCode ?? 'CLP',
      primaryBranchAddressLine1: primaryBranch?.addressLine1 ?? '',
      primaryBranchCommune: primaryBranch?.commune ?? '',
      primaryBranchCity: primaryBranch?.city ?? ''
    };
  }

  private createFormDefaults(): TenantCreateForm {
    return {
      name: '',
      ownerEmail: '',
      ownerFullName: '',
      subscriptionPlanCode: 'FOUNDATION'
    };
  }

  private detailFormDefaults(): TenantDetailForm {
    return {
      tenantId: null,
      primaryBranchId: null,
      name: '',
      code: '',
      timezone: 'America/Santiago',
      status: 'ACTIVE',
      legalName: '',
      taxId: '',
      billingEmail: '',
      billingPhone: '',
      economicActivity: '',
      siiActivityCode: '',
      taxAddress: '',
      taxCommune: '',
      taxCity: '',
      legalRepresentativeName: '',
      legalRepresentativeTaxId: '',
      subscriptionPlanCode: 'FOUNDATION',
      subscriptionStatus: 'ACTIVE',
      trialEndsAt: '',
      onboardingStage: 'OWNER_BOOTSTRAPPED',
      siiStartActivitiesVerified: false,
      primaryBranchName: '',
      primaryBranchCode: '',
      currencyCode: 'CLP',
      primaryBranchAddressLine1: '',
      primaryBranchCommune: '',
      primaryBranchCity: ''
    };
  }

  private normalizeEmpty(value: string | null | undefined): string | null {
    if (value == null) {
      return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  private toDateTimeLocal(value: string | null): string {
    if (!value) {
      return '';
    }
    return value.slice(0, 16);
  }

  private toIsoDateTime(value: string): string | null {
    if (!value) {
      return null;
    }

    return new Date(value).toISOString();
  }

  private slugify(value: string, fallback: string): string {
    const normalized = value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    return normalized || fallback;
  }

  private downloadBlob(blob: Blob, filename: string): void {
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(objectUrl);
    this.downloadLabel.set(null);
  }
}
