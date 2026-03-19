import { Routes } from '@angular/router';
import { staffAuthGuard } from './core/guards/staff-auth.guard';
import { TenantShellComponent } from './layout/tenant-shell.component';

export const routes: Routes = [
  {
    path: '',
    component: TenantShellComponent,
    canActivate: [staffAuthGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: '',
        loadChildren: () => import('./features/console/tenant-console.routes').then((module) => module.TENANT_CONSOLE_ROUTES)
      },
      {
        path: '**',
        redirectTo: 'dashboard'
      }
    ]
  }
];
