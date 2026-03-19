import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { FRONTEND_RUNTIME_CONFIG } from './frontend-runtime-config.token';
import { PublishedMenuDto, QrContextDto } from './public-api.contracts';

@Injectable({ providedIn: 'root' })
export class PublicApiClient {
  private readonly httpClient = inject(HttpClient);
  private readonly runtimeConfig = inject(FRONTEND_RUNTIME_CONFIG);

  validateQr(qrToken: string): Observable<QrContextDto> {
    return this.httpClient.get<QrContextDto>(`${this.runtimeConfig.publicApiBaseUrl}/q/${qrToken}`);
  }

  getPublishedMenu(qrToken: string): Observable<PublishedMenuDto> {
    return this.httpClient.get<PublishedMenuDto>(`${this.runtimeConfig.publicApiBaseUrl}/menus/published`, {
      params: { qrToken }
    });
  }
}
