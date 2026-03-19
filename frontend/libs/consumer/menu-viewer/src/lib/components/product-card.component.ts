import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { PricePillComponent } from '@mixmaster/shared/ui-core';

export interface ProductCardViewModel {
  id: string;
  name: string;
  typeLabel: string;
  shortDescription: string;
  priceLabel: string;
  imageUrl?: string;
  tags: string[];
  availabilityState: 'available' | 'low-stock' | 'paused' | 'unavailable';
}

@Component({
  selector: 'mm-product-card',
  standalone: true,
  imports: [NgOptimizedImage, PricePillComponent],
  template: `
    <article class="mm-surface flex h-full flex-col overflow-hidden">
      <div class="aspect-[4/3] bg-surface-3/75">
        @if (product().imageUrl) {
          <img [ngSrc]="product().imageUrl!" [alt]="product().name" width="640" height="480" class="h-full w-full object-cover" />
        } @else {
          <div class="flex h-full items-center justify-center text-sm text-muted">Imagen disponible pronto</div>
        }
      </div>

      <div class="flex flex-1 flex-col gap-4 p-4">
        <div class="space-y-2">
          <p class="mm-eyebrow">{{ product().typeLabel }}</p>
          <h3 class="text-xl font-semibold text-text">{{ product().name }}</h3>
          <p class="text-sm leading-6 text-muted">{{ product().shortDescription }}</p>
        </div>

        <div class="flex flex-wrap gap-2">
          @for (tag of product().tags; track tag) {
            <span class="mm-chip">{{ tag }}</span>
          }
        </div>

        <div class="mt-auto flex items-center justify-between gap-3">
          <mm-price-pill [label]="product().priceLabel" />
          <button type="button" class="mm-button-secondary" (click)="selected.emit(product().id)">Ver detalle</button>
        </div>
      </div>
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductCardComponent {
  readonly product = input.required<ProductCardViewModel>();
  readonly selected = output<string>();
}
