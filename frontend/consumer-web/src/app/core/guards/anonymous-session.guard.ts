import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { ConsumerSessionService } from '../services/consumer-session.service';

export const anonymousSessionGuard: CanActivateFn = () => {
  const router = inject(Router);
  const consumerSessionService = inject(ConsumerSessionService);

  if (consumerSessionService.hasActiveSession() || consumerSessionService.activeQrCode()) {
    return true;
  }

  return router.createUrlTree(['/experience/start']);
};
