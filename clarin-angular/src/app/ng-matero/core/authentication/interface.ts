export interface User {
  [propName: string]: any;

  id: number | string | null;
  name?: string;
  email?: string;
  avatar?: string;
}

export interface BackendUser {
  id: number | string | null;
  email?:       string;
  permissions?: string | null;
  last_login?:  string | null;
  first_name?:  string | null
  last_name?:   string | null;
  created_at?:  string | null;
  updated_at?:  string | null;
  jwtToken?:    string | null;
}

export interface Token {
  access_token?: string;
  token?: string;
  token_type?: string;
  expires_in?: number;
}

export interface RefreshToken {
  refresh: boolean;
  accessToken: string;
  tokenType: string;
  exp: number;

  refreshTime: () => number;
  valid: () => boolean;
}
