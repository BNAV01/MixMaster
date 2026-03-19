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

  if (context.tenantId) {
    headers['X-Tenant-Id'] = context.tenantId;
  }

  if (context.branchId) {
    headers['X-Branch-Id'] = context.branchId;
  }

  return next(Object.keys(headers).length > 0 ? request.clone({ setHeaders: headers }) : request);
};

export const errorNormalizationInterceptor: HttpInterceptorFn = (request, next) => next(request).pipe(
  catchError((error: HttpErrorResponse) => {
    const normalizedError: NormalizedApiError = {
      code: error.error?.code ?? 'UNEXPECTED_ERROR',
      message: error.error?.message ?? error.message ?? 'Unexpected API error.',
      status: error.status,
      details: typeof error.error === 'object' && error.error ? error.error : undefined
    };

    return throwError(() => normalizedError);
  })
);
