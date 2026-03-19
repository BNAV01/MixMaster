import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import {
  ACCESS_TOKEN_RESOLVER,
  FRONTEND_RUNTIME_CONFIG,
  TENANT_CONTEXT_RESOLVER,
  authInterceptor,
  correlationIdInterceptor,
  errorNormalizationInterceptor,
  tenantContextInterceptor
} from '@mixmaster/shared/api-clients';
import {
  BRANCH_SCOPE_RESOLVER,
  PERMISSION_CHECKER,
  TENANT_SCOPE_RESOLVER
} from '@mixmaster/shared/permissions';
import { routes } from './app.routes';
import { TENANT_FRONTEND_RUNTIME_CONFIG } from './core/config/tenant-runtime.config';
import { StaffSessionService } from './core/services/staff-session.service';
import { TenantContextService } from './core/services/tenant-context.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    {
      provide: FRONTEND_RUNTIME_CONFIG,
      useValue: TENANT_FRONTEND_RUNTIME_CONFIG
    },
    {
      provide: ACCESS_TOKEN_RESOLVER,
      useFactory: (staffSessionService: StaffSessionService) => () => staffSessionService.accessToken(),
      deps: [StaffSessionService]
    },
    {
      provide: TENANT_CONTEXT_RESOLVER,
      useFactory: (tenantContextService: TenantContextService) => () => ({
        tenantId: tenantContextService.activeTenant(),
        branchId: tenantContextService.activeBranch()
      }),
      deps: [TenantContextService]
    },
    {
      provide: PERMISSION_CHECKER,
      useFactory: (staffSessionService: StaffSessionService) => (permission: string | string[]) =>
        staffSessionService.hasPermission(permission),
      deps: [StaffSessionService]
    },
    {
      provide: TENANT_SCOPE_RESOLVER,
      useFactory: (tenantContextService: TenantContextService) => () => !!tenantContextService.activeTenant(),
      deps: [TenantContextService]
    },
    {
      provide: BRANCH_SCOPE_RESOLVER,
      useFactory: (tenantContextService: TenantContextService) => () => !!tenantContextService.activeBranch(),
      deps: [TenantContextService]
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
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }))
  ]
};
