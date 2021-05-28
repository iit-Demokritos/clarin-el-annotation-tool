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
  selector: 'add-documents-dialog',
  templateUrl: './add-documents-dialog.component.html',
  styleUrls: ['./add-documents-dialog.component.scss']
})
export class AddDocumentsDialogComponent implements OnInit {

  collectionData: any;

  constructor(public injector:Injector, @Inject(MAT_DIALOG_DATA) public data: any, public dialogRef:MatDialogRef<any>, public collectionService:CollectionService, public flashMessage:FlashMessagesService,public sharedCollectionService:SharedCollectionService, public documentService:DocumentService, public dialog:MatDialog) {
  }

  ngOnInit(): void {
    this.collectionData = this.data;
  }

  //$scope.$broadcast("initializeUploader", {encoding : $scope.collectionData.encoding});
  /*$scope.$on('flowEvent', function(event, data) {
    $scope.userFiles = data.userFiles;
    if (data.msg !== "")
      $scope.$parent.flash = data.msg;
    else if ($scope.$parent.flash !== "")
      $scope.$parent.flash = "";
  });*/

  //add() {
  /*if (angular.isUndefined($scope.userFiles) || $scope.userFiles.length === 0) {
    $scope.$parent.flash = "Please add at least one document";
    return false;
  } else {
    if (!angular.isUndefined($scope.$parent.flash) || !($scope.$parent.flash === ""))
      $scope.$parent.flash = "";

    Document.save($scope.collectionData.collectionId, $scope.userFiles)
      .then(function (data) {
        $modalInstance.close();
        $scope.$destroy();
      });
  }*/
  //};

  public userFiles: any = [];

  handleFileInput(obj: any) {
    this.userFiles = obj["files"];

    if(obj["message"].length > 0){
      this.dialog.open(ErrorDialogComponent,{data: new ConfirmDialogData("Error",obj["message"])});
    }

  }

  add() {
    if (typeof this.userFiles != "undefined") {
      if (this.userFiles.length > 0) {
        this.documentService.save(this.collectionData.collectionId, this.userFiles)
          .then((data) => {
            this.dialogRef.close();
          });
      }
      else {
        this.flashMessage.show("Please add at least one document", { cssClass: 'alert alert-danger', timeout: 2000 });
      }
    } else {
      this.flashMessage.show("Please add at least one document", { cssClass: 'alert alert-danger', timeout: 2000 });
    }
  }

  cancel() {
    /*$modalInstance.dismiss("cancel");
    $scope.$destroy();*/
    this.dialogRef.close();
  };

}
