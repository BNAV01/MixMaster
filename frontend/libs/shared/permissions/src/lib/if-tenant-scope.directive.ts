import { Directive, TemplateRef, ViewContainerRef, effect, inject } from '@angular/core';
import { TENANT_SCOPE_RESOLVER } from './permission-context.tokens';

@Directive({
  selector: '[ifTenantScope]'
})
export class IfTenantScopeDirective {
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly resolveTenantScope = inject(TENANT_SCOPE_RESOLVER);

  constructor() {
    effect(() => {
      this.viewContainerRef.clear();

      if (this.resolveTenantScope()) {
        this.viewContainerRef.createEmbeddedView(this.templateRef);
      }
    });
  }
}
