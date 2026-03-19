import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { FRONTEND_RUNTIME_CONFIG } from './frontend-runtime-config.token';
import {
  AnonymousSessionBootstrapRequest,
  AnonymousSessionBootstrapResponse,
  ConsumerPreferencePayload,
  FavoriteProductDto,
  LoyaltySnapshotDto,
  RecommendationFeedbackPayload,
  RecommendationResultDto
} from './consumer-api.contracts';

@Injectable({ providedIn: 'root' })
export class ConsumerApiClient {
  private readonly httpClient = inject(HttpClient);
  private readonly runtimeConfig = inject(FRONTEND_RUNTIME_CONFIG);

  startAnonymousSession(payload: AnonymousSessionBootstrapRequest): Observable<AnonymousSessionBootstrapResponse> {
    return this.httpClient.post<AnonymousSessionBootstrapResponse>(
      `${this.runtimeConfig.consumerApiBaseUrl}/anonymous-sessions`,
      payload
    );
  }

  savePreferences(payload: ConsumerPreferencePayload): Observable<void> {
    return this.httpClient.post<void>(`${this.runtimeConfig.consumerApiBaseUrl}/preferences`, payload);
  }

  getRecommendations(mode: 'safe' | 'explore' | 'hybrid'): Observable<RecommendationResultDto> {
    return this.httpClient.get<RecommendationResultDto>(`${this.runtimeConfig.consumerApiBaseUrl}/recommendations`, {
      params: { mode }
    });
  }

  submitFeedback(payload: RecommendationFeedbackPayload): Observable<void> {
    return this.httpClient.post<void>(`${this.runtimeConfig.consumerApiBaseUrl}/recommendations/feedback`, payload);
  }

  listFavorites(): Observable<FavoriteProductDto[]> {
    return this.httpClient.get<FavoriteProductDto[]>(`${this.runtimeConfig.consumerApiBaseUrl}/favorites`);
  }

  getLoyaltySnapshot(): Observable<LoyaltySnapshotDto> {
    return this.httpClient.get<LoyaltySnapshotDto>(`${this.runtimeConfig.consumerApiBaseUrl}/loyalty/snapshot`);
  }
}
