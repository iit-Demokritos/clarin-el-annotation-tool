import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TokenResponse, User, LoginData } from './interface';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  constructor(protected http: HttpClient) {}

  async getToken() {
    return await this.http.get('api/auth/gettoken').toPromise();
  }

  refreshCSRFToken() {
    return this.getToken();
  }

  login(email: string, password: string, rememberMe: boolean = false) {
    // Ensure we have a valid CSRF token...
    this.refreshCSRFToken();
    return this.http.post<LoginData | any>('/api/auth/login', {
      email,
      password,
      remember_me: rememberMe,
    }).pipe(
      // Caller expects a <TokenResponse>
      map(loginData => {return {token: loginData.data.jwtToken,
                                token_type: 'bearer'}})
    );
  }; /* login */

  refresh() {
    // return this.http.post<TokenResponse | any>('/auth/refresh', {});
    return this.http.post<TokenResponse | any>('/api/user/refresh-token', {});
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

  menu() {
    //return this.http.get('/me/menu');
    return this.http.get('assets/data/menu.json?_t=' + Date.now());
  }; /* menu */
}
