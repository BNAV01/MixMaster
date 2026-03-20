import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { DEMO_ANONYMOUS_SESSION, DEMO_QR_CONTEXT } from '../mocks/consumer-demo.data';
import { ConsumerSessionService } from '../services/consumer-session.service';

export const anonymousSessionGuard: CanActivateFn = () => {
  const consumerSessionService = inject(ConsumerSessionService);

  if (consumerSessionService.hasActiveSession() || consumerSessionService.activeQrCode()) {
    return true;
  }

  consumerSessionService.hydrateQrContext(DEMO_QR_CONTEXT);
  consumerSessionService.hydrateAnonymousSession(DEMO_ANONYMOUS_SESSION);

  return true;
};
