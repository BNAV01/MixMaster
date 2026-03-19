import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ConsumerThemeService {
  constructor(@Inject(DOCUMENT) private readonly document: Document) {}

  applyAppTheme(): void {
    this.document.documentElement.dataset['app'] = 'consumer-web';
  }
}
