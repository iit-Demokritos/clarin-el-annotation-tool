import { Component, Inject, OnInit } from '@angular/core';
import { MainDialogComponent } from '../main-dialog/main-dialog.component';

@Component({
  selector: 'confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent extends MainDialogComponent implements OnInit {

  super(){
  }

  ngOnInit(): void{
  }

  cancel(){
    this.dialogRef.close();
  }

  confirm(result:any){
    this.dialogRef.close(result);
  }

}

