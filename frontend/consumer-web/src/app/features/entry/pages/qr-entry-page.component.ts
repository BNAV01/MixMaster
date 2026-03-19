import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AppShellHeaderComponent, TenantBadgeComponent } from '@mixmaster/shared/ui-core';
import { ConsumerExperienceFacade } from '../../../core/facades/consumer-experience.facade';
import { ConsumerSessionService } from '../../../core/services/consumer-session.service';

@Component({
  selector: 'app-qr-entry-page',
  standalone: true,
  imports: [AppShellHeaderComponent, RouterLink, TenantBadgeComponent],
  template: `
    <section class="space-y-6">
      <mm-app-shell-header
        eyebrow="Entrada QR"
        title="Contexto detectado y listo para comenzar"
        description="Validamos QR, resolvemos sucursal y dejamos preparada la sesion anonima antes de entrar a la experiencia."
      />

      @if (experienceFacade.qrContext()) {
        <mm-tenant-badge
          [tenantName]="experienceFacade.qrContext()?.branchName ?? 'Sucursal detectada'"
          [branchName]="experienceFacade.qrContext()?.tableLabel ?? ''"
        />
      }

      <article class="mm-surface space-y-4 p-5">
        <div class="space-y-2">
          <p class="mm-eyebrow">Token activo</p>
          <h3 class="text-2xl font-semibold text-text">{{ qrCode() || 'Sin valor' }}</h3>
          <p class="text-sm leading-6 text-muted">
            Si el backend ya responde, esta vista consume contexto real. Mientras tanto usa un fallback coherente para no romper el flujo.
          </p>
        </div>

        <div class="flex flex-wrap gap-3">
          <a routerLink="/experience/start" class="mm-button-primary">Continuar</a>
          <a routerLink="/experience/menu" class="mm-button-secondary">Ver carta viva</a>
        </div>
      </article>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QrEntryPageComponent {
  private readonly route = inject(ActivatedRoute);
  protected readonly experienceFacade = inject(ConsumerExperienceFacade);
  private readonly consumerSessionService = inject(ConsumerSessionService);
  protected readonly qrCode = signal(this.route.snapshot.paramMap.get('qrCode'));

  constructor() {
    this.consumerSessionService.startQrSession(this.qrCode());
    if (this.qrCode()) {
      this.experienceFacade.loadQrContext(this.qrCode()!);
      this.experienceFacade.ensureAnonymousSession(this.qrCode()!);
    }
  }
}
