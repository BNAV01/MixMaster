import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TenantSupportTicketPriorityDto } from '@mixmaster/shared/api-clients';
import {
  AppShellHeaderComponent,
  AppShellSidebarComponent,
  BranchSwitcherComponent,
  EmptyStateComponent,
  LoadingSkeletonComponent,
  TenantBadgeComponent
} from '@mixmaster/shared/ui-core';
import { NavigationItem, SectionPageContent } from '@mixmaster/shared/models';
import { TENANT_NAVIGATION } from '@mixmaster/tenant/navigation';
import { TenantWorkspaceFacade } from '../../../core/facades/tenant-workspace.facade';
import { StaffSessionService } from '../../../core/services/staff-session.service';
import { TenantContextService } from '../../../core/services/tenant-context.service';
import { take } from 'rxjs';

type TenantSupportCategory = 'BILLING' | 'ONBOARDING' | 'OPERATIONS' | 'LEGAL' | 'PRODUCT' | 'INCIDENT' | 'OTHER';

@Component({
  selector: 'app-tenant-route-page',
  standalone: true,
  imports: [
    AppShellHeaderComponent,
    AppShellSidebarComponent,
    BranchSwitcherComponent,
    DatePipe,
    EmptyStateComponent,
    FormsModule,
    LoadingSkeletonComponent,
    TenantBadgeComponent
  ],
  template: `
    <div class="grid gap-6 xl:grid-cols-[18rem,1fr]">
      <mm-app-shell-sidebar
        eyebrow="Tenant console"
        title="Operacion del local"
        subtitle="Sesiones reales, scopes y usuarios internos operables."
        [items]="navigation()"
      />

      <section class="space-y-6">
        <mm-app-shell-header
          [eyebrow]="content.eyebrow"
          [title]="content.title"
          [description]="content.description"
        />

        <article class="mm-surface flex flex-col gap-4 p-5 xl:flex-row xl:items-center xl:justify-between">
          <div class="space-y-3">
            <mm-tenant-badge
              [tenantName]="staffSessionService.tenantName() ?? 'Tenant'"
              [branchName]="tenantContextService.activeBranch() ?? 'sin sucursal'"
            />
            <div class="space-y-1">
              <h2 class="text-xl font-semibold text-text">{{ staffSessionService.displayName() }}</h2>
              <p class="text-sm text-muted">
                {{ staffSessionService.roleCodes().join(', ') || 'sin roles' }} · {{ staffSessionService.actor()?.email }}
              </p>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            @if (tenantContextService.availableBranches().length > 0) {
              <mm-branch-switcher
                [branches]="tenantContextService.availableBranches()"
                [activeBranchId]="tenantContextService.activeBranch()"
                (branchChange)="changeBranch($event)"
              />
            }
            <button type="button" class="mm-button-secondary" (click)="logout()">Cerrar sesion</button>
          </div>
        </article>

        @if (workspaceFacade.errorMessage()) {
          <p class="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
            {{ workspaceFacade.errorMessage() }}
          </p>
        }

        @switch (content.pageId) {
          @case ('dashboard') {
            @if (workspaceFacade.dashboardStatus() === 'loading') {
              <mm-loading-skeleton [cards]="4" />
            } @else if (workspaceFacade.dashboard()) {
              <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                @for (metric of workspaceFacade.dashboard()?.metrics ?? []; track metric.label) {
                  <article class="mm-surface space-y-2 p-5">
                    <p class="text-sm uppercase tracking-[0.2em] text-accent">{{ metric.label }}</p>
                    <p class="text-3xl font-semibold text-text">{{ metric.value }}</p>
                    @if (metric.delta) {
                      <p class="text-sm text-muted">{{ metric.delta }}</p>
                    }
                  </article>
                }
              </div>

              <article class="mm-surface space-y-4 p-5">
                <p class="mm-eyebrow">Acceso actual</p>
                <div class="flex flex-wrap gap-2">
                  @for (permission of staffSessionService.permissions(); track permission) {
                    <span class="mm-chip">{{ permission }}</span>
                  }
                </div>
              </article>
            } @else {
              <mm-empty-state title="Sin dashboard disponible" description="No fue posible cargar métricas de acceso para este actor." />
            }
          }

          @case ('staff') {
            <div class="grid gap-5 xl:grid-cols-[minmax(0,24rem),1fr]">
              <form class="mm-surface space-y-4 p-5" (ngSubmit)="createStaffUser()">
                <div class="space-y-2">
                  <p class="mm-eyebrow">Control de acceso</p>
                  <h3 class="text-2xl font-semibold text-text">Crear usuario interno</h3>
                  <p class="text-sm leading-6 text-muted">Alta real de personal con rol, estado y scope inicial.</p>
                </div>

                <label class="grid gap-2">
                  <span class="text-sm font-medium text-text">Nombre completo</span>
                  <input class="mm-input" type="text" name="fullName" [(ngModel)]="newStaffFullName" (ngModelChange)="staffUserFormMessage.set(null)" required />
                </label>

                <label class="grid gap-2">
                  <span class="text-sm font-medium text-text">Correo</span>
                  <input class="mm-input" type="email" name="email" [(ngModel)]="newStaffEmail" (ngModelChange)="staffUserFormMessage.set(null)" required />
                </label>

                <label class="grid gap-2">
                  <span class="text-sm font-medium text-text">Contraseña inicial</span>
                  <input
                    class="mm-input"
                    type="password"
                    name="password"
                    [(ngModel)]="newStaffPassword"
                    (ngModelChange)="staffUserFormMessage.set(null)"
                    minlength="8"
                    maxlength="128"
                    required
                  />
                  <p class="text-xs text-muted">Debe tener entre 8 y 128 caracteres.</p>
                  @if (newStaffPassword && (newStaffPassword.length < 8 || newStaffPassword.length > 128)) {
                    <p class="text-sm text-danger">La contraseña inicial debe tener entre 8 y 128 caracteres.</p>
                  }
                </label>

                <label class="grid gap-2">
                  <span class="text-sm font-medium text-text">Rol</span>
                  <select class="mm-input" name="roleCode" [(ngModel)]="selectedRoleCode" (ngModelChange)="staffUserFormMessage.set(null)">
                    @for (role of workspaceFacade.roles(); track role.roleId) {
                      <option [value]="role.code">{{ role.name }}</option>
                    }
                  </select>
                </label>

                <label class="grid gap-2">
                  <span class="text-sm font-medium text-text">Scope</span>
                  <select class="mm-input" name="scopeType" [(ngModel)]="selectedScopeType" (ngModelChange)="staffUserFormMessage.set(null)">
                    <option value="TENANT">Tenant completo</option>
                    <option value="BRANCH">Sucursal especifica</option>
                  </select>
                </label>

                @if (selectedScopeType === 'BRANCH') {
                  <div class="space-y-2">
                    <span class="text-sm font-medium text-text">Sucursales del alcance</span>
                    <div class="grid gap-2">
                      @for (branch of tenantContextService.availableBranches(); track branch.id) {
                        <label class="flex items-center gap-3 rounded-2xl border border-line/70 bg-panel/70 px-4 py-3 text-sm text-text">
                          <input
                            type="checkbox"
                            [checked]="selectedBranchIds.includes(branch.id)"
                            (change)="toggleBranch(branch.id, $any($event.target).checked)"
                          />
                          <span>{{ branch.label }}</span>
                        </label>
                      }
                    </div>
                  </div>
                }

                <label class="grid gap-2">
                  <span class="text-sm font-medium text-text">Estado inicial</span>
                  <select class="mm-input" name="status" [(ngModel)]="selectedStatus" (ngModelChange)="staffUserFormMessage.set(null)">
                    <option value="ACTIVE">Activo</option>
                    <option value="INVITED">Invitado</option>
                    <option value="DISABLED">Deshabilitado</option>
                  </select>
                </label>

                <label class="flex items-center gap-3 text-sm text-text">
                  <input type="checkbox" name="requireReset" [(ngModel)]="requirePasswordReset" (ngModelChange)="staffUserFormMessage.set(null)" />
                  <span>Forzar cambio de contraseña en el primer ingreso</span>
                </label>

                @if (staffUserFormMessage()) {
                  <p class="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
                    {{ staffUserFormMessage() }}
                  </p>
                }

                <button
                  type="submit"
                  class="mm-button-primary w-full"
                  [disabled]="workspaceFacade.saveStatus() === 'loading' || !canCreateStaffUser()"
                >
                  {{ workspaceFacade.saveStatus() === 'loading' ? 'Guardando...' : 'Crear usuario interno' }}
                </button>
              </form>

              <section class="space-y-4">
                <article class="mm-surface space-y-4 p-5">
                  <div class="space-y-2">
                    <p class="mm-eyebrow">Catálogo de roles</p>
                    <h3 class="text-2xl font-semibold text-text">Permisos base del tenant</h3>
                  </div>

                  @if (workspaceFacade.rolesStatus() === 'loading') {
                    <mm-loading-skeleton [cards]="2" />
                  } @else {
                    <div class="grid gap-3 lg:grid-cols-2">
                      @for (role of workspaceFacade.roles(); track role.roleId) {
                        <article class="rounded-3xl border border-line/70 bg-panel/70 p-4">
                          <p class="text-sm uppercase tracking-[0.18em] text-accent">{{ role.code }}</p>
                          <h4 class="mt-2 text-lg font-semibold text-text">{{ role.name }}</h4>
                          <p class="mt-2 text-sm leading-6 text-muted">{{ role.description }}</p>
                          <p class="mt-3 text-sm text-muted">{{ role.permissions.length }} permisos vinculados</p>
                        </article>
                      }
                    </div>
                  }
                </article>

                <article class="mm-surface space-y-4 p-5">
                  <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div class="space-y-2">
                      <p class="mm-eyebrow">Staff real</p>
                      <h3 class="text-2xl font-semibold text-text">Usuarios internos del tenant</h3>
                    </div>
                    <label class="grid gap-2 lg:min-w-[18rem]">
                      <span class="text-sm font-medium text-text">Clave temporal para reset</span>
                      <input class="mm-input" type="password" name="resetPassword" [(ngModel)]="temporaryPassword" />
                    </label>
                  </div>

                  @if (workspaceFacade.staffUsersStatus() === 'loading') {
                    <mm-loading-skeleton [cards]="3" />
                  } @else if (workspaceFacade.staffUsers().length === 0) {
                    <mm-empty-state title="Sin usuarios internos" description="Aún no hay usuarios creados para este tenant aparte del owner inicial." />
                  } @else {
                    <div class="grid gap-4">
                      @for (staffUser of workspaceFacade.staffUsers(); track staffUser.userId) {
                        <article class="rounded-3xl border border-line/70 bg-panel/70 p-5">
                          <div class="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                            <div class="space-y-3">
                              <div>
                                <h4 class="text-xl font-semibold text-text">{{ staffUser.fullName }}</h4>
                                <p class="text-sm text-muted">{{ staffUser.email }} · {{ staffUser.status }}</p>
                              </div>
                              <div class="flex flex-wrap gap-2">
                                @for (assignment of staffUser.assignments; track assignment.assignmentId) {
                                  <span class="mm-chip">
                                    {{ assignment.roleName }} · {{ assignment.scopeType }} @ {{ assignment.branchName ?? assignment.brandName ?? 'tenant' }}
                                  </span>
                                }
                              </div>
                              <p class="text-sm text-muted">
                                Último acceso {{ staffUser.lastLoginAt ? (staffUser.lastLoginAt | date: 'short') : 'sin acceso todavía' }}
                              </p>
                            </div>

                            <div class="flex flex-wrap gap-2">
                              <button
                                type="button"
                                class="mm-button-secondary"
                                (click)="toggleStatus(staffUser.userId, staffUser.status)"
                              >
                                {{ staffUser.status === 'ACTIVE' ? 'Bloquear' : 'Activar' }}
                              </button>
                              <button
                                type="button"
                                class="mm-button-secondary"
                                [disabled]="!temporaryPassword.trim()"
                                (click)="resetPassword(staffUser.userId)"
                              >
                                Resetear clave
                              </button>
                            </div>
                          </div>
                        </article>
                      }
                    </div>
                  }
                </article>
              </section>
            </div>
          }

          @case ('branches') {
            @if (workspaceFacade.organizationStatus() === 'loading') {
              <mm-loading-skeleton [cards]="4" />
            } @else if (workspaceFacade.organization()) {
              <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <article class="mm-surface space-y-2 p-5">
                  <p class="text-sm uppercase tracking-[0.2em] text-accent">Marcas</p>
                  <p class="text-3xl font-semibold text-text">{{ workspaceFacade.organization()?.brandCount }}</p>
                </article>
                <article class="mm-surface space-y-2 p-5">
                  <p class="text-sm uppercase tracking-[0.2em] text-accent">Sucursales visibles</p>
                  <p class="text-3xl font-semibold text-text">{{ workspaceFacade.organization()?.visibleBranchCount }}</p>
                </article>
                <article class="mm-surface space-y-2 p-5">
                  <p class="text-sm uppercase tracking-[0.2em] text-accent">Total tenant</p>
                  <p class="text-3xl font-semibold text-text">{{ workspaceFacade.organization()?.totalBranchCount }}</p>
                </article>
                <article class="mm-surface space-y-2 p-5">
                  <p class="text-sm uppercase tracking-[0.2em] text-accent">Acceso cruzado</p>
                  <p class="text-3xl font-semibold text-text">
                    {{ workspaceFacade.organization()?.crossBranchAccess ? 'Sí' : 'No' }}
                  </p>
                </article>
              </div>

              <div class="grid gap-5 xl:grid-cols-[minmax(0,24rem),1fr]">
                <section class="space-y-4">
                  @if (staffSessionService.hasPermission('tenant.branches.write')) {
                    <form class="mm-surface space-y-4 p-5" (ngSubmit)="createBrand()">
                      <div class="space-y-2">
                        <p class="mm-eyebrow">Nueva marca</p>
                        <h3 class="text-2xl font-semibold text-text">Alta de brand</h3>
                        <p class="text-sm leading-6 text-muted">La estructura nace desde flujo real, sin datos demo precargados.</p>
                      </div>

                      <label class="grid gap-2">
                        <span class="text-sm font-medium text-text">Código</span>
                        <input class="mm-input" type="text" name="brandCode" [(ngModel)]="newBrandCode" required />
                      </label>

                      <label class="grid gap-2">
                        <span class="text-sm font-medium text-text">Nombre</span>
                        <input class="mm-input" type="text" name="brandName" [(ngModel)]="newBrandName" required />
                      </label>

                      <button type="submit" class="mm-button-primary w-full" [disabled]="workspaceFacade.saveStatus() === 'loading'">
                        {{ workspaceFacade.saveStatus() === 'loading' ? 'Guardando...' : 'Crear marca' }}
                      </button>
                    </form>

                    <form class="mm-surface space-y-4 p-5" (ngSubmit)="createBranch()">
                      <div class="space-y-2">
                        <p class="mm-eyebrow">Nueva sucursal</p>
                        <h3 class="text-2xl font-semibold text-text">Alta de branch</h3>
                        <p class="text-sm leading-6 text-muted">Disponible solo para operadores con gobierno real de estructura.</p>
                      </div>

                      <label class="grid gap-2">
                        <span class="text-sm font-medium text-text">Marca</span>
                        <select class="mm-input" name="branchBrandId" [(ngModel)]="newBranchBrandId" required>
                          <option value="" disabled>Selecciona una marca</option>
                          @for (brand of workspaceFacade.organization()?.brands ?? []; track brand.brandId) {
                            <option [value]="brand.brandId">{{ brand.name }}</option>
                          }
                        </select>
                      </label>

                      <label class="grid gap-2">
                        <span class="text-sm font-medium text-text">Código</span>
                        <input class="mm-input" type="text" name="branchCode" [(ngModel)]="newBranchCode" required />
                      </label>

                      <label class="grid gap-2">
                        <span class="text-sm font-medium text-text">Nombre</span>
                        <input class="mm-input" type="text" name="branchName" [(ngModel)]="newBranchName" required />
                      </label>

                      <label class="grid gap-2">
                        <span class="text-sm font-medium text-text">Zona horaria</span>
                        <input class="mm-input" type="text" name="branchTimezone" [(ngModel)]="newBranchTimezone" required />
                      </label>

                      <label class="grid gap-2">
                        <span class="text-sm font-medium text-text">Moneda</span>
                        <input class="mm-input uppercase" type="text" maxlength="3" name="branchCurrencyCode" [(ngModel)]="newBranchCurrencyCode" required />
                      </label>

                      <button type="submit" class="mm-button-primary w-full" [disabled]="workspaceFacade.saveStatus() === 'loading'">
                        {{ workspaceFacade.saveStatus() === 'loading' ? 'Guardando...' : 'Crear sucursal' }}
                      </button>
                    </form>
                  } @else {
                    <mm-empty-state
                      title="Acceso de solo lectura"
                      description="Tu rol puede revisar estructura y alcance, pero no crear ni modificar marcas o sucursales."
                    />
                  }
                </section>

                <section class="space-y-4">
                  @for (brand of workspaceFacade.organization()?.brands ?? []; track brand.brandId) {
                    <article class="mm-surface space-y-4 p-5">
                      <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div class="space-y-2">
                          <p class="text-sm uppercase tracking-[0.18em] text-accent">{{ brand.code }}</p>
                          <h3 class="text-2xl font-semibold text-text">{{ brand.name }}</h3>
                          <p class="text-sm text-muted">
                            {{ brand.visibleBranchCount }} visibles de {{ brand.totalBranchCount }} sucursales
                          </p>
                        </div>
                        <span class="mm-chip">{{ brand.active ? 'Activa' : 'Inactiva' }}</span>
                      </div>

                      @if (brand.branches.length === 0) {
                        <mm-empty-state title="Sin sucursales visibles" description="Este operador no tiene alcance sobre branches de esta marca." />
                      } @else {
                        <div class="grid gap-3">
                          @for (branch of brand.branches; track branch.branchId) {
                            <article class="rounded-3xl border border-line/70 bg-panel/70 p-4">
                              <div class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                                <div class="space-y-2">
                                  <h4 class="text-lg font-semibold text-text">{{ branch.name }}</h4>
                                  <p class="text-sm text-muted">
                                    {{ branch.code }} · {{ branch.timezone }} · {{ branch.currencyCode }}
                                  </p>
                                </div>

                                <div class="flex flex-wrap items-center gap-2">
                                  <span class="mm-chip">{{ branch.active ? 'Operativa' : 'Desactivada' }}</span>
                                  @if (staffSessionService.hasPermission('tenant.branches.write')) {
                                    <button
                                      type="button"
                                      class="mm-button-secondary"
                                      (click)="toggleBranchStatus(branch.branchId, branch.name, branch.timezone, branch.currencyCode, branch.active)"
                                    >
                                      {{ branch.active ? 'Desactivar' : 'Activar' }}
                                    </button>
                                  }
                                </div>
                              </div>
                            </article>
                          }
                        </div>
                      }
                    </article>
                  }
                </section>
              </div>
            } @else {
              <mm-empty-state title="Sin estructura disponible" description="No fue posible resolver marcas y sucursales del tenant." />
            }
          }

          @case ('support') {
            <div class="grid gap-5 xl:grid-cols-[minmax(0,24rem),1fr]">
              <section class="space-y-4">
                @if (staffSessionService.hasPermission('tenant.tickets.write')) {
                  <form class="mm-surface space-y-4 p-5" (ngSubmit)="createSupportTicket()">
                    <div class="space-y-2">
                      <p class="mm-eyebrow">Nuevo ticket</p>
                      <h3 class="text-2xl font-semibold text-text">Escalar al SaaS Admin</h3>
                      <p class="text-sm leading-6 text-muted">Canal persistente para incidentes, onboarding, legal, producto y operación diaria.</p>
                    </div>

                    <label class="grid gap-2">
                      <span class="text-sm font-medium text-text">Sucursal</span>
                      <select class="mm-input" name="supportBranchId" [(ngModel)]="supportBranchId">
                        <option value="">Sin asociar</option>
                        @for (branch of tenantContextService.availableBranches(); track branch.id) {
                          <option [value]="branch.id">{{ branch.label }}</option>
                        }
                      </select>
                    </label>

                    <label class="grid gap-2">
                      <span class="text-sm font-medium text-text">Asunto</span>
                      <input class="mm-input" type="text" name="supportSubject" [(ngModel)]="supportSubject" required />
                    </label>

                    <div class="grid gap-4 md:grid-cols-2">
                      <label class="grid gap-2">
                        <span class="text-sm font-medium text-text">Categoría</span>
                        <select class="mm-input" name="supportCategory" [(ngModel)]="supportCategory">
                          @for (category of supportCategories; track category) {
                            <option [value]="category">{{ category }}</option>
                          }
                        </select>
                      </label>

                      <label class="grid gap-2">
                        <span class="text-sm font-medium text-text">Prioridad</span>
                        <select class="mm-input" name="supportPriority" [(ngModel)]="supportPriority">
                          @for (priority of supportPriorities; track priority) {
                            <option [value]="priority">{{ priority }}</option>
                          }
                        </select>
                      </label>
                    </div>

                    <label class="grid gap-2">
                      <span class="text-sm font-medium text-text">Descripción</span>
                      <textarea class="mm-input min-h-32" name="supportBody" [(ngModel)]="supportBody" required></textarea>
                    </label>

                    <button type="submit" class="mm-button-primary w-full" [disabled]="workspaceFacade.saveStatus() === 'loading'">
                      {{ workspaceFacade.saveStatus() === 'loading' ? 'Enviando...' : 'Enviar ticket' }}
                    </button>
                  </form>
                }

                <article class="mm-surface space-y-4 p-5">
                  <div class="space-y-2">
                    <p class="mm-eyebrow">Bandeja</p>
                    <h3 class="text-2xl font-semibold text-text">Tickets del tenant</h3>
                  </div>

                  @if (workspaceFacade.supportTicketsStatus() === 'loading') {
                    <mm-loading-skeleton [cards]="3" />
                  } @else if (workspaceFacade.supportTickets().length === 0) {
                    <mm-empty-state title="Sin tickets" description="Todavía no hay solicitudes abiertas entre este tenant y SaaS Admin." />
                  } @else {
                    <div class="grid gap-3">
                      @for (ticket of workspaceFacade.supportTickets(); track ticket.ticketId) {
                        <button
                          type="button"
                          class="rounded-3xl border border-line/70 bg-panel/70 p-4 text-left transition hover:border-accent/50"
                          (click)="openSupportTicket(ticket.ticketId)"
                        >
                          <p class="mm-eyebrow">{{ ticket.priority }} · {{ ticket.status }}</p>
                          <h4 class="mt-2 text-lg font-semibold text-text">{{ ticket.subject }}</h4>
                          <p class="mt-2 text-sm text-muted">
                            {{ ticket.category }} · {{ ticket.lastMessageAt | date: 'short' }}
                          </p>
                          <p class="mt-2 text-sm text-muted">
                            Última respuesta: {{ ticket.lastReplyByAudience === 'PLATFORM' ? 'SaaS Admin' : 'Tenant' }}
                          </p>
                        </button>
                      }
                    </div>
                  }
                </article>
              </section>

              <section class="space-y-4">
                @if (workspaceFacade.supportTicketDetailStatus() === 'loading') {
                  <mm-loading-skeleton [cards]="3" />
                } @else if (workspaceFacade.supportTicketDetail()) {
                  <article class="mm-surface space-y-4 p-5">
                    <div class="space-y-2">
                      <p class="mm-eyebrow">
                        {{ workspaceFacade.supportTicketDetail()?.summary?.priority }} · {{ workspaceFacade.supportTicketDetail()?.summary?.status }}
                      </p>
                      <h3 class="text-2xl font-semibold text-text">{{ workspaceFacade.supportTicketDetail()?.summary?.subject }}</h3>
                      <p class="text-sm text-muted">
                        {{ workspaceFacade.supportTicketDetail()?.summary?.category }} · solicitado por
                        {{ workspaceFacade.supportTicketDetail()?.summary?.requestedByName }}
                      </p>
                    </div>

                    <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      <article class="rounded-3xl border border-line/70 bg-panel/70 p-4">
                        <p class="text-sm text-muted">Estado</p>
                        <p class="mt-2 text-lg font-semibold text-text">{{ workspaceFacade.supportTicketDetail()?.summary?.status }}</p>
                      </article>
                      <article class="rounded-3xl border border-line/70 bg-panel/70 p-4">
                        <p class="text-sm text-muted">Prioridad</p>
                        <p class="mt-2 text-lg font-semibold text-text">{{ workspaceFacade.supportTicketDetail()?.summary?.priority }}</p>
                      </article>
                      <article class="rounded-3xl border border-line/70 bg-panel/70 p-4">
                        <p class="text-sm text-muted">Último mensaje</p>
                        <p class="mt-2 text-sm font-semibold text-text">{{ workspaceFacade.supportTicketDetail()?.summary?.lastMessageAt | date: 'medium' }}</p>
                      </article>
                      <article class="rounded-3xl border border-line/70 bg-panel/70 p-4">
                        <p class="text-sm text-muted">Resolución</p>
                        <p class="mt-2 text-sm font-semibold text-text">{{ workspaceFacade.supportTicketDetail()?.summary?.resolutionSummary || 'Pendiente' }}</p>
                      </article>
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
                          <p class="mt-3 text-xs text-muted">{{ message.createdAt | date: 'medium' }}</p>
                        </article>
                      }
                    </div>

                    @if (staffSessionService.hasPermission('tenant.tickets.write')) {
                      <label class="grid gap-2">
                        <span class="text-sm font-medium text-text">Responder</span>
                        <textarea class="mm-input min-h-28" name="supportReplyBody" [(ngModel)]="supportReplyBody"></textarea>
                      </label>

                      <button
                        type="button"
                        class="mm-button-secondary"
                        [disabled]="!supportReplyBody.trim() || workspaceFacade.saveStatus() === 'loading'"
                        (click)="replySupportTicket()"
                      >
                        {{ workspaceFacade.saveStatus() === 'loading' ? 'Guardando...' : 'Enviar respuesta' }}
                      </button>
                    }

                    @if (staffSessionService.hasPermission('tenant.tickets.resolve')) {
                      <label class="grid gap-2">
                        <span class="text-sm font-medium text-text">Resumen de cierre</span>
                        <textarea class="mm-input min-h-24" name="supportResolutionSummary" [(ngModel)]="supportResolutionSummary"></textarea>
                      </label>

                      <button
                        type="button"
                        class="mm-button-primary"
                        [disabled]="workspaceFacade.saveStatus() === 'loading'"
                        (click)="resolveSupportTicket()"
                      >
                        {{ workspaceFacade.saveStatus() === 'loading' ? 'Cerrando...' : 'Marcar resuelto' }}
                      </button>
                    }
                  </article>
                } @else {
                  <mm-empty-state title="Selecciona un ticket" description="Abre un ticket de la bandeja o crea uno nuevo para conversar con SaaS Admin." />
                }
              </section>
            </div>
          }

          @default {
            <mm-empty-state
              title="Bloque siguiente"
              description="Esta ruta queda protegida por permisos reales, pero su caso de uso operativo se implementa en los siguientes bloques sin reintroducir mocks."
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
  private readonly router = inject(Router);
  protected readonly workspaceFacade = inject(TenantWorkspaceFacade);
  protected readonly tenantContextService = inject(TenantContextService);
  protected readonly staffSessionService = inject(StaffSessionService);

  protected readonly content = this.route.snapshot.data as SectionPageContent;
  protected readonly navigation = computed<NavigationItem[]>(() => TENANT_NAVIGATION.filter(
    (item) => !item.requiredPermission || this.staffSessionService.hasPermission(item.requiredPermission)
  ));

  protected newStaffFullName = '';
  protected newStaffEmail = '';
  protected newStaffPassword = '';
  protected newBrandCode = '';
  protected newBrandName = '';
  protected newBranchBrandId = '';
  protected newBranchCode = '';
  protected newBranchName = '';
  protected newBranchTimezone = 'America/Santiago';
  protected newBranchCurrencyCode = 'CLP';
  protected selectedRoleCode = '';
  protected selectedScopeType: 'TENANT' | 'BRANCH' = 'BRANCH';
  protected selectedBranchIds: string[] = [];
  protected selectedStatus: 'ACTIVE' | 'INVITED' | 'DISABLED' = 'ACTIVE';
  protected requirePasswordReset = true;
  protected readonly staffUserFormMessage = signal<string | null>(null);
  protected temporaryPassword = '';
  protected readonly supportCategories: TenantSupportCategory[] = ['OPERATIONS', 'INCIDENT', 'ONBOARDING', 'LEGAL', 'PRODUCT', 'BILLING', 'OTHER'];
  protected readonly supportPriorities: TenantSupportTicketPriorityDto[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
  protected supportBranchId = '';
  protected supportSubject = '';
  protected supportCategory: TenantSupportCategory = 'OPERATIONS';
  protected supportPriority: TenantSupportTicketPriorityDto = 'MEDIUM';
  protected supportBody = '';
  protected supportReplyBody = '';
  protected supportResolutionSummary = '';

  constructor() {
    this.tenantContextService.ensureContext();
    this.supportBranchId = this.tenantContextService.activeBranch() ?? '';

    switch (this.content.pageId) {
      case 'dashboard':
        this.workspaceFacade.loadDashboard();
        break;
      case 'staff':
        this.workspaceFacade.loadRoles();
        this.workspaceFacade.loadStaffUsers();
        break;
      case 'branches':
        this.workspaceFacade.loadOrganization();
        break;
      case 'support':
        this.workspaceFacade.loadSupportTickets();
        break;
      default:
        break;
    }

    effect(() => {
      if (this.content.pageId !== 'support') {
        return;
      }

      const tickets = this.workspaceFacade.supportTickets();
      const detail = this.workspaceFacade.supportTicketDetail();
      const status = this.workspaceFacade.supportTicketsStatus();

      if (!detail && status === 'success' && tickets.length > 0) {
        this.workspaceFacade.loadSupportTicket(tickets[0].ticketId);
      }
    });

    effect(() => {
      if (this.content.pageId !== 'support') {
        return;
      }

      const detail = this.workspaceFacade.supportTicketDetail();
      this.supportResolutionSummary = detail?.summary.resolutionSummary ?? '';
    });
  }

  protected changeBranch(branchId: string): void {
    this.tenantContextService.setActiveBranch(branchId);
    if (this.content.pageId === 'dashboard') {
      this.workspaceFacade.loadDashboard();
    }
    if (this.content.pageId === 'support') {
      this.supportBranchId = branchId;
    }
  }

  protected toggleBranch(branchId: string, checked: boolean): void {
    this.staffUserFormMessage.set(null);
    this.selectedBranchIds = checked
      ? [...this.selectedBranchIds, branchId]
      : this.selectedBranchIds.filter((currentBranchId) => currentBranchId !== branchId);
  }

  protected createStaffUser(): void {
    const validationMessage = this.validateStaffUserForm();
    this.staffUserFormMessage.set(validationMessage);
    if (validationMessage) {
      return;
    }

    this.workspaceFacade.createStaffUser({
      email: this.newStaffEmail.trim(),
      fullName: this.newStaffFullName.trim(),
      password: this.newStaffPassword,
      status: this.selectedStatus,
      passwordResetRequired: this.requirePasswordReset,
      assignments: [
        {
          roleCode: this.selectedRoleCode,
          scopeType: this.selectedScopeType,
          branchIds: this.selectedScopeType === 'BRANCH' ? this.selectedBranchIds : undefined
        }
      ]
    });
  }

  protected canCreateStaffUser(): boolean {
    return this.validateStaffUserForm() === null;
  }

  protected createBrand(): void {
    this.workspaceFacade.createBrand({
      code: this.newBrandCode.trim(),
      name: this.newBrandName.trim()
    });
  }

  protected createBranch(): void {
    this.workspaceFacade.createBranch({
      brandId: this.newBranchBrandId,
      code: this.newBranchCode.trim(),
      name: this.newBranchName.trim(),
      timezone: this.newBranchTimezone.trim(),
      currencyCode: this.newBranchCurrencyCode.trim().toUpperCase()
    });
  }

  protected toggleStatus(userId: string, currentStatus: string): void {
    this.workspaceFacade.updateStaffUserStatus(userId, {
      status: currentStatus === 'ACTIVE' ? 'LOCKED' : 'ACTIVE'
    });
  }

  protected resetPassword(userId: string): void {
    this.workspaceFacade.resetStaffPassword(userId, this.temporaryPassword.trim(), true);
  }

  private validateStaffUserForm(): string | null {
    if (!this.newStaffFullName.trim()) {
      return 'El nombre completo es obligatorio.';
    }

    if (!this.newStaffEmail.trim()) {
      return 'El correo es obligatorio.';
    }

    if (this.newStaffPassword.length < 8 || this.newStaffPassword.length > 128) {
      return 'La contraseña inicial debe tener entre 8 y 128 caracteres.';
    }

    if (!this.selectedRoleCode) {
      return 'Debes seleccionar un rol.';
    }

    if (this.selectedScopeType === 'BRANCH' && this.selectedBranchIds.length === 0) {
      return 'Debes seleccionar al menos una sucursal para ese alcance.';
    }

    return null;
  }

  protected toggleBranchStatus(
    branchId: string,
    name: string,
    timezone: string,
    currencyCode: string,
    active: boolean
  ): void {
    this.workspaceFacade.updateBranch(branchId, {
      name,
      timezone,
      currencyCode,
      active: !active
    });
  }

  protected openSupportTicket(ticketId: string): void {
    this.workspaceFacade.loadSupportTicket(ticketId);
  }

  protected createSupportTicket(): void {
    this.workspaceFacade.createSupportTicket({
      branchId: this.supportBranchId || this.tenantContextService.activeBranch() || null,
      subject: this.supportSubject.trim(),
      category: this.supportCategory,
      priority: this.supportPriority,
      body: this.supportBody.trim()
    });
    this.supportSubject = '';
    this.supportCategory = 'OPERATIONS';
    this.supportPriority = 'MEDIUM';
    this.supportBody = '';
  }

  protected replySupportTicket(): void {
    const ticketId = this.workspaceFacade.supportTicketDetail()?.summary.ticketId;
    if (!ticketId || !this.supportReplyBody.trim()) {
      return;
    }

    this.workspaceFacade.replySupportTicket(ticketId, {
      body: this.supportReplyBody.trim()
    });
    this.supportReplyBody = '';
  }

  protected resolveSupportTicket(): void {
    const ticketId = this.workspaceFacade.supportTicketDetail()?.summary.ticketId;
    if (!ticketId) {
      return;
    }

    this.workspaceFacade.resolveSupportTicket(ticketId, {
      resolutionSummary: this.supportResolutionSummary.trim() || null
    });
    this.supportResolutionSummary = '';
  }

  protected logout(): void {
    this.staffSessionService.logout().pipe(take(1)).subscribe(() => {
      void this.router.navigateByUrl('/login');
    });
  }
}
