import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export interface BenefitCardViewModel {
  id: string;
  title: string;
  description: string;
  badge: string;
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
      <button type="button" class="mm-button-secondary mt-auto" (click)="selected.emit(benefit().id)">Ver detalle</button>
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BenefitCardComponent {
  readonly benefit = input.required<BenefitCardViewModel>();
  readonly selected = output<string>();
}
