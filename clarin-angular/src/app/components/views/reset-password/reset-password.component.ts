import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@core/authentication/auth.service';
//import { FlashMessagesService } from 'flash-messages-angular';
import { FlashMessagesService } from '@components/controls/flash-messages';
import { filter } from 'rxjs/operators';
import  packageJson from '@src/../package.json';
import { VERSION } from '@angular/core';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: UntypedFormGroup;
  public appVersion: string = packageJson.version;
  public ngVersion:  any    = VERSION;

  constructor(private fb: UntypedFormBuilder, private router: Router,
    private auth: AuthService,
    private flashMessage: FlashMessagesService) { }

  ngOnInit() {
    this.resetPasswordForm = this.fb.group({
      username: ['', [Validators.required]],
    });
  }

  get username() {
    return this.resetPasswordForm.get('username');
  }

  reset() {
    // console.error("ResetPasswordComponent: login(): username:", this.username.value,
    //               ", remember:", this.rememberMe.value);
    // This service is in src/ng-matero/core/authentication/auth.service.ts (@core)
    this.auth
      .reset(this.username.value)
      .subscribe(
        (response) => {
        },
        (error: HttpErrorResponse) => {
          if (error.status === 422) {
            const form = this.resetPasswordForm;
            const errors = error.error.errors;
            Object.keys(errors).forEach(key => {
              form.get(key === 'email' ? 'username' : key)?.setErrors({
                remote: errors[key][0],
              });
            });
          } else if (error.status != 200) {
            this.flashMessage.show(error.error.message, { cssClass: 'alert alert-warning', timeout: 10000 });
          }
        },
        () => {
          // this.router.navigateByUrl('/auth/login');
        }
      );
  }
}
