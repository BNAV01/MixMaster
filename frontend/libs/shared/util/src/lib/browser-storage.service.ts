import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class BrowserStorageService {
  constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    @Inject(PLATFORM_ID) private readonly platformId: object
  ) {}

  getLocalItem(key: string): string | null {
    return this.isBrowser() ? globalThis.localStorage.getItem(key) : null;
  }

  setLocalItem(key: string, value: string): void {
    if (this.isBrowser()) {
      globalThis.localStorage.setItem(key, value);
    }
  }

  removeLocalItem(key: string): void {
    if (this.isBrowser()) {
      globalThis.localStorage.removeItem(key);
    }
  }

  setDocumentAttribute(name: string, value: string): void {
    if (this.isBrowser()) {
      this.document.documentElement.setAttribute(name, value);
    }
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId) && typeof globalThis.localStorage !== 'undefined';
  }
}
