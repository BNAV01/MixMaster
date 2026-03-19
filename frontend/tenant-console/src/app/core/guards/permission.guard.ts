import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { StaffSessionService } from '../services/staff-session.service';

export const permissionGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const staffSessionService = inject(StaffSessionService);
  const requiredPermission = route.data['requiredPermission'] as string | string[] | undefined;

  if (!requiredPermission || staffSessionService.hasPermission(requiredPermission)) {
    return true;
  }

  return router.createUrlTree(['/dashboard'], {
    queryParams: { reason: 'insufficient-permission' }
  });
};
