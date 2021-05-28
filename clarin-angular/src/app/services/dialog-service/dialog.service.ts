import { Injectable } from '@angular/core';
import { ErrorDialogComponent } from 'src/app/components/dialogs/error-dialog/error-dialog.component';
import { RenameCollectionModalComponent } from 'src/app/components/dialogs/rename-collection-modal/rename-collection-modal.component';
import { ConfirmDialogData } from 'src/app/models/dialogs/confirm-dialog';
import { MainService } from '../main/main.service';

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  constructor() { }

  showError(title,message){
    //this.dialog.open(ErrorDialogComponent,{data:new ConfirmDialogData(title,message)});
  }
}
