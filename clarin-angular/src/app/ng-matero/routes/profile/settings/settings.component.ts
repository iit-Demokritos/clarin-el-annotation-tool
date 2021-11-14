import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';

import { LoggingInterceptor } from '@core/interceptors/logging-interceptor';
import { UserService } from 'src/app/services/user-service/user.service';
import { FlashMessagesService } from 'flash-messages-angular';
import { LoginService } from '@core';//?
/*import { ErrorStateMatcher } from '@angular/material/core';



export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const invalidCtrl = !!(control && control.invalid && control.parent.dirty);
    const invalidParent = !!(control && control.parent && control.parent.invalid && control.parent.dirty);

    return (invalidCtrl || invalidParent);
  }
}

*/






@Component({
  selector: 'app-profile-settings',
  templateUrl: './settings.component.html',
})
export class ProfileSettingsComponent implements OnInit {
  reactiveForm: FormGroup;
  UpdatePasswordForm: FormGroup;

  tabvalue=0
 // public userService:UserService;
 // matcher = new MyErrorStateMatcher();

  constructor(private fb: FormBuilder,public userService: UserService, public flashMessage: FlashMessagesService,public loginService: LoginService) {
    this.reactiveForm = this.fb.group({
      firstname: ['', [Validators.required]],
      lastname: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      gender: [''], //[Validators.required]],
      city: [''],// [Validators.required]],
      address: [''], //[Validators.required]],
      company: [''], //[Validators.required]],
      birthdate: ['']//, [Validators.required]],
    });

    this.UpdatePasswordForm = this.fb.group({
      currentpassword: ['', [Validators.required]],
      newpassword: ['', [Validators.required]],
   // confirmnewpassword: ['', [Validators.required]],
    confirmnewpassword: ['', [this.confirmValidator]]

    });


  }

  confirmValidator = (control: FormControl): { [k: string]: boolean } => {
    if (!control.value) {
      return { error: true, required: true };
    } else if (control.value !== this.UpdatePasswordForm.controls.newpassword.value) {
      return { error: true, confirm: true };
    }
    return {};
  };

 /* checkPasswords: ValidatorFn = (control: FormControl): { [k: string]: boolean } => {
    console.log(control.value)
    if(this.UpdatePasswordForm!==undefined){
    console.log(this.UpdatePasswordForm.controls.newpassword.value)
    }
    if (!control.value) {
      return { error: true, required: true };
    } else if (control.value !== this.UpdatePasswordForm.controls.newpassword.value) {
      return { error: true, confirm: true };
    }
    return {};
  };
  */
  
  /*(group: AbstractControl):  ValidationErrors | null => { 
    let pass = group.get('newpassword').value;
    let confirmPass = group.get('confirmnewpassword').value
    return pass === confirmPass ? null : { notSame: true }
  }

*/




  ngOnInit() {
   // console.log("111111")
    
    this.loginService.me()
    .subscribe(res=> {
     // console.log(res);
      this.reactiveForm.controls["firstname"].setValue(res["first_name"])
      this.reactiveForm.controls["lastname"].setValue(res["last_name"])
      this.reactiveForm.controls["email"].setValue(res["email"])
     
    })
  //  console.log("222222")
   
    //this.flashMessage.show("alex", { cssClass: 'alert alert-warning', timeout: 30000 });
   // this.handleClick()
  }
  
  updatePassword(){
    let state= this.UpdatePasswordForm.valid
    if (state===true){
      this.tabvalue=1
      //data for request
        let passwords={
              "old_password":this.UpdatePasswordForm.controls["currentpassword"].value,
              "new_password":this.UpdatePasswordForm.controls["newpassword"].value
        }
        //update password request
       // console.log(passwords)  
        this.userService.updatePassword(passwords)
        .then((response) => {
            console.log(response)
           this.flashMessage.show(response["message"], { cssClass: 'alert alert-warning', timeout: 10000 });
        },  (error) => {
            console.log(error)
            this.flashMessage.show(error["error"]["message"], { cssClass: 'alert alert-warning', timeout: 10000 });
           // this.flashMessage.show("Please provide all the required information.", { cssClass: 'alert alert-warning', timeout: 2000 });
    })
    this.UpdatePasswordForm.reset()
   
  }

  }


  
  UpdateProfile() { 
   let state= this.reactiveForm.valid
   if (state===true){
      this.tabvalue=0
      let birthdate_val=(this.reactiveForm.controls["birthdate"].value)["_i"]
   //   console.log(birthdate_val)
      //data for request
      let profiledata={
        "firstname":this.reactiveForm.controls["firstname"].value
        ,"lastname":this.reactiveForm.controls["lastname"].value,
        "email":this.reactiveForm.controls["email"].value,
        "gender":this.reactiveForm.controls["gender"].value,
        "city":this.reactiveForm.controls["city"].value,
        "address":this.reactiveForm.controls["address"].value,
        "company":this.reactiveForm.controls["company"].value,
        "birthdate":birthdate_val
      }
      
      this.userService.updateProfile(profiledata)
      .then((response) => {
          console.log(response)

         this.flashMessage.show(response["message"], { cssClass: 'alert alert-warning', timeout: 10000 });
      },  (error) => {
          console.log(error)
          this.flashMessage.show(error["error"]["message"], { cssClass: 'alert alert-warning', timeout: 10000 });
         // this.flashMessage.show("Please provide all the required information.", { cssClass: 'alert alert-warning', timeout: 2000 });
  })

      //console.log(profiledata)
    
      
  } 
}





  
  getErrorMessage(form: FormGroup) {
    return form.get('email')?.hasError('required')
      ? 'You must enter a value'
      : form.get('email')?.hasError('email')
      ? 'Not a valid email'
      : '';
  }
}
