import { Component, OnInit } from '@angular/core';
import { MainDialogComponent } from '../main-dialog/main-dialog.component';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';

@Component({
  selector: 'rename-collection-modal',
  templateUrl: './rename-collection-modal.component.html',
  styleUrls: ['./rename-collection-modal.component.scss']
})
export class RenameCollectionModalComponent extends MainDialogComponent implements OnInit {

  public renameForm: FormGroup;
  collectionData: any = this.data;
  oldCollectionName = this.collectionData.data.collectionName;

  super() { }

  ngOnInit(): void {
    this.renameForm = this.formBuilder.group({
      collectionName: [""]
    });
  }; /* ngOnInit */

  rename() {
    if (this.oldCollectionName === this.collectionData.collectionName) {
      //$modalInstance.close(oldCollectionName);
      this.dialogRef.close(this.oldCollectionName);
      return false;
    }

    if (typeof this.collectionData.collectionName != "undefined") {
      var updateData = {
        id: this.collectionData.data.collectionId,
        name: this.collectionData.collectionName
      };

      this.collectionService.update(updateData)
        .then((response) => {
          if (response["success"] && !response["exists"]) {
            this.dialogRef.close(updateData.name);
          } else if (response["success"] && response["exists"]) {
            this.flashMessage.show(response["flash"],
              { cssClass: 'alert alert-warning', timeout: 6000 });
          } else {
            this.flashMessage.show("An error occurred during the renaming of your collection",
              { cssClass: 'alert alert-warning', timeout: 6000 });
          }
        }, (error) => {
          this.dialogRef.close('Error in edit Collection. Please refresh the page and try again');
        });
    }
  };

  cancel() {
    this.dialogRef.close();
  };

}
