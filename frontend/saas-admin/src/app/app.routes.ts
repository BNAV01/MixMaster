import { Routes } from '@angular/router';
import { saasAuthGuard } from './core/guards/saas-auth.guard';
import { PlatformShellComponent } from './layout/platform-shell.component';

export const routes: Routes = [
  {
    path: '',
    component: PlatformShellComponent,
    canActivate: [saasAuthGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'tenants' },
      {
        path: '',
        loadChildren: () => import('./features/console/platform-console.routes').then((module) => module.PLATFORM_CONSOLE_ROUTES)
      },
      {
        path: '**',
        redirectTo: 'tenants'
      }
    ]
  }
];
