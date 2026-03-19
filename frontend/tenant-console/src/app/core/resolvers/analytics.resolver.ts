import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { TenantWorkspaceFacade } from '../facades/tenant-workspace.facade';

export const analyticsResolver: ResolveFn<boolean> = () => {
  const facade = inject(TenantWorkspaceFacade);
  facade.loadAnalytics();
  return true;
};
