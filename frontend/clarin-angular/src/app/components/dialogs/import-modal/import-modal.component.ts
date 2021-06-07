import { Component, Inject, Injector, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FlashMessagesService } from 'flash-messages-angular';
import { ConfirmDialogData } from 'src/app/models/dialogs/confirm-dialog';
import { CollectionService } from 'src/app/services/collection-service/collection-service.service';
import { DocumentService } from 'src/app/services/document-service/document.service';
import { SharedCollectionService } from 'src/app/services/shared-collection/shared-collection.service';
import { ErrorDialogComponent } from '../error-dialog/error-dialog.component';
import { MainDialogComponent } from '../main-dialog/main-dialog.component';

@Component({
  selector: 'import-modal',
  templateUrl: './import-modal.component.html',
  styleUrls: ['./import-modal.component.scss']
})
export class ImportModalComponent implements OnInit {

  filterFiles = false;
  userFiles: any[] = [];
  collectionName: any = "";

  constructor(public injector:Injector, @Inject(MAT_DIALOG_DATA) public data: any, public dialogRef:MatDialogRef<any>, public collectionService:CollectionService, public flashMessage:FlashMessagesService,public sharedCollectionService:SharedCollectionService, public documentService:DocumentService, public dialog:MatDialog) {
  }

  ngOnInit(): void {
  }

  //TODO: Implement uploader
  /*$scope.$on('flowEvent', function(event, data) {
    $scope.userFiles = data.userFiles;
    if (data.msg !== "")
      $scope.$parent.flash = data.msg;
    else if ($scope.$parent.flash !== "")
      $scope.$parent.flash = "";
  });*/

  // import() {
  /*if (angular.isUndefined($scope.userFiles) || $scope.userFiles.length === 0) {
    $scope.$parent.flash = "Please add at least one document";
    return false;
  } else if (angular.isUndefined($scope.collectionName) || $scope.collectionName.length === 0) {
    $scope.$parent.flash = "Please enter a collection name";
    return false;
  } else {
    // Reset error
    $scope.$parent.flash = "";

    // Import files
    Collection.importFiles($scope.collectionName, $scope.userFiles)
      .then(function(data) {
        $modalInstance.close();
        $scope.$destroy();
      });
  };*/
  //}

  handleFileInput(obj: any) {
    this.userFiles = obj["files"];

    if (obj["message"].length > 0) {
      this.dialog.open(ErrorDialogComponent,{data:new ConfirmDialogData("Error",obj["message"])});
    }

  }


  import() {
    if (typeof this.userFiles != "undefined") {
      if (this.userFiles.length > 0) {
        if (!this.collectionName || this.collectionName.length === 0) {
          this.flashMessage.show("Please enter a collection name", { cssClass: 'alert alert-danger', timeout: 4000 });
        } else {
          // Reset error
          //$scope.$parent.flash = "";

          // Import files
          this.collectionService.importFiles(this.collectionName, this.userFiles)
            .then((data)=> {
              this.dialogRef.close();
            },(error)=>{
              this.flashMessage.show("Error occured while importing. Please, try again", { cssClass: 'alert alert-danger', timeout: 4000 });
            });
        };
      }
      else {
        this.flashMessage.show("Please add at least one document", { cssClass: 'alert alert-danger', timeout: 4000 });
      }
    } else {
      this.flashMessage.show("Please add at least one document", { cssClass: 'alert alert-danger', timeout: 4000 });
    }
  }

  cancel() {
    //TODO : Close dialog
    this.dialogRef.close();
  };

}
