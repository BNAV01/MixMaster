import { Directive, TemplateRef, ViewContainerRef, computed, effect, inject, input } from '@angular/core';
import { PERMISSION_CHECKER } from './permission-context.tokens';

@Directive({
  selector: '[ifCan]'
})
export class IfCanDirective {
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly can = inject(PERMISSION_CHECKER);

  readonly permission = input.required<string | string[]>({ alias: 'ifCan' });

  private readonly hasPermission = computed(() => this.can(this.permission()));

  constructor() {
    effect(() => {
      this.viewContainerRef.clear();

      if (this.hasPermission()) {
        this.viewContainerRef.createEmbeddedView(this.templateRef);
      }
    });
  }
}
