import { Component, ElementRef, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { BaseControlComponent } from '../../base-control/base-control.component';
import { AddCustomValueModalComponent } from 'src/app/components/dialogs/add-custom-value-modal/add-custom-value-modal.component';
import { ErrorDialogComponent } from 'src/app/components/dialogs/error-dialog/error-dialog.component';
import { ConfirmDialogData } from 'src/app/models/dialogs/confirm-dialog';
import { element } from 'protractor';

@Component({
  selector: 'annotation-button-custom-value-add',
  templateUrl: './annotation-button-custom-value-add.component.html',
  styleUrls: ['./annotation-button-custom-value-add.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AnnotationButtonCustomValueAddComponent extends BaseControlComponent implements OnInit {

  @Input() label;

  ngOnInit(): void {
  }; /* ngOnInit */

  openCustomValueModal() {
    var dialogRef = this.dialog.open(AddCustomValueModalComponent,
      {width: '600px', disableClose: true});
  }; /* openCustomValueModal */

}
