import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import {
  ACCESS_TOKEN_RESOLVER,
  FRONTEND_RUNTIME_CONFIG,
  authInterceptor,
  correlationIdInterceptor,
  errorNormalizationInterceptor
} from '@mixmaster/shared/api-clients';
import { PERMISSION_CHECKER } from '@mixmaster/shared/permissions';
import { routes } from './app.routes';
import { PLATFORM_FRONTEND_RUNTIME_CONFIG } from './core/config/platform-runtime.config';
import { platformAuthRecoveryInterceptor } from './core/interceptors/platform-auth-recovery.interceptor';
import { PlatformSessionService } from './core/services/platform-session.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    {
      provide: FRONTEND_RUNTIME_CONFIG,
      useValue: PLATFORM_FRONTEND_RUNTIME_CONFIG
    },
    {
      provide: ACCESS_TOKEN_RESOLVER,
      useFactory: (platformSessionService: PlatformSessionService) => () => platformSessionService.accessToken(),
      deps: [PlatformSessionService]
    },
    {
      provide: PERMISSION_CHECKER,
      useFactory: (platformSessionService: PlatformSessionService) => (permission: string | string[]) =>
        platformSessionService.hasPermission(permission),
      deps: [PlatformSessionService]
    },
    provideHttpClient(
      withFetch(),
      withInterceptors([
        correlationIdInterceptor,
        authInterceptor,
        platformAuthRecoveryInterceptor,
        errorNormalizationInterceptor
      ])
    ),
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }))
  ]
};
