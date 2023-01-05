import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Token, User, LoginData } from './interface';
import { Menu } from '@core';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private token_refresh: string | null = null;

  constructor(protected http: HttpClient) {}

  async getToken() {
    return await this.http.get('api/auth/gettoken').toPromise();
  }

  refreshCSRFToken() {
    return this.getToken();
  }

  getAccessToken(token) : string {
    if (typeof token === 'string' /* || token instanceof String */) {
      this.token_refresh = null;
      return token;
    } else {
      this.token_refresh = token['refresh'];
      return token['access'];
    }
  }; /* getAccessToken */

  getRefreshToken() : string {
    return this.token_refresh;
  }; /* getRefreshToken */

  login(email: string, password: string, rememberMe: boolean = false) {
    /*
     * The caller to this method is AuthService::login(), which gets our response,
     * and passes it to TokenService::set(), which expects a <Token>.
     */
    // Ensure we have a valid CSRF token...
    this.refreshCSRFToken();
    return this.http.post<Token>('/api/auth/login', {
      email,
      password,
      remember_me: rememberMe,
    }).pipe(
      // Caller expects a <Token>
      map(loginData => {
        return {
          access_token:      this.getAccessToken(loginData['data']['jwtToken']),
          refresh_token:     this.getRefreshToken(),
          token_type:        'bearer'
        }
      }).bind(this)
    );
  }; /* login */

  reset(email: string) {
    // Ensure we have a valid CSRF token...
    this.refreshCSRFToken();
    return this.http.post('/api/auth/reset', {
      email
    });
  }; /* reset */

  refresh(params: Record<string, any>) {
    // return this.http.post<TokenResponse | any>('/auth/refresh', {});
    return this.http.post<Token | any>('/api/user/refresh-token', {
      refresh: params['refresh_token']
    }).pipe(
      // Caller expects a <Token>
      map(loginData => {
        return {access_token:  this.getAccessToken(loginData),
                refresh_token: this.getRefreshToken(),
                token_type:    'bearer'/*,
                prop["loginData"]: loginData*/}
      }).bind(this)
    );
  }; /* refresh */

  logout() {
    // return this.http.post('/auth/logout', {});
    return this.http.get('/api/user/logout');
  }; /* logout */

  me() {
    // return this.http.get<User>('/me');
    return this.http.get<LoginData>('/api/user/me').pipe(
      map(data => {
        return {id: data.data.id,
                name: data.data.first_name + " " + data.data.last_name,
                email: data.data.email,
                first_name: data.data.first_name,
                last_name: data.data.last_name,
                avatar: './assets/images/avatar-default.jpg'};
      })
    );
  }; /* me */

  authenticated() {
    // console.error("LoginService: authenticated()");
    // this.refreshCSRFToken();
    return this.http.get<any>('/api/user/authenticated');
  }; /* authenticated */

  socialLoginProviders() {
    // console.error("LoginService: socialLoginProviders()");
    // this.refreshCSRFToken();
    return this.http.get<any>('/api/auth/loginsocialproviders');
  }; /* socialLoginProviders */

  menu() {
    //return this.http.get<{ menu: Menu[] }>('/me/menu').pipe(map(res => res.menu));
    return this.http.get<{ menu: Menu[] }>('assets/data/menu.json?_t=' + Date.now()).pipe(map(res => res.menu));
  }; /* menu */
}
