import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { PlatformWorkspaceFacade } from '../facades/platform-workspace.facade';

export const tenantResolver: ResolveFn<boolean> = (route) => {
  const facade = inject(PlatformWorkspaceFacade);
  const tenantId = route.paramMap.get('tenantId');

  facade.loadTenants();
  facade.loadSupportData();

  if (tenantId) {
    facade.loadTenantDetail(tenantId);
  }

  return true;
};
