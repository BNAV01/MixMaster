import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'mm-loading-skeleton',
  standalone: true,
  imports: [NgClass],
  template: `
    <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      @for (_ of placeholders(); track $index) {
        <div class="mm-surface animate-pulse space-y-3 p-4">
          <div class="h-4 w-24 rounded bg-surface-3/90"></div>
          <div class="h-8 w-2/3 rounded bg-surface-3/90"></div>
          @for (_line of linesPlaceholder(); track $index) {
            <div class="h-3 rounded bg-surface-3/70" [ngClass]="{ 'w-4/5': $index % 2 === 0, 'w-full': $index % 2 !== 0 }"></div>
          }
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadingSkeletonComponent {
  readonly cards = input(3);
  readonly lines = input(3);

  protected placeholders(): number[] {
    return Array.from({ length: this.cards() }, (_, index) => index);
  }

  protected linesPlaceholder(): number[] {
    return Array.from({ length: this.lines() }, (_, index) => index);
  }
}
