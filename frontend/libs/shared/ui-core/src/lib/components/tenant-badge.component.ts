import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'mm-tenant-badge',
  standalone: true,
  template: `
    <div class="inline-flex items-center gap-3 rounded-pill border border-border/20 bg-surface-2/75 px-3 py-1.5 text-sm">
      <span class="h-2.5 w-2.5 rounded-full bg-accent"></span>
      <span class="font-medium text-text">{{ tenantName() }}</span>
      @if (branchName()) {
        <span class="text-muted">/ {{ branchName() }}</span>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TenantBadgeComponent {
  readonly tenantName = input.required<string>();
  readonly branchName = input<string>('');
}
