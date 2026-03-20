import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NavigationItem } from '@mixmaster/shared/models';

type NavigationSection = {
  label: string | null;
  items: NavigationItem[];
};

@Component({
  selector: 'mm-app-shell-sidebar',
  standalone: true,
  imports: [NgClass, RouterLink],
  template: `
    <aside class="mm-surface flex h-full flex-col gap-6 p-4 lg:p-5">
      <div class="space-y-2">
        <p class="mm-eyebrow">{{ eyebrow() }}</p>
        <div>
          <h2 class="text-lg font-semibold text-text">{{ title() }}</h2>
          @if (subtitle()) {
            <p class="text-sm text-muted">{{ subtitle() }}</p>
          }
        </div>
      </div>

      <nav class="grid gap-4">
        @for (section of groupedItems(); track section.label ?? $index) {
          <section class="space-y-2">
            @if (section.label) {
              <p class="px-2 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-muted/80">
                {{ section.label }}
              </p>
            }

            <div class="grid gap-2">
              @for (item of section.items; track item.route) {
                <a
                  [routerLink]="item.route"
                  [ngClass]="{
                    'bg-accent/15 text-text border-accent/25': isActive(item.route, item.exact ?? false)
                  }"
                  class="flex items-center justify-between rounded-lg border border-transparent px-3 py-2.5 text-sm text-muted transition duration-240 ease-expressive hover:border-border/20 hover:bg-surface-2/80 hover:text-text"
                >
                  <span>{{ item.label }}</span>
                  @if (item.badge) {
                    <span class="rounded-pill bg-surface-3/80 px-2 py-0.5 text-[0.7rem] font-semibold text-text">{{ item.badge }}</span>
                  }
                </a>
              }
            </div>
          </section>
        }
      </nav>
    </aside>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppShellSidebarComponent {
  private readonly router = inject(Router);

  readonly eyebrow = input.required<string>();
  readonly title = input.required<string>();
  readonly subtitle = input<string>('');
  readonly items = input.required<NavigationItem[]>();
  protected readonly groupedItems = computed<NavigationSection[]>(() => {
    const sections: NavigationSection[] = [];

    for (const item of this.items()) {
      const sectionLabel = item.section ?? null;
      const lastSection = sections[sections.length - 1];

      if (!lastSection || lastSection.label !== sectionLabel) {
        sections.push({
          label: sectionLabel,
          items: [item]
        });
        continue;
      }

      lastSection.items.push(item);
    }

    return sections;
  });

  protected isActive(route: string, exact: boolean): boolean {
    return exact ? this.router.url === route : this.router.url.startsWith(route);
  }
}
