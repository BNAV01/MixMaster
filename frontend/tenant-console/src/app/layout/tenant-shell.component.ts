import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-tenant-shell',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="min-h-dvh px-4 py-4 lg:px-6">
      <main class="mx-auto max-w-[92rem]">
        <router-outlet />
      </main>
    </div>
  `
})
export class TenantShellComponent {}
