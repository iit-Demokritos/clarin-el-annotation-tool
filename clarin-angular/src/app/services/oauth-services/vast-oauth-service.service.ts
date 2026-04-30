import { Injectable } from '@angular/core';
// OAuthService
import { OAuthService, JwksValidationHandler, AuthConfig } from 'angular-oauth2-oidc';

export const VAST_AuthCodeFlowConfig: AuthConfig = {
  // Url of the Identity Provider
  // issuer: 'https://idsvr4.azurewebsites.net',
  // issuer: 'https://login.vast-project.eu/openam/oauth2/realms/root/realms/VAST_Tools',
  issuer: window.location.origin + '/dj-rest-auth/vast/',

  // URL of the SPA to redirect the user to after login
  redirectUri: window.location.origin + '/index.html',

  // The SPA's id. The SPA is registerd with this id at the auth-server
  // clientId: 'server.code',
  clientId: 'spa',

  // Just needed if your auth server demands a secret. In general, this
  // is a sign that the auth server is not configured with SPAs in mind
  // and it might not enforce further best practices vital for security
  // such applications.
  // dummyClientSecret: 'secret',

  responseType: 'code',

  // set the scope for the permissions the client should request
  // The first four are defined by OIDC.
  // Important: Request offline_access to get a refresh token
  // The api scope is a usecase specific one
  scope: 'openid profile email offline_access api',

  showDebugInformation: true,
};

@Injectable({
  providedIn: 'root'
})
export class VAST_OauthService {

  constructor() { }
}
