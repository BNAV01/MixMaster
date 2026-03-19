import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { ConsumerSessionService } from '../services/consumer-session.service';

export const qrContextGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const consumerSessionService = inject(ConsumerSessionService);
  const qrToken = route.paramMap.get('qrToken');

  if (qrToken) {
    consumerSessionService.startQrSession(qrToken);
    return true;
  }

  return consumerSessionService.activeQrCode() ? true : router.createUrlTree(['/experience/start']);
};
