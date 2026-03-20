import { Injectable, computed, signal } from '@angular/core';
import { PlatformAdminApiClient, PlatformActorDto, PlatformAuthSessionDto, PlatformLoginRequestDto } from '@mixmaster/shared/api-clients';
import { NormalizedApiError } from '@mixmaster/shared/models';
import { BrowserStorageService } from '@mixmaster/shared/util';
import { Observable, catchError, finalize, map, of, shareReplay, tap } from 'rxjs';

interface PersistedPlatformSession {
  accessToken: string | null;
  refreshToken: string | null;
  actor: PlatformActorDto | null;
}

@Injectable({ providedIn: 'root' })
export class PlatformSessionService {
  private readonly storageKey = 'mixmaster.platform.session';
  private restoreRequest$: Observable<boolean> | null = null;
  private readonly hydrated = signal(false);

  readonly accessToken = signal<string | null>(null);
  readonly refreshToken = signal<string | null>(null);
  readonly actor = signal<PlatformActorDto | null>(null);
  readonly displayName = computed(() => this.actor()?.fullName ?? null);
  readonly permissions = computed(() => this.actor()?.permissions ?? []);
  readonly isAuthenticated = computed(() => !!this.accessToken() && !!this.actor());

  constructor(
    private readonly browserStorageService: BrowserStorageService,
    private readonly platformAdminApiClient: PlatformAdminApiClient
  ) {
    this.restoreFromStorage();
  }

  login(payload: PlatformLoginRequestDto): Observable<PlatformActorDto> {
    return this.platformAdminApiClient.login(payload).pipe(
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
      ? this.platformAdminApiClient.getMe().pipe(
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

    return this.platformAdminApiClient.logout().pipe(
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

    return this.platformAdminApiClient.refresh(this.refreshToken() as string).pipe(
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
      const parsedValue = JSON.parse(rawValue) as PersistedPlatformSession;
      this.accessToken.set(parsedValue.accessToken);
      this.refreshToken.set(parsedValue.refreshToken);
      this.actor.set(parsedValue.actor);
    } catch {
      this.browserStorageService.removeLocalItem(this.storageKey);
    }
  }

  private applySession(session: PlatformAuthSessionDto): void {
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
    } satisfies PersistedPlatformSession));
  }
}
