import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'mm-analytics-tile',
  standalone: true,
  template: `
    <article class="mm-surface space-y-3 p-4">
      <p class="text-sm font-medium text-muted">{{ label() }}</p>
      <p class="text-3xl font-semibold text-text">{{ value() }}</p>
      @if (delta()) {
        <p class="text-sm text-accent-2">{{ delta() }}</p>
      }
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnalyticsTileComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly delta = input<string>('');
}
