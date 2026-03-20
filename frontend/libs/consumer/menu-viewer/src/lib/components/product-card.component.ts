import { NgClass, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { PricePillComponent } from '@mixmaster/shared/ui-core';

export interface ProductCustomizationOptionViewModel {
  label: string;
  priceDeltaLabel?: string;
}

export interface ProductCustomizationGroupViewModel {
  title: string;
  selectionRule: string;
  options: ProductCustomizationOptionViewModel[];
}

export interface ProductCardViewModel {
  id: string;
  name: string;
  typeLabel: string;
  shortDescription: string;
  priceLabel: string;
  imageUrl?: string;
  tags: string[];
  availabilityState: 'available' | 'low-stock' | 'paused' | 'unavailable';
  highlight?: string;
  customizationGroups?: ProductCustomizationGroupViewModel[];
  primaryActionLabel?: string;
}

@Component({
  selector: 'mm-product-card',
  standalone: true,
  imports: [NgClass, NgOptimizedImage, PricePillComponent],
  template: `
    <article class="mm-surface flex h-full flex-col overflow-hidden">
      <div class="relative aspect-[4/3] bg-surface-3/75">
        @if (product().imageUrl) {
          <img [ngSrc]="product().imageUrl!" [alt]="product().name" width="640" height="480" class="h-full w-full object-cover" />
        } @else {
          <div class="flex h-full items-center justify-center text-sm text-muted">Imagen disponible pronto</div>
        }

        <span
          class="absolute left-4 top-4 rounded-pill px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]"
          [ngClass]="availabilityClasses(product().availabilityState)"
        >
          {{ availabilityLabel(product().availabilityState) }}
        </span>
      </div>

      <div class="flex flex-1 flex-col gap-4 p-4">
        <div class="space-y-2">
          <p class="mm-eyebrow">{{ product().typeLabel }}</p>
          <h3 class="text-xl font-semibold text-text">{{ product().name }}</h3>
          <p class="text-sm leading-6 text-muted">{{ product().shortDescription }}</p>
        </div>

        @if (product().highlight) {
          <div class="rounded-2xl border border-border/15 bg-surface-2/76 p-3 text-sm leading-6 text-text">
            {{ product().highlight }}
          </div>
        }

        <div class="flex flex-wrap gap-2">
          @for (tag of product().tags; track tag) {
            <span class="mm-chip">{{ tag }}</span>
          }
        </div>

        @if (product().customizationGroups?.length) {
          <div class="space-y-3">
            @for (group of product().customizationGroups; track group.title) {
              <div class="rounded-2xl border border-border/15 bg-surface-2/72 p-3">
                <div class="flex items-center justify-between gap-3">
                  <p class="text-sm font-semibold text-text">{{ group.title }}</p>
                  <span class="text-xs uppercase tracking-[0.14em] text-muted">{{ group.selectionRule }}</span>
                </div>

                <div class="mt-3 flex flex-wrap gap-2">
                  @for (option of group.options; track option.label) {
                    <span class="rounded-pill border border-border/15 bg-surface/64 px-3 py-1.5 text-xs text-muted">
                      {{ option.label }}
                      @if (option.priceDeltaLabel) {
                        <span class="text-text"> · {{ option.priceDeltaLabel }}</span>
                      }
                    </span>
                  }
                </div>
              </div>
            }
          </div>
        }

        <div class="mt-auto flex items-center justify-between gap-3">
          <mm-price-pill [label]="product().priceLabel" />
          <button type="button" class="mm-button-secondary" (click)="selected.emit(product().id)">
            {{ product().primaryActionLabel ?? 'Ver detalle' }}
          </button>
        </div>
      </div>
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductCardComponent {
  readonly product = input.required<ProductCardViewModel>();
  readonly selected = output<string>();

  protected availabilityLabel(state: ProductCardViewModel['availabilityState']): string {
    if (state === 'available') {
      return 'Disponible';
    }

    if (state === 'low-stock') {
      return 'Ultimos';
    }

    if (state === 'paused') {
      return 'Pausado';
    }

    return 'No disponible';
  }

  protected availabilityClasses(state: ProductCardViewModel['availabilityState']): string {
    if (state === 'available') {
      return 'bg-success/15 text-success';
    }

    if (state === 'low-stock') {
      return 'bg-warning/15 text-warning';
    }

    return 'bg-danger/15 text-danger';
  }
}
