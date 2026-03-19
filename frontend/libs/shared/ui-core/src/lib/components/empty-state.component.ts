import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'mm-empty-state',
  standalone: true,
  template: `
    <section class="mm-empty-state">
      <p class="mm-eyebrow">{{ eyebrow() }}</p>
      <h3 class="mt-3 text-xl font-semibold text-text">{{ title() }}</h3>
      <p class="mt-2 max-w-prose text-sm leading-6 text-muted">{{ description() }}</p>

      @if (actionLabel()) {
        <button type="button" class="mm-button-primary mt-5" (click)="action.emit()">
          {{ actionLabel() }}
        </button>
      }
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptyStateComponent {
  readonly eyebrow = input('Sin datos');
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly actionLabel = input<string>('');
  readonly action = output<void>();
}
