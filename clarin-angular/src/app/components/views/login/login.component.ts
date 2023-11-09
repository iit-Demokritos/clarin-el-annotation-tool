import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
//import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@core/authentication/auth.service';
//import { FlashMessagesService } from 'flash-messages-angular';
import { FlashMessagesService } from '@components/controls/flash-messages';
import { filter } from 'rxjs/operators';
import  packageJson from '@src/../package.json';
import { VERSION } from '@angular/core';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  isSubmitting = false;
  hide_password = true;

  loginForm = this.fb.nonNullable.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
    rememberMe: [false],
  });
  
  socialLoginProvidersLength = 0;
  socialLoginProviders = {};

  public appVersion: string = packageJson.version;
  public ngVersion:  any    = VERSION;

  constructor(public fb: FormBuilder,
              public router: Router,
              public auth: AuthService,
              public flashMessage: FlashMessagesService) {
    // console.error("LoginComponent::constructor()", VERSION);
  }; /* constructor */

  ngOnInit() {
    this.auth.socialLoginProviders().subscribe((data) => {
      // console.error("LoginComponent: ngOnInit(): socialLoginProviders(): data:", data);
      if (data["success"]) {
        this.socialLoginProvidersLength = 0;
        data["data"]["providers"].forEach((p) => {
          switch(p.id) {
            case "vastauth2": {
              this.socialLoginProviders[p.id] = p;
              this.socialLoginProvidersLength += 1;
              break;
            }
          }
        });
      }
    },
    (error: HttpErrorResponse) => {
      console.error("LoginComponent: ngOnInit(): socialLoginProviders(): error:", error);
    });
    /*this.auth.authenticated().subscribe(
      (data) => {
        console.error("LoginComponent: ngOnInit(): data:", data);
      },
      (error: HttpErrorResponse) => {
        console.error("LoginComponent: ngOnInit(): error:", error);
      });*/
  }; /* ngOnInit */

  get username() {
    return this.loginForm.get('username')!;
  }

  get password() {
    return this.loginForm.get('password')!;
  }

  get rememberMe() {
    return this.loginForm.get('rememberMe')!;
  }

  login() {
    // console.error("LoginComponent: login(): username:", this.username.value,
    //               ", remember:", this.rememberMe.value);
    // This service is in src/ng-matero/core/authentication/auth.service.ts (@core)
    this.auth
      .login(this.username.value, this.password.value, this.rememberMe.value)
      //.pipe(filter(authenticated => authenticated))
      .subscribe(
        () => {
          this.router.navigateByUrl('/app');
        },
        (error: HttpErrorResponse) => {
          if (error.status === 422) {
            const form = this.loginForm;
            const errors = error.error.errors;
            Object.keys(errors).forEach(key => {
              form.get(key === 'email' ? 'username' : key)?.setErrors({
                remote: errors[key][0],
              });
            });
          } else if (error.status != 200) {
            this.flashMessage.show(error.error.message, { cssClass: 'alert alert-warning', timeout: 10000 });
          }
        }
      );
  }; // login

}
