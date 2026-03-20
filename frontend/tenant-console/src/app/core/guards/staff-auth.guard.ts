import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { map } from 'rxjs';
import { StaffSessionService } from '../services/staff-session.service';

export const staffAuthGuard: CanActivateFn = () => {
  const router = inject(Router);
  const staffSessionService = inject(StaffSessionService);

  return staffSessionService.restoreSession().pipe(
    map((isAuthenticated) => isAuthenticated ? true : router.createUrlTree(['/login']))
  );
};
