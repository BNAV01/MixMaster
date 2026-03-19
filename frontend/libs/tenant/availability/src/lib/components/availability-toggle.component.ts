import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'mm-availability-toggle',
  standalone: true,
  imports: [NgClass],
  template: `
    <button
      type="button"
      class="inline-flex items-center gap-2 rounded-pill border px-3 py-2 text-sm font-medium transition duration-240 ease-expressive"
      [ngClass]="{
        'border-success/25 bg-success/10 text-success': state() === 'available',
        'border-warning/25 bg-warning/10 text-warning': state() === 'low-stock',
        'border-danger/25 bg-danger/10 text-danger': state() === 'paused' || state() === 'unavailable'
      }"
      (click)="toggled.emit()"
    >
      <span>{{ label() }}</span>
      <span class="rounded-pill bg-surface-3/80 px-2 py-0.5 text-[0.7rem] text-text">{{ state() }}</span>
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AvailabilityToggleComponent {
  readonly label = input.required<string>();
  readonly state = input.required<'available' | 'low-stock' | 'paused' | 'unavailable'>();
  readonly toggled = output<void>();
}
