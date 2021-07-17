import { Component, Input, Inject, Injector, OnInit } from '@angular/core';
import { MainService } from 'src/app/services/main/main.service';
import * as _ from 'lodash';
import { MainDialogComponent } from '../main-dialog/main-dialog.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FlashMessagesService } from 'flash-messages-angular';
import { AnnotationSchemaService } from 'src/app/services/annotation-schema-service/annotation-schema.service';
import { ButtonAnnotatorService } from 'src/app/services/button-annotator-service/button-annotator.service';
import { CollectionService } from 'src/app/services/collection-service/collection-service.service';
import { CoreferenceAnnotatorService } from 'src/app/services/coreference-annotator-service/coreference-annotator.service';
import { DialogService } from 'src/app/services/dialog-service/dialog.service';
import { DocumentService } from 'src/app/services/document-service/document.service';
import { RestoreAnnotationService } from 'src/app/services/restore-annotation-service/restore-annotation.service';
import { SharedCollectionService } from 'src/app/services/shared-collection/shared-collection.service';
import { TextWidgetAPI } from 'src/app/services/text-widget/text-widget.service';
import { DialogData } from 'src/app/models/dialogs/dialog-data';
import { AnnotationComponent } from '../../views/annotation/annotation.component';

@Component({
  selector: 'add-custom-value-modal',
  templateUrl: './add-custom-value-modal.component.html',
  styleUrls: ['./add-custom-value-modal.component.scss']
})
export class AddCustomValueModalComponent extends MainDialogComponent implements OnInit {

  @Input() buttonAttributeValue;
  @Input() buttonLabel;

  ngOnInit(): void {
  }

  addbutton() {
    console.error("addButton(): label:", this.buttonLabel, "attribute:", this.buttonAttributeValue);
    var customvalue = [{ attributes:[
      {label: this.buttonLabel, value: this.buttonAttributeValue}
    ]}];
    this.TextWidgetAPI.setFoundInCollection(customvalue);

    this.dialogRef.close();
  } /* addButton */

  cancel() {
    this.dialogRef.close();
  }; /* cancel */

}
