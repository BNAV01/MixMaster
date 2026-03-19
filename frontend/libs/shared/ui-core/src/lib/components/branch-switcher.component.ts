import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'mm-branch-switcher',
  standalone: true,
  template: `
    <label class="flex min-w-52 flex-col gap-2 text-sm text-muted">
      <span class="font-medium text-text">Sucursal activa</span>
      <select
        class="rounded-lg border border-border/25 bg-surface-2/80 px-3 py-2.5 text-text focus:border-accent/40 focus:outline-none"
        [value]="activeBranchId()"
        (change)="branchChange.emit(($any($event.target).value))"
      >
        @for (branch of branches(); track branch.id) {
          <option [value]="branch.id">{{ branch.label }}</option>
        }
      </select>
    </label>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BranchSwitcherComponent {
  readonly branches = input.required<ReadonlyArray<{ id: string; label: string }>>();
  readonly activeBranchId = input<string | null>(null);
  readonly branchChange = output<string>();
}
