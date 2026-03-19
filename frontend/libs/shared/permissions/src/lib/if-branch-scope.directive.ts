import { Directive, TemplateRef, ViewContainerRef, effect, inject } from '@angular/core';
import { BRANCH_SCOPE_RESOLVER } from './permission-context.tokens';

@Directive({
  selector: '[ifBranchScope]'
})
export class IfBranchScopeDirective {
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly resolveBranchScope = inject(BRANCH_SCOPE_RESOLVER);

  constructor() {
    effect(() => {
      this.viewContainerRef.clear();

      if (this.resolveBranchScope()) {
        this.viewContainerRef.createEmbeddedView(this.templateRef);
      }
    });
  }
}
