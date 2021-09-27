import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';
import { MainDialogComponent } from '../main-dialog/main-dialog.component';

@Component({
  selector: 'detect-changes-modal',
  templateUrl: './detect-changes-modal.component.html',
  styleUrls: ['./detect-changes-modal.component.scss']
})
export class DetectChangesModalComponent extends MainDialogComponent implements OnInit {

  super() { }

  openedDocument: any = {};
  opened_by: any = [];

  collection: any = {};
  document: any = {};
  annotations: any = {
    annotations_len : 0,
    annotations_attributes_len : 0,
    annotations_settings_len : 0,
    annotations_total_len : 0,
    annotations_temp_len : 0,
    annotations_temp_attributes_len : 0,
    annotations_temp_settings_len : 0,
    annotations_temp_total_len : 0
  };
  enableDiscard = false;
  owner         = false;

  ngOnInit(): void {
    this.openedDocument = _.cloneDeep(this.data);
    // console.error("DetectChangesModalComponent(): Opened Document:", this.openedDocument);
    // Get information about Collection...
    this.collectionService.get(this.openedDocument.collection_id).then((response: any) => {
      // console.error("DetectChangesModalComponent(): Collection:", response.data);
      if (response.success && response.data.length) {
        this.collection = {
          name: response.data[0].name
        };
      }
    }, (error) => {
    });
    // Get information about Document...
    this.documentService.get(this.openedDocument.collection_id, this.openedDocument.document_id).then((response: any) => {
      //console.error("DetectChangesModalComponent(): Document:", response);
      if (response.success) {
        this.document = {
          name: response.data.name,
          updated_by: response.data.updated_by,
          updated_at: response.data.updated_at
        };
      }
    }, (error) => {
    });
    // Collect information about annotations...
    this.annotationService.getAll(this.openedDocument.collection_id, this.openedDocument.document_id)
      .then((response) => {
        this.annotations.annotations_total_len = response['data'].length;
        this.annotations.annotations_settings_len =
          response['data'].filter(ann => this.TextWidgetAPI.isSettingAnnotation(ann)).length;
        this.annotations.annotations_attributes_len =
          response['data'].filter(ann => this.TextWidgetAPI.isAttributeAnnotation(ann)).length;
        this.annotations.annotations_len = this.annotations.annotations_total_len -
          this.annotations.annotations_attributes_len - this.annotations.annotations_settings_len;
      });
    // Collect information about temporary annotations...
    this.tempAnnotationService.getAll(this.openedDocument.collection_id, this.openedDocument.document_id)
      .then((response) => {
        this.annotations.annotations_temp_total_len = response['data'].length;
        this.annotations.annotations_temp_settings_len =
          response['data'].filter(ann => this.TextWidgetAPI.isSettingAnnotation(ann)).length;
        this.annotations.annotations_temp_attributes_len =
          response['data'].filter(ann => this.TextWidgetAPI.isAttributeAnnotation(ann)).length;
        this.annotations.annotations_temp_len = this.annotations.annotations_temp_total_len -
          this.annotations.annotations_temp_attributes_len - this.annotations.annotations_temp_settings_len;
      });
    // Get information about the users who have opened this document...
    this.openDocumentService.get(this.openedDocument.document_id, null).then((response: any) => {
      if (response.success && response.data.length > 0) {
        response.data.forEach((opendoc) => {
          if (opendoc.opened && opendoc.owner) {
            this.owner = true;
          }
          this.opened_by.push({
            email: opendoc.email,
            first_name: opendoc.first_name,
            last_name: opendoc.last_name,
            owner: opendoc.owner,
            annotator: opendoc.annotator_type,
            db_interactions: opendoc.db_interactions
          });
        });
        if (this.owner) {
          this.enableDiscard = true;
        }
      }
    }, (error) => {
    })
  }

  continueAnnotation() {
    this.collectionService.getData()
      .then((response: any) => {
        if (response.success) {
          // var openCollection = _.findWhere(response.data, { id: this.openedDocument.collection_id });
          // var openDocument   = _.findWhere(openCollection.children, { id: this.openedDocument.document_id });
          var openCollection = response.data.find(doc => doc.id === this.openedDocument.collection_id);
          var openDocument = openCollection.children.find(doc => doc.id === this.openedDocument.document_id);

          this.annotationSchemaService.restore(this.openedDocument.annotator_type)
            .then((response: any) => {
              if (response.success &&
                typeof (response.savedAnnotationSchema) != "undefined" &&
                typeof (response.annotationSchemaOptions) != "undefined") {
                this.TextWidgetAPI.disableIsRunning();
                this.TextWidgetAPI.resetCallbacks();

                this.TextWidgetAPI.setAnnotatorType(this.openedDocument.annotator_type);
                this.TextWidgetAPI.setAnnotationSchemaOptions(response.annotationSchemaOptions);
                this.TextWidgetAPI.setAnnotationSchema(response.savedAnnotationSchema);

                this.TextWidgetAPI.setCurrentCollection(openCollection);
                openDocument.annotator_id = this.TextWidgetAPI.getAnnotatorTypeId();
                this.TextWidgetAPI.setCurrentDocument(openDocument);

                var modalResponse = { success: true, resume: true, userSelection: "resume" };
                this.dialogRef.close(modalResponse);
              } else {
                response.userSelection = "resume";
                this.dialogRef.close(response);
              }
            }, (error) => {
              error.userSelection = "resume";
              this.dialogRef.close(error);
            });
        } else {
          response.userSelection = "resume";
          this.dialogRef.close(response);
        }
      });
  };

  saveChanges() {
    this.restoreAnnotationService.autoSave(this.openedDocument.collection_id, this.openedDocument.document_id, this.openedDocument.annotator_type)
      .then((response: any) => {
        response.userSelection = "save";
        this.dialogRef.close(response);
      }, (error) => {
        error.userSelection = "save";
        this.dialogRef.close(error);
      });
  };

  discardChanges() {
    this.restoreAnnotationService.discard(this.openedDocument.collection_id, this.openedDocument.document_id, this.openedDocument.annotator_type)     //delete the old annotations of the document
      .then((response: any) => {
        response.userSelection = "discard";
        this.dialogRef.close(response);
      }, (error) => {
        error.userSelection = "discard";
        this.dialogRef.close(error);
      });
  };

  cancel() {
    this.dialogRef.close({ success: true, cancel: true, userSelection: "cancel" });
  }; /* cancel */

}
