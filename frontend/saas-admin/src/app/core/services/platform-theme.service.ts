import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PlatformThemeService {
  constructor(@Inject(DOCUMENT) private readonly document: Document) {}

  applyAppTheme(): void {
    this.document.documentElement.dataset['app'] = 'saas-admin';
  }
}
