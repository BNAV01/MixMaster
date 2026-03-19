import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { PlatformSessionService } from '../services/platform-session.service';

export const saasAuthGuard: CanActivateFn = () => {
  const router = inject(Router);
  const platformSessionService = inject(PlatformSessionService);

  return platformSessionService.isAuthenticated()
    ? true
    : router.createUrlTree(['/tenants']);
};
