import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TenantThemeService } from './core/services/tenant-theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private readonly themeService = inject(TenantThemeService);

  constructor() {
    this.themeService.applyAppTheme();
  }
}
