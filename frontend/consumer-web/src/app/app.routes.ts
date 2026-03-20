import { Routes } from '@angular/router';
import { qrContextGuard } from './core/guards/qr-context.guard';
import { QrEntryPageComponent } from './features/entry/pages/qr-entry-page.component';
import { PublicShellComponent } from './layout/public-shell.component';

export const routes: Routes = [
  {
    path: '',
    component: PublicShellComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'experience/start' },
      { path: 'q/:qrCode', component: QrEntryPageComponent, canActivate: [qrContextGuard], title: 'QR Entry' },
      { path: 'menu', redirectTo: 'experience/menu', pathMatch: 'full' },
      {
        path: 'experience',
        loadChildren: () => import('./features/experience/experience.routes').then((module) => module.EXPERIENCE_ROUTES)
      },
      {
        path: '',
        loadChildren: () => import('./features/account/account.routes').then((module) => module.ACCOUNT_ROUTES)
      },
      {
        path: '**',
        redirectTo: 'experience/start'
      }
    ]
  }
];
