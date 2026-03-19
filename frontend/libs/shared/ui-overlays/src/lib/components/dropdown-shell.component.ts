import { CdkConnectedOverlay, CdkOverlayOrigin } from '@angular/cdk/overlay';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'mm-dropdown-shell',
  standalone: true,
  imports: [CdkConnectedOverlay],
  template: `
    <ng-template
      cdkConnectedOverlay
      [cdkConnectedOverlayOpen]="open()"
      [cdkConnectedOverlayOrigin]="origin()"
      [cdkConnectedOverlayHasBackdrop]="true"
      [cdkConnectedOverlayBackdropClass]="'bg-transparent'"
      (backdropClick)="closed.emit()"
    >
      <div class="min-w-56 rounded-xl border border-border/20 bg-surface p-2 shadow-panel">
        <ng-content />
      </div>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DropdownShellComponent {
  readonly open = input(false);
  readonly origin = input.required<CdkOverlayOrigin>();
  readonly closed = output<void>();
}
