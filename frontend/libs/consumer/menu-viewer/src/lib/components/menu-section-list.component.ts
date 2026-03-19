import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export interface MenuSectionViewModel {
  id: string;
  title: string;
  subtitle?: string;
  itemCount: number;
}

@Component({
  selector: 'mm-menu-section-list',
  standalone: true,
  template: `
    <div class="grid gap-3">
      @for (section of sections(); track section.id) {
        <button
          type="button"
          class="mm-surface flex items-center justify-between p-4 text-left transition duration-240 ease-expressive hover:border-accent/25 hover:bg-surface-2/90"
          (click)="sectionSelected.emit(section.id)"
        >
          <div class="space-y-1">
            <h3 class="text-lg font-semibold text-text">{{ section.title }}</h3>
            @if (section.subtitle) {
              <p class="text-sm text-muted">{{ section.subtitle }}</p>
            }
          </div>
          <span class="rounded-pill bg-surface-3/80 px-3 py-1 text-sm text-muted">{{ section.itemCount }} items</span>
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
