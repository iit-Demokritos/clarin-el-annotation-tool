import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  constructor() { }

  showError(title, message) {
    //this.dialog.open(ErrorDialogComponent,{data:new ConfirmDialogData(title,message)});
  }
}
