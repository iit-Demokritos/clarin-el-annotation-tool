import { Component, Inject, Injector, OnInit } from '@angular/core';
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
  selector: 'detect-changes-modal',
  templateUrl: './detect-changes-modal.component.html',
  styleUrls: ['./detect-changes-modal.component.scss']
})
export class DetectChangesModalComponent extends MainDialogComponent implements OnInit {

  super(){}

  documentFound:any = {};

  ngOnInit(): void {
    this.documentFound = _.cloneDeep(this.data);
  }

  continueAnnotation() {
    this.collectionService.getData()
      .then((response:any)=> {
        if (response.success) {
          // var openCollection = _.findWhere(response.data, { id: this.documentFound.collection_id });
          // var openDocument   = _.findWhere(openCollection.children, { id: this.documentFound.document_id });
          var openCollection = response.data.find(doc => doc.id === this.documentFound.collection_id);
          var openDocument   = openCollection.children.find(doc => doc.id === this.documentFound.document_id);

          this.annotationSchemaService.restore(this.documentFound.annotator_type)
            .then((response:any)=> {
              if (response.success &&
                  typeof(response.savedAnnotationSchema) != "undefined" &&
                  typeof(response.annotationSchemaOptions)!="undefined") {
                this.TextWidgetAPI.disableIsRunning();
                this.TextWidgetAPI.resetCallbacks();

                this.TextWidgetAPI.setAnnotatorType(this.documentFound.annotator_type);
                this.TextWidgetAPI.setAnnotationSchemaOptions(response.annotationSchemaOptions);
                this.TextWidgetAPI.setAnnotationSchema(response.savedAnnotationSchema);

                this.TextWidgetAPI.setCurrentCollection(openCollection);
                openDocument.annotator_id = this.TextWidgetAPI.getAnnotatorTypeId();
                this.TextWidgetAPI.setCurrentDocument(openDocument);

                var modalResponse = { success: true, resume: true };
                this.dialogRef.close(modalResponse);
              } else
                this.dialogRef.close(response);
            }, (error) => {
             this.dialogRef.close(error);
            });
        } else {
          this.dialogRef.close(response);
        }
      });
  };

  saveChanges() {
    this.restoreAnnotationService.autoSave(this.documentFound.collection_id, this.documentFound.document_id, this.documentFound.annotator_type)
      .then((response:any)=> {
        this.dialogRef.close(response);
      }, (error)=> {
        this.dialogRef.close(error);
      });
  };

  discardChanges() {
    this.restoreAnnotationService.discard(this.documentFound.collection_id, this.documentFound.document_id, this.documentFound.annotator_type)     //delete the old annotations of the document
      .then((response:any)=> {
        this.dialogRef.close(response);
      },(error)=> {
        this.dialogRef.close(error);
      });
  };

}
