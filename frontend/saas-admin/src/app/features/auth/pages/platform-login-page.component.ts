import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PlatformSessionService } from '../../../core/services/platform-session.service';
import { AsyncStatus, NormalizedApiError } from '@mixmaster/shared/models';
import { take } from 'rxjs';

@Component({
  selector: 'app-platform-login-page',
  standalone: true,
  imports: [FormsModule],
  template: `
    <section class="mx-auto flex min-h-dvh max-w-5xl items-center px-4 py-10">
      <div class="grid w-full gap-8 lg:grid-cols-[1.1fr,0.9fr]">
        <article class="mm-surface space-y-6 p-8">
          <p class="mm-eyebrow">MixMaster SaaS</p>
          <h1 class="text-4xl font-semibold text-text">Acceso de plataforma con sesiones reales y control multitenant</h1>
          <p class="text-base leading-7 text-muted">
            Esta consola ya no crea sesiones ficticias. Desde aquí se administran tenants, owners, sucursales base y gobierno inicial del producto.
          </p>
          <div class="grid gap-3 sm:grid-cols-2">
            <article class="rounded-3xl border border-line/70 bg-panel/70 p-4">
              <h2 class="text-sm font-semibold uppercase tracking-[0.24em] text-accent">Bloque activo</h2>
              <p class="mt-3 text-lg font-semibold text-text">Usuarios, roles, permisos y scopes</p>
            </article>
            <article class="rounded-3xl border border-line/70 bg-panel/70 p-4">
              <h2 class="text-sm font-semibold uppercase tracking-[0.24em] text-accent">Bootstrap</h2>
              <p class="mt-3 text-lg font-semibold text-text">Solo existe el SaaS admin inicial</p>
            </article>
          </div>
        </article>

        <form class="mm-surface space-y-5 p-8" (ngSubmit)="submit()">
          <div class="space-y-2">
            <p class="mm-eyebrow">Login</p>
            <h2 class="text-2xl font-semibold text-text">Operador SaaS</h2>
            <p class="text-sm leading-6 text-muted">Usa las credenciales persistentes del administrador principal o de soporte.</p>
          </div>

          <label class="grid gap-2">
            <span class="text-sm font-medium text-text">Correo</span>
            <input
              class="mm-input"
              type="email"
              name="email"
              [(ngModel)]="email"
              autocomplete="email"
              required
            />
          </label>

          <label class="grid gap-2">
            <span class="text-sm font-medium text-text">Contraseña</span>
            <input
              class="mm-input"
              type="password"
              name="password"
              [(ngModel)]="password"
              autocomplete="current-password"
              required
            />
          </label>

          @if (errorMessage()) {
            <p class="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">{{ errorMessage() }}</p>
          }

          <button type="submit" class="mm-button-primary w-full" [disabled]="status() === 'loading'">
            {{ status() === 'loading' ? 'Ingresando...' : 'Ingresar a plataforma' }}
          </button>
        </form>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlatformLoginPageComponent {
  private readonly router = inject(Router);
  private readonly platformSessionService = inject(PlatformSessionService);

  protected readonly status = signal<AsyncStatus>('idle');
  protected readonly errorMessage = signal<string | null>(null);

  protected email = '';
  protected password = '';

  constructor() {
    this.platformSessionService.restoreSession().pipe(take(1)).subscribe((isAuthenticated) => {
      if (isAuthenticated) {
        void this.router.navigateByUrl('/dashboard');
      }
    });
  }

  protected submit(): void {
    this.status.set('loading');
    this.errorMessage.set(null);

    this.platformSessionService.login({
      email: this.email.trim(),
      password: this.password
    }).pipe(take(1)).subscribe({
      next: () => {
        this.status.set('success');
        void this.router.navigateByUrl('/dashboard');
      },
      error: (error: NormalizedApiError) => {
        this.status.set('error');
        this.errorMessage.set(error.message);
      }
    });
  }
}
