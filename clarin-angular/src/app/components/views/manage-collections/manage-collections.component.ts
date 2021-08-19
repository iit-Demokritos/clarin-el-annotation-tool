import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ConfirmDialogData } from 'src/app/models/dialogs/confirm-dialog';
import { RenameDialogData } from 'src/app/models/dialogs/rename-dialog-data';
import { AddDocumentsDialogComponent } from '../../dialogs/add-documents-dialog/add-documents-dialog.component';
import { ConfirmDialogComponent } from '../../dialogs/confirm-dialog/confirm-dialog.component';
import { ErrorDialogComponent } from '../../dialogs/error-dialog/error-dialog.component';
import { ImportModalComponent } from '../../dialogs/import-modal/import-modal.component';
import { RenameCollectionModalComponent } from '../../dialogs/rename-collection-modal/rename-collection-modal.component';
import { ShareCollectionModalComponent } from '../../dialogs/share-collection-modal/share-collection-modal.component';
import { MainComponent } from '../main/main.component';

export interface DocumentInformation {
  id: number;
  name: string;
  collection_id: number;
  encoding: string;
  owner_email: string;
  updated_at: string;
  updated_by: string;
  position: number;
}

@Component({
  selector: 'manage-collections',
  templateUrl: './manage-collections.component.html',
  styleUrls: ['./manage-collections.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ManageCollectionsComponent extends MainComponent implements OnInit {

  @ViewChild(MatTable, { static: true })
  documentsTable: MatTable<any>;

  super() { }

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

  /* Selection model for selecting collection documents (for deletion) */
  documentsDisplayedColumns: string[] = ['select', 'id', 'name',
    'owner', 'updated_at', 'updated_by'];
  documentsSelection;
  documentsDataSource =
    new MatTableDataSource<DocumentInformation>(this.collectionDocuments);

  ngOnInit(): void {
    const initialSelection = [];
    const allowMultiSelect = true;
    this.documentsSelection =
      new SelectionModel<DocumentInformation>(allowMultiSelect,
        initialSelection);
    this.initializeCollections();
    this.documentsSelection.changed.subscribe(this.documentClick.bind(this));
  }; /* ngOnInit */

  //initialize the collections tree
  initializeCollections() {
    this.collectionService.getAll().then((response) => {
      if (!response["success"]) {
        this.dialog.open(ErrorDialogComponent, {
          data: new ConfirmDialogData(
            this.translate.instant("Error"),
            this.translate.instant("Collections.Error during the restoring of your collections. Please refresh the page and try again."))
        });
      } else {
        this.dataForTheTree = response["data"]; //angular.copy(response.data); TODO:
      }
    });
  }


  //refresh collection's data
  initializeCollectionData() {
    if (this.selectedCollection === undefined) {
      this.setCollectionDocuments([]);
      this.btnShow = false;
      return;
    }
    this.documentService.getAll(this.selectedCollection.id)
      .then((response) => {
        if (!response["success"]) {
          this.dialog.open(ErrorDialogComponent, {
            data: new ConfirmDialogData("Error",
              "Error during the restoring of your collection\'s documents. Please refresh the page and try again.")
          });
        } else {
          this.setCollectionDocuments(response["data"]);
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
      modalOptions.dialogTitle = this.translate.instant('Warning');
      modalOptions.message = this.translate.instant('Collections.This action is going to delete the entire Collection. Do you want to proceed?', { name: this.selectedCollection.name });
      modalOptions.buttons = ['No', 'Yes'];

      var dialogRef = this.dialog.open(ConfirmDialogComponent, { data: modalOptions, width: this.dialogWidth });

      dialogRef.afterClosed().subscribe(modalResult => {
        if (modalResult === "Yes") {
          this.collectionService.destroy(id)
            .then((data) => {
              this.selectedCollection = undefined;
              this.setCollectionDocuments([]);
              this.initializeCollections();
              this.showStaticHeader = true;
              this.selectedCollectionIndex = null;
            }, (error) => {
              this.dialog.open(ConfirmDialogComponent, {
                data: new ConfirmDialogData(this.translate.instant("Error"),
                  this.translate.instant("Collections.Error in delete Collection. Please refresh the page and try again.")), width: this.dialogWidth
              });
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
      data: modalOptions, width: this.dialogWidth
    });
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
    modalOptions.message = 'This action is going to delete the selected document(s) from your collection:<ol><li>' +
      this.selectedDocuments.map((elem) => { return elem.name; }).join("</li><li>") +
      '</li></ol>Do you want to proceed?';
    modalOptions.buttons = ['No', 'Yes'];

    var dialogRef = this.dialog.open(ConfirmDialogComponent, { data: modalOptions, width: this.dialogWidth });

    dialogRef.afterClosed().subscribe(modalResult => {
      if (modalResult === "Yes") {
        var promises = [];
        this.selectedDocuments.forEach(element => {
          // console.error("Deleting:", this.selectedCollection.id, element.id);
          promises.push(this.documentService.destroy(this.selectedCollection.id, element.id));
        });

        Promise.all(promises)
          .then((data) => {
            this.initializeCollections();
            this.initializeCollectionData();
            this.selectedCollectionIndex = this.selectedCollectionIndexTmp;
            this.documentsSelectionClear();
          });
      }
    });
  };

  //function to be called when a user clicks on table documents
  documentClick(s) {
    // console.error("click():", s, this.documentsSelection.selected);
    this.selectedCollectionIndexTmp = this.selectedCollectionIndex;
    this.selectedDocuments = this.documentsSelection.selected;
    if (this.documentsSelection.selected.length > 0)
      this.btnShow = false;
    else
      this.btnShow = true;
  }; /* documentClick */

  setCollectionDocuments(docs) {
    this.collectionDocuments = docs;
    // Add position
    this.collectionDocuments.forEach(function (element, index) {
      element.position = index;
    });
    this.documentsDataSource = new MatTableDataSource<DocumentInformation>(this.collectionDocuments);
    this.documentsSelectionClear();
    if (this.documentsTable !== undefined) {
      this.documentsTable.renderRows();
    }
  }; /* setCollectionDocuments */

  documentsSelectionClear() {
    this.documentsSelection.clear();
    this.selectedDocuments = [];
  }; /* documentsSelectionClear */

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.documentsSelection.selected.length;
    const numRows = this.documentsDataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear documentsSelection. */
  masterToggle() {
    if (this.isAllSelected()) {
      this.documentsSelectionClear();
      return;
    }

    this.documentsSelection.select(...this.documentsDataSource.data);
    this.selectedDocuments = this.documentsSelection.selected;
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: DocumentInformation): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.documentsSelection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

}
