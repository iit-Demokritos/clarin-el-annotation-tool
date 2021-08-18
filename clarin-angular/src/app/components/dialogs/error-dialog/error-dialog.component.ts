import { Component, OnInit } from '@angular/core';
import { MainDialogComponent } from '../main-dialog/main-dialog.component';

@Component({
  selector: 'error-dialog',
  templateUrl: './error-dialog.component.html',
  styleUrls: ['./error-dialog.component.scss']
})
export class ErrorDialogComponent extends MainDialogComponent implements OnInit {

  super() { }

  ngOnInit(): void {
  }

  cancel() {
    this.dialogRef.close();
  }

}
