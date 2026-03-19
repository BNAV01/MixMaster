import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { TenantContextService } from '../services/tenant-context.service';

export const branchResolver: ResolveFn<boolean> = (route) => {
  const tenantContextService = inject(TenantContextService);
  const branchId = route.paramMap.get('branchId');

  if (branchId) {
    tenantContextService.setActiveBranch(branchId);
  }

  tenantContextService.ensureContext();
  return true;
};
