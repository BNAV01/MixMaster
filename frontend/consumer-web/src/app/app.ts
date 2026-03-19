import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConsumerThemeService } from './core/services/consumer-theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private readonly themeService = inject(ConsumerThemeService);

  constructor() {
    this.themeService.applyAppTheme();
  }
}
