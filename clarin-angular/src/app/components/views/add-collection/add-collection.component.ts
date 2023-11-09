import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { ConfirmDialogData } from 'src/app/models/dialogs/confirm-dialog';
import { ErrorDialogData } from 'src/app/models/dialogs/error-dialog';
import { ConfirmDialogComponent } from '../../dialogs/confirm-dialog/confirm-dialog.component';
import { ErrorDialogComponent } from '../../dialogs/error-dialog/error-dialog.component';
import { MainComponent } from '../main/main.component';
import { CollectionNamePattern } from '@models/collection';

@Component({
  selector: 'add-collection',
  templateUrl: './add-collection.component.html',
  styleUrls: ['./add-collection.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AddCollectionComponent extends MainComponent implements OnInit {

  @Input() creatingNewCollection: boolean = true;
  @Input() editingCollectionData: any = {};
  @Input() showPageHeader: boolean = true;
  @Input() showMyCollections: boolean = true;
  @Input() showHeader: boolean = true;
  @Input() showNameField: boolean = true;
  @Input() showSubmitButton: boolean = true;
  @Output() filesChange = new EventEmitter<any[]>();

  public breakpoint: number; // Breakpoint observer code
  public editCollectionForm: UntypedFormGroup;
  // sidebarSelector = "myCollections";
  allowedTypes = ["text/plain", "text/xml",
                  "image/jpeg", "image/png", "image/gif", "image/tiff", "image/webp", "image/svg+xml", "image/bmp",
                  "audio/mpeg", "audio/ogg", "audio/x-wav", "audio/mp4",
                  "video/mp4", "video/webm", "video/ogg",
                  "image/*", "audio/*", "video/*"];
  typeOptions = ["Text", "TEI XML",
                 "JPEG", "PNG", "GIF", "TIFF", "WEBP", "SVG", "BMP",
                 "AUDIO MP3", "AUDIO OGG", "AUDIO WAV", "AUDIO MP4",
                 "VIDEO MP4", "VIDEO WEBM", "VIDEO OGG",
                 "IMAGE", "AUDIO", "VIDEO"];
  encodingOptions = ["UTF-8", "Unicode"];
  handlerOptions = [
    { name: 'No Handler', value: 'none' },
    { name: 'TEI XML Import', value: 'tei' },
  ];
  dataForTheTreeAll: any = [];
  dataForTheTree: any = [];
  collectionData: any = {};
  collectionDataUpdated: boolean;
  filterFiles = true;
  flowAttributes = { accept: this.allowedTypes };
  selectedCollection: any = null;
  selectedCollectionIndex = null;
  collectionNamePattern = CollectionNamePattern;

  super() { };

  ngOnInit(): void {
    this.initializeForm();
    this.initializeCollections();
    this.editCollectionForm = this.formBuilder.group({
      collectionName: [this.collectionData.name],
      collectionEncoding: [this.collectionData.encoding],
      collectionHandler: [this.collectionData.handler],
    });
    // Breakpoint observer code
    this.breakpoint = window.innerWidth <= 600 ? 1 : 2;
  }

  initializeForm() {
    this.userFiles = [];
    this.collectionData = {};
    this.collectionData.name = "";
    this.collectionData.encoding = this.encodingOptions[0];
    this.collectionData.handler = this.handlerOptions[0];
    this.collectionData.type = "text";
    this.collectionData.visualisation_options = "";
    this.encodingChange();
    this.sendFiles();
  };

  initializeCollections() {
    if (!this.showMyCollections) return;

    this.collectionService.getAll()
      .then((response) => {
        if (!response["success"]) {
          var dialogRef = this.dialog.open(ErrorDialogComponent, { data: new ErrorDialogData(this.translate,
            "ErrorDuringRetrievingCollections") });
        } else {
          this.dataForTheTreeAll = this.dataForTheTree = response["data"];
        }
      });
  };

  onApplyCollectionFilter(event) {
    let filterText = event.target.value;
    let regexObj = new RegExp(filterText, 'i');
    if (filterText) {
      this.dataForTheTree = this.dataForTheTreeAll.filter(col => regexObj.test(col.name));
    } else {
      this.dataForTheTree = this.dataForTheTreeAll;
    }
  }; /* onApplyCollectionFilter */

  validateCollection() {
    return new Promise((resolve, reject) => {
      if (this.collectionData.name.length < 4) {
        this.dialog.open(ErrorDialogComponent, {
          data: new ConfirmDialogData("Error", 'Collections.NameMustBeAtLeast4CharactersLong.')
        });
        reject('Collections.NameMustBeAtLeast4CharactersLong.');
      } else if (this.userFiles.length === 0) {

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
            if (response["success"] && response["exists"]) { // collection already exists

              var modalOptions = new ConfirmDialogData();

              modalOptions.headerType = "warning";
              modalOptions.dialogTitle = 'Warning';
              modalOptions.message = 'The collection "' + this.collectionData.name + '" already exists. What do you want to do?';
              modalOptions.buttons = ['Rename', 'Overwrite'];

              var dialogRef = this.dialog.open(ConfirmDialogComponent, { data: modalOptions, width: '550px', disableClose: true });

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
    this.collectionDataUpdated = !this.collectionDataUpdated;
  }
  handlerChange() {
    this.collectionDataUpdated = !this.collectionDataUpdated;
  }
  handleFileInputs(event) {
    event.files.forEach(file => { this.userFiles.push(file); });
    if (event.message != "") {
      this.dialog.open(ErrorDialogComponent, {
        data: new ConfirmDialogData("Error", event.message)
      });
    }
    this.sendFiles();
  };

  public onResize(event: any): void {
    this.breakpoint = event.target.innerWidth <= 600 ? 1 : 2;
  }

  sendFiles() {
    this.filesChange.emit(this.userFiles);
  }

  // Function to be called when a user selects a collection
  // from the sidebar tree
  showSelectedCollection(collection, index) {
    this.selectedCollectionIndex = index;
    this.selectedCollection = collection;
    this.collectionData.name = collection.name;
  }; /* showSelectedCollection */

  /*$scope.$on('flowEvent', function(event, data) {
    $scope.userFiles = data.userFiles;
    if (data.msg !== "") {
      var modalOptions = { body: data.msg };
      Dialog.error(modalOptions);
    }
  }); TODO: Update uploader */


}
