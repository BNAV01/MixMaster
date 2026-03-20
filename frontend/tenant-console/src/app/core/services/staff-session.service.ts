import { Injectable, computed, signal } from '@angular/core';
import { NormalizedApiError } from '@mixmaster/shared/models';
import { BrowserStorageService } from '@mixmaster/shared/util';
import { TenantAdminApiClient, TenantActorDto, TenantAuthSessionDto, TenantLoginRequestDto } from '@mixmaster/shared/api-clients';
import { Observable, catchError, finalize, map, of, shareReplay, tap } from 'rxjs';

interface PersistedStaffSession {
  accessToken: string | null;
  refreshToken: string | null;
  actor: TenantActorDto | null;
}

@Injectable({ providedIn: 'root' })
export class StaffSessionService {
  private readonly storageKey = 'mixmaster.tenant.staff-session';
  private restoreRequest$: Observable<boolean> | null = null;
  private readonly hydrated = signal(false);

  readonly accessToken = signal<string | null>(null);
  readonly refreshToken = signal<string | null>(null);
  readonly actor = signal<TenantActorDto | null>(null);
  readonly displayName = computed(() => this.actor()?.fullName ?? null);
  readonly tenantId = computed(() => this.actor()?.tenantId ?? null);
  readonly tenantCode = computed(() => this.actor()?.tenantCode ?? null);
  readonly tenantName = computed(() => this.actor()?.tenantName ?? null);
  readonly branchId = computed(() => this.actor()?.activeBranchId ?? null);
  readonly permissions = computed(() => this.actor()?.permissions ?? []);
  readonly roleCodes = computed(() => this.actor()?.roleCodes ?? []);
  readonly accessibleBranches = computed(() => this.actor()?.accessibleBranches ?? []);
  readonly isAuthenticated = computed(() => !!this.accessToken() && !!this.actor());

  constructor(
    private readonly browserStorageService: BrowserStorageService,
    private readonly tenantAdminApiClient: TenantAdminApiClient
  ) {
    this.restoreFromStorage();
  }

  login(payload: TenantLoginRequestDto): Observable<TenantActorDto> {
    return this.tenantAdminApiClient.login(payload).pipe(
      tap((session) => this.applySession(session)),
      map((session) => session.actor)
    );
  }

  restoreSession(): Observable<boolean> {
    if (this.hydrated()) {
      return of(this.isAuthenticated());
    }

    if (this.restoreRequest$) {
      return this.restoreRequest$;
    }

    if (!this.accessToken() && !this.refreshToken()) {
      this.hydrated.set(true);
      return of(false);
    }

    const sessionRequest$ = (this.accessToken()
      ? this.tenantAdminApiClient.getMe().pipe(
          tap((actor) => this.actor.set(actor)),
          map(() => true),
          catchError((error: NormalizedApiError) => this.handleRestoreFailure(error))
        )
      : this.refreshOrClear()
    ).pipe(
      finalize(() => {
        this.hydrated.set(true);
        this.restoreRequest$ = null;
      }),
      shareReplay(1)
    );

    this.restoreRequest$ = sessionRequest$;
    return sessionRequest$;
  }

  logout(): Observable<void> {
    if (!this.accessToken()) {
      this.clearSession();
      return of(void 0);
    }

    return this.tenantAdminApiClient.logout().pipe(
      catchError(() => of(void 0)),
      tap(() => this.clearSession())
    );
  }

  hasPermission(requiredPermission: string | string[]): boolean {
    const requiredPermissions = Array.isArray(requiredPermission) ? requiredPermission : [requiredPermission];
    return requiredPermissions.every((permission) => this.permissions().includes(permission));
  }

  private refreshOrClear(): Observable<boolean> {
    if (!this.refreshToken()) {
      this.clearSession();
      return of(false);
    }

    return this.tenantAdminApiClient.refresh(this.refreshToken() as string).pipe(
      tap((session) => this.applySession(session)),
      map(() => true),
      catchError((error: NormalizedApiError) => {
        if (this.isRecoverableNetworkError(error)) {
          return of(this.isAuthenticated());
        }

        this.clearSession();
        return of(false);
      })
    );
  }

  private handleRestoreFailure(error: NormalizedApiError): Observable<boolean> {
    if (this.isRecoverableNetworkError(error)) {
      return of(this.isAuthenticated());
    }

    return this.refreshOrClear();
  }

  private isRecoverableNetworkError(error: NormalizedApiError): boolean {
    return error.kind === 'network' && !!this.accessToken() && !!this.actor();
  }

  private restoreFromStorage(): void {
    const rawValue = this.browserStorageService.getLocalItem(this.storageKey);

    if (!rawValue) {
      return;
    }

    try {
      const parsedValue = JSON.parse(rawValue) as PersistedStaffSession;
      this.accessToken.set(parsedValue.accessToken);
      this.refreshToken.set(parsedValue.refreshToken);
      this.actor.set(parsedValue.actor);
    } catch {
      this.browserStorageService.removeLocalItem(this.storageKey);
    }
  }

  private applySession(session: TenantAuthSessionDto): void {
    this.accessToken.set(session.accessToken);
    this.refreshToken.set(session.refreshToken);
    this.actor.set(session.actor);
    this.persist();
  }

  private clearSession(): void {
    this.accessToken.set(null);
    this.refreshToken.set(null);
    this.actor.set(null);
    this.hydrated.set(true);
    this.browserStorageService.removeLocalItem(this.storageKey);
  }

  private persist(): void {
    this.browserStorageService.setLocalItem(this.storageKey, JSON.stringify({
      accessToken: this.accessToken(),
      refreshToken: this.refreshToken(),
      actor: this.actor()
    } satisfies PersistedStaffSession));
  }
}
