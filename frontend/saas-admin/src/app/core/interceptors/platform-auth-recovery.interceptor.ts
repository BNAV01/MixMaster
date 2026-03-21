import { HttpContextToken, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { FRONTEND_RUNTIME_CONFIG } from '@mixmaster/shared/api-clients';
import { catchError, switchMap, throwError } from 'rxjs';
import { PlatformSessionService } from '../services/platform-session.service';

const PLATFORM_AUTH_RETRY = new HttpContextToken<boolean>(() => false);

export const platformAuthRecoveryInterceptor: HttpInterceptorFn = (request, next) => {
  const platformSessionService = inject(PlatformSessionService);
  const router = inject(Router);
  const runtimeConfig = inject(FRONTEND_RUNTIME_CONFIG);

  const platformAdminBaseUrl = runtimeConfig.platformAdminApiBaseUrl;
  const publicAuthBaseUrl = `${platformAdminBaseUrl}/public/auth`;
  const isPlatformRequest = request.url.startsWith(platformAdminBaseUrl);
  const isPublicAuthRequest = request.url.startsWith(publicAuthBaseUrl);
  const isRetriedRequest = request.context.get(PLATFORM_AUTH_RETRY);

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401 || !isPlatformRequest) {
        return throwError(() => error);
      }

      if (isPublicAuthRequest) {
        platformSessionService.invalidateSession();
        void router.navigateByUrl('/login');
        return throwError(() => error);
      }

      if (isRetriedRequest || !platformSessionService.canAttemptRefresh()) {
        platformSessionService.invalidateSession();
        void router.navigateByUrl('/login');
        return throwError(() => error);
      }

      return platformSessionService.refreshSession().pipe(
        switchMap((refreshed) => {
          const accessToken = platformSessionService.accessToken();

          if (!refreshed || !accessToken) {
            platformSessionService.invalidateSession();
            void router.navigateByUrl('/login');
            return throwError(() => error);
          }

          return next(request.clone({
            context: request.context.set(PLATFORM_AUTH_RETRY, true),
            setHeaders: {
              Authorization: `Bearer ${accessToken}`
            }
          }));
        })
      );
    })
  );
};
