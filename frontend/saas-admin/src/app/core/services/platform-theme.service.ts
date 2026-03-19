import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { BrowserStorageService } from '@mixmaster/shared/util';

@Injectable({ providedIn: 'root' })
export class PlatformThemeService {
  constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    private readonly browserStorageService: BrowserStorageService
  ) {}

  applyAppTheme(): void {
    this.document.documentElement.dataset['app'] = 'saas-admin';
    this.browserStorageService.setDocumentAttribute('data-mm-color-scheme', 'dark');
  }
}
