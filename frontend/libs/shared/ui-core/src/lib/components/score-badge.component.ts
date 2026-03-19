import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'mm-score-badge',
  standalone: true,
  imports: [NgClass],
  template: `
    <span
      class="inline-flex min-w-12 items-center justify-center rounded-pill px-2.5 py-1 text-xs font-semibold"
      [ngClass]="{
        'bg-success/15 text-success': score() >= 90,
        'bg-info/15 text-info': score() < 90 && score() >= 75,
        'bg-warning/15 text-warning': score() < 75
      }"
    >
      {{ score() }}%
    </span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScoreBadgeComponent {
  readonly score = input.required<number>();
}
