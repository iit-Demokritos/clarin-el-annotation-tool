import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { AuthService } from '@core/authentication/auth.service';
import { FlashMessagesService } from 'flash-messages-angular';
import { filter } from 'rxjs/operators';
import { LoginComponent }  from '@components/views/login/login.component';
import { Token } from '@core/authentication/interface';

import  packageJson from '@src/../package.json';

@Component({
  selector: 'app-login',
  templateUrl: '../login/login.component.html',
})
export class LoginSocialComponent extends LoginComponent implements OnInit {
  loginForm: FormGroup;
  hide_password = true;

  public appVersion: string = packageJson.version;

  route_params: any;
  user_authenticated: any;

  constructor(public fb: FormBuilder,
              public router: Router,
              public route: ActivatedRoute,
              public auth: AuthService,
              public flashMessage: FlashMessagesService) {
    super(fb, router, auth, flashMessage);
  }; /* constructor */

  ngOnInit() {
    super.ngOnInit();
    this.userAuthenticated();
  }; /* ngOnInit */

  userAuthenticated() {
    this.route.queryParams
      .subscribe((params: any) => {
        this.route_params = params;
        // console.error("PARAMS:", params);
        if ("refresh" in this.route_params &&
            "access" in this.route_params) {
          // Ok, we got two keys. Django will also had set the access_token cookie.
          // This means that we are probably authenticated!
          this.auth.authenticated()
            .subscribe((data: any) => {
              // console.error("LoginSocialComponent: ngOnInit(): data:", data);
              if (data.success && data.data.authenticated) {
                // We are authenticated!
                this.user_authenticated = data.data;
                this.login();
              }
            },
            (error: HttpErrorResponse) => {
               console.error("LoginSocialComponent: userAuthenticated(): error:", error);
               this.router.navigateByUrl('/auth/login');
            });
        }
      }, (error) => {
         console.error("LoginSocialComponent: userAuthenticated(): error:", error);
         this.router.navigateByUrl('/auth/login');
      });
  }; /* userAuthenticated */

  generateToken(): Token {
    return {
      access_token:  this.route_params['access'],
      refresh_token: this.route_params['refresh'],
      token_type: "bearer"
    };
  }; /* generateToken */

  loginWithToken(token?: Token): boolean {
    return this.auth.loginToken(token);
  }; /* loginWithToken */

  login()  {
    if (this.loginWithToken(this.generateToken())) {
      this.router.navigateByUrl('/app');
    }
  }; /* login */

}
