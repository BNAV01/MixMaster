import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'mm-feedback-prompt',
  standalone: true,
  template: `
    <section class="mm-surface space-y-5 p-5">
      <div class="space-y-2">
        <p class="mm-eyebrow">{{ eyebrow() }}</p>
        <h3 class="text-2xl font-semibold text-text">{{ title() }}</h3>
        <p class="text-sm leading-6 text-muted">{{ description() }}</p>
      </div>

      <div class="flex flex-wrap gap-3">
        @for (option of sentimentOptions(); track option) {
          <button type="button" class="mm-button-secondary" (click)="sentimentSelected.emit(option)">
            {{ option }}
          </button>
        }
      </div>

      <div class="flex flex-wrap gap-2">
        @for (adjustment of adjustments(); track adjustment) {
          <button type="button" class="mm-chip" (click)="adjustmentSelected.emit(adjustment)">
            {{ adjustment }}
          </button>
        }
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeedbackPromptComponent {
  readonly eyebrow = input('Feedback breve');
  readonly title = input('Te acertamos?');
  readonly description = input('Ayudanos a ajustar mejor la siguiente recomendacion sin hacerte perder tiempo.');
  readonly sentimentOptions = input<ReadonlyArray<string>>(['Si', 'Mas o menos', 'No']);
  readonly adjustments = input<ReadonlyArray<string>>([
    'Mas dulce',
    'Menos dulce',
    'Mas suave',
    'Mas intenso',
    'Mas parecido a lo mio',
    'Mas atrevido'
  ]);
  readonly sentimentSelected = output<string>();
  readonly adjustmentSelected = output<string>();
}
