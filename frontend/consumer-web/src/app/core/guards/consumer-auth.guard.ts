import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { ConsumerAuthService } from '../services/consumer-auth.service';

export const consumerAuthGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const consumerAuthService = inject(ConsumerAuthService);

  return consumerAuthService.isAuthenticated()
    ? true
    : router.createUrlTree(['/login'], {
        queryParams: { redirectTo: state.url }
      });
};
