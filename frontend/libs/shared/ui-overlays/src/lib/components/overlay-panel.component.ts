import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'mm-overlay-panel',
  standalone: true,
  template: `
    <div class="rounded-xl border border-border/20 bg-surface p-4 shadow-panel">
      <ng-content />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OverlayPanelComponent {}
