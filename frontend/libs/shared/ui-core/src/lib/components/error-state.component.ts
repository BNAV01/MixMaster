import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'mm-error-state',
  standalone: true,
  template: `
    <section class="rounded-xl border border-danger/25 bg-danger/8 p-5 text-left">
      <p class="mm-eyebrow text-danger">Algo falló</p>
      <h3 class="mt-3 text-lg font-semibold text-text">{{ title() }}</h3>
      <p class="mt-2 text-sm leading-6 text-muted">{{ description() }}</p>
      @if (actionLabel()) {
        <button type="button" class="mm-button-secondary mt-4" (click)="retry.emit()">{{ actionLabel() }}</button>
      }
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorStateComponent {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly actionLabel = input('Reintentar');
  readonly retry = output<void>();
}
