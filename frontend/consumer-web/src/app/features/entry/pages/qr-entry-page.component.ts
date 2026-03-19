import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-qr-entry-page',
  imports: [RouterLink],
  template: `
    <section class="page">
      <span class="kicker">Entrada QR</span>
      <h2>Contexto detectado</h2>
      <p>La experiencia pública nace aquí y prepara sesión anónima, carta viva y recomendación.</p>
      <div class="card">
        <strong>Código QR</strong>
        <span>{{ qrCode() || 'sin valor' }}</span>
      </div>
      <div class="actions">
        <a routerLink="/experience/start">Continuar</a>
        <a routerLink="/experience/recommendations">Ver ejemplo de resultado</a>
      </div>
    </section>
  `,
  styles: [`
    .page { display: grid; gap: 1rem; }
    .card {
      display: grid;
      gap: 0.35rem;
      padding: 1rem;
      border: var(--border-subtle);
      border-radius: var(--radius-md);
      background: var(--color-surface);
    }
    .actions { display: flex; gap: 0.75rem; flex-wrap: wrap; }
    .actions a {
      padding: 0.75rem 1rem;
      border-radius: 999px;
      background: rgba(217, 167, 95, 0.16);
      color: var(--color-accent);
    }
    .kicker { color: var(--color-accent-alt); text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.12em; }
  `]
})
export class QrEntryPageComponent {
  private readonly route = inject(ActivatedRoute);
  protected readonly qrCode = signal(this.route.snapshot.paramMap.get('qrCode'));
}
