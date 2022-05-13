import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@core/authentication/auth.service';
import { FlashMessagesService } from 'flash-messages-angular';
import { filter } from 'rxjs/operators';
import  packageJson from '@src/../package.json';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  hide_password = true;

  public appVersion: string = packageJson.version;

  constructor(private fb: FormBuilder, private router: Router,
    private auth: AuthService,
    private flashMessage: FlashMessagesService) { }

  ngOnInit() {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
      remember_me: [false],
    });
  }

  get username() {
    return this.loginForm.get('username');
  }

  get password() {
    return this.loginForm.get('password');
  }

  get rememberMe() {
    return this.loginForm.get('remember_me');
  }

  login() {
    // console.error("LoginComponent: login(): username:", this.username.value,
    //               ", remember:", this.rememberMe.value);
    // This service is in src/ng-matero/core/authentication/auth.service.ts (@core)
    this.auth
      .login(this.username.value, this.password.value, this.rememberMe.value)
      .pipe(filter(authenticated => authenticated))
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
  }
}
