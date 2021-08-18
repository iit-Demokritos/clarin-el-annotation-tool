import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { AddCustomValueModalComponent } from 'src/app/components/dialogs/add-custom-value-modal/add-custom-value-modal.component';
import { BaseControlComponent } from '../../base-control/base-control.component';

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
      { width: '600px', disableClose: true });
  }; /* openCustomValueModal */

}
