import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'mm-dislike-chip',
  standalone: true,
  imports: [NgClass],
  template: `
    <button
      type="button"
      class="rounded-pill border px-3 py-2 text-sm transition duration-240 ease-expressive"
      [ngClass]="{
        'border-danger/30 bg-danger/10 text-text': selected(),
        'border-border/20 bg-surface-2/70 text-muted': !selected()
      }"
      (click)="toggled.emit()"
    >
      {{ label() }}
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DislikeChipComponent {
  readonly label = input.required<string>();
  readonly selected = input(false);
  readonly toggled = output<void>();
}
