import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PlatformThemeService } from './core/services/platform-theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private readonly themeService = inject(PlatformThemeService);

  constructor() {
    this.themeService.applyAppTheme();
  }
}
