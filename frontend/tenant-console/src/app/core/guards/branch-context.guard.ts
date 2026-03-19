import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { TenantContextService } from '../services/tenant-context.service';

export const branchContextGuard: CanActivateFn = (route) => {
  const tenantContextService = inject(TenantContextService);
  const branchId = route.paramMap.get('branchId');

  if (branchId) {
    tenantContextService.setActiveBranch(branchId);
  }

  tenantContextService.ensureContext();
  return true;
};
