import { Component, Inject, Injector, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FlashMessagesService } from 'flash-messages-angular';
import { DocumentService } from 'src/app/services/document-service/document.service';

@Component({
  selector: 'add-documents-dialog',
  templateUrl: './add-documents-dialog.component.html',
  styleUrls: ['./add-documents-dialog.component.scss']
})
export class AddDocumentsDialogComponent implements OnInit {

  public userFiles: any = [];
  collectionData: any;

  constructor(
    public injector: Injector,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<any>,
    public flashMessage: FlashMessagesService,
    public documentService: DocumentService,
    public dialog: MatDialog) {
  }

  ngOnInit(): void {
    this.collectionData = this.data.data;
  }

  updateUserFiles(event) {
    this.userFiles = event;
  }; /* updateUserFiles */

  add() {
    if (typeof this.collectionData.collectionId == "undefined") {
      this.flashMessage.show("Unknown Collection",
        { cssClass: 'alert alert-danger', timeout: 12000 });
      return
    }
    if (typeof this.userFiles != "undefined") {
      if (this.userFiles.length > 0) {
        this.documentService.save(
          this.collectionData.collectionId,
          this.userFiles)
          .then((data) => {
            if (data.every((item) => item['success'])) {
              this.dialogRef.close()
            } else {
              this.flashMessage.show(data.find((item) => !item['success'])['message'],
                { cssClass: 'alert alert-danger', timeout: 12000 });
            };
          }, (error) => {
            console.error("AddDocumentsDialogComponent: add():", error);
          });
      } else {
        this.flashMessage.show(
          "Please add at least one document",
          { cssClass: 'alert alert-danger', timeout: 12000 });
      }
    } else {
      this.flashMessage.show(
        "Please add at least one document",
        { cssClass: 'alert alert-danger', timeout: 12000 });
    }
  }

  cancel() {
    this.dialogRef.close();
  };

}
