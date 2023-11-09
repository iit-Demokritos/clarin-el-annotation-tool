import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { MainDialogComponent } from '../main-dialog/main-dialog.component';
import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { DocumentNamePattern } from '@models/document';

@Component({
  selector: 'rename-document-modal',
  templateUrl: './rename-document-modal.component.html',
  styleUrls: ['./rename-document-modal.component.scss']
})
export class RenameDocumentModalComponent extends MainDialogComponent implements OnInit {

  public renameForm: UntypedFormGroup;
  documentData: any = this.data;
  oldDocumentName = this.documentData.data.documentName;
  documentNamePattern = DocumentNamePattern;

  super() { }

  ngOnInit(): void {
    this.renameForm = this.formBuilder.group({
      documentName: ["", [Validators.required,
                          Validators.minLength(4),
                          this.createFilenameValidator()]]
    });
    this.documentData.documentName = this.oldDocumentName
  }; /* ngOnInit */

  createFilenameValidator(): ValidatorFn {
    return (control:AbstractControl) : ValidationErrors | null => {
        const value = control.value;
        if (!value) {
          return null;
        }
        const hasChanged = value != this.oldDocumentName;
        if (!hasChanged) {
          return {filenameUnchanged: true}
        }

        const hasExtensionTXT = /\.txt/.test(value);
        const hasExtensionTEIXML = /\.tei\.xml/.test(value);
        const hasExtensionImage = /\.((png)|(jpeg)|(jpg)|(gif)|(tiff)|(tif)|(webp)|(svg)|(bmp))/.test(value);
        const hasExtensionAV = /\.((3gp)|(aac)|(flac)|(mpg)|(mpeg)|(mp3)|(mp4a)|(mp4)|(oga)|(ogv)|(ogg)|(wav)|(mov)|(webm))/.test(value);
        const hasExtension = hasExtensionTXT || hasExtensionTEIXML || hasExtensionImage || hasExtensionAV;

        if (!hasExtension) {
          return {filenameMissingExtension: true}
        }

        const filenameValid = hasChanged && hasExtension;
        return !filenameValid ? {filenameInvalid: true}: null;
    }
  }; /* createFilenameValidator */

  getExtension(): string {
    return "";
    /*
    switch(this.documentData.data.documentType) {
      case "text":
        return ".txt";
      case "tei xml":
        return ".tei.xml";
      default:
        return ".txt";
    }*/
  }; /* getExtension */

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
