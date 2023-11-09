import { Component, Inject, Injector, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
//import { FlashMessagesService } from 'flash-messages-angular';
import { FlashMessagesService } from '@components/controls/flash-messages';
import { ConfirmDialogData } from 'src/app/models/dialogs/confirm-dialog';
import { CollectionImportService } from 'src/app/services/collection-import-service/collection-import-service.service';
import { ConfirmDialogComponent } from '../../dialogs/confirm-dialog/confirm-dialog.component';
import { ErrorDialogComponent } from '../error-dialog/error-dialog.component';
import { AnnotationService } from 'src/app/services/annotation-service/annotation.service';
import { CollectionNamePattern } from '@models/collection';

@Component({
  selector: 'import-documents-from-export-modal',
  templateUrl: './import-documents-from-export-modal.component.html',
  styleUrls: ['./import-documents-from-export-modal.component.scss']
})
export class ImportDocumentsFromExportModalComponent implements OnInit {

  public importForm: UntypedFormGroup;
  userFiles: any[] = [];
  collectionName: any = "";
  allowedTypes = ["application/json"];
  flowAttributes = { accept: this.allowedTypes };
  collectionNamePattern = CollectionNamePattern;

  constructor(
    public injector: Injector,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<any>,
    public formBuilder: UntypedFormBuilder,
    public collectionImportService: CollectionImportService,
    public annotationService: AnnotationService,
    public flashMessage: FlashMessagesService,
    public dialog: MatDialog) {
  }

  ngOnInit(): void {
    this.collectionName = this.data.collection.name;
    this.importForm = this.formBuilder.group({
      collectionName: [this.collectionName]
    });
  }

  handleFileInputs(obj: any) {
    // console.error("handleFileInput():", obj);
    this.userFiles = obj["files"];
    if (obj["message"].length > 0) {
      this.dialog.open(ErrorDialogComponent, { data: new ConfirmDialogData("Error", obj["message"]) });
    }
  }; /* handleFileInputs */

  saveAnnotation(collectionId, documentId, ann) {
    // console.error("CollectionImportService: saveAnnotations(): anns:", anns, collectionId, documentId);
    return this.annotationService.import(collectionId, documentId, ann);
  }; /* saveAnnotation */

  async collectionExists(name) {
    var response = await this.collectionImportService.exists(name);
    return response;
  }; /* collectionExists */

  import() {
    var all_ok = true;
    this.collectionImportService.readJSONFiles(this.userFiles)
      .then((dataJSON) => {
        if (this.data.collection.id != dataJSON[0].data.id) {
          this.flashMessage.show("Collection mismatch", { cssClass: 'alert alert-warning', timeout: 10000 });
          all_ok = false;
        } else if (dataJSON[0].data.documents.length == 0) {
          this.flashMessage.show("No documents found", { cssClass: 'alert alert-warning', timeout: 10000 });
          all_ok = false;
        } else {
          let selected_documents = [];
          for (let docJSON of dataJSON[0].data.documents) {
            for (let doc of this.data.documents) {
              if (docJSON.id == doc.id) {
                selected_documents.push(docJSON)
              }
            }
          }
          if (selected_documents.length == 0) {
            this.flashMessage.show("Documents mismatch", { cssClass: 'alert alert-warning', timeout: 10000 });
            all_ok = false;
          } else {
            for (let selected_document of selected_documents) {
              for (let annotation of selected_document.annotations) {
                this.saveAnnotation(this.data.collection.id, selected_document.id, annotation).then((response) => {
                  if (response["success"]) {
                  } else {
                    this.flashMessage.show("Error occured while importing: " + response['message'],
                      { cssClass: 'alert alert-danger', timeout: 8000 });
                    all_ok = false;
                  }
                }, (error) => {
                  this.flashMessage.show("Error occured while importing: " + error.message,
                    { cssClass: 'alert alert-danger', timeout: 8000 });
                  all_ok = false;
                });
              }
            }
          }
        }
      }, (error) => {
        this.flashMessage.show("Error occured while importing: " + error.message,
          { cssClass: 'alert alert-danger', timeout: 8000 });
        all_ok = false;
      });
      if (all_ok) {
        this.dialogRef.close();
      }
  }; /* import */

  cancel() {
    this.dialogRef.close();
  }; /* cancel */

}
