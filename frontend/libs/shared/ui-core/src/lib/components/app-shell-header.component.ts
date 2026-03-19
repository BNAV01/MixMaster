import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, TemplateRef, input } from '@angular/core';

@Component({
  selector: 'mm-app-shell-header',
  standalone: true,
  imports: [NgTemplateOutlet],
  template: `
    <header class="mm-surface flex flex-col gap-6 p-6 lg:flex-row lg:items-end lg:justify-between">
      <div class="space-y-3">
        <p class="mm-eyebrow">{{ eyebrow() }}</p>
        <div class="space-y-2">
          <h1 class="mm-page-title">{{ title() }}</h1>
          @if (description()) {
            <p class="mm-page-copy max-w-prose">{{ description() }}</p>
          }
        </div>
      </div>

      @if (actionsTpl()) {
        <div class="flex flex-wrap items-center gap-3">
          <ng-container *ngTemplateOutlet="actionsTpl() ?? null" />
        </div>
      }
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppShellHeaderComponent {
  readonly eyebrow = input.required<string>();
  readonly title = input.required<string>();
  readonly description = input<string>('');
  readonly actionsTpl = input<TemplateRef<unknown> | null>(null);
}
