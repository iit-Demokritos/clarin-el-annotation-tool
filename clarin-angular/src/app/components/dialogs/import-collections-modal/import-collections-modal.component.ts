import { Component, Inject, Injector, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
//import { FlashMessagesService } from 'flash-messages-angular';
import { FlashMessagesService } from '@components/controls/flash-messages';
import { ConfirmDialogData } from 'src/app/models/dialogs/confirm-dialog';
import { CollectionImportService } from 'src/app/services/collection-import-service/collection-import-service.service';
import { ConfirmDialogComponent } from '../../dialogs/confirm-dialog/confirm-dialog.component';
import { ErrorDialogComponent } from '../error-dialog/error-dialog.component';

@Component({
  selector: 'import-collections-modal',
  templateUrl: './import-collections-modal.component.html',
  styleUrls: ['./import-collections-modal.component.scss']
})
export class ImportCollectionsModalComponent implements OnInit {

  public importForm: UntypedFormGroup;
  userFiles: any[] = [];
  collectionName: any = "";
  allowedTypes = ["application/json"];
  flowAttributes = { accept: this.allowedTypes };

  constructor(
    public injector: Injector,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<any>,
    public formBuilder: UntypedFormBuilder,
    public collectionImportService: CollectionImportService,
    public flashMessage: FlashMessagesService,
    public dialog: MatDialog) {
  }

  ngOnInit(): void {
    this.importForm = this.formBuilder.group({
    });
  }

  handleFileInputs(obj: any) {
    // console.error("handleFileInput():", obj);
    this.userFiles = obj["files"];
    if (obj["message"].length > 0) {
      this.dialog.open(ErrorDialogComponent, { data: new ConfirmDialogData("Error", obj["message"]) });
    }
  }; /* handleFileInputs */

  async collectionExists(name) {
    var response = await this.collectionImportService.exists(name);
    return response;
  }; /* collectionExists */

  async import() {
    var all_ok = true;
    // Get the files...
    let files = await this.collectionImportService.readFiles(this.userFiles);
    // Itearte over all files...
    files.forEach((file) => {
      var collections = JSON.parse(file);
      // We expect an array of Collections...
      collections.forEach(async (collection_data) => {
        try {
          let collection = this.collectionImportService.extractCollectiondData(collection_data);
          let name = collection_data['name'];
          collection['name'] = name;
          // Check if collection name exists...
          let collectionId = undefined;
          let overwrite = false;
          let response = await this.collectionImportService.exists(name);
          if (response["success"] && response["exists"]) {
            if (Array.isArray(response["data"])) {
              collectionId = response["data"][0]["id"];
            } else {
              collectionId = response["data"]["id"];
            }
            // collection already exists
            var modalOptions = new ConfirmDialogData();
            modalOptions.headerType = "warning";
            modalOptions.dialogTitle = 'Warning';
            modalOptions.message = 'The collection "' + this.collectionName +
              '" already exists. What do you want to do?';
            modalOptions.buttons = ['Rename', 'Overwrite'];
            var dialogRef = this.dialog.open(ConfirmDialogComponent, { data: modalOptions, width: '550px' });
            dialogRef.afterClosed().subscribe(async modalResult => {
              if (modalResult === "Rename") {
                collection['name'] = name + `-${(new Date().toJSON())}`;
              } else if (modalResult === "Overwrite") {
                overwrite = true;
              }
            });
          }
          // Add Documents...
          var documents = [];
          collection_data['documents'].forEach(document_data => {
            documents.push(this.collectionImportService.extractDocumentdData(document_data));
          });
          await this.importCollection(collection, documents, overwrite, collectionId);
        }
        catch (e) {
          console.error("ImportCollectionsModalComponent: import() Error:", e);
          this.flashMessage.show("Error occured while importing: " + e.message,
            { cssClass: 'alert alert-danger', timeout: 6000 });
          all_ok = false;
        };
      });
    });
    if (all_ok) {
      this.dialogRef.close();
    }
  }; /* import */

  importCollection(collection, documents, overwrite: boolean = false, collectionId = undefined) {
    if (overwrite && collectionId != undefined) {
      collection.id = collectionId;
    }
    // console.error(collection, documents)
    return this.collectionImportService.saveCollection(collection, documents);
  }; /* importCollection */

  doImport(overwrite: boolean = false, collectionId = undefined) {
    // Import files
    this.collectionImportService.importFiles(this.collectionName,
      this.userFiles, overwrite, collectionId)
      .then((responses) => {
        // console.error("promises:", responses);
        var promises;
        if (Array.isArray(responses)) {
          promises = responses;
        } else {
          promises = [responses];
        }
        var all_ok = true;
        promises.forEach(response => {
          if (response["success"]) {
          } else {
            // console.error("ImportCollectionsModalComponent: doImport(): response:", response);
            this.flashMessage.show("Error occured while importing: " + response['message'],
              { cssClass: 'alert alert-danger', timeout: 8000 });
            all_ok = false;
          }
        });
        if (all_ok) {
          this.dialogRef.close();
        }
      }, (error) => {
        console.error("ImportCollectionsModalComponent: doImport() Error:", error);
        this.flashMessage.show("Error occured while importing: " + error.message,
          { cssClass: 'alert alert-danger', timeout: 8000 });
      });
  }; /* doImport */

  cancel() {
    this.dialogRef.close();
  }; /* cancel */

}
