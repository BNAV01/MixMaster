import { Injectable, inject, signal } from '@angular/core';
import {
  ConsumerApiClient,
  FRONTEND_RUNTIME_CONFIG,
  FrontendRuntimeConfig,
  LoyaltySnapshotDto,
  PublicApiClient,
  PublishedMenuDto,
  QrContextDto,
  RecommendationResultDto
} from '@mixmaster/shared/api-clients';
import { RealtimeConnectionService } from '@mixmaster/shared/realtime';
import { AsyncStatus } from '@mixmaster/shared/models';
import { catchError, of, take } from 'rxjs';
import {
  DEMO_ANONYMOUS_SESSION,
  DEMO_LOYALTY_SNAPSHOT,
  DEMO_PUBLISHED_MENU,
  DEMO_QR_CONTEXT,
  DEMO_RECOMMENDATIONS
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

    this.publicApiClient.validateQr(qrToken).pipe(
      take(1),
      catchError(() => of(DEMO_QR_CONTEXT))
    ).subscribe((context: QrContextDto) => {
      this.qrContext.set(context);
      this.qrStatus.set('success');
      this.consumerSessionService.hydrateQrContext(context);
      this.realtimeConnectionService.connect(
        `${this.runtimeConfig.realtimeBaseUrl}/public/availability?branchId=${context.branchId}`
      );
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
      catchError(() => of(DEMO_PUBLISHED_MENU))
    ).subscribe((menu: PublishedMenuDto) => {
      this.publishedMenu.set(menu);
      this.menuStatus.set('success');
    });
  }

  loadRecommendations(mode: 'safe' | 'explore' | 'hybrid'): void {
    this.recommendationsStatus.set('loading');

    this.consumerApiClient.getRecommendations(mode).pipe(
      take(1),
      catchError(() => of({ ...DEMO_RECOMMENDATIONS, mode }))
    ).subscribe((result: RecommendationResultDto) => {
      this.recommendations.set(result);
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
}
