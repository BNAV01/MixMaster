import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NormalizedApiError } from '@mixmaster/shared/models';
import { ACCESS_TOKEN_RESOLVER, ANONYMOUS_TOKEN_RESOLVER, TENANT_CONTEXT_RESOLVER } from './api-context.tokens';

const ensureCorrelationId = () => {
  if ('crypto' in globalThis && 'randomUUID' in globalThis.crypto) {
    return globalThis.crypto.randomUUID();
  }

  return `mm-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const correlationIdInterceptor: HttpInterceptorFn = (request, next) => {
  const correlationId = ensureCorrelationId();

  return next(request.clone({
    setHeaders: {
      'X-Correlation-Id': correlationId
    }
  }));
};

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const resolveAccessToken = inject(ACCESS_TOKEN_RESOLVER);
  const resolveAnonymousToken = inject(ANONYMOUS_TOKEN_RESOLVER);
  const accessToken = resolveAccessToken();
  const anonymousToken = resolveAnonymousToken();

  const headers: Record<string, string> = {};

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  if (anonymousToken) {
    headers['X-Anonymous-Token'] = anonymousToken;
  }

  return next(Object.keys(headers).length > 0 ? request.clone({ setHeaders: headers }) : request);
};

export const tenantContextInterceptor: HttpInterceptorFn = (request, next) => {
  const resolveTenantContext = inject(TENANT_CONTEXT_RESOLVER);
  const context = resolveTenantContext();
  const headers: Record<string, string> = {};

  const tenantHeaderValue = context.tenantKey ?? context.tenantId;

  if (tenantHeaderValue) {
    headers['X-Tenant-Key'] = tenantHeaderValue;
  }

  if (context.tenantId) {
    headers['X-Tenant-Id'] = context.tenantId;
  }

  if (context.branchId) {
    headers['X-Branch-Key'] = context.branchId;
    headers['X-Branch-Id'] = context.branchId;
  }

  return next(Object.keys(headers).length > 0 ? request.clone({ setHeaders: headers }) : request);
};

export const errorNormalizationInterceptor: HttpInterceptorFn = (request, next) => next(request).pipe(
  catchError((error: HttpErrorResponse) => {
    const defaultServerMessage = typeof error.error?.message === 'string'
      ? error.error.message
      : error.message ?? 'Unexpected API error.';
    const isNetworkError = error.status === 0;
    const kind: NormalizedApiError['kind'] = isNetworkError
      ? 'network'
      : error.status === 401
        ? 'unauthorized'
        : error.status === 403
          ? 'forbidden'
          : error.status === 400 || error.status === 422
            ? 'validation'
            : error.status >= 500
              ? 'server'
              : 'unexpected';

    const message = isNetworkError
      ? 'No fue posible conectar con el backend. Verifica que el servicio esté levantado y que el proxy del frontend apunte al puerto correcto.'
      : error.status === 401 && defaultServerMessage === 'Full authentication is required to access this resource'
        ? 'La sesión ya no es válida para este recurso. Vuelve a iniciar sesión cuando el backend esté disponible.'
        : defaultServerMessage;

    const normalizedError: NormalizedApiError = {
      code: isNetworkError ? 'SERVICE_UNAVAILABLE' : error.error?.code ?? 'UNEXPECTED_ERROR',
      message,
      status: error.status,
      kind,
      details: typeof error.error === 'object' && error.error ? error.error : undefined
    };

    return throwError(() => normalizedError);
  })
);
