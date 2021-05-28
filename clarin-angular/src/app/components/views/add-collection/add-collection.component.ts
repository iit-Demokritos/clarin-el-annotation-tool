import { Component, OnInit } from '@angular/core';
import { ConfirmDialogData } from 'src/app/models/dialogs/confirm-dialog';
import { ConfirmDialogComponent } from '../../dialogs/confirm-dialog/confirm-dialog.component';
import { ErrorDialogComponent } from '../../dialogs/error-dialog/error-dialog.component';
import { MainComponent } from '../main/main.component';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'add-collection',
  templateUrl: './add-collection.component.html',
  styleUrls: ['./add-collection.component.scss']
})
export class AddCollectionComponent extends MainComponent implements OnInit {

  super() { }

  ngOnInit(): void {
    this.initializeForm();
    this.initializeCollections();
  }

  sidebarSelector = "myCollections";
  encodingOptions = ["UTF-8", "Unicode"];
  handlerOptions = [
    { name: 'No Handler', value: 'noHandler' },
    { name: 'Handler 1', value: 'handler1' },
    { name: 'Handler 2', value: 'handler2' }
  ];
  dataForTheTree: any;
  collectionData: any = {};
  handlerOption: any = {};


  initializeCollections() {
    this.collectionService.getAll()
      .then((response) => {
        if (!response["success"]) {
          /*var modalOptions = { body: 'Error during the restoring of your collections. Please refresh the page and try again.' };
          Dialog.error(modalOptions);*/
          //this.flashMessage.show("Error during the restoring of your collections. Please refresh the page and try again.", { cssClass: 'alert alert-danger', timeout: 2000 });
          var dialogRef = this.dialog.open(ErrorDialogComponent, { data: new ConfirmDialogData("Error", "Error during the restoring of your collections. Please refresh the page and try again.", "error") });
        } else {
          /*$scope.collections = response.data;
        $scope.dataForTheTree = $scope.collections;*/
          this.dataForTheTree = response["data"]; //angular.copy(response.data); TODO: Copy data
        }
      });
  };

  initializeForm() {
    this.userFiles = [];
    this.collectionData = {};
    this.collectionData.name = "";
    this.collectionData.encoding = this.encodingOptions[0];
    this.handlerOption = this.handlerOptions[0];
    this.encodingChange();
  };

  validateCollection() {
    return new Promise((resolve, reject) => {
      if (this.userFiles.length === 0) {

        var modalOptions = new ConfirmDialogData();

        modalOptions.headerType = "warning";
        modalOptions.dialogTitle = 'Warning';
        modalOptions.message = 'The collection does not contain any documents. Do you want to proceed?';
        modalOptions.buttons = ['No', 'Yes'];

        var dialogRef = this.dialog.open(ConfirmDialogComponent, { data: modalOptions, width: '550px' });

        dialogRef.afterClosed().subscribe(modalResult => {
          resolve(modalResult);
        });

        /*Dialog.confirm(modalOptions).result.then(function (result) {
          resolve(result);
        }, function () {
          reject();
        });*/

      } else
        resolve("Yes");
    });
  }

  submitCollection() {
    this.validateCollection().then((modalResult) => {
      if (modalResult === "Yes") {
        this.collectionData.overwrite = false;

        this.collectionService.save(this.collectionData)
          .then((response) => {
            if (response["success"] && response["exists"]) {              // collection already exists

              var modalOptions = new ConfirmDialogData();

              modalOptions.headerType = "warning";
              modalOptions.dialogTitle = 'Warning';
              modalOptions.message = 'The collection "' + this.collectionData.name + '" already exists. What do you want to do?';
              modalOptions.buttons = ['Rename', 'Overwrite'];

              var dialogRef = this.dialog.open(ConfirmDialogComponent, { data: modalOptions, width: '550px' });

              dialogRef.afterClosed().subscribe(modalResult => {
                //var modalInstance = Dialog.confirm(modalOptions);
                //modalInstance.result.then((modalResult) => {
                if (modalResult === "Rename") {
                  //angular.element(document.querySelector('#collectionName')).focus();
                  //angular.element(document.querySelector('#collectionName')).select();
                  return false;
                } else if (modalResult === "Overwrite") {
                  this.collectionData.overwrite = true;
                  this.collectionData.id = response["collection_id"];
                  this.collectionService.save(this.collectionData).then((val) => { });

                  this.collectionService.save(this.collectionData)
                    .then((newCollectionResponse: any) => {           // execute after saving collection
                      if (newCollectionResponse["success"]) {
                        this.collectionData.overwrite = false;
                        return this.documentService.save(newCollectionResponse.collection_id, this.userFiles)
                      } else {
                        //var modalOptions = { body: 'Error during collection save. Please refresh the page and try again.' };
                        //Dialog.error(modalOptions);
                        this.dialog.open(ErrorDialogComponent, { data: new ConfirmDialogData("Error", "Error during collection save. Please refresh the page and try again.") });
                        //return false;
                      }
                    }).then(() => {              // all collection documents saved
                      this.initializeForm();
                      this.initializeCollections()
                      //$scope.$broadcast("initializeUploaderFiles"); TODO: Update
                    }, (error) => {
                      /*var modalOptions = { body: 'Error during collection save. Please refresh the page and try again.' };
                      Dialog.error(modalOptions);*/
                      this.dialog.open(ErrorDialogComponent, { data: new ConfirmDialogData("Error", "Error during collection save. Please refresh the page and try again.") });
                    });
                } else {
                  return false;
                }
              });
            } else if (response["success"] && !response["exists"]) {        // new collection
              this.documentService.save(response["collection_id"], this.userFiles)
                .then(() => {                    // all collection documents saved
                  this.initializeForm();
                  this.initializeCollections();
                  //$scope.$broadcast("initializeUploaderFiles"); TODO:Update
                });
            } else if (!response["success"]) {
              this.dialog.open(ErrorDialogComponent, { data: new ConfirmDialogData("Error", "Error in saving Collection. Please refresh the page and try again.") });
            }
          }, (error) => {
            this.dialog.open(ErrorDialogComponent, { data: new ConfirmDialogData("Error", "Error in saving Collection. Please refresh the page and try again.") });
          });
      }
    });
  };

  encodingChange() {
    //$scope.$broadcast("initializeUploaderEncoding", { encoding: $scope.collectionData.encoding }); TODO: Update
  }

  /*$scope.$on('flowEvent', function(event, data) {
    $scope.userFiles = data.userFiles;
    if (data.msg !== "") {
      var modalOptions = { body: data.msg };
      Dialog.error(modalOptions);
    }
  }); TODO: Update uploader */


}
