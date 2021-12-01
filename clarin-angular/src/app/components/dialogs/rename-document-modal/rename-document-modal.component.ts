import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MainDialogComponent } from '../main-dialog/main-dialog.component';

@Component({
  selector: 'rename-document-modal',
  templateUrl: './rename-document-modal.component.html',
  styleUrls: ['./rename-document-modal.component.scss']
})
export class RenameDocumentModalComponent extends MainDialogComponent implements OnInit {

  public renameForm: FormGroup;
  documentData: any = this.data;
  oldDocumentName = this.documentData.data.documentName;

  super() { }

  ngOnInit(): void {
    this.renameForm = this.formBuilder.group({
      documentName: [""]
    });
  }; /* ngOnInit */


getExtension(){
  switch(this.documentData.data.documentType) {
    case "text":
    return ".txt";
  
    case "tei xml":
      return ".tei.xml";
    default:
      return ".txt";
  }
 
}


  rename() {
    if (this.oldDocumentName === (this.documentData.documentName+this.getExtension())) {
      //$modalInstance.close(oldCollectionName);
      this.dialogRef.close(this.oldDocumentName);
      return false;
    }

    if (typeof this.documentData.documentName != "undefined") {
      var updateData = {
        id: this.documentData.data.documentId,
        cid:this.documentData.data.collectionId,
        name: this.documentData.documentName+this.getExtension()
      };
      console.log(updateData)
      this.documentService.update(updateData)
        .then((response) => {
          if (response["success"] && !response["exists"]) {
            this.dialogRef.close(updateData.name);
          } else if (response["success"] && response["exists"]) {
            this.flashMessage.show(response["flash"],
              { cssClass: 'alert alert-warning', timeout: 6000 });
          } else {
            this.flashMessage.show("An error occurred during the renaming of your document",
              { cssClass: 'alert alert-warning', timeout: 6000 });
          }
        }, (error) => {
          this.dialogRef.close('Error in edit Document. Please refresh the page and try again');
        });
    }
  };

  cancel() {
    this.dialogRef.close();
  };

}
