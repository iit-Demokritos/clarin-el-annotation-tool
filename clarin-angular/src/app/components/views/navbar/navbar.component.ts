import { Component, OnInit } from '@angular/core';
import { MainComponent } from '../main/main.component';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent extends MainComponent implements OnInit {

  super() { }

  ngOnInit(): void {
  }

  logout() {
    this.userService.logout().then((response) => {
      delete sessionStorage.authenticated;
      this.flashMessage.show(response.message, { cssClass: 'alert alert-warning', timeout: 2000 });
      //$state.go('welcome');
      this.router.navigate(["/clarin/welcome"])
    }, (error) => {
      delete sessionStorage.authenticated;
      this.flashMessage.show(error.message, { cssClass: 'alert alert-warning', timeout: 2000 });
      this.router.navigate(["/clarin/welcome"])
      //$state.go('welcome');
    });
  };

}
