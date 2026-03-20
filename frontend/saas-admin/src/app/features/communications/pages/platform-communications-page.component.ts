import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PLATFORM_NAVIGATION } from '@mixmaster/platform/navigation';
import {
  PlatformEmailProviderDto,
  PlatformEmailRecipientModeDto,
  PlatformEmailTemplateCategoryDto,
  PlatformSupportTicketSummaryDto,
  TenantSummaryDto
} from '@mixmaster/shared/api-clients';
import { NavigationItem, SectionPageContent } from '@mixmaster/shared/models';
import {
  AppShellHeaderComponent,
  AppShellSidebarComponent,
  EmptyStateComponent,
  LoadingSkeletonComponent
} from '@mixmaster/shared/ui-core';
import { PlatformMessagingFacade } from '../../../core/facades/platform-messaging.facade';
import { PlatformWorkspaceFacade } from '../../../core/facades/platform-workspace.facade';
import { PlatformSessionService } from '../../../core/services/platform-session.service';

type EmailSettingsForm = {
  providerCode: PlatformEmailProviderDto;
  host: string;
  port: number;
  protocol: string;
  authRequired: boolean;
  starttlsEnabled: boolean;
  sslEnabled: boolean;
  username: string;
  password: string;
  fromName: string;
  fromEmail: string;
  replyToEmail: string;
  connectionTimeoutMs: number;
  readTimeoutMs: number;
  writeTimeoutMs: number;
};

type TemplateForm = {
  code: string;
  name: string;
  category: PlatformEmailTemplateCategoryDto;
  description: string;
  subjectTemplate: string;
  htmlTemplate: string;
  textTemplate: string;
  active: boolean;
};

type TestForm = {
  recipientEmail: string;
  recipientName: string;
};

type PreviewForm = {
  tenantId: string;
  supportTicketId: string;
};

type DispatchForm = {
  tenantId: string;
  recipientMode: PlatformEmailRecipientModeDto;
  customRecipientEmail: string;
  customRecipientName: string;
  supportTicketId: string;
};

type PlaceholderInsertTarget = 'subject' | 'html' | 'text';

@Component({
  selector: 'app-platform-communications-page',
  standalone: true,
  imports: [
    AppShellHeaderComponent,
    AppShellSidebarComponent,
    DatePipe,
    EmptyStateComponent,
    FormsModule,
    LoadingSkeletonComponent,
    NgClass,
    RouterLink
  ],
  template: `
    <div class="grid gap-6 xl:grid-cols-[18rem,1fr]">
      <mm-app-shell-sidebar
        eyebrow="SaaS control"
        title="Platform admin"
        subtitle="Correo transaccional y operativo para tenants, con control de proveedor, plantillas y envíos manuales."
        [items]="navigation()"
      />

      <section class="space-y-6">
        <ng-template #headerActions>
          <button type="button" class="mm-button-secondary" (click)="refreshPage()">
            {{ messagingFacade.workspaceStatus() === 'loading' ? 'Actualizando...' : 'Refrescar sección' }}
          </button>
          <button type="button" class="mm-button-primary" (click)="startNewTemplate()">Nueva plantilla</button>
        </ng-template>

        <mm-app-shell-header
          [eyebrow]="content.eyebrow"
          [title]="content.title"
          [description]="content.description"
          [actionsTpl]="headerActions"
        />

        <article class="mm-surface flex flex-col gap-4 p-5 xl:flex-row xl:items-center xl:justify-between">
          <div class="space-y-1">
            <p class="mm-eyebrow">Cuenta raíz activa</p>
            <h2 class="text-xl font-semibold text-text">{{ platformSessionService.displayName() }}</h2>
            <p class="text-sm text-muted">{{ platformSessionService.actor()?.roleCode }} · {{ platformSessionService.actor()?.email }}</p>
          </div>

          <div class="flex flex-wrap gap-3">
            <a class="mm-button-secondary" routerLink="/dashboard">Dashboard</a>
            <a class="mm-button-secondary" routerLink="/tenants">Tenants</a>
            <button type="button" class="mm-button-secondary" (click)="logout()">Cerrar sesión</button>
          </div>
        </article>

        @if (pageError()) {
          <p class="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
            {{ pageError() }}
          </p>
        }

        @if (successMessage()) {
          <p class="rounded-2xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
            {{ successMessage() }}
          </p>
        }

        @if (messagingFacade.workspaceStatus() === 'loading' && !messagingFacade.workspace()) {
          <mm-loading-skeleton [cards]="6" />
        } @else {
          <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <article class="mm-surface p-4">
              <p class="text-sm text-muted">Proveedor SMTP</p>
              <p class="mt-2 text-lg font-semibold text-text">{{ messagingFacade.workspace()?.settings?.providerCode || 'No configurado' }}</p>
            </article>
            <article class="mm-surface p-4">
              <p class="text-sm text-muted">Plantillas activas</p>
              <p class="mt-2 text-lg font-semibold text-text">{{ activeTemplateCount() }}/{{ templateCount() }}</p>
            </article>
            <article class="mm-surface p-4">
              <p class="text-sm text-muted">Última prueba SMTP</p>
              <p class="mt-2 text-sm font-semibold text-text">
                {{ messagingFacade.workspace()?.settings?.lastTestSentAt ? (messagingFacade.workspace()?.settings?.lastTestSentAt | date: 'short') : 'Sin prueba' }}
              </p>
            </article>
            <article class="mm-surface p-4">
              <p class="text-sm text-muted">Destinos disponibles</p>
              <p class="mt-2 text-lg font-semibold text-text">{{ tenants().length }}</p>
            </article>
          </div>

          <div class="grid gap-6 2xl:grid-cols-[24rem,1fr]">
            <section class="space-y-6">
              <form class="mm-surface space-y-4 p-5" (ngSubmit)="saveSettings()">
                <div class="space-y-2">
                  <p class="mm-eyebrow">Servidor SMTP</p>
                  <h3 class="text-2xl font-semibold text-text">Google Workspace y SMTP custom</h3>
                  <p class="text-sm leading-6 text-muted">
                    Puedes trabajar con relay corporativo de Google o con otro servidor SMTP. El password no se expone otra vez; si lo dejas vacío, se mantiene el actual.
                  </p>
                </div>

                <button type="button" class="mm-button-secondary w-full" (click)="applyGoogleWorkspacePreset()">
                  Cargar preset Google Workspace
                </button>

                <div class="grid gap-4">
                  <label class="grid gap-2">
                    <span class="text-sm font-medium text-text">Proveedor</span>
                    <select class="mm-input" name="providerCode" [(ngModel)]="settingsForm.providerCode">
                      @for (provider of providers; track provider) {
                        <option [value]="provider">{{ provider }}</option>
                      }
                    </select>
                  </label>

                  <div class="grid gap-4 md:grid-cols-2">
                    <label class="grid gap-2">
                      <span class="text-sm font-medium text-text">Host</span>
                      <input class="mm-input" type="text" name="host" [(ngModel)]="settingsForm.host" required />
                    </label>
                    <label class="grid gap-2">
                      <span class="text-sm font-medium text-text">Puerto</span>
                      <input class="mm-input" type="number" name="port" [(ngModel)]="settingsForm.port" min="1" max="65535" required />
                    </label>
                  </div>

                  <div class="grid gap-4 md:grid-cols-2">
                    <label class="grid gap-2">
                      <span class="text-sm font-medium text-text">Protocolo</span>
                      <input class="mm-input" type="text" name="protocol" [(ngModel)]="settingsForm.protocol" required />
                    </label>
                    <label class="grid gap-2">
                      <span class="text-sm font-medium text-text">Usuario SMTP</span>
                      <input class="mm-input" type="text" name="username" [(ngModel)]="settingsForm.username" />
                    </label>
                  </div>

                  <label class="grid gap-2">
                    <span class="text-sm font-medium text-text">Password SMTP</span>
                    <input class="mm-input" type="password" name="password" [(ngModel)]="settingsForm.password" placeholder="Dejar vacío para mantener el actual" />
                  </label>

                  @if (messagingFacade.workspace()?.settings?.passwordConfigured) {
                    <p class="rounded-2xl border border-line/60 bg-panel/70 px-4 py-3 text-sm text-muted">
                      Ya existe un secreto SMTP configurado. Solo escribe un nuevo password si quieres rotarlo.
                    </p>
                  }

                  <div class="grid gap-3">
                    <label class="flex items-center gap-3 rounded-2xl border border-line/60 bg-panel/70 px-4 py-3 text-sm text-text">
                      <input type="checkbox" name="authRequired" [(ngModel)]="settingsForm.authRequired" />
                      Autenticación SMTP requerida
                    </label>
                    <label class="flex items-center gap-3 rounded-2xl border border-line/60 bg-panel/70 px-4 py-3 text-sm text-text">
                      <input type="checkbox" name="starttlsEnabled" [(ngModel)]="settingsForm.starttlsEnabled" />
                      STARTTLS habilitado
                    </label>
                    <label class="flex items-center gap-3 rounded-2xl border border-line/60 bg-panel/70 px-4 py-3 text-sm text-text">
                      <input type="checkbox" name="sslEnabled" [(ngModel)]="settingsForm.sslEnabled" />
                      SSL habilitado
                    </label>
                  </div>

                  <div class="grid gap-4">
                    <label class="grid gap-2">
                      <span class="text-sm font-medium text-text">Nombre remitente</span>
                      <input class="mm-input" type="text" name="fromName" [(ngModel)]="settingsForm.fromName" required />
                    </label>
                    <label class="grid gap-2">
                      <span class="text-sm font-medium text-text">Correo remitente</span>
                      <input class="mm-input" type="email" name="fromEmail" [(ngModel)]="settingsForm.fromEmail" required />
                    </label>
                    <label class="grid gap-2">
                      <span class="text-sm font-medium text-text">Reply-to</span>
                      <input class="mm-input" type="email" name="replyToEmail" [(ngModel)]="settingsForm.replyToEmail" />
                    </label>
                  </div>

                  <div class="grid gap-4 md:grid-cols-3">
                    <label class="grid gap-2">
                      <span class="text-sm font-medium text-text">Connect timeout</span>
                      <input class="mm-input" type="number" name="connectionTimeoutMs" [(ngModel)]="settingsForm.connectionTimeoutMs" min="1000" required />
                    </label>
                    <label class="grid gap-2">
                      <span class="text-sm font-medium text-text">Read timeout</span>
                      <input class="mm-input" type="number" name="readTimeoutMs" [(ngModel)]="settingsForm.readTimeoutMs" min="1000" required />
                    </label>
                    <label class="grid gap-2">
                      <span class="text-sm font-medium text-text">Write timeout</span>
                      <input class="mm-input" type="number" name="writeTimeoutMs" [(ngModel)]="settingsForm.writeTimeoutMs" min="1000" required />
                    </label>
                  </div>
                </div>

                <p class="rounded-2xl border border-line/60 bg-panel/70 px-4 py-3 text-sm text-muted">
                  Preset recomendado para Google Workspace relay: <strong class="text-text">smtp-relay.gmail.com</strong>, puerto
                  <strong class="text-text">587</strong>, protocolo <strong class="text-text">smtp</strong> y STARTTLS habilitado.
                </p>

                <button type="submit" class="mm-button-primary w-full" [disabled]="messagingFacade.settingsSaveStatus() === 'loading'">
                  {{ messagingFacade.settingsSaveStatus() === 'loading' ? 'Guardando...' : 'Guardar configuración SMTP' }}
                </button>
              </form>

              <form class="mm-surface space-y-4 p-5" (ngSubmit)="sendTestEmail()">
                <div class="space-y-2">
                  <p class="mm-eyebrow">Prueba controlada</p>
                  <h3 class="text-2xl font-semibold text-text">Enviar correo de prueba</h3>
                  <p class="text-sm leading-6 text-muted">
                    Úsalo para validar conexión, remitente y reputación básica antes de disparar plantillas a tenants.
                  </p>
                </div>

                <label class="grid gap-2">
                  <span class="text-sm font-medium text-text">Correo destino</span>
                  <input class="mm-input" type="email" name="recipientEmail" [(ngModel)]="testForm.recipientEmail" required />
                </label>
                <label class="grid gap-2">
                  <span class="text-sm font-medium text-text">Nombre destino</span>
                  <input class="mm-input" type="text" name="recipientName" [(ngModel)]="testForm.recipientName" />
                </label>

                @if (messagingFacade.lastTestResult()) {
                  <p class="rounded-2xl border border-line/60 bg-panel/70 px-4 py-3 text-sm text-muted">
                    Última prueba enviada a <strong class="text-text">{{ messagingFacade.lastTestResult()?.recipientEmail }}</strong>
                    el {{ messagingFacade.lastTestResult()?.sentAt | date: 'medium' }}.
                  </p>
                }

                <button type="submit" class="mm-button-primary w-full" [disabled]="messagingFacade.testStatus() === 'loading'">
                  {{ messagingFacade.testStatus() === 'loading' ? 'Enviando...' : 'Enviar prueba SMTP' }}
                </button>
              </form>

              <article class="mm-surface space-y-4 p-5">
                <div class="space-y-2">
                  <p class="mm-eyebrow">Placeholders inteligentes</p>
                  <h3 class="text-2xl font-semibold text-text">Catálogo reusable</h3>
                  <p class="text-sm leading-6 text-muted">
                    Inserta variables y luego previsualízalas contra un tenant real para ver los valores resueltos antes de enviar.
                  </p>
                </div>

                <label class="grid gap-2">
                  <span class="text-sm font-medium text-text">Insertar en</span>
                  <select class="mm-input" name="placeholderInsertTarget" [ngModel]="placeholderInsertTarget()" (ngModelChange)="placeholderInsertTarget.set($event)">
                    <option value="subject">Asunto</option>
                    <option value="html">HTML</option>
                    <option value="text">Texto plano</option>
                  </select>
                </label>

                <div class="space-y-3">
                  @for (placeholder of placeholders(); track placeholder.key) {
                    <article class="rounded-3xl border border-line/70 bg-panel/70 p-4">
                      <div class="flex flex-col gap-3">
                        <div class="space-y-1">
                          <p class="text-sm font-semibold text-text">{{ placeholder.label }}</p>
                          <p class="text-xs text-muted">{{ placeholder.description }}</p>
                        </div>
                        <p class="rounded-2xl bg-surface-3/70 px-3 py-2 font-mono text-xs text-text">{{ tokenFor(placeholder.key) }}</p>
                        <p class="text-xs text-muted">Ejemplo: {{ placeholder.exampleValue }}</p>
                        <button type="button" class="mm-button-secondary" (click)="insertPlaceholder(placeholder.key)">
                          Insertar en {{ insertTargetLabel() }}
                        </button>
                      </div>
                    </article>
                  }
                </div>
              </article>
            </section>

            <section class="space-y-6">
              <article class="mm-surface space-y-4 p-5">
                <div class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div class="space-y-1">
                    <p class="mm-eyebrow">Biblioteca de plantillas</p>
                    <h3 class="text-2xl font-semibold text-text">Gestor de plantillas</h3>
                  </div>
                  <button type="button" class="mm-button-secondary" (click)="startNewTemplate()">Nueva plantilla</button>
                </div>

                @if (templates().length === 0) {
                  <mm-empty-state title="Sin plantillas" description="Crea la primera plantilla transaccional o informativa para tenants." />
                } @else {
                  <div class="grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">
                    @for (template of templates(); track template.templateId) {
                      <article class="rounded-3xl border border-line/70 bg-panel/70 p-4">
                        <div class="flex items-start justify-between gap-3">
                          <div class="space-y-1">
                            <p class="mm-eyebrow">{{ template.category }}</p>
                            <h4 class="text-lg font-semibold text-text">{{ template.name }}</h4>
                            <p class="text-xs text-muted">{{ template.code }}</p>
                          </div>
                          <span
                            class="rounded-pill px-2 py-1 text-[0.7rem] font-semibold"
                            [ngClass]="template.active ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'"
                          >
                            {{ template.active ? 'Activa' : 'Inactiva' }}
                          </span>
                        </div>
                        <p class="mt-3 text-xs text-muted">Actualizada {{ template.updatedAt | date: 'short' }}</p>
                        <div class="mt-4 flex gap-2">
                          <button type="button" class="mm-button-secondary flex-1" (click)="selectTemplate(template.templateId)">Editar</button>
                        </div>
                      </article>
                    }
                  </div>
                }
              </article>

              <div class="grid gap-6 xl:grid-cols-[minmax(0,1.1fr),minmax(0,0.9fr)]">
                <form class="mm-surface space-y-4 p-5" (ngSubmit)="saveTemplate()">
                  <div class="flex items-center justify-between gap-3">
                    <div class="space-y-1">
                      <p class="mm-eyebrow">{{ selectedTemplateId() ? 'Edición' : 'Creación' }}</p>
                      <h3 class="text-2xl font-semibold text-text">
                        {{ selectedTemplateId() ? 'Plantilla seleccionada' : 'Nueva plantilla' }}
                      </h3>
                    </div>
                    @if (selectedTemplateId()) {
                      <button type="button" class="mm-button-secondary" (click)="deleteTemplate()">Eliminar</button>
                    }
                  </div>

                  <div class="grid gap-4 md:grid-cols-2">
                    <label class="grid gap-2">
                      <span class="text-sm font-medium text-text">Código</span>
                      <input class="mm-input" type="text" name="templateCode" [(ngModel)]="templateForm.code" required />
                    </label>
                    <label class="grid gap-2">
                      <span class="text-sm font-medium text-text">Categoría</span>
                      <select class="mm-input" name="templateCategory" [(ngModel)]="templateForm.category">
                        @for (category of categories; track category) {
                          <option [value]="category">{{ category }}</option>
                        }
                      </select>
                    </label>
                  </div>

                  <label class="grid gap-2">
                    <span class="text-sm font-medium text-text">Nombre</span>
                    <input class="mm-input" type="text" name="templateName" [(ngModel)]="templateForm.name" required />
                  </label>

                  <label class="grid gap-2">
                    <span class="text-sm font-medium text-text">Descripción</span>
                    <textarea class="mm-input min-h-24" name="templateDescription" [(ngModel)]="templateForm.description"></textarea>
                  </label>

                  <label class="grid gap-2">
                    <span class="text-sm font-medium text-text">Asunto</span>
                    <input class="mm-input" type="text" name="subjectTemplate" [(ngModel)]="templateForm.subjectTemplate" required />
                  </label>

                  <label class="grid gap-2">
                    <span class="text-sm font-medium text-text">HTML</span>
                    <textarea class="mm-input min-h-[18rem] font-mono text-sm" name="htmlTemplate" [(ngModel)]="templateForm.htmlTemplate" required></textarea>
                  </label>

                  <label class="grid gap-2">
                    <span class="text-sm font-medium text-text">Texto plano</span>
                    <textarea class="mm-input min-h-40 font-mono text-sm" name="textTemplate" [(ngModel)]="templateForm.textTemplate"></textarea>
                  </label>

                  <label class="flex items-center gap-3 rounded-2xl border border-line/60 bg-panel/70 px-4 py-3 text-sm text-text">
                    <input type="checkbox" name="templateActive" [(ngModel)]="templateForm.active" />
                    Plantilla activa para preview y envío
                  </label>

                  @if (messagingFacade.templateDetail()?.placeholderKeys?.length) {
                    <div class="rounded-2xl border border-line/60 bg-panel/70 px-4 py-3">
                      <p class="text-sm font-medium text-text">Variables detectadas</p>
                      <div class="mt-3 flex flex-wrap gap-2">
                        @for (placeholderKey of messagingFacade.templateDetail()?.placeholderKeys || []; track placeholderKey) {
                          <span class="rounded-pill bg-surface-3/80 px-2 py-1 text-xs font-mono text-text">{{ tokenFor(placeholderKey) }}</span>
                        }
                      </div>
                    </div>
                  }

                  <button type="submit" class="mm-button-primary w-full" [disabled]="messagingFacade.templateSaveStatus() === 'loading'">
                    {{ messagingFacade.templateSaveStatus() === 'loading' ? 'Guardando...' : selectedTemplateId() ? 'Actualizar plantilla' : 'Crear plantilla' }}
                  </button>
                </form>

                <div class="space-y-6">
                  <article class="mm-surface space-y-4 p-5">
                    <div class="space-y-1">
                      <p class="mm-eyebrow">Preview contextual</p>
                      <h3 class="text-2xl font-semibold text-text">Resolver placeholders</h3>
                    </div>

                    <label class="grid gap-2">
                      <span class="text-sm font-medium text-text">Tenant</span>
                      <select class="mm-input" name="previewTenantId" [(ngModel)]="previewForm.tenantId">
                        <option value="">Sin contexto tenant</option>
                        @for (tenant of tenants(); track tenant.tenantId) {
                          <option [value]="tenant.tenantId">{{ tenant.name }} · {{ tenant.code }}</option>
                        }
                      </select>
                    </label>

                    <label class="grid gap-2">
                      <span class="text-sm font-medium text-text">Ticket soporte (opcional)</span>
                      <select class="mm-input" name="previewSupportTicketId" [(ngModel)]="previewForm.supportTicketId">
                        <option value="">Sin ticket</option>
                        @for (ticket of supportTickets(); track ticket.ticketId) {
                          <option [value]="ticket.ticketId">{{ ticket.subject }} · {{ ticket.tenantName || ticket.tenantId }}</option>
                        }
                      </select>
                    </label>

                    <button type="button" class="mm-button-primary w-full" [disabled]="!selectedTemplateId() || messagingFacade.previewStatus() === 'loading'" (click)="previewTemplate()">
                      {{ messagingFacade.previewStatus() === 'loading' ? 'Renderizando...' : 'Generar preview' }}
                    </button>

                    @if (messagingFacade.preview()) {
                      <div class="space-y-4">
                        <div class="rounded-2xl border border-line/60 bg-panel/70 px-4 py-3">
                          <p class="text-sm text-muted">Asunto resuelto</p>
                          <p class="mt-2 text-base font-semibold text-text">{{ messagingFacade.preview()?.subject }}</p>
                        </div>

                        @if (messagingFacade.preview()?.unresolvedPlaceholders?.length) {
                          <div class="rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3">
                            <p class="text-sm font-medium text-warning">Placeholders sin resolver</p>
                            <div class="mt-3 flex flex-wrap gap-2">
                              @for (placeholderKey of messagingFacade.preview()?.unresolvedPlaceholders || []; track placeholderKey) {
                                <span class="rounded-pill bg-warning/15 px-2 py-1 text-xs font-mono text-warning">{{ tokenFor(placeholderKey) }}</span>
                              }
                            </div>
                          </div>
                        }

                        @if (resolvedPreviewEntries().length > 0) {
                          <div class="rounded-2xl border border-line/60 bg-panel/70 px-4 py-3">
                            <p class="text-sm font-medium text-text">Valores resueltos</p>
                            <div class="mt-3 grid gap-2">
                              @for (entry of resolvedPreviewEntries(); track entry[0]) {
                                <div class="grid gap-1 rounded-xl border border-line/50 bg-surface-2/60 px-3 py-2">
                                  <p class="text-xs font-mono text-muted">{{ tokenFor(entry[0]) }}</p>
                                  <p class="text-sm text-text">{{ entry[1] }}</p>
                                </div>
                              }
                            </div>
                          </div>
                        }

                        <div class="rounded-2xl border border-line/60 bg-panel/70 px-4 py-3">
                          <p class="text-sm font-medium text-text">Vista HTML</p>
                          <div class="mt-3 rounded-2xl border border-line/50 bg-white p-4 text-sm text-slate-900" [innerHTML]="messagingFacade.preview()?.htmlBody"></div>
                        </div>

                        <div class="rounded-2xl border border-line/60 bg-panel/70 px-4 py-3">
                          <p class="text-sm font-medium text-text">Texto plano</p>
                          <pre class="mt-3 whitespace-pre-wrap text-xs text-text">{{ messagingFacade.preview()?.textBody }}</pre>
                        </div>
                      </div>
                    } @else {
                      <mm-empty-state title="Sin preview" description="Selecciona tenant y dispara una previsualización para validar placeholders y contenido." />
                    }
                  </article>

                  <article class="mm-surface space-y-4 p-5">
                    <div class="space-y-1">
                      <p class="mm-eyebrow">Envío manual</p>
                      <h3 class="text-2xl font-semibold text-text">Despachar plantilla</h3>
                    </div>

                    <label class="grid gap-2">
                      <span class="text-sm font-medium text-text">Tenant destino</span>
                      <select class="mm-input" name="dispatchTenantId" [(ngModel)]="dispatchForm.tenantId" required>
                        <option value="">Selecciona tenant</option>
                        @for (tenant of tenants(); track tenant.tenantId) {
                          <option [value]="tenant.tenantId">{{ tenant.name }} · {{ tenant.code }}</option>
                        }
                      </select>
                    </label>

                    <label class="grid gap-2">
                      <span class="text-sm font-medium text-text">Modo destinatario</span>
                      <select class="mm-input" name="recipientMode" [(ngModel)]="dispatchForm.recipientMode">
                        @for (mode of recipientModes; track mode) {
                          <option [value]="mode">{{ mode }}</option>
                        }
                      </select>
                    </label>

                    @if (dispatchForm.recipientMode === 'CUSTOM') {
                      <div class="grid gap-4 md:grid-cols-2">
                        <label class="grid gap-2">
                          <span class="text-sm font-medium text-text">Correo custom</span>
                          <input class="mm-input" type="email" name="customRecipientEmail" [(ngModel)]="dispatchForm.customRecipientEmail" required />
                        </label>
                        <label class="grid gap-2">
                          <span class="text-sm font-medium text-text">Nombre custom</span>
                          <input class="mm-input" type="text" name="customRecipientName" [(ngModel)]="dispatchForm.customRecipientName" />
                        </label>
                      </div>
                    }

                    <label class="grid gap-2">
                      <span class="text-sm font-medium text-text">Ticket soporte asociado (opcional)</span>
                      <select class="mm-input" name="dispatchSupportTicketId" [(ngModel)]="dispatchForm.supportTicketId">
                        <option value="">Sin ticket</option>
                        @for (ticket of supportTickets(); track ticket.ticketId) {
                          <option [value]="ticket.ticketId">{{ ticket.subject }} · {{ ticket.tenantName || ticket.tenantId }}</option>
                        }
                      </select>
                    </label>

                    @if (messagingFacade.lastDispatch()) {
                      <p class="rounded-2xl border border-line/60 bg-panel/70 px-4 py-3 text-sm text-muted">
                        Último envío a <strong class="text-text">{{ messagingFacade.lastDispatch()?.recipientEmail }}</strong>
                        el {{ messagingFacade.lastDispatch()?.sentAt | date: 'medium' }}.
                      </p>
                    }

                    <button type="button" class="mm-button-primary w-full" [disabled]="!selectedTemplateId() || messagingFacade.dispatchStatus() === 'loading'" (click)="dispatchTemplate()">
                      {{ messagingFacade.dispatchStatus() === 'loading' ? 'Enviando...' : 'Enviar correo al tenant' }}
                    </button>
                  </article>
                </div>
              </div>
            </section>
          </div>
        }
      </section>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlatformCommunicationsPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly messagingFacade = inject(PlatformMessagingFacade);
  protected readonly workspaceFacade = inject(PlatformWorkspaceFacade);
  protected readonly platformSessionService = inject(PlatformSessionService);

  protected readonly content = this.route.snapshot.data as SectionPageContent;
  protected readonly navigation = computed<NavigationItem[]>(() => PLATFORM_NAVIGATION.filter(
    (item) => !item.requiredPermission || this.platformSessionService.hasPermission(item.requiredPermission)
  ));
  protected readonly providers: PlatformEmailProviderDto[] = ['GOOGLE_WORKSPACE', 'CUSTOM_SMTP'];
  protected readonly categories: PlatformEmailTemplateCategoryDto[] = [
    'INFORMATIONAL',
    'ONBOARDING',
    'BILLING',
    'SUPPORT',
    'LEGAL',
    'CAMPAIGN',
    'SECURITY'
  ];
  protected readonly recipientModes: PlatformEmailRecipientModeDto[] = ['OWNER', 'BILLING', 'CUSTOM'];
  protected readonly pageError = computed(() => this.messagingFacade.errorMessage() ?? this.workspaceFacade.errorMessage());
  protected readonly templates = computed(() => this.messagingFacade.workspace()?.templates ?? []);
  protected readonly placeholders = computed(() => this.messagingFacade.workspace()?.placeholders ?? []);
  protected readonly tenants = computed(() => [...this.workspaceFacade.tenants()].sort((left, right) => left.name.localeCompare(right.name)));
  protected readonly supportTickets = computed(() => [...this.workspaceFacade.supportTickets()].sort(
    (left, right) => right.lastMessageAt.localeCompare(left.lastMessageAt)
  ));
  protected readonly activeTemplateCount = computed(() => this.templates().filter((template) => template.active).length);
  protected readonly templateCount = computed(() => this.templates().length);
  protected readonly selectedTemplateId = computed(() => this.messagingFacade.templateDetail()?.templateId ?? null);
  protected readonly resolvedPreviewEntries = computed(() => Object.entries(this.messagingFacade.preview()?.resolvedPlaceholders ?? {}));
  protected readonly placeholderInsertTarget = signal<PlaceholderInsertTarget>('html');
  protected readonly successMessage = signal<string | null>(null);
  private readonly queuedSuccessMessage = signal<string | null>(null);

  protected settingsForm: EmailSettingsForm = this.settingsFormDefaults();
  protected templateForm: TemplateForm = this.templateFormDefaults();
  protected testForm: TestForm = this.testFormDefaults();
  protected previewForm: PreviewForm = this.previewFormDefaults();
  protected dispatchForm: DispatchForm = this.dispatchFormDefaults();

  constructor() {
    this.refreshPage();

    effect(() => {
      const workspace = this.messagingFacade.workspace();
      if (workspace) {
        this.hydrateSettingsForm(workspace.settings);
      }
    });

    effect(() => {
      const template = this.messagingFacade.templateDetail();
      if (template) {
        this.hydrateTemplateForm(template);
      }
    });

    effect(() => {
      if (!this.messagingFacade.templateDetail() && this.messagingFacade.templateDetailStatus() !== 'loading') {
        this.templateForm = this.templateFormDefaults();
      }
    });

    effect(() => {
      const actor = this.platformSessionService.actor();
      if (actor && !this.testForm.recipientEmail) {
        this.testForm = {
          recipientEmail: actor.email,
          recipientName: actor.fullName
        };
      }
    });

    effect(() => {
      const tenants = this.tenants();
      if (!this.previewForm.tenantId && tenants.length > 0) {
        this.previewForm.tenantId = tenants[0].tenantId;
      }
      if (!this.dispatchForm.tenantId && tenants.length > 0) {
        this.dispatchForm.tenantId = tenants[0].tenantId;
      }
    });

    effect(() => {
      if (this.pageError()) {
        this.queuedSuccessMessage.set(null);
        this.successMessage.set(null);
      }
    });

    effect(() => {
      if (this.messagingFacade.settingsSaveStatus() === 'success') {
        this.settingsForm.password = '';
        this.flushSuccessMessage('Configuración SMTP actualizada.');
      }
    });

    effect(() => {
      if (this.messagingFacade.testStatus() === 'success') {
        this.flushSuccessMessage('Correo de prueba enviado.');
      }
    });

    effect(() => {
      if (this.messagingFacade.templateSaveStatus() === 'success') {
        this.flushSuccessMessage('Plantilla persistida correctamente.');
      }
    });

    effect(() => {
      if (this.messagingFacade.dispatchStatus() === 'success') {
        this.flushSuccessMessage('Correo enviado al tenant.');
      }
    });
  }

  protected refreshPage(): void {
    this.successMessage.set(null);
    this.messagingFacade.loadWorkspace();
    if (this.platformSessionService.hasPermission('platform.tenants.read')) {
      this.workspaceFacade.loadWorkspace();
    }
    if (this.platformSessionService.hasPermission('platform.support.read')) {
      this.workspaceFacade.loadSupportTickets();
    }
  }

  protected logout(): void {
    this.platformSessionService.logout().subscribe({
      next: () => this.router.navigate(['/login'])
    });
  }

  protected applyGoogleWorkspacePreset(): void {
    this.settingsForm = {
      ...this.settingsForm,
      providerCode: 'GOOGLE_WORKSPACE',
      host: 'smtp-relay.gmail.com',
      port: 587,
      protocol: 'smtp',
      authRequired: false,
      starttlsEnabled: true,
      sslEnabled: false
    };
  }

  protected saveSettings(): void {
    this.queueSuccessMessage('Configuración SMTP actualizada.');
    this.messagingFacade.updateEmailSettings({
      providerCode: this.settingsForm.providerCode,
      host: this.settingsForm.host.trim(),
      port: this.settingsForm.port,
      protocol: this.settingsForm.protocol.trim(),
      authRequired: this.settingsForm.authRequired,
      starttlsEnabled: this.settingsForm.starttlsEnabled,
      sslEnabled: this.settingsForm.sslEnabled,
      username: this.trimToNull(this.settingsForm.username),
      password: this.trimToNull(this.settingsForm.password),
      fromName: this.settingsForm.fromName.trim(),
      fromEmail: this.settingsForm.fromEmail.trim(),
      replyToEmail: this.trimToNull(this.settingsForm.replyToEmail),
      connectionTimeoutMs: this.settingsForm.connectionTimeoutMs,
      readTimeoutMs: this.settingsForm.readTimeoutMs,
      writeTimeoutMs: this.settingsForm.writeTimeoutMs
    });
  }

  protected sendTestEmail(): void {
    this.queueSuccessMessage('Correo de prueba enviado.');
    this.messagingFacade.sendEmailSettingsTest({
      recipientEmail: this.testForm.recipientEmail.trim(),
      recipientName: this.trimToNull(this.testForm.recipientName)
    });
  }

  protected startNewTemplate(): void {
    this.successMessage.set(null);
    this.messagingFacade.clearTemplateSelection();
    this.templateForm = this.templateFormDefaults();
  }

  protected selectTemplate(templateId: string): void {
    this.successMessage.set(null);
    this.messagingFacade.loadTemplate(templateId);
  }

  protected saveTemplate(): void {
    this.successMessage.set(null);
    const payload = {
      code: this.slugify(this.templateForm.code || this.templateForm.name, 'template'),
      name: this.templateForm.name.trim(),
      category: this.templateForm.category,
      description: this.trimToNull(this.templateForm.description),
      subjectTemplate: this.templateForm.subjectTemplate.trim(),
      htmlTemplate: this.templateForm.htmlTemplate.trim(),
      textTemplate: this.trimToNull(this.templateForm.textTemplate),
      active: this.templateForm.active
    };

    if (this.selectedTemplateId()) {
      this.queueSuccessMessage('Plantilla actualizada.');
      this.messagingFacade.updateTemplate(this.selectedTemplateId() as string, payload);
      return;
    }

    this.queueSuccessMessage('Plantilla creada.');
    this.messagingFacade.createTemplate(payload);
  }

  protected deleteTemplate(): void {
    const templateId = this.selectedTemplateId();
    if (!templateId) {
      return;
    }

    if (!window.confirm('Esta acción elimina la plantilla seleccionada. ¿Deseas continuar?')) {
      return;
    }

    this.queueSuccessMessage('Plantilla eliminada.');
    this.messagingFacade.deleteTemplate(templateId);
  }

  protected previewTemplate(): void {
    const templateId = this.selectedTemplateId();
    if (!templateId) {
      this.successMessage.set('Guarda o selecciona una plantilla antes de generar preview.');
      return;
    }

    this.successMessage.set(null);
    this.messagingFacade.previewTemplate(templateId, {
      tenantId: this.trimToNull(this.previewForm.tenantId),
      supportTicketId: this.trimToNull(this.previewForm.supportTicketId)
    });
  }

  protected dispatchTemplate(): void {
    const templateId = this.selectedTemplateId();
    if (!templateId) {
      this.successMessage.set('Guarda o selecciona una plantilla antes de enviarla.');
      return;
    }

    this.queueSuccessMessage('Correo enviado al tenant.');
    this.messagingFacade.dispatchTemplate(templateId, {
      tenantId: this.dispatchForm.tenantId,
      recipientMode: this.dispatchForm.recipientMode,
      customRecipientEmail: this.dispatchForm.recipientMode === 'CUSTOM' ? this.trimToNull(this.dispatchForm.customRecipientEmail) : null,
      customRecipientName: this.dispatchForm.recipientMode === 'CUSTOM' ? this.trimToNull(this.dispatchForm.customRecipientName) : null,
      supportTicketId: this.trimToNull(this.dispatchForm.supportTicketId)
    });
  }

  protected insertPlaceholder(key: string): void {
    const token = this.tokenFor(key);
    switch (this.placeholderInsertTarget()) {
      case 'subject':
        this.templateForm.subjectTemplate = this.appendToken(this.templateForm.subjectTemplate, token);
        break;
      case 'text':
        this.templateForm.textTemplate = this.appendToken(this.templateForm.textTemplate, token);
        break;
      default:
        this.templateForm.htmlTemplate = this.appendToken(this.templateForm.htmlTemplate, token);
        break;
    }
  }

  protected insertTargetLabel(): string {
    switch (this.placeholderInsertTarget()) {
      case 'subject':
        return 'asunto';
      case 'text':
        return 'texto plano';
      default:
        return 'HTML';
    }
  }

  protected tokenFor(key: string): string {
    return `{{${key}}}`;
  }

  private hydrateSettingsForm(settings: {
    providerCode: PlatformEmailProviderDto;
    host: string;
    port: number;
    protocol: string;
    authRequired: boolean;
    starttlsEnabled: boolean;
    sslEnabled: boolean;
    username: string | null;
    fromName: string;
    fromEmail: string;
    replyToEmail: string | null;
    connectionTimeoutMs: number;
    readTimeoutMs: number;
    writeTimeoutMs: number;
  }): void {
    this.settingsForm = {
      providerCode: settings.providerCode,
      host: settings.host,
      port: settings.port,
      protocol: settings.protocol,
      authRequired: settings.authRequired,
      starttlsEnabled: settings.starttlsEnabled,
      sslEnabled: settings.sslEnabled,
      username: settings.username ?? '',
      password: '',
      fromName: settings.fromName,
      fromEmail: settings.fromEmail,
      replyToEmail: settings.replyToEmail ?? '',
      connectionTimeoutMs: settings.connectionTimeoutMs,
      readTimeoutMs: settings.readTimeoutMs,
      writeTimeoutMs: settings.writeTimeoutMs
    };
  }

  private hydrateTemplateForm(template: {
    code: string;
    name: string;
    category: PlatformEmailTemplateCategoryDto;
    description: string | null;
    subjectTemplate: string;
    htmlTemplate: string;
    textTemplate: string | null;
    active: boolean;
  }): void {
    this.templateForm = {
      code: template.code,
      name: template.name,
      category: template.category,
      description: template.description ?? '',
      subjectTemplate: template.subjectTemplate,
      htmlTemplate: template.htmlTemplate,
      textTemplate: template.textTemplate ?? '',
      active: template.active
    };
  }

  private settingsFormDefaults(): EmailSettingsForm {
    return {
      providerCode: 'GOOGLE_WORKSPACE',
      host: 'smtp-relay.gmail.com',
      port: 587,
      protocol: 'smtp',
      authRequired: false,
      starttlsEnabled: true,
      sslEnabled: false,
      username: '',
      password: '',
      fromName: 'MixMaster',
      fromEmail: '',
      replyToEmail: '',
      connectionTimeoutMs: 5000,
      readTimeoutMs: 5000,
      writeTimeoutMs: 5000
    };
  }

  private templateFormDefaults(): TemplateForm {
    return {
      code: '',
      name: '',
      category: 'INFORMATIONAL',
      description: '',
      subjectTemplate: '',
      htmlTemplate: '<p>Hola {{tenant.ownerFullName}},</p>\n<p></p>',
      textTemplate: 'Hola {{tenant.ownerFullName}},',
      active: true
    };
  }

  private testFormDefaults(): TestForm {
    return {
      recipientEmail: '',
      recipientName: ''
    };
  }

  private previewFormDefaults(): PreviewForm {
    return {
      tenantId: '',
      supportTicketId: ''
    };
  }

  private dispatchFormDefaults(): DispatchForm {
    return {
      tenantId: '',
      recipientMode: 'OWNER',
      customRecipientEmail: '',
      customRecipientName: '',
      supportTicketId: ''
    };
  }

  private appendToken(currentValue: string, token: string): string {
    if (!currentValue.trim()) {
      return token;
    }

    return currentValue.endsWith(' ') || currentValue.endsWith('\n')
      ? `${currentValue}${token}`
      : `${currentValue} ${token}`;
  }

  private trimToNull(value: string): string | null {
    const normalizedValue = value.trim();
    return normalizedValue.length > 0 ? normalizedValue : null;
  }

  private slugify(rawValue: string, fallback: string): string {
    const value = rawValue
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return value.length > 0 ? value : fallback;
  }

  private queueSuccessMessage(message: string): void {
    this.successMessage.set(null);
    this.queuedSuccessMessage.set(message);
  }

  private flushSuccessMessage(fallbackMessage: string): void {
    const message = this.queuedSuccessMessage() ?? fallbackMessage;
    this.successMessage.set(message);
    this.queuedSuccessMessage.set(null);
  }
}
