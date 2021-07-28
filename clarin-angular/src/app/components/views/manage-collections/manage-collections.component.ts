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

  dialogWidth: "550px";
  dialogHeight: "600px";

  initializeCollections() {                //initialize the collections tree
    this.collectionService.getAll().then((response) => {
      if (!response["success"]) {
        this.dialog.open(ErrorDialogComponent, { data: new ConfirmDialogData("Error", "Error during the restoring of your collections. Please refresh the page and try again.") });
      } else {
        this.dataForTheTree = response["data"]; //angular.copy(response.data); TODO: 
      }
    });
  }


  initializeCollectionData() {            //refresh collection's data
    if (this.selectedCollection === undefined) {
      this.collectionDocuments = [];
      this.btnShow = false;
      return;
    }
    this.documentService.getAll(this.selectedCollection.id)
      .then((response) => {
        if (!response["success"]) {
          this.dialog.open(ErrorDialogComponent, { data: new ConfirmDialogData("Error", "Error during the restoring of your collection\'s documents. Please refresh the page and try again.") });
        } else {
          this.collectionDocuments = response["data"];
          this.selectedDocuments = [];
          this.showStaticHeader = false;
          this.btnShow = true;
        }
      });
  }

  //function to be called when a user selects a collection from the sidebar tree
  showSelectedCollection(collection, index) {
    this.selectedCollectionIndex = index;
    this.selectedCollection = collection;
    this.initializeCollectionData();
  };

  // function to be called when a user presses the delete collection button
  deleteCollection(id) {
    if (typeof id != "undefined") {
      var modalOptions = new ConfirmDialogData();

      modalOptions.headerType = "warning";
      modalOptions.dialogTitle = 'Warning';
      modalOptions.message = this.translate.instant('Collections.This action is going to delete the entire Collection. Do you want to proceed?', {name: this.selectedCollection.name});
      modalOptions.buttons = ['No', 'Yes'];

      var dialogRef = this.dialog.open(ConfirmDialogComponent, { data: modalOptions, width: this.dialogWidth });

      dialogRef.afterClosed().subscribe(modalResult => {
        if (modalResult === "Yes") {
          this.collectionService.destroy(id)
            .then((data) => {
              this.selectedCollection = undefined;
              this.collectionDocuments = [];
              this.initializeCollections();
              this.showStaticHeader = true;
              this.selectedCollectionIndex = null;
            }, (error) => {
              this.dialog.open(ConfirmDialogComponent, {
                data: new ConfirmDialogData("Error",
                this.translate.instant("Collections.Error in delete Collection. Please refresh the page and try again.")), width: this.dialogWidth });
            });
        }
      });
    }
  }; /* deleteCollection */

  //function to be called when a user wants to add documents to a collection
  addDocuments() {
    var data = {
      collectionId: this.selectedCollection.id,
      collectionName: this.selectedCollection.name,
      collectionEncoding: this.selectedCollection.encoding,
      collectionHandler: this.selectedCollection.handler
    };
    var modalOptions = new ConfirmDialogData("Add Documents to Collection");
    modalOptions.data = data;

    var dialogRef = this.dialog.open(AddDocumentsDialogComponent, {
       data: modalOptions, width: this.dialogWidth });
    dialogRef.afterClosed().subscribe(modalResult => {
      this.initializeCollections();
      this.initializeCollectionData();
    });
  };

  /**
   * Import documents to the collection
   */
  importDocuments() {
    var dialogRef = this.dialog.open(ImportModalComponent,
    { width: this.dialogWidth });
    dialogRef.afterClosed().subscribe(modalResult => {
      this.initializeCollections();
      this.initializeCollectionData();
    });
  }; /* importDocuments */

  // function to be called when a user wants to rename a collection
  renameCollection() {
    var data = {
      collectionId: this.selectedCollection.id,
      collectionName: this.selectedCollection.name
    };
    var dialogData = new RenameDialogData(data);
    var dialogRef = this.dialog.open(RenameCollectionModalComponent, {
      data: dialogData, width: this.dialogWidth
    });
    dialogRef.afterClosed().subscribe(modalResult => {
      this.initializeCollections();
      this.initializeCollectionData();
    });
  }; /* renameCollection */

  // function to be called when a user wants to share a collection
  shareCollection() {
    var data = {
      collectionId: this.selectedCollection.id,
      collectionName: this.selectedCollection.name
    };
    var dialogRef = this.dialog.open(ShareCollectionModalComponent, {
      data: data, width: this.dialogWidth
    });
    dialogRef.afterClosed().subscribe(modalResult => {
      this.initializeCollections();
      this.initializeCollectionData();
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

    var dialogRef = this.dialog.open(ConfirmDialogComponent, { data: modalOptions, width: '550px' });

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
