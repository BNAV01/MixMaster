import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export interface BenefitCardViewModel {
  id: string;
  title: string;
  description: string;
  badge: string;
  statusLabel?: string;
  pointsCostLabel?: string;
  expiresLabel?: string;
  ctaLabel?: string;
}

@Component({
  selector: 'mm-benefit-card',
  standalone: true,
  template: `
    <article class="mm-surface flex h-full flex-col gap-4 p-5">
      <div class="flex items-start justify-between gap-4">
        <div class="space-y-2">
          <p class="mm-eyebrow">Beneficio</p>
          <h3 class="text-xl font-semibold text-text">{{ benefit().title }}</h3>
        </div>
        <span class="rounded-pill bg-accent-2/15 px-3 py-1 text-sm font-semibold text-accent-2">{{ benefit().badge }}</span>
      </div>
      <p class="text-sm leading-6 text-muted">{{ benefit().description }}</p>

      @if (benefit().statusLabel || benefit().pointsCostLabel || benefit().expiresLabel) {
        <div class="space-y-2 rounded-2xl border border-border/15 bg-surface-2/74 p-3 text-sm">
          @if (benefit().statusLabel) {
            <p class="font-medium text-text">{{ benefit().statusLabel }}</p>
          }
          <div class="flex flex-wrap gap-2 text-muted">
            @if (benefit().pointsCostLabel) {
              <span class="rounded-pill bg-surface/70 px-2.5 py-1">{{ benefit().pointsCostLabel }}</span>
            }
            @if (benefit().expiresLabel) {
              <span class="rounded-pill bg-surface/70 px-2.5 py-1">{{ benefit().expiresLabel }}</span>
            }
          </div>
        </div>
      }

      <button type="button" class="mm-button-secondary mt-auto" (click)="selected.emit(benefit().id)">
        {{ benefit().ctaLabel ?? 'Ver detalle' }}
      </button>
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BenefitCardComponent {
  readonly benefit = input.required<BenefitCardViewModel>();
  readonly selected = output<string>();
}
