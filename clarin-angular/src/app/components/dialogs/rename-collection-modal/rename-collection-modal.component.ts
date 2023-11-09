import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { MainDialogComponent } from '../main-dialog/main-dialog.component';
import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { CollectionNamePattern } from '@models/collection';

@Component({
  selector: 'rename-collection-modal',
  templateUrl: './rename-collection-modal.component.html',
  styleUrls: ['./rename-collection-modal.component.scss']
})
export class RenameCollectionModalComponent extends MainDialogComponent implements OnInit {

  public renameForm: UntypedFormGroup;
  collectionData: any = this.data;
  oldCollectionName = this.collectionData.data.collectionName;
  collectionNamePattern = CollectionNamePattern;

  super() { }

  ngOnInit(): void {
    this.renameForm = this.formBuilder.group({
      collectionName: ["", [Validators.required,
                            Validators.minLength(4),
                            this.createCollectionNameValidator()]]
    });
    this.collectionData.collectionName = this.oldCollectionName
  }; /* ngOnInit */

  createCollectionNameValidator(): ValidatorFn {
    return (control:AbstractControl) : ValidationErrors | null => {
        const value = control.value;
        if (!value) {
          return null;
        }
        const hasChanged = value != this.oldCollectionName;
        if (!hasChanged) {
          return {collectionnameUnchanged: true}
        }

        const collectionnameValid = hasChanged;
        return !collectionnameValid ? {collectionnameInvalid: true}: null;
    }
  }; /* createCollectionNameValidator */

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
