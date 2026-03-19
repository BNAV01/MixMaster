import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommandAction } from '@mixmaster/shared/models';

@Component({
  selector: 'mm-command-bar',
  standalone: true,
  template: `
    <div class="flex flex-wrap items-center gap-3 rounded-xl border border-border/20 bg-surface/75 p-3 backdrop-blur">
      @for (action of actions(); track action.id) {
        <button type="button" class="mm-button-secondary" (click)="actionSelected.emit(action.id)">
          <span>{{ action.label }}</span>
          @if (action.shortcut) {
            <span class="rounded bg-surface-3/80 px-1.5 py-0.5 text-[0.7rem] text-muted">{{ action.shortcut }}</span>
          }
        </button>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommandBarComponent {
  readonly actions = input.required<ReadonlyArray<CommandAction>>();
  readonly actionSelected = output<string>();
}
