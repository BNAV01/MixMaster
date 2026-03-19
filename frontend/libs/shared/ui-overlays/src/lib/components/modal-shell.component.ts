import { CdkTrapFocus } from '@angular/cdk/a11y';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'mm-modal-shell',
  standalone: true,
  imports: [CdkTrapFocus],
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm">
        <div cdkTrapFocus class="w-full max-w-2xl rounded-2xl border border-border/20 bg-surface p-6 shadow-panel">
          <div class="flex items-start justify-between gap-4">
            <div class="space-y-2">
              <p class="mm-eyebrow">{{ eyebrow() }}</p>
              <h3 class="text-2xl font-semibold text-text">{{ title() }}</h3>
            </div>

            <button type="button" class="mm-button-secondary" (click)="closed.emit()">Cerrar</button>
          </div>

          <div class="mt-6">
            <ng-content />
          </div>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalShellComponent {
  readonly open = input(false);
  readonly eyebrow = input('Panel');
  readonly title = input.required<string>();
  readonly closed = output<void>();
}
