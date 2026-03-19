import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'mm-taste-chip',
  standalone: true,
  imports: [NgClass],
  template: `
    <button
      type="button"
      class="rounded-pill border px-3 py-2 text-sm transition duration-240 ease-expressive"
      [ngClass]="{
        'border-accent/30 bg-accent/15 text-text': selected(),
        'border-border/20 bg-surface-2/70 text-muted': !selected()
      }"
      (click)="toggled.emit()"
    >
      {{ label() }}
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TasteChipComponent {
  readonly label = input.required<string>();
  readonly selected = input(false);
  readonly toggled = output<void>();
}
