import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { PricePillComponent, ScoreBadgeComponent } from '@mixmaster/shared/ui-core';

export interface RecommendationCardViewModel {
  id: string;
  name: string;
  typeLabel?: string;
  summary: string;
  score: number;
  priceLabel: string;
  reason: string;
  tags: string[];
  imageUrl?: string;
}

@Component({
  selector: 'mm-recommendation-card',
  standalone: true,
  imports: [NgOptimizedImage, PricePillComponent, ScoreBadgeComponent],
  template: `
    <article class="mm-surface flex h-full flex-col overflow-hidden">
      @if (recommendation().imageUrl) {
        <div class="aspect-[16/10] bg-surface-3/75">
          <img
            [ngSrc]="recommendation().imageUrl!"
            [alt]="recommendation().name"
            width="640"
            height="400"
            class="h-full w-full object-cover"
          />
        </div>
      }

      <div class="flex h-full flex-col gap-4 p-5">
      <div class="flex items-start justify-between gap-4">
        <div class="space-y-2">
          <p class="mm-eyebrow">{{ recommendation().typeLabel ?? 'Para ti' }}</p>
          <h3 class="text-2xl font-semibold text-text">{{ recommendation().name }}</h3>
        </div>
        <mm-score-badge [score]="recommendation().score" />
      </div>

      <p class="text-sm leading-6 text-muted">{{ recommendation().summary }}</p>

      <div class="rounded-xl bg-surface-2/70 p-3 text-sm text-text">
        {{ recommendation().reason }}
      </div>

      <div class="flex flex-wrap gap-2">
        @for (tag of recommendation().tags; track tag) {
          <span class="mm-chip">{{ tag }}</span>
        }
      </div>

      <div class="mt-auto flex items-center justify-between gap-3">
        <mm-price-pill [label]="recommendation().priceLabel" />
        <button type="button" class="mm-button-primary" (click)="selected.emit(recommendation().id)">Lo quiero</button>
      </div>
      </div>
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecommendationCardComponent {
  readonly recommendation = input.required<RecommendationCardViewModel>();
  readonly selected = output<string>();
}
