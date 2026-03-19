import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'mm-draft-publish-banner',
  standalone: true,
  template: `
    <section class="rounded-xl border border-accent/20 bg-accent/8 p-4">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div class="space-y-2">
          <p class="mm-eyebrow">{{ eyebrow() }}</p>
          <h3 class="text-xl font-semibold text-text">{{ title() }}</h3>
          <p class="text-sm leading-6 text-muted">{{ description() }}</p>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <button type="button" class="mm-button-secondary" (click)="discard.emit()">Descartar</button>
          <button type="button" class="mm-button-primary" (click)="publish.emit()">Publicar</button>
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DraftPublishBannerComponent {
  readonly eyebrow = input('Menu draft');
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly publish = output<void>();
  readonly discard = output<void>();
}
