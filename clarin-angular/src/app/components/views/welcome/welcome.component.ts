import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MainComponent } from '../main/main.component';

@Component({
  selector: 'welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class WelcomeComponent extends MainComponent implements OnInit {
  //faArrowCircleLeft = faArrowCircleLeft;

  super() { }

  ngOnInit(): void {
    

  }

  flash = "";
  mode = "";
  regInfo = {
    name: "",
    email: "",
    password: ""
  };
  loginInfo = {
    email: "",
    password: ""
  };
  resetInfo = {
    email: ""
  };

  initializeUserInfo() {
    this.resetInfo = {
      email: ""
    };

    this.loginInfo = {
      email: "",
      password: ""
    };

    this.regInfo = {
      name: "",
      email: "",
      password: ""
    };
  };


  formContentChanged() {

  }


  selectMode(value) {
    this.formContentChanged();
    this.mode = value;
  };

  register(regForm) {
    if (!regForm.checkValidity()) {
      if (!regForm.regName.checkValidity() || !regForm.regEmail.checkValidity()) {
        //Flash.show("Please provide all the required information.");
        this.flashMessage.show("Please provide all the required information.", { cssClass: 'alert alert-warning', timeout: 2000 });
        return false;
      }

      if (regForm.regPassword.value.length < 6) {
        //Flash.show("Your password must contain at least 6 characters.");
        this.flashMessage.show("Your password must contain at least 6 characters.", { cssClass: 'alert alert-warning', timeout: 2000 });
        return false;
      }
    }

    this.userService.register(this.regInfo)
      .then(function (response) {
        this.initializeUserInfo();
        //Flash.show(response.message);
        this.flashMessage.show(response.message, { cssClass: 'alert alert-warning', timeout: 2000 });
      }, function (error) {
        //Flash.show(error.message);
        this.flashMessage.show(error.message, { cssClass: 'alert alert-warning', timeout: 2000 });
      });
  };

  login(loginForm) {
    if (!loginForm.checkValidity()) {
      //Flash.show("Please provide all the required information.");
      this.flashMessage.show("Please provide all the required information.", { cssClass: 'alert alert-warning', timeout: 2000 });
      return false;
    }

    this.userService.login(this.loginInfo)
      .then((response) => {
        if (response.success) {
          sessionStorage.authenticated = true;

          //Flash.clear();
          this.initializeUserInfo();
          //$state.go('profile');
          this.router.navigate(['/clarin/profile']);

        } else {
          delete sessionStorage.authenticated;
          //Flash.show(response.message);
          this.flashMessage.show(response.message, { cssClass: 'alert alert-warning', timeout: 2000 });
          //$state.go('welcome');
        }
      }, (error) => {
        //Flash.show(error.message);
        this.flashMessage.show(error.message, { cssClass: 'alert alert-warning', timeout: 2000 });
        //$state.go('welcome');
      });
  };


  reset(resetForm) {
    if (!resetForm.$valid) {
      //Flash.show("Please provide all the required information.");
      this.flashMessage.show("Please provide all the required information.", { cssClass: 'alert alert-warning', timeout: 2000 });
      return false;
    }

    this.userService.resetPassword({ email: this.resetInfo["email"] })
      .then((response) => {
        //Flash.show(response.message);
        this.flashMessage.show(response.message, { cssClass: 'alert alert-warning', timeout: 2000 });
      }, (error) => {
        //Flash.show(error.message);
        this.flashMessage.show(error.message, { cssClass: 'alert alert-warning', timeout: 2000 });
      });
  };

}
