import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { ConsumerExperienceFacade } from '../facades/consumer-experience.facade';
import { ConsumerSessionService } from '../services/consumer-session.service';

export const publishedMenuResolver: ResolveFn<boolean> = (route) => {
  const facade = inject(ConsumerExperienceFacade);
  const consumerSessionService = inject(ConsumerSessionService);
  const qrToken = route.paramMap.get('qrToken') ?? consumerSessionService.activeQrCode();

  if (qrToken) {
    facade.loadQrContext(qrToken);
    facade.ensureAnonymousSession(qrToken);
    facade.loadPublishedMenu(qrToken);
  }

  return true;
};
