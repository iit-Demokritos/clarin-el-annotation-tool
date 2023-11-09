import { Component, Inject, Injector, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
//import { FlashMessagesService } from 'flash-messages-angular';
import { FlashMessagesService } from '@components/controls/flash-messages';
import { ConfirmDialogData } from 'src/app/models/dialogs/confirm-dialog';
import { CollectionImportService } from 'src/app/services/collection-import-service/collection-import-service.service';
import { ConfirmDialogComponent } from '../../dialogs/confirm-dialog/confirm-dialog.component';
import { ErrorDialogComponent } from '../error-dialog/error-dialog.component';
import { CollectionNamePattern } from '@models/collection';

@Component({
  selector: 'import-modal',
  templateUrl: './import-modal.component.html',
  styleUrls: ['./import-modal.component.scss']
})
export class ImportModalComponent implements OnInit {

  public importForm: UntypedFormGroup;
  userFiles: any[] = [];
  _collectionName: any = "";
  allowedTypes = ["application/json"];
  flowAttributes = { accept: this.allowedTypes };
  collectionNamePattern = CollectionNamePattern;

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
      collectionName: [this._collectionName]
    });
  }

  get collectionName() {
    return this.importForm.get('collectionName')!;
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

  import() {
    if (this.collectionName.value.length < 4) {
      console.error("Collection name too short:", this.collectionName.value);
      throw new Error("Collection name too short!");
      return;
    }
    this.collectionImportService.exists(this.collectionName.value)
      .then((response) => {
        if (response["success"] && response["exists"]) {
          var collectionId;
          if (Array.isArray(response["data"])) {
            collectionId = response["data"][0]["id"];
          } else {
            collectionId = response["data"]["id"];
          }
          // collection already exists
          var modalOptions = new ConfirmDialogData();
          modalOptions.headerType = "warning";
          modalOptions.dialogTitle = 'Warning';
          modalOptions.message = 'The collection "' + this.collectionName.value +
            '" already exists. What do you want to do?';
          modalOptions.buttons = ['Cancel', 'Overwrite'];
          var dialogRef = this.dialog.open(ConfirmDialogComponent, { data: modalOptions, width: '550px' });
          dialogRef.afterClosed().subscribe(modalResult => {
            if (modalResult === "Cancel") {
              return false;
            } else if (modalResult === "Overwrite") {
              this.doImport(true, collectionId);
            }
          });
        } else {
          this.doImport(false);
        }
      }, (error) => {
        console.error("ImportModalComponent: import() Error:", error);
        this.flashMessage.show("Error occured while importing: " + error.message,
          { cssClass: 'alert alert-danger', timeout: 6000 });
      });
  }; /* import */

  doImport(overwrite: boolean = false, collectionId = undefined) {
    // Import files
    this.collectionImportService.importFiles(this.collectionName.value,
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
            // console.error("ImportModalComponent: doImport(): response:", response);
            this.flashMessage.show("Error occured while importing: " + response['message'],
              { cssClass: 'alert alert-danger', timeout: 8000 });
            all_ok = false;
          }
        });
        if (all_ok) {
          this.dialogRef.close();
        }
      }, (error) => {
        console.error("ImportModalComponent: doImport() Error:", error);
        this.flashMessage.show("Error occured while importing: " + error.message,
          { cssClass: 'alert alert-danger', timeout: 8000 });
      });
  }; /* doImport */

  cancel() {
    this.dialogRef.close();
  }; /* cancel */

}
