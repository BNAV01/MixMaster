import { Injectable, computed, signal } from '@angular/core';
import { PlatformAdminApiClient, PlatformActorDto, PlatformAuthSessionDto, PlatformLoginRequestDto } from '@mixmaster/shared/api-clients';
import { NormalizedApiError } from '@mixmaster/shared/models';
import { BrowserStorageService } from '@mixmaster/shared/util';
import { Observable, catchError, finalize, map, of, shareReplay, tap } from 'rxjs';

interface PersistedPlatformSession {
  accessToken: string | null;
  refreshToken: string | null;
  accessExpiresAt: string | null;
  refreshExpiresAt: string | null;
  actor: PlatformActorDto | null;
}

@Injectable({ providedIn: 'root' })
export class PlatformSessionService {
  private readonly storageKey = 'mixmaster.platform.session';
  private restoreRequest$: Observable<boolean> | null = null;
  private refreshRequest$: Observable<boolean> | null = null;
  private readonly hydrated = signal(false);
  private readonly expirySkewMs = 5_000;

  readonly accessToken = signal<string | null>(null);
  readonly refreshToken = signal<string | null>(null);
  readonly accessExpiresAt = signal<string | null>(null);
  readonly refreshExpiresAt = signal<string | null>(null);
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

    const sessionRequest$ = (this.hasUsableAccessToken()
      ? this.platformAdminApiClient.getMe().pipe(
          tap((actor) => this.actor.set(actor)),
          map(() => true),
          catchError((error: NormalizedApiError) => this.handleRestoreFailure(error))
        )
      : this.refreshSession()
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

  refreshSession(): Observable<boolean> {
    if (this.refreshRequest$) {
      return this.refreshRequest$;
    }

    if (!this.canAttemptRefresh()) {
      this.clearSession();
      return of(false);
    }

    const refreshRequest$ = this.platformAdminApiClient.refresh(this.refreshToken() as string).pipe(
      tap((session) => this.applySession(session)),
      map(() => true),
      catchError((error: NormalizedApiError) => {
        if (this.isRecoverableNetworkError(error)) {
          return of(this.isAuthenticated());
        }

        this.clearSession();
        return of(false);
      }),
      finalize(() => {
        this.refreshRequest$ = null;
      }),
      shareReplay(1)
    );

    this.refreshRequest$ = refreshRequest$;
    return refreshRequest$;
  }

  canAttemptRefresh(): boolean {
    return !!this.refreshToken() && !this.isExpired(this.refreshExpiresAt());
  }

  invalidateSession(): void {
    this.clearSession();
  }

  private handleRestoreFailure(error: NormalizedApiError): Observable<boolean> {
    if (this.isRecoverableNetworkError(error)) {
      return of(this.isAuthenticated());
    }

    return this.refreshSession();
  }

  private isRecoverableNetworkError(error: NormalizedApiError): boolean {
    return error.kind === 'network' && !!this.accessToken() && !!this.actor();
  }

  private hasUsableAccessToken(): boolean {
    return !!this.accessToken() && !this.isExpired(this.accessExpiresAt());
  }

  private isExpired(expiresAt: string | null): boolean {
    if (!expiresAt) {
      return false;
    }

    const expiryTime = Date.parse(expiresAt);
    if (Number.isNaN(expiryTime)) {
      return false;
    }

    return expiryTime <= Date.now() + this.expirySkewMs;
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
      this.accessExpiresAt.set(parsedValue.accessExpiresAt ?? null);
      this.refreshExpiresAt.set(parsedValue.refreshExpiresAt ?? null);
      this.actor.set(parsedValue.actor);
    } catch {
      this.browserStorageService.removeLocalItem(this.storageKey);
    }
  }

  private applySession(session: PlatformAuthSessionDto): void {
    this.accessToken.set(session.accessToken);
    this.refreshToken.set(session.refreshToken);
    this.accessExpiresAt.set(session.accessExpiresAt);
    this.refreshExpiresAt.set(session.refreshExpiresAt);
    this.actor.set(session.actor);
    this.persist();
  }

  private clearSession(): void {
    this.accessToken.set(null);
    this.refreshToken.set(null);
    this.accessExpiresAt.set(null);
    this.refreshExpiresAt.set(null);
    this.actor.set(null);
    this.hydrated.set(true);
    this.browserStorageService.removeLocalItem(this.storageKey);
  }

  private persist(): void {
    this.browserStorageService.setLocalItem(this.storageKey, JSON.stringify({
      accessToken: this.accessToken(),
      refreshToken: this.refreshToken(),
      accessExpiresAt: this.accessExpiresAt(),
      refreshExpiresAt: this.refreshExpiresAt(),
      actor: this.actor()
    } satisfies PersistedPlatformSession));
  }
}
