import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export interface BranchComparisonRow {
  branchName: string;
  recommendationAcceptance: string;
  influencedRevenue: string;
  availabilityHealth: string;
}

@Component({
  selector: 'mm-branch-comparison-table',
  standalone: true,
  template: `
    <div class="overflow-hidden rounded-xl border border-border/20 bg-surface">
      <table class="min-w-full divide-y divide-border/15 text-left text-sm">
        <thead class="bg-surface-2/90 text-muted">
          <tr>
            <th class="px-4 py-3 font-medium">Sucursal</th>
            <th class="px-4 py-3 font-medium">Aceptación</th>
            <th class="px-4 py-3 font-medium">Revenue influido</th>
            <th class="px-4 py-3 font-medium">Salud disponibilidad</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border/10">
          @for (row of rows(); track row.branchName) {
            <tr class="text-text">
              <td class="px-4 py-3 font-medium">{{ row.branchName }}</td>
              <td class="px-4 py-3 text-muted">{{ row.recommendationAcceptance }}</td>
              <td class="px-4 py-3 text-muted">{{ row.influencedRevenue }}</td>
              <td class="px-4 py-3 text-muted">{{ row.availabilityHealth }}</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BranchComparisonTableComponent {
  readonly rows = input.required<ReadonlyArray<BranchComparisonRow>>();
}
