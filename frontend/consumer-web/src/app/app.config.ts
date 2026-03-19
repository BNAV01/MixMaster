import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import {
  ACCESS_TOKEN_RESOLVER,
  ANONYMOUS_TOKEN_RESOLVER,
  FRONTEND_RUNTIME_CONFIG,
  TENANT_CONTEXT_RESOLVER,
  authInterceptor,
  correlationIdInterceptor,
  errorNormalizationInterceptor,
  tenantContextInterceptor
} from '@mixmaster/shared/api-clients';
import { routes } from './app.routes';
import { CONSUMER_FRONTEND_RUNTIME_CONFIG } from './core/config/consumer-runtime.config';
import { ConsumerAuthService } from './core/services/consumer-auth.service';
import { ConsumerSessionService } from './core/services/consumer-session.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    {
      provide: FRONTEND_RUNTIME_CONFIG,
      useValue: CONSUMER_FRONTEND_RUNTIME_CONFIG
    },
    {
      provide: ACCESS_TOKEN_RESOLVER,
      useFactory: (consumerAuthService: ConsumerAuthService) => () => consumerAuthService.accessToken(),
      deps: [ConsumerAuthService]
    },
    {
      provide: ANONYMOUS_TOKEN_RESOLVER,
      useFactory: (consumerSessionService: ConsumerSessionService) => () => consumerSessionService.anonymousToken(),
      deps: [ConsumerSessionService]
    },
    {
      provide: TENANT_CONTEXT_RESOLVER,
      useFactory: (consumerSessionService: ConsumerSessionService) => () => ({
        tenantId: consumerSessionService.activeTenantId(),
        branchId: consumerSessionService.activeBranchId()
      }),
      deps: [ConsumerSessionService]
    },
    provideHttpClient(
      withFetch(),
      withInterceptors([
        correlationIdInterceptor,
        authInterceptor,
        tenantContextInterceptor,
        errorNormalizationInterceptor
      ])
    ),
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })),
    provideClientHydration(withEventReplay())
  ]
};
