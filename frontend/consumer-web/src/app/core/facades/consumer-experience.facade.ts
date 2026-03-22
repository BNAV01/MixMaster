import { Injectable, inject, signal } from '@angular/core';
import {
  ConsumerApiClient,
  FRONTEND_RUNTIME_CONFIG,
  FrontendRuntimeConfig,
  LoyaltySnapshotDto,
  PublishedMenuItemDto,
  PublicApiClient,
  PublishedMenuDto,
  QrContextDto,
  RecommendationResultDto
} from '@mixmaster/shared/api-clients';
import { RealtimeConnectionService } from '@mixmaster/shared/realtime';
import { AsyncStatus } from '@mixmaster/shared/models';
import { catchError, map, of, take } from 'rxjs';
import {
  DEMO_ANONYMOUS_SESSION,
  enrichPublishedMenuWithDemo,
  enrichRecommendationsWithDemo,
  DEMO_LOYALTY_SNAPSHOT,
  DEMO_PUBLISHED_MENU,
  DEMO_QR_CONTEXT
} from '../mocks/consumer-demo.data';
import { ConsumerSessionService } from '../services/consumer-session.service';

@Injectable({ providedIn: 'root' })
export class ConsumerExperienceFacade {
  private readonly runtimeConfig = inject<FrontendRuntimeConfig>(FRONTEND_RUNTIME_CONFIG);
  readonly qrContext = signal<QrContextDto | null>(null);
  readonly publishedMenu = signal<PublishedMenuDto | null>(null);
  readonly recommendations = signal<RecommendationResultDto | null>(null);
  readonly loyaltySnapshot = signal<LoyaltySnapshotDto | null>(null);

  readonly qrStatus = signal<AsyncStatus>('idle');
  readonly menuStatus = signal<AsyncStatus>('idle');
  readonly recommendationsStatus = signal<AsyncStatus>('idle');
  readonly loyaltyStatus = signal<AsyncStatus>('idle');

  constructor(
    private readonly publicApiClient: PublicApiClient,
    private readonly consumerApiClient: ConsumerApiClient,
    private readonly consumerSessionService: ConsumerSessionService,
    private readonly realtimeConnectionService: RealtimeConnectionService
  ) {}

  loadQrContext(qrToken: string): void {
    this.qrStatus.set('loading');
    this.consumerSessionService.startQrSession(qrToken);
    let useRealtime = this.runtimeConfig.realtimeEnabled === true;

    this.publicApiClient.validateQr(qrToken).pipe(
      take(1),
      catchError(() => {
        useRealtime = false;
        return of(qrToken.startsWith('demo-') ? DEMO_QR_CONTEXT : null);
      })
    ).subscribe((context: QrContextDto | null) => {
      if (!context) {
        this.qrContext.set(null);
        this.qrStatus.set('error');
        this.realtimeConnectionService.disconnect();
        return;
      }

      this.qrContext.set(context);
      if (!context.valid || !context.branchId) {
        this.qrStatus.set('error');
        this.realtimeConnectionService.disconnect();
        return;
      }

      this.qrStatus.set('success');
      this.consumerSessionService.hydrateQrContext(context);
      if (useRealtime) {
        this.realtimeConnectionService.connect(
          `${this.runtimeConfig.realtimeBaseUrl}/public/availability?branchId=${context.branchId}`
        );
      } else {
        this.realtimeConnectionService.disconnect();
      }
    });
  }

  ensureAnonymousSession(qrToken: string): void {
    if (this.consumerSessionService.hasActiveSession()) {
      return;
    }

    this.consumerApiClient.startAnonymousSession({ qrToken }).pipe(
      take(1),
      catchError(() => of(DEMO_ANONYMOUS_SESSION))
    ).subscribe((bootstrap: import('@mixmaster/shared/api-clients').AnonymousSessionBootstrapResponse) =>
      this.consumerSessionService.hydrateAnonymousSession(bootstrap)
    );
  }

  loadPublishedMenu(qrToken: string): void {
    this.menuStatus.set('loading');

    this.publicApiClient.getPublishedMenu(qrToken).pipe(
      take(1),
      catchError(() => of(qrToken.startsWith('demo-') ? DEMO_PUBLISHED_MENU : null))
    ).subscribe((menu: PublishedMenuDto | null) => {
      if (!menu) {
        this.publishedMenu.set(null);
        this.menuStatus.set('error');
        return;
      }

      this.publishedMenu.set(enrichPublishedMenuWithDemo(menu));
      this.menuStatus.set('success');
    });
  }

  loadRecommendations(mode: 'safe' | 'explore' | 'hybrid'): void {
    this.recommendationsStatus.set('loading');
    const qrToken = this.consumerSessionService.activeQrCode();

    this.consumerApiClient.getRecommendations(mode).pipe(
      take(1),
      catchError(() => {
        if (!qrToken) {
          return of(this.buildFallbackRecommendations(mode, this.publishedMenu()));
        }

        return this.publicApiClient.getPublishedMenu(qrToken).pipe(
          take(1),
          catchError(() => of(this.publishedMenu() ?? (qrToken.startsWith('demo-') ? DEMO_PUBLISHED_MENU : null))),
          map((menu: PublishedMenuDto | null) => {
            const resolvedMenu = menu ? enrichPublishedMenuWithDemo(menu) : null;
            if (resolvedMenu) {
              this.publishedMenu.set(resolvedMenu);
              this.menuStatus.set('success');
            }
            return this.buildFallbackRecommendations(mode, resolvedMenu);
          })
        );
      })
    ).subscribe((result: RecommendationResultDto) => {
      this.recommendations.set(enrichRecommendationsWithDemo(result));
      this.recommendationsStatus.set('success');
    });
  }

  loadLoyaltySnapshot(): void {
    this.loyaltyStatus.set('loading');

    this.consumerApiClient.getLoyaltySnapshot().pipe(
      take(1),
      catchError(() => of(DEMO_LOYALTY_SNAPSHOT))
    ).subscribe((snapshot: LoyaltySnapshotDto) => {
      this.loyaltySnapshot.set(snapshot);
      this.loyaltyStatus.set('success');
    });
  }

  private buildFallbackRecommendations(
    mode: 'safe' | 'explore' | 'hybrid',
    menu: PublishedMenuDto | null
  ): RecommendationResultDto {
    const items = (menu?.sections ?? [])
      .flatMap((section) => section.subsections ?? [])
      .flatMap((subsection) => subsection.items)
      .sort((left, right) => this.recommendationScore(right, mode, menu) - this.recommendationScore(left, mode, menu))
      .slice(0, 5)
      .map((item, index) => this.toFallbackRecommendation(item, mode, index));

    return {
      resultId: `fallback-${mode}-${Date.now()}`,
      generatedAt: new Date().toISOString(),
      mode,
      headline: this.buildRecommendationHeadline(mode, menu, items.length),
      items
    };
  }

  private toFallbackRecommendation(
    item: PublishedMenuItemDto,
    mode: 'safe' | 'explore' | 'hybrid',
    index: number
  ): import('@mixmaster/shared/api-clients').RecommendationItemDto {
    return {
      productId: item.id,
      name: item.name,
      productType: this.normalizeRecommendationProductType(item.productType),
      priceLabel: item.priceLabel,
      score: Math.max(78, 96 - (index * 4)),
      imageUrl: item.imageUrl,
      summary: this.buildRecommendationSummary(item, mode),
      tags: item.tags,
      availabilityState: item.availabilityState
    };
  }

  private buildRecommendationHeadline(
    mode: 'safe' | 'explore' | 'hybrid',
    menu: PublishedMenuDto | null,
    itemCount: number
  ): string {
    if (!itemCount) {
      return 'Todavia no hay suficientes productos publicados para recomendar desde esta visita.';
    }

    if (menu?.recommendationMode === 'CATALOG_ONLY') {
      return mode === 'explore'
        ? 'La carta oficial vive en PDF, asi que exploramos el catalogo digital de cocteles y productos cargados para esta sucursal.'
        : 'Aunque la carta completa esta en PDF, ya ordenamos el catalogo digital para recomendarte que pedir sin perder velocidad.';
    }

    return mode === 'explore'
      ? 'Tomamos la carta estructurada del local y la reordenamos para explorar cocteles y categorias con mas novedad.'
      : 'Las recomendaciones salen directo desde la carta publicada por el local para priorizar cocteles y productos con mejor encaje.';
  }

  private buildRecommendationSummary(
    item: PublishedMenuItemDto,
    mode: 'safe' | 'explore' | 'hybrid'
  ): string {
    const baseSummary = item.featuredReason || item.preparationNote || item.description || 'Producto cargado por el local.';

    if (mode === 'explore') {
      return `${baseSummary} Buena opcion para salir un poco de lo habitual sin perder contexto.`;
    }

    if (mode === 'safe') {
      return `${baseSummary} Punto de entrada facil para decidir rapido.`;
    }

    return `${baseSummary} Mezcla afinidad, contexto de visita y carta publicada.`;
  }

  private recommendationScore(
    item: PublishedMenuItemDto,
    mode: 'safe' | 'explore' | 'hybrid',
    menu: PublishedMenuDto | null
  ): number {
    let score = 50;

    if (item.featuredReason) {
      score += 20;
    }
    if (item.availabilityState === 'available') {
      score += 14;
    }
    if (item.availabilityState === 'low-stock') {
      score += 4;
    }
    if (item.availabilityState === 'paused' || item.availabilityState === 'unavailable') {
      score -= 25;
    }
    if (item.productType === 'cocktail' || item.productType === 'mocktail') {
      score += menu?.recommendationMode === 'INTEGRATED' ? 14 : 10;
    }
    if (mode === 'safe' && (item.productType === 'food' || item.productType === 'dessert')) {
      score -= 6;
    }
    if (mode === 'explore' && !(item.productType === 'cocktail' || item.productType === 'mocktail')) {
      score += 5;
    }

    return score;
  }

  private normalizeRecommendationProductType(
    productType: PublishedMenuItemDto['productType']
  ): import('@mixmaster/shared/api-clients').RecommendationItemDto['productType'] {
    return productType === 'dessert' ? 'food' : productType === 'other' ? 'other' : productType;
  }
}
