import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ConfirmDialogData } from 'src/app/models/dialogs/confirm-dialog';
import { RenameDialogData } from 'src/app/models/dialogs/rename-dialog-data';
import { SharedCollectionService } from 'src/app/services/shared-collection/shared-collection.service';
import { AddDocumentsDialogComponent } from '../../dialogs/add-documents-dialog/add-documents-dialog.component';
import { ConfirmDialogComponent } from '../../dialogs/confirm-dialog/confirm-dialog.component';
import { ErrorDialogComponent } from '../../dialogs/error-dialog/error-dialog.component';
import { ImportModalComponent } from '../../dialogs/import-modal/import-modal.component';
import { RenameCollectionModalComponent } from '../../dialogs/rename-collection-modal/rename-collection-modal.component';
import { ShareCollectionModalComponent } from '../../dialogs/share-collection-modal/share-collection-modal.component';
import { MainComponent } from '../main/main.component';

@Component({
  selector: 'manage-collections',
  templateUrl: './manage-collections.component.html',
  styleUrls: ['./manage-collections.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ManageCollectionsComponent extends MainComponent implements OnInit {

  super() { }

  ngOnInit(): void {
    this.initializeCollections();
  }


  btnShow = true;
  showStaticHeader = true;
  sidebarSelector = "myCollections";
  selectedCollectionIndexTmp = -1;
  selectedCollectionIndex = null;
  selectedDocuments = [];
  dataForTheTree: any = [];
  selectedCollection: any;

  collectionDocuments: any = [];

  initializeCollections() {                //initialize the collections tree
    this.collectionService.getAll().then((response) => {
      if (!response["success"]) {
        this.dialog.open(ErrorDialogComponent, {data:new ConfirmDialogData("Error", "Error during the restoring of your collections. Please refresh the page and try again.")});
      } else {
        /*$scope.collections = response.data;
$scope.dataForTheTree = $scope.collections;*/
        this.dataForTheTree = response["data"];   //angular.copy(response.data); TOOD: 
      }
    });
  }


  initializeCollectionData() {            //refresh collection's data
    this.documentService.getAll(this.selectedCollection.id)
      .then((response) => {
        if (!response["success"]) {
          this.dialog.open(ErrorDialogComponent, {data:new ConfirmDialogData("Error", "Error during the restoring of your collection\'s documents. Please refresh the page and try again.")});
        } else {
          this.collectionDocuments = response["data"];
          this.selectedDocuments = [];
          this.showStaticHeader = false;
          this.btnShow = true;
        }
      });
  }

  showSelectedCollection(collection, index) {       //function to be called when a user selects a collection from the sidebar tree
    this.selectedCollectionIndex = index;
    this.selectedCollection = collection;
    this.initializeCollectionData();
  };

  deleteCollection(id) {                            //function to be called when a user presses the delete collection button
    if (typeof id != "undefined") {
      var modalOptions = new ConfirmDialogData();

      modalOptions.headerType = "warning";
      modalOptions.dialogTitle = 'Warning';
      modalOptions.message = 'This action is going to delete the entire collection. Do you want to proceed?';
      modalOptions.buttons = ['Yes', 'No'];

      var dialogRef = this.dialog.open(ConfirmDialogComponent, {data:modalOptions,width: '550px'});

      dialogRef.afterClosed().subscribe(modalResult => {

        if (modalResult === "Yes") {
          this.collectionService.destroy(id)
            .then((data) => {
              this.initializeCollections();
              delete this.selectedCollection;
              delete this.collectionDocuments;
              this.showStaticHeader = true;
              this.selectedCollectionIndex = null;
            }, (error) => {
              this.dialog.open(ConfirmDialogComponent, {data:new ConfirmDialogData("Error", "Error in delete Collection. Please refresh the page and try again."),width: '550px'});
            });
        }
      });
    }
  }

  addDocuments() {                //function to be called when a user wants to add documents to a collection
    var data = {
      collectionId: this.selectedCollection.id,
      collectionName: this.selectedCollection.name,
      collectionEncoding: this.selectedCollection.encoding
    };

    /*$ocLazyLoad.load('addDocumentsModalCtrl').then(function () {
      var modalInstance = Dialog.custom('add-documents-modal.html', 'addDocumentsModalCtrl', data);
      modalInstance.result.then(function () {
        this.initializeCollections();
        this.initializeCollectionData();
      });
    });*/

    var dialogRef = this.dialog.open(AddDocumentsDialogComponent, {data:new ConfirmDialogData("Add collection", "Add new collections"),width: '550px'});

    dialogRef.afterClosed().subscribe(modalResult => {

      this.initializeCollections();
      this.initializeCollectionData();

    });

  };

  /**
   * Import documents to the collection
   */
  importDocuments() {
    /*$ocLazyLoad.load('importModalCtrl').then(function () {
      var modalInstance = Dialog.custom('import-modal.html', 'importModalCtrl', {});
      modalInstance.result.then(function () {
        this.initializeCollections();
      });
    });*/

    var dialogRef = this.dialog.open(ImportModalComponent,{width: '550px'});

    dialogRef.afterClosed().subscribe(modalResult => {

      this.initializeCollections();

    });

  };


  renameCollection() {            //function to be called when a user wants to rename a collection
    var data = {
      collectionId: this.selectedCollection.id,
      collectionName: this.selectedCollection.name
    };

    var dialogData = new RenameDialogData(data);

    /*$ocLazyLoad.load('renameCollectionModalCtrl').then(function () {
      var modalInstance = Dialog.custom('rename-collection-modal.html', 'renameCollectionModalCtrl', data);
      modalInstance.result.then((newName) => {
        this.selectedCollection.name = newName;
        this.initializeCollections();
      });
    });*/

    var dialogRef = this.dialog.open(RenameCollectionModalComponent, {
      data:dialogData, width: '600px', height:'400px'
    });

    dialogRef.afterClosed().subscribe(modalResult => {
      this.initializeCollections();
    });

  }

  // function to be called when a user wants to share a collection
  shareCollection() {
    var data = {
      collectionId: this.selectedCollection.id,
      collectionName: this.selectedCollection.name
    };
    var dialogRef = this.dialog.open(ShareCollectionModalComponent, {
      data: data
    });
    dialogRef.afterClosed().subscribe(modalResult => {
      this.initializeCollections();
    });
  }; /* shareCollection */

  //function to be called when a user wants to delete selected documents
  deleteDocuments() {
    if (this.selectedDocuments.length == 0) {
      //no document has been selected
      return false;
    }

    var modalOptions = new ConfirmDialogData();

    modalOptions.headerType = "warning";
    modalOptions.dialogTitle = 'Warning';
    modalOptions.message = 'This action is going to delete the selected document(s) from your collection. Do you want to proceed?';
    modalOptions.buttons = ['Yes', 'No'];

    var dialogRef = this.dialog.open(ConfirmDialogComponent, {data:modalOptions,width: '550px'});

    dialogRef.afterClosed().subscribe(modalResult => {

      if (modalResult === "Yes") {
        var promises = [];
        this.selectedDocuments.forEach(element => {
          promises.push(this.documentService.destroy(this.selectedCollection.id, element.id));
        });

        Promise.all(promises)
          .then((data) => {
            this.initializeCollections();
            this.initializeCollectionData();
            this.selectedCollectionIndex = this.selectedCollectionIndexTmp;
          });
      }
    });
  };

  documentClick() {            //function to be called when a user clicks on table documents 
    this.selectedCollectionIndexTmp = this.selectedCollectionIndex;
    this.selectedDocuments = this.collectionDocuments.filter(x => x.isSelected == true);
    if (this.selectedDocuments.length > 0)
      this.btnShow = false;
    else
      this.btnShow = true;
  }

}
