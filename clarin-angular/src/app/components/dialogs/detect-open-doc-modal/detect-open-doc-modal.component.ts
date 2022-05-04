import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';
import { MainDialogComponent } from '../main-dialog/main-dialog.component';

@Component({
  selector: 'detect-open-doc-modal',
  templateUrl: './detect-open-doc-modal.component.html',
  styleUrls: ['./detect-open-doc-modal.component.scss']
})
export class DetectOpenDocModalComponent extends MainDialogComponent implements OnInit {

  currentDocument;

  super() { }

  ngOnInit(): void {
    this.currentDocument = _.cloneDeep(this.data);
  }

  saveChanges() {
    var AnnotatorTypeId = this.TextWidgetAPI.getAnnotatorTypeId();
    this.restoreAnnotationService.saveAndCloseDocument(this.currentDocument.collection_id, this.currentDocument.id, AnnotatorTypeId)
      .then((response: any) => {
        if (response.success)
          this.dialogRef.close(response);
        else
          this.dialogRef.close(response);
      }, (error) => {
        this.dialogRef.close(error);
      });
  };

  discardChanges() {
    if (typeof (this.currentDocument.confirmed) != "undefined" && this.currentDocument.confirmed) {
      this.dialogRef.close({ success: true });
      return false;
    }

    let AnnotatorTypeId = this.TextWidgetAPI.getAnnotatorTypeId();
    this.restoreAnnotationService.discard(this.currentDocument.collection_id, this.currentDocument.id, AnnotatorTypeId)     //delete the old annotations of the document
      .then((response: any) => {
        if (response.success)
          this.dialogRef.close(response);
        else
          this.dialogRef.close(response);
      }, (error) => {
        this.dialogRef.close(error);
      });
  };

}
