import { Component, OnInit } from '@angular/core';
import { MainComponent } from '../main/main.component';

@Component({
  selector: 'profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent extends MainComponent implements OnInit {

  super() { }

  ngOnInit(): void {
    this.getUserStats();
    this.initializeInfo();
  }

  updateInfo = {
    oldPassword: "",
    newPassword: "",
    retypePassword: ""
  };
  userStats = {
    collections: 0,
    documents: 0,
    annotations: 0
  };

  initializeInfo() {
    this.updateInfo = {
      oldPassword: "",
      newPassword: "",
      retypePassword: ""
    };
  };

  getUserStats() {
    this.userService.getStats()
      .then((response) => {
        this.userStats = response.data;
      }, (error) => {
        console.log(error);
      });
  };


  updatePassword(updateForm) {
    if (!updateForm.checkValidity()) {
      this.flashMessage.show("The password fields must contain at least 6 characters.", { cssClass: 'alert alert-warning', timeout: 2000 });
      return false;
    } else if (this.updateInfo.newPassword !== this.updateInfo.retypePassword) {
      this.flashMessage.show("New password does not match the confirm password.", { cssClass: 'alert alert-warning', timeout: 2000 });
      return false;
    }

    var passwordData = {
      old_password: this.updateInfo.oldPassword,
      new_password: this.updateInfo.newPassword
    };

    this.userService.updatePassword(passwordData)
      .then((response) => {
        this.initializeInfo();

        this.flashMessage.show(response.message, { cssClass: 'alert alert-warning', timeout: 2000 });

      }, (error) => {
        this.flashMessage.show(error.message, { cssClass: 'alert alert-warning', timeout: 2000 });
      });
  };

}
