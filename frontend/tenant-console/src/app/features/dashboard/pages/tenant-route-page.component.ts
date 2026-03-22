import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  MenuSourceTypeDto,
  TenantAdminApiClient,
  TenantMenuItemDto,
  TenantMenuVersionDto,
  TenantStaffUserDto,
  TenantSupportTicketPriorityDto
} from '@mixmaster/shared/api-clients';
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
type TenantStaffAssignmentForm = {
  id: string;
  roleCode: string;
  scopeType: 'TENANT' | 'BRAND' | 'BRANCH';
  brandIds: string[];
  branchIds: string[];
};
type TenantMenuItemForm = {
  id: string;
  categoryName: string;
  name: string;
  description: string;
  price: string;
  currencyCode: string;
  productType: string;
  featured: boolean;
};

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

          @case ('menu-drafts') {
            @if (workspaceFacade.menuWorkspaceStatus() === 'loading') {
              <mm-loading-skeleton [cards]="4" />
            } @else {
              <div class="grid gap-5 xl:grid-cols-[minmax(0,26rem),1fr]">
                <form class="mm-surface space-y-4 p-5" (ngSubmit)="saveMenuWorkspace()">
                  <div class="space-y-2">
                    <p class="mm-eyebrow">Authoring real</p>
                    <h3 class="text-2xl font-semibold text-text">Crear o actualizar carta</h3>
                    <p class="text-sm leading-6 text-muted">
                      Puedes crear una carta estructurada con menú, descripción y precios, o subir un PDF y dejar solo el catálogo de cocteles para pedido y recomendación.
                    </p>
                  </div>

                  <label class="grid gap-2">
                    <span class="text-sm font-medium text-text">Tipo de carta</span>
                    <select class="mm-input" name="menuSourceType" [(ngModel)]="menuSourceType" (ngModelChange)="menuFormMessage.set(null)">
                      @for (sourceType of menuSourceTypes; track sourceType) {
                        <option [value]="sourceType">{{ sourceType === 'STRUCTURED' ? 'Carta integrada' : 'Carta PDF + catálogo' }}</option>
                      }
                    </select>
                  </label>

                  <label class="grid gap-2">
                    <span class="text-sm font-medium text-text">Nombre de la carta</span>
                    <input class="mm-input" type="text" name="menuName" [(ngModel)]="menuName" (ngModelChange)="menuFormMessage.set(null)" required />
                  </label>

                  <label class="grid gap-2">
                    <span class="text-sm font-medium text-text">Descripción general</span>
                    <textarea class="mm-input min-h-24" name="menuDescription" [(ngModel)]="menuDescription" (ngModelChange)="menuFormMessage.set(null)"></textarea>
                  </label>

                  <label class="grid gap-2">
                    <span class="text-sm font-medium text-text">Notas de servicio</span>
                    <textarea class="mm-input min-h-24" name="menuNotesText" [(ngModel)]="menuNotesText" (ngModelChange)="menuFormMessage.set(null)"></textarea>
                    <span class="text-xs text-muted">Una nota por línea.</span>
                  </label>

                  @if (menuSourceType === 'PDF') {
                    <div class="space-y-3 rounded-3xl border border-line/70 bg-panel/70 p-4">
                      <div class="space-y-2">
                        <p class="text-sm font-medium text-text">PDF de la carta</p>
                        <p class="text-sm text-muted">La experiencia pública mostrará el PDF y, aparte, el catálogo de cocteles para pedido y recomendación.</p>
                      </div>
                      <input type="file" accept="application/pdf" (change)="onMenuPdfSelected($event)" />
                      @if (uploadedPdfName) {
                        <p class="text-sm text-muted">Archivo actual: {{ uploadedPdfName }}</p>
                      }
                    </div>
                  } @else {
                    <p class="rounded-2xl border border-line/60 bg-panel/70 px-4 py-3 text-sm text-muted">
                      En carta integrada, el motor de recomendación queda alineado directamente con los items estructurados del menú.
                    </p>
                  }

                  <div class="space-y-3">
                    <div class="flex items-center justify-between gap-3">
                      <div>
                        <p class="text-sm font-medium text-text">
                          {{ menuSourceType === 'PDF' ? 'Catálogo de cocteles para pedido' : 'Items de la carta' }}
                        </p>
                        <p class="text-sm text-muted">Cada item necesita sección, descripción y precio.</p>
                      </div>
                      <button type="button" class="mm-button-secondary" (click)="addMenuItem()">Agregar item</button>
                    </div>

                    @for (item of menuItems(); track item.id; let index = $index) {
                      <article class="rounded-3xl border border-line/70 bg-panel/70 p-4">
                        <div class="flex items-center justify-between gap-3">
                          <p class="text-sm font-medium text-text">Item {{ index + 1 }}</p>
                          @if (menuItems().length > 1) {
                            <button type="button" class="text-sm text-muted" (click)="removeMenuItem(item.id)">Quitar</button>
                          }
                        </div>

                        <div class="mt-4 grid gap-4">
                          <label class="grid gap-2">
                            <span class="text-sm font-medium text-text">Sección / categoría</span>
                            <input
                              class="mm-input"
                              [name]="'menuCategory' + item.id"
                              [ngModel]="item.categoryName"
                              (ngModelChange)="updateMenuItemField(item.id, 'categoryName', $event)"
                            />
                          </label>

                          <label class="grid gap-2">
                            <span class="text-sm font-medium text-text">Nombre</span>
                            <input
                              class="mm-input"
                              [name]="'menuItemName' + item.id"
                              [ngModel]="item.name"
                              (ngModelChange)="updateMenuItemField(item.id, 'name', $event)"
                            />
                          </label>

                          <label class="grid gap-2">
                            <span class="text-sm font-medium text-text">Descripción</span>
                            <textarea
                              class="mm-input min-h-20"
                              [name]="'menuItemDescription' + item.id"
                              [ngModel]="item.description"
                              (ngModelChange)="updateMenuItemField(item.id, 'description', $event)"
                            ></textarea>
                          </label>

                          <div class="grid gap-4 md:grid-cols-3">
                            <label class="grid gap-2">
                              <span class="text-sm font-medium text-text">Precio</span>
                              <input
                                class="mm-input"
                                type="number"
                                min="0"
                                step="0.01"
                                [name]="'menuItemPrice' + item.id"
                                [ngModel]="item.price"
                                (ngModelChange)="updateMenuItemField(item.id, 'price', $event)"
                              />
                            </label>

                            <label class="grid gap-2">
                              <span class="text-sm font-medium text-text">Moneda</span>
                              <input
                                class="mm-input uppercase"
                                [name]="'menuItemCurrency' + item.id"
                                [ngModel]="item.currencyCode"
                                (ngModelChange)="updateMenuItemField(item.id, 'currencyCode', $event)"
                              />
                            </label>

                            <label class="grid gap-2">
                              <span class="text-sm font-medium text-text">Tipo</span>
                              <select
                                class="mm-input"
                                [name]="'menuItemType' + item.id"
                                [ngModel]="item.productType"
                                (ngModelChange)="updateMenuItemField(item.id, 'productType', $event)"
                              >
                                @for (productType of menuProductTypes; track productType) {
                                  <option [value]="productType">{{ productType }}</option>
                                }
                              </select>
                            </label>
                          </div>

                          <label class="flex items-center gap-3 text-sm text-text">
                            <input
                              type="checkbox"
                              [name]="'menuItemFeatured' + item.id"
                              [ngModel]="item.featured"
                              (ngModelChange)="updateMenuItemField(item.id, 'featured', $event)"
                            />
                            <span>Destacar este item en la experiencia</span>
                          </label>
                        </div>
                      </article>
                    }
                  </div>

                  @if (menuFormMessage()) {
                    <p class="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
                      {{ menuFormMessage() }}
                    </p>
                  }

                  <div class="flex flex-wrap gap-3">
                    <button type="submit" class="mm-button-primary" [disabled]="workspaceFacade.saveStatus() === 'loading'">
                      {{ workspaceFacade.saveStatus() === 'loading' ? 'Guardando...' : 'Guardar draft' }}
                    </button>
                    <button
                      type="button"
                      class="mm-button-secondary"
                      [disabled]="workspaceFacade.saveStatus() === 'loading' || !workspaceFacade.menuWorkspace()?.draftVersion"
                      (click)="publishMenuWorkspace()"
                    >
                      Publicar carta
                    </button>
                  </div>
                </form>

                <section class="space-y-4">
                  <article class="mm-surface space-y-4 p-5">
                    <div class="space-y-2">
                      <p class="mm-eyebrow">Workspace actual</p>
                      <h3 class="text-2xl font-semibold text-text">{{ workspaceFacade.menuWorkspace()?.branchName || 'Carta del branch' }}</h3>
                      <p class="text-sm text-muted">{{ workspaceFacade.menuWorkspace()?.brandName || 'Sin marca' }}</p>
                    </div>

                    @if (workspaceFacade.menuWorkspace()?.draftVersion) {
                      <article class="rounded-3xl border border-line/70 bg-panel/70 p-4">
                        <p class="mm-eyebrow">Draft</p>
                        <h4 class="mt-2 text-lg font-semibold text-text">{{ workspaceFacade.menuWorkspace()?.draftVersion?.menuName }}</h4>
                        <p class="mt-2 text-sm text-muted">
                          {{ workspaceFacade.menuWorkspace()?.draftVersion?.sourceType }} · {{ workspaceFacade.menuWorkspace()?.draftVersion?.items?.length }} items
                        </p>
                        @if (workspaceFacade.menuWorkspace()?.draftVersion?.pdfFileName) {
                          <div class="mt-3 flex flex-wrap gap-2">
                            <span class="mm-chip">{{ workspaceFacade.menuWorkspace()?.draftVersion?.pdfFileName }}</span>
                            <button type="button" class="mm-button-secondary" (click)="previewMenuPdf('DRAFT')">Abrir PDF</button>
                          </div>
                        }
                      </article>
                    } @else {
                      <mm-empty-state title="Sin draft" description="Todavía no hay un borrador guardado para esta sucursal." />
                    }

                    @if (workspaceFacade.menuWorkspace()?.publishedVersion) {
                      <article class="rounded-3xl border border-line/70 bg-panel/70 p-4">
                        <p class="mm-eyebrow">Publicado</p>
                        <h4 class="mt-2 text-lg font-semibold text-text">{{ workspaceFacade.menuWorkspace()?.publishedVersion?.menuName }}</h4>
                        <p class="mt-2 text-sm text-muted">
                          {{ workspaceFacade.menuWorkspace()?.publishedVersion?.sourceType }} · actualizado
                          {{ workspaceFacade.menuWorkspace()?.publishedVersion?.updatedAt | date: 'short' }}
                        </p>
                        @if (workspaceFacade.menuWorkspace()?.publishedVersion?.pdfFileName) {
                          <div class="mt-3 flex flex-wrap gap-2">
                            <span class="mm-chip">{{ workspaceFacade.menuWorkspace()?.publishedVersion?.pdfFileName }}</span>
                            <button type="button" class="mm-button-secondary" (click)="previewMenuPdf('PUBLISHED')">Abrir PDF publicado</button>
                          </div>
                        }
                      </article>
                    }
                  </article>
                </section>
              </div>
            }
          }

          @case ('menu-published') {
            @if (workspaceFacade.menuWorkspaceStatus() === 'loading') {
              <mm-loading-skeleton [cards]="3" />
            } @else if (workspaceFacade.menuWorkspace()?.publishedVersion) {
              <section class="space-y-4">
                <article class="mm-surface space-y-4 p-5">
                  <div class="space-y-2">
                    <p class="mm-eyebrow">Carta publicada</p>
                    <h3 class="text-2xl font-semibold text-text">{{ workspaceFacade.menuWorkspace()?.publishedVersion?.menuName }}</h3>
                    <p class="text-sm text-muted">
                      {{ workspaceFacade.menuWorkspace()?.publishedVersion?.sourceType }} ·
                      {{ workspaceFacade.menuWorkspace()?.publishedVersion?.recommendationMode }}
                    </p>
                  </div>

                  <p class="text-sm leading-6 text-muted">
                    {{ workspaceFacade.menuWorkspace()?.publishedVersion?.description || 'Sin descripción general.' }}
                  </p>

                  @if (workspaceFacade.menuWorkspace()?.publishedVersion?.pdfFileName) {
                    <div class="flex flex-wrap gap-2">
                      <span class="mm-chip">{{ workspaceFacade.menuWorkspace()?.publishedVersion?.pdfFileName }}</span>
                      <button type="button" class="mm-button-secondary" (click)="previewMenuPdf('PUBLISHED')">Abrir PDF publicado</button>
                    </div>
                  }
                </article>

                <div class="grid gap-3">
                  @for (item of workspaceFacade.menuWorkspace()?.publishedVersion?.items ?? []; track item.name + item.categoryName) {
                    <article class="mm-surface space-y-2 p-5">
                      <p class="mm-eyebrow">{{ item.categoryName }}</p>
                      <h4 class="text-xl font-semibold text-text">{{ item.name }}</h4>
                      <p class="text-sm text-muted">{{ item.description || 'Sin descripción.' }}</p>
                      <p class="text-sm text-text">{{ item.currencyCode }} {{ item.price }}</p>
                    </article>
                  }
                </div>
              </section>
            } @else {
              <mm-empty-state title="Sin carta publicada" description="Aún no hay una versión publicada para esta sucursal. Guarda y publica desde Drafts." />
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

                <div class="space-y-3">
                  <div class="flex items-center justify-between gap-3">
                    <div>
                      <p class="text-sm font-medium text-text">Asignaciones iniciales</p>
                      <p class="text-sm text-muted">Puedes definir multirol y alcance por tenant, marca o sucursal.</p>
                    </div>
                    <button type="button" class="mm-button-secondary" (click)="addCreateAssignment()">Agregar rol</button>
                  </div>

                  @for (assignment of createStaffAssignments(); track assignment.id; let index = $index) {
                    <article class="rounded-3xl border border-line/70 bg-panel/70 p-4">
                      <div class="flex items-center justify-between gap-3">
                        <p class="text-sm font-medium text-text">Asignación {{ index + 1 }}</p>
                        @if (createStaffAssignments().length > 1) {
                          <button type="button" class="text-sm text-muted" (click)="removeCreateAssignment(assignment.id)">Quitar</button>
                        }
                      </div>

                      <div class="mt-4 grid gap-4">
                        <label class="grid gap-2">
                          <span class="text-sm font-medium text-text">Rol</span>
                          <select
                            class="mm-input"
                            [name]="'createRole' + assignment.id"
                            [ngModel]="assignment.roleCode"
                            (ngModelChange)="updateCreateAssignmentRole(assignment.id, $event)"
                          >
                            <option value="" disabled>Selecciona un rol</option>
                            @for (role of workspaceFacade.roles(); track role.roleId) {
                              <option [value]="role.code">{{ role.name }}</option>
                            }
                          </select>
                        </label>

                        <label class="grid gap-2">
                          <span class="text-sm font-medium text-text">Scope</span>
                          <select
                            class="mm-input"
                            [name]="'createScope' + assignment.id"
                            [ngModel]="assignment.scopeType"
                            (ngModelChange)="updateCreateAssignmentScope(assignment.id, $event)"
                          >
                            <option value="TENANT">Tenant completo</option>
                            <option value="BRAND">Marca</option>
                            <option value="BRANCH">Sucursal</option>
                          </select>
                        </label>
                      </div>

                      @if (assignment.scopeType === 'BRAND') {
                        <div class="mt-4 space-y-2">
                          <span class="text-sm font-medium text-text">Marcas del alcance</span>
                          <div class="grid gap-2">
                            @for (brand of workspaceFacade.organization()?.brands ?? []; track brand.brandId) {
                              <label class="flex items-center gap-3 rounded-2xl border border-line/70 bg-panel/90 px-4 py-3 text-sm text-text">
                                <input
                                  type="checkbox"
                                  [checked]="assignment.brandIds.includes(brand.brandId)"
                                  (change)="toggleCreateAssignmentBrand(assignment.id, brand.brandId, $any($event.target).checked)"
                                />
                                <span>{{ brand.name }}</span>
                              </label>
                            }
                          </div>
                        </div>
                      }

                      @if (assignment.scopeType === 'BRANCH') {
                        <div class="mt-4 space-y-2">
                          <span class="text-sm font-medium text-text">Sucursales del alcance</span>
                          <div class="grid gap-2">
                            @for (brand of workspaceFacade.organization()?.brands ?? []; track brand.brandId) {
                              @for (branch of brand.branches; track branch.branchId) {
                                <label class="flex items-center gap-3 rounded-2xl border border-line/70 bg-panel/90 px-4 py-3 text-sm text-text">
                                  <input
                                    type="checkbox"
                                    [checked]="assignment.branchIds.includes(branch.branchId)"
                                    (change)="toggleCreateAssignmentBranch(assignment.id, branch.branchId, $any($event.target).checked)"
                                  />
                                  <span>{{ branch.name }} · {{ brand.name }}</span>
                                </label>
                              }
                            }
                          </div>
                        </div>
                      }
                    </article>
                  }
                </div>

                <label class="grid gap-2">
                  <span class="text-sm font-medium text-text">Estado inicial</span>
                  <select class="mm-input" name="status" [(ngModel)]="createStaffStatus" (ngModelChange)="staffUserFormMessage.set(null)">
                    <option value="ACTIVE">Activo</option>
                    <option value="INVITED">Invitado</option>
                    <option value="DISABLED">Deshabilitado</option>
                  </select>
                </label>

                <label class="flex items-center gap-3 text-sm text-text">
                  <input type="checkbox" name="requireReset" [(ngModel)]="createRequirePasswordReset" (ngModelChange)="staffUserFormMessage.set(null)" />
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
                  <div class="flex items-center justify-between gap-3">
                    <div class="space-y-2">
                      <p class="mm-eyebrow">Catálogo de roles</p>
                      <h3 class="text-2xl font-semibold text-text">Permisos base del tenant</h3>
                    </div>
                    <button type="button" class="mm-button-secondary" (click)="showRoleCatalog.set(!showRoleCatalog())">
                      {{ showRoleCatalog() ? 'Ocultar catálogo' : 'Mostrar catálogo' }}
                    </button>
                  </div>

                  @if (showRoleCatalog()) {
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
                  } @else {
                    <p class="text-sm text-muted">Catálogo oculto para dar prioridad a la operación diaria del staff.</p>
                  }
                </article>

                @if (editingStaffUser()) {
                  <article class="mm-surface space-y-4 p-5">
                    <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div class="space-y-2">
                        <p class="mm-eyebrow">Editar acceso</p>
                        <h3 class="text-2xl font-semibold text-text">{{ editingStaffUser()?.fullName }}</h3>
                        <p class="text-sm text-muted">{{ editingStaffUser()?.email }}</p>
                      </div>
                      <button type="button" class="mm-button-secondary" (click)="cancelEditingStaffUser()">Cancelar</button>
                    </div>

                    <div class="grid gap-4 md:grid-cols-2">
                      <label class="grid gap-2">
                        <span class="text-sm font-medium text-text">Estado operativo</span>
                        <select class="mm-input" name="editStaffStatus" [(ngModel)]="editStaffStatus">
                          <option value="INVITED">Invitado</option>
                          <option value="ACTIVE">Activo</option>
                          <option value="LOCKED">Bloqueado</option>
                          <option value="DISABLED">Deshabilitado</option>
                        </select>
                      </label>

                      <label class="flex items-center gap-3 rounded-2xl border border-line/60 bg-panel/70 px-4 py-3">
                        <input type="checkbox" name="editRequireReset" [(ngModel)]="editRequirePasswordReset" />
                        <span class="text-sm text-muted">Forzar cambio de contraseña en el próximo ingreso</span>
                      </label>
                    </div>

                    <div class="space-y-3">
                      <div class="flex items-center justify-between gap-3">
                        <div>
                          <p class="text-sm font-medium text-text">Asignaciones activas</p>
                          <p class="text-sm text-muted">Roles, scopes y alcance editable sin recrear el usuario.</p>
                        </div>
                        <button type="button" class="mm-button-secondary" (click)="addEditAssignment()">Agregar rol</button>
                      </div>

                      @for (assignment of editStaffAssignments(); track assignment.id; let index = $index) {
                        <article class="rounded-3xl border border-line/70 bg-panel/70 p-4">
                          <div class="flex items-center justify-between gap-3">
                            <p class="text-sm font-medium text-text">Asignación {{ index + 1 }}</p>
                            @if (editStaffAssignments().length > 1) {
                              <button type="button" class="text-sm text-muted" (click)="removeEditAssignment(assignment.id)">Quitar</button>
                            }
                          </div>

                          <div class="mt-4 grid gap-4">
                            <label class="grid gap-2">
                              <span class="text-sm font-medium text-text">Rol</span>
                              <select
                                class="mm-input"
                                [name]="'editRole' + assignment.id"
                                [ngModel]="assignment.roleCode"
                                (ngModelChange)="updateEditAssignmentRole(assignment.id, $event)"
                              >
                                <option value="" disabled>Selecciona un rol</option>
                                @for (role of workspaceFacade.roles(); track role.roleId) {
                                  <option [value]="role.code">{{ role.name }}</option>
                                }
                              </select>
                            </label>

                            <label class="grid gap-2">
                              <span class="text-sm font-medium text-text">Scope</span>
                              <select
                                class="mm-input"
                                [name]="'editScope' + assignment.id"
                                [ngModel]="assignment.scopeType"
                                (ngModelChange)="updateEditAssignmentScope(assignment.id, $event)"
                              >
                                <option value="TENANT">Tenant completo</option>
                                <option value="BRAND">Marca</option>
                                <option value="BRANCH">Sucursal</option>
                              </select>
                            </label>
                          </div>

                          @if (assignment.scopeType === 'BRAND') {
                            <div class="mt-4 space-y-2">
                              <span class="text-sm font-medium text-text">Marcas del alcance</span>
                              <div class="grid gap-2">
                                @for (brand of workspaceFacade.organization()?.brands ?? []; track brand.brandId) {
                                  <label class="flex items-center gap-3 rounded-2xl border border-line/70 bg-panel/90 px-4 py-3 text-sm text-text">
                                    <input
                                      type="checkbox"
                                      [checked]="assignment.brandIds.includes(brand.brandId)"
                                      (change)="toggleEditAssignmentBrand(assignment.id, brand.brandId, $any($event.target).checked)"
                                    />
                                    <span>{{ brand.name }}</span>
                                  </label>
                                }
                              </div>
                            </div>
                          }

                          @if (assignment.scopeType === 'BRANCH') {
                            <div class="mt-4 space-y-2">
                              <span class="text-sm font-medium text-text">Sucursales del alcance</span>
                              <div class="grid gap-2">
                                @for (brand of workspaceFacade.organization()?.brands ?? []; track brand.brandId) {
                                  @for (branch of brand.branches; track branch.branchId) {
                                    <label class="flex items-center gap-3 rounded-2xl border border-line/70 bg-panel/90 px-4 py-3 text-sm text-text">
                                      <input
                                        type="checkbox"
                                        [checked]="assignment.branchIds.includes(branch.branchId)"
                                        (change)="toggleEditAssignmentBranch(assignment.id, branch.branchId, $any($event.target).checked)"
                                      />
                                      <span>{{ branch.name }} · {{ brand.name }}</span>
                                    </label>
                                  }
                                }
                              </div>
                            </div>
                          }
                        </article>
                      }
                    </div>

                    @if (staffAccessFormMessage()) {
                      <p class="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
                        {{ staffAccessFormMessage() }}
                      </p>
                    }

                    <button
                      type="button"
                      class="mm-button-primary"
                      [disabled]="workspaceFacade.saveStatus() === 'loading'"
                      (click)="saveStaffUserAccess()"
                    >
                      {{ workspaceFacade.saveStatus() === 'loading' ? 'Guardando...' : 'Guardar acceso del staff' }}
                    </button>
                  </article>
                }

                <article class="mm-surface space-y-4 p-5">
                  <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div class="space-y-2">
                      <p class="mm-eyebrow">Staff real</p>
                      <h3 class="text-2xl font-semibold text-text">Usuarios internos del tenant</h3>
                    </div>
                    <label class="grid gap-2 lg:min-w-[18rem]">
                      <span class="text-sm font-medium text-text">Clave temporal para reset</span>
                      <input class="mm-input" type="password" name="resetPassword" [(ngModel)]="temporaryPassword" />
                      <span class="text-xs text-muted">Mínimo 8 caracteres y mantiene las reglas de complejidad vigentes.</span>
                    </label>
                  </div>

                  @if (!canResetTemporaryPassword() && temporaryPassword.trim()) {
                    <p class="text-sm text-danger">La clave temporal debe tener entre 8 y 128 caracteres.</p>
                  }

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

                              @if (staffUser.bootstrapProtected) {
                                <p class="rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-text">
                                  Este usuario es la credencial bootstrap inicial y no puede editarse desde el tenant.
                                </p>
                              }
                            </div>

                            <div class="flex flex-wrap gap-2">
                              <button
                                type="button"
                                class="mm-button-secondary"
                                [disabled]="staffUser.bootstrapProtected"
                                (click)="startEditingStaffUser(staffUser)"
                              >
                                Editar acceso
                              </button>
                              <button
                                type="button"
                                class="mm-button-secondary"
                                [disabled]="staffUser.bootstrapProtected || !canResetTemporaryPassword()"
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
  private readonly tenantAdminApiClient = inject(TenantAdminApiClient);
  private staffAssignmentSequence = 0;
  private menuItemSequence = 0;
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
  protected createStaffStatus: 'ACTIVE' | 'INVITED' | 'DISABLED' = 'ACTIVE';
  protected createRequirePasswordReset = true;
  protected readonly createStaffAssignments = signal<TenantStaffAssignmentForm[]>([this.createAssignment()]);
  protected readonly showRoleCatalog = signal(false);
  protected readonly editingStaffUserId = signal<string | null>(null);
  protected readonly editingStaffUser = computed(() => {
    const userId = this.editingStaffUserId();
    return this.workspaceFacade.staffUsers().find((staffUser) => staffUser.userId === userId) ?? null;
  });
  protected editStaffStatus: 'INVITED' | 'ACTIVE' | 'LOCKED' | 'DISABLED' = 'ACTIVE';
  protected editRequirePasswordReset = true;
  protected readonly editStaffAssignments = signal<TenantStaffAssignmentForm[]>([]);
  protected readonly staffUserFormMessage = signal<string | null>(null);
  protected readonly staffAccessFormMessage = signal<string | null>(null);
  protected temporaryPassword = '';
  protected readonly supportCategories: TenantSupportCategory[] = ['OPERATIONS', 'INCIDENT', 'ONBOARDING', 'LEGAL', 'PRODUCT', 'BILLING', 'OTHER'];
  protected readonly supportPriorities: TenantSupportTicketPriorityDto[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
  protected readonly menuSourceTypes: MenuSourceTypeDto[] = ['STRUCTURED', 'PDF'];
  protected readonly menuProductTypes = ['cocktail', 'mocktail', 'wine', 'beer', 'food', 'dessert', 'other'];
  protected menuName = '';
  protected menuDescription = '';
  protected menuSourceType: MenuSourceTypeDto = 'STRUCTURED';
  protected menuNotesText = '';
  protected readonly menuItems = signal<TenantMenuItemForm[]>([this.createMenuItem()]);
  protected readonly menuFormMessage = signal<string | null>(null);
  protected uploadedPdfName = '';
  protected uploadedPdfContentType = 'application/pdf';
  protected uploadedPdfBase64: string | null = null;
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
        this.workspaceFacade.loadOrganization();
        break;
      case 'menu-drafts':
      case 'menu-published':
        this.workspaceFacade.loadMenuWorkspace();
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

    effect(() => {
      if (this.content.pageId !== 'staff' || this.workspaceFacade.saveStatus() !== 'success') {
        return;
      }

      this.resetCreateStaffForm();
      this.cancelEditingStaffUser();
      this.temporaryPassword = '';
    });

    effect(() => {
      if ((this.content.pageId !== 'menu-drafts' && this.content.pageId !== 'menu-published')) {
        return;
      }

      const workspace = this.workspaceFacade.menuWorkspace();
      if (!workspace) {
        return;
      }

      const version = workspace.draftVersion ?? workspace.publishedVersion;
      if (!version) {
        this.resetMenuForm();
        return;
      }

      this.hydrateMenuForm(version);
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
    if (this.content.pageId === 'menu-drafts' || this.content.pageId === 'menu-published') {
      this.workspaceFacade.loadMenuWorkspace();
    }
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
      status: this.createStaffStatus,
      passwordResetRequired: this.createRequirePasswordReset,
      assignments: this.serializeAssignments(this.createStaffAssignments())
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

  protected resetPassword(userId: string): void {
    if (!this.canResetTemporaryPassword()) {
      return;
    }
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

    return this.validateAssignments(this.createStaffAssignments());
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

  protected addMenuItem(): void {
    this.menuItems.update((items) => [...items, this.createMenuItem()]);
    this.menuFormMessage.set(null);
  }

  protected removeMenuItem(itemId: string): void {
    this.menuItems.update((items) => items.filter((item) => item.id !== itemId));
    this.menuFormMessage.set(null);
  }

  protected updateMenuItemField(itemId: string, field: keyof Omit<TenantMenuItemForm, 'id'>, value: string | boolean): void {
    this.menuItems.update((items) => items.map((item) => item.id === itemId
      ? {
          ...item,
          [field]: value
        }
      : item));
    this.menuFormMessage.set(null);
  }

  protected async onMenuPdfSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.item(0);
    if (!file) {
      return;
    }

    if (file.type !== 'application/pdf') {
      this.menuFormMessage.set('Solo se permiten archivos PDF para la carta subida.');
      return;
    }

    this.uploadedPdfName = file.name;
    this.uploadedPdfContentType = file.type || 'application/pdf';
    this.uploadedPdfBase64 = await this.readFileAsBase64(file);
    this.menuFormMessage.set(null);
  }

  protected saveMenuWorkspace(): void {
    const validationMessage = this.validateMenuForm();
    this.menuFormMessage.set(validationMessage);
    if (validationMessage) {
      return;
    }

    this.workspaceFacade.saveMenuWorkspace({
      branchId: this.tenantContextService.activeBranch() ?? null,
      menuName: this.menuName.trim(),
      menuDescription: this.menuDescription.trim() || null,
      sourceType: this.menuSourceType,
      notes: this.menuNotesText.split('\n').map((note) => note.trim()).filter(Boolean),
      items: this.menuItems().map((item) => this.toTenantMenuItem(item)),
      pdfUpload: this.menuSourceType === 'PDF' && this.uploadedPdfBase64
        ? {
            fileName: this.uploadedPdfName,
            contentType: this.uploadedPdfContentType,
            base64: this.uploadedPdfBase64
          }
        : null
    });
  }

  protected publishMenuWorkspace(): void {
    this.workspaceFacade.publishMenuWorkspace();
  }

  protected previewMenuPdf(versionStatus: 'DRAFT' | 'PUBLISHED'): void {
    const branchId = this.tenantContextService.activeBranch() ?? undefined;
    this.tenantAdminApiClient.downloadMenuPdf(branchId, versionStatus).pipe(take(1)).subscribe((blob) => {
      const objectUrl = URL.createObjectURL(blob);
      globalThis.open(objectUrl, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(objectUrl), 5000);
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

  private createMenuItem(): TenantMenuItemForm {
    this.menuItemSequence += 1;
    return {
      id: `menu-item-${this.menuItemSequence}`,
      categoryName: '',
      name: '',
      description: '',
      price: '',
      currencyCode: 'CLP',
      productType: 'cocktail',
      featured: false
    };
  }

  private validateMenuForm(): string | null {
    if (!this.menuName.trim()) {
      return 'El nombre de la carta es obligatorio.';
    }

    if (this.menuItems().length === 0) {
      return 'Debes incluir al menos un item en la carta o catálogo.';
    }

    for (const item of this.menuItems()) {
      if (!item.categoryName.trim()) {
        return 'Cada item debe tener una categoría o sección.';
      }
      if (!item.name.trim()) {
        return 'Cada item debe tener un nombre.';
      }
      if (!item.price.trim() || Number.isNaN(Number(item.price)) || Number(item.price) < 0) {
        return 'Cada item debe tener un precio válido.';
      }
    }

    if (this.menuSourceType === 'PDF'
      && !this.uploadedPdfBase64
      && !this.workspaceFacade.menuWorkspace()?.draftVersion?.pdfFileName
      && !this.workspaceFacade.menuWorkspace()?.publishedVersion?.pdfFileName) {
      return 'La carta en modo PDF requiere que subas un archivo PDF.';
    }

    return null;
  }

  private toTenantMenuItem(item: TenantMenuItemForm): TenantMenuItemDto {
    return {
      categoryName: item.categoryName.trim(),
      name: item.name.trim(),
      description: item.description.trim() || null,
      price: Number(item.price),
      currencyCode: item.currencyCode.trim().toUpperCase(),
      productType: item.productType,
      featured: item.featured
    };
  }

  private hydrateMenuForm(version: TenantMenuVersionDto): void {
    this.menuName = version.menuName;
    this.menuDescription = version.description ?? '';
    this.menuSourceType = version.sourceType;
    this.menuNotesText = version.notes.join('\n');
    this.menuItems.set(version.items.length > 0 ? version.items.map((item) => this.fromTenantMenuItem(item)) : [this.createMenuItem()]);
    this.uploadedPdfName = version.pdfFileName ?? '';
    this.uploadedPdfContentType = version.pdfContentType ?? 'application/pdf';
    this.uploadedPdfBase64 = null;
    this.menuFormMessage.set(null);
  }

  private fromTenantMenuItem(item: TenantMenuItemDto): TenantMenuItemForm {
    return {
      id: this.createMenuItem().id,
      categoryName: item.categoryName,
      name: item.name,
      description: item.description ?? '',
      price: String(item.price),
      currencyCode: item.currencyCode,
      productType: item.productType,
      featured: item.featured
    };
  }

  private resetMenuForm(): void {
    this.menuName = '';
    this.menuDescription = '';
    this.menuSourceType = 'STRUCTURED';
    this.menuNotesText = '';
    this.menuItems.set([this.createMenuItem()]);
    this.uploadedPdfName = '';
    this.uploadedPdfContentType = 'application/pdf';
    this.uploadedPdfBase64 = null;
    this.menuFormMessage.set(null);
  }

  private readFileAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(reader.error);
      reader.onload = () => {
        const result = String(reader.result ?? '');
        const base64 = result.includes(',') ? result.split(',')[1] : result;
        resolve(base64);
      };
      reader.readAsDataURL(file);
    });
  }

  protected addCreateAssignment(): void {
    this.createStaffAssignments.update((assignments) => [...assignments, this.createAssignment()]);
    this.staffUserFormMessage.set(null);
  }

  protected removeCreateAssignment(assignmentId: string): void {
    this.createStaffAssignments.update((assignments) => assignments.filter((assignment) => assignment.id !== assignmentId));
    this.staffUserFormMessage.set(null);
  }

  protected updateCreateAssignmentRole(assignmentId: string, roleCode: string): void {
    this.patchCreateAssignment(assignmentId, { roleCode });
  }

  protected updateCreateAssignmentScope(assignmentId: string, scopeType: 'TENANT' | 'BRAND' | 'BRANCH'): void {
    this.patchCreateAssignment(assignmentId, {
      scopeType,
      brandIds: [],
      branchIds: []
    });
  }

  protected toggleCreateAssignmentBrand(assignmentId: string, brandId: string, checked: boolean): void {
    const assignment = this.createStaffAssignments().find((currentAssignment) => currentAssignment.id === assignmentId);
    if (!assignment) {
      return;
    }

    const brandIds = checked
      ? [...assignment.brandIds, brandId]
      : assignment.brandIds.filter((currentBrandId) => currentBrandId !== brandId);
    this.patchCreateAssignment(assignmentId, { brandIds });
  }

  protected toggleCreateAssignmentBranch(assignmentId: string, branchId: string, checked: boolean): void {
    const assignment = this.createStaffAssignments().find((currentAssignment) => currentAssignment.id === assignmentId);
    if (!assignment) {
      return;
    }

    const branchIds = checked
      ? [...assignment.branchIds, branchId]
      : assignment.branchIds.filter((currentBranchId) => currentBranchId !== branchId);
    this.patchCreateAssignment(assignmentId, { branchIds });
  }

  protected startEditingStaffUser(staffUser: TenantStaffUserDto): void {
    if (staffUser.bootstrapProtected) {
      this.staffAccessFormMessage.set('La credencial bootstrap inicial debe recuperarse desde la consola SaaS.');
      return;
    }

    this.editingStaffUserId.set(staffUser.userId);
    this.editStaffStatus = staffUser.status;
    this.editRequirePasswordReset = staffUser.passwordResetRequired;
    this.editStaffAssignments.set(this.mapAssignments(staffUser.assignments));
    this.staffAccessFormMessage.set(null);
  }

  protected cancelEditingStaffUser(): void {
    this.editingStaffUserId.set(null);
    this.editStaffAssignments.set([]);
    this.staffAccessFormMessage.set(null);
  }

  protected addEditAssignment(): void {
    this.editStaffAssignments.update((assignments) => [...assignments, this.createAssignment()]);
    this.staffAccessFormMessage.set(null);
  }

  protected removeEditAssignment(assignmentId: string): void {
    this.editStaffAssignments.update((assignments) => assignments.filter((assignment) => assignment.id !== assignmentId));
    this.staffAccessFormMessage.set(null);
  }

  protected updateEditAssignmentRole(assignmentId: string, roleCode: string): void {
    this.patchEditAssignment(assignmentId, { roleCode });
  }

  protected updateEditAssignmentScope(assignmentId: string, scopeType: 'TENANT' | 'BRAND' | 'BRANCH'): void {
    this.patchEditAssignment(assignmentId, {
      scopeType,
      brandIds: [],
      branchIds: []
    });
  }

  protected toggleEditAssignmentBrand(assignmentId: string, brandId: string, checked: boolean): void {
    const assignment = this.editStaffAssignments().find((currentAssignment) => currentAssignment.id === assignmentId);
    if (!assignment) {
      return;
    }

    const brandIds = checked
      ? [...assignment.brandIds, brandId]
      : assignment.brandIds.filter((currentBrandId) => currentBrandId !== brandId);
    this.patchEditAssignment(assignmentId, { brandIds });
  }

  protected toggleEditAssignmentBranch(assignmentId: string, branchId: string, checked: boolean): void {
    const assignment = this.editStaffAssignments().find((currentAssignment) => currentAssignment.id === assignmentId);
    if (!assignment) {
      return;
    }

    const branchIds = checked
      ? [...assignment.branchIds, branchId]
      : assignment.branchIds.filter((currentBranchId) => currentBranchId !== branchId);
    this.patchEditAssignment(assignmentId, { branchIds });
  }

  protected saveStaffUserAccess(): void {
    const userId = this.editingStaffUserId();
    if (!userId) {
      return;
    }

    const validationMessage = this.validateAssignments(this.editStaffAssignments());
    this.staffAccessFormMessage.set(validationMessage);
    if (validationMessage) {
      return;
    }

    this.workspaceFacade.updateStaffUserAccess(userId, {
      status: this.editStaffStatus,
      passwordResetRequired: this.editRequirePasswordReset,
      assignments: this.serializeAssignments(this.editStaffAssignments())
    });
  }

  protected canResetTemporaryPassword(): boolean {
    const password = this.temporaryPassword.trim();
    return password.length >= 8 && password.length <= 128;
  }

  private createAssignment(scopeType: 'TENANT' | 'BRAND' | 'BRANCH' = 'BRANCH'): TenantStaffAssignmentForm {
    this.staffAssignmentSequence += 1;
    return {
      id: `tenant-assignment-${this.staffAssignmentSequence}`,
      roleCode: '',
      scopeType,
      brandIds: [],
      branchIds: []
    };
  }

  private patchCreateAssignment(
    assignmentId: string,
    patch: Partial<Omit<TenantStaffAssignmentForm, 'id'>>
  ): void {
    this.createStaffAssignments.update((assignments) => assignments.map((assignment) => assignment.id === assignmentId
      ? {
          ...assignment,
          ...patch
        }
      : assignment));
    this.staffUserFormMessage.set(null);
  }

  private patchEditAssignment(
    assignmentId: string,
    patch: Partial<Omit<TenantStaffAssignmentForm, 'id'>>
  ): void {
    this.editStaffAssignments.update((assignments) => assignments.map((assignment) => assignment.id === assignmentId
      ? {
          ...assignment,
          ...patch
        }
      : assignment));
    this.staffAccessFormMessage.set(null);
  }

  private mapAssignments(assignments: Array<{
    roleCode: string;
    scopeType: 'TENANT' | 'BRAND' | 'BRANCH';
    brandId?: string | null;
    branchId?: string | null;
  }>): TenantStaffAssignmentForm[] {
    const groupedAssignments = new Map<string, TenantStaffAssignmentForm>();

    for (const assignment of assignments) {
      const key = `${assignment.roleCode}:${assignment.scopeType}`;
      const currentAssignment = groupedAssignments.get(key) ?? {
        ...this.createAssignment(assignment.scopeType),
        roleCode: assignment.roleCode
      };

      if (assignment.brandId && !currentAssignment.brandIds.includes(assignment.brandId)) {
        currentAssignment.brandIds = [...currentAssignment.brandIds, assignment.brandId];
      }

      if (assignment.branchId && !currentAssignment.branchIds.includes(assignment.branchId)) {
        currentAssignment.branchIds = [...currentAssignment.branchIds, assignment.branchId];
      }

      groupedAssignments.set(key, currentAssignment);
    }

    return groupedAssignments.size > 0 ? [...groupedAssignments.values()] : [this.createAssignment()];
  }

  private serializeAssignments(assignments: TenantStaffAssignmentForm[]) {
    return assignments.map((assignment) => ({
      roleCode: assignment.roleCode,
      scopeType: assignment.scopeType,
      brandIds: assignment.scopeType === 'BRAND' ? assignment.brandIds : undefined,
      branchIds: assignment.scopeType === 'BRANCH' ? assignment.branchIds : undefined
    }));
  }

  private validateAssignments(assignments: TenantStaffAssignmentForm[]): string | null {
    if (assignments.length === 0) {
      return 'Debes asignar al menos un rol.';
    }

    const validRoleCodes = new Set(this.workspaceFacade.roles().map((role) => role.code));
    const validBrandIds = new Set((this.workspaceFacade.organization()?.brands ?? []).map((brand) => brand.brandId));
    const validBranchIds = new Set(
      (this.workspaceFacade.organization()?.brands ?? []).flatMap((brand) => brand.branches.map((branch) => branch.branchId))
    );

    for (const assignment of assignments) {
      if (!assignment.roleCode || !validRoleCodes.has(assignment.roleCode)) {
        return 'Debes seleccionar un rol válido en cada asignación.';
      }

      if (assignment.scopeType === 'BRAND') {
        if (assignment.brandIds.length === 0) {
          return 'Las asignaciones por marca requieren al menos una marca.';
        }

        if (assignment.brandIds.some((brandId) => !validBrandIds.has(brandId))) {
          return 'Hay marcas fuera del alcance visible del actor.';
        }
      }

      if (assignment.scopeType === 'BRANCH') {
        if (assignment.branchIds.length === 0) {
          return 'Las asignaciones por sucursal requieren al menos una sucursal.';
        }

        if (assignment.branchIds.some((branchId) => !validBranchIds.has(branchId))) {
          return 'Hay sucursales fuera del alcance visible del actor.';
        }
      }
    }

    return null;
  }

  private resetCreateStaffForm(): void {
    this.newStaffFullName = '';
    this.newStaffEmail = '';
    this.newStaffPassword = '';
    this.createStaffStatus = 'ACTIVE';
    this.createRequirePasswordReset = true;
    this.createStaffAssignments.set([this.createAssignment()]);
    this.staffUserFormMessage.set(null);
  }
}
