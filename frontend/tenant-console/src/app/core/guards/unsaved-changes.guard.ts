import { CanDeactivateFn } from '@angular/router';
import { Observable } from 'rxjs';

export interface UnsavedChangesAware {
  canDiscardChanges: () => boolean | Observable<boolean>;
}

export const unsavedChangesGuard: CanDeactivateFn<UnsavedChangesAware> = (component) => component.canDiscardChanges();
