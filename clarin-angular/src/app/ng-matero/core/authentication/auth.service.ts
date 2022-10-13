import { Injectable } from '@angular/core';
import { BehaviorSubject, iif, merge, of } from 'rxjs';
import { catchError, map, share, switchMap, tap } from 'rxjs/operators';
import { TokenService } from './token.service';
import { LoginService } from './login.service';
import { filterObject, isEmptyObject } from './helpers';
import { Token, User } from './interface';

// OAuthService
import { OAuthService, /*JwksValidationHandler,*/ AuthConfig } from 'angular-oauth2-oidc';
import { VAST_AuthCodeFlowConfig } from '@services/oauth-services/vast-oauth-service.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private user$ = new BehaviorSubject<User>({});
  private change$ = merge(
    this.tokenService.change(),
    this.tokenService.refresh().pipe(switchMap(() => this.refresh()))
  ).pipe(
    switchMap(() => this.assignUser()),
    share()
  );

  constructor(private loginService: LoginService,
              private tokenService: TokenService,
              private oauthService: OAuthService) {
    this.oauthService.configure(VAST_AuthCodeFlowConfig);
    // this.oauthService.tokenValidationHandler = new JwksValidationHandler();
    //this.oauthService.loadDiscoveryDocumentAndTryLogin();
  }; /* constructor */

  init() {
    return new Promise<void>(resolve => this.change$.subscribe(() => resolve()));
  }

  change() {
    return this.change$;
  }

  check() {
    return this.tokenService.valid();
  }

  login(username: string, password: string, rememberMe = false) {
    return this.loginService.login(username, password, rememberMe).pipe(
      tap((token: Token /* Petasis */) => this.tokenService.set(token)),
      map(() => this.check())
    );
  }

  loginToken(token?: Token): boolean {
    this.tokenService.set(token);
    return this.check();
  }; /* loginTokens */
  
  reset(email: string,) {
    this.tokenService.clear();
    return this.loginService.reset(email).pipe(
      tap(() => this.tokenService.clear()),
      map(() => !this.check())
    );
  }

  refresh() {
    return this.loginService
      .refresh(filterObject({ refresh_token: this.tokenService.getRefreshToken() }))
      .pipe(
        catchError(() => of(undefined)),
        tap((token: Token /* Petasis */) => this.tokenService.set(token)),
        map(() => this.check())
      );
  }

  logout() {
    return this.loginService.logout().pipe(
      tap(() => this.tokenService.clear()),
      map(() => !this.check())
    );
  }

  user() {
    return this.user$.pipe(share());
  }

  menu() {
    return iif(() => this.check(), this.loginService.menu(), of([]));
  }

  private assignUser() {
    if (!this.check()) {
      return of({}).pipe(tap(user => this.user$.next(user)));
    }

    if (!isEmptyObject(this.user$.getValue())) {
      return of(this.user$.getValue());
    }

    return this.loginService.me().pipe(tap(user => this.user$.next(user)));
  }

  authenticated() {
    // console.error("AuthService: authenticated()");
    return this.loginService.authenticated();
  }; /* authenticated */

  /*
   * Social login: OAUTH 2.0
   */
  loginSocial(provider: string = "VAST") {
    console.error("AuthService: loginSocial(): provider:", provider);
    this.oauthService.configure(VAST_AuthCodeFlowConfig);
    this.oauthService.loadDiscoveryDocumentAndTryLogin();
    this.oauthService.initImplicitFlow();

  }; /* loginSocial */
}
