import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'mm-price-pill',
  standalone: true,
  template: `
    <span class="inline-flex items-center rounded-pill bg-accent/16 px-3 py-1 text-sm font-semibold text-accent">
      {{ label() }}
    </span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PricePillComponent {
  readonly label = input.required<string>();
}
