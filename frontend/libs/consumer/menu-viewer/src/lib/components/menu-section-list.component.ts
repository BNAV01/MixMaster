import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export interface MenuSectionViewModel {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  itemCount: number;
}

@Component({
  selector: 'mm-menu-section-list',
  standalone: true,
  template: `
    <div class="grid gap-4 md:grid-cols-2">
      @for (section of sections(); track section.id) {
        <button
          type="button"
          class="mm-surface flex h-full flex-col gap-5 p-5 text-left transition duration-240 ease-expressive hover:border-accent/30 hover:bg-surface-2/88"
          (click)="sectionSelected.emit(section.id)"
        >
          <div class="space-y-2">
            <div class="flex items-center justify-between gap-3">
              <span class="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/12 text-sm font-semibold text-accent">
                {{ $index + 1 }}
              </span>
              <span class="rounded-pill border border-border/20 bg-surface-3/72 px-3 py-1 text-sm text-muted">
                {{ section.itemCount }} items
              </span>
            </div>
            <h3 class="text-xl font-semibold text-text">{{ section.title }}</h3>
            @if (section.subtitle) {
              <p class="text-sm font-medium text-accent-2">{{ section.subtitle }}</p>
            }
            @if (section.description) {
              <p class="text-sm leading-6 text-muted">{{ section.description }}</p>
            }
          </div>

          <div class="mt-auto inline-flex items-center gap-2 text-sm font-medium text-text">
            <span>Ver seccion</span>
            <span aria-hidden="true">></span>
          </div>
        </button>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuSectionListComponent {
  readonly sections = input.required<ReadonlyArray<MenuSectionViewModel>>();
  readonly sectionSelected = output<string>();
}
