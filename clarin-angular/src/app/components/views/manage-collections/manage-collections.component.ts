import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ConfirmDialogData } from 'src/app/models/dialogs/confirm-dialog';
import { RenameDialogData } from 'src/app/models/dialogs/rename-dialog-data';
import { AddDocumentsDialogComponent } from '../../dialogs/add-documents-dialog/add-documents-dialog.component';
import { ConfirmDialogComponent } from '../../dialogs/confirm-dialog/confirm-dialog.component';
import { ErrorDialogComponent } from '../../dialogs/error-dialog/error-dialog.component';
import { ImportModalComponent } from '../../dialogs/import-modal/import-modal.component';
import { ImportDocumentsFromExportModalComponent } from '../../dialogs/import-documents-from-export-modal/import-documents-from-export-modal.component';
import { RenameCollectionModalComponent } from '../../dialogs/rename-collection-modal/rename-collection-modal.component';
import { ShareCollectionModalComponent } from '../../dialogs/share-collection-modal/share-collection-modal.component';
import { MainComponent } from '../main/main.component';
import {CdkDragDrop, CdkDrag} from '@angular/cdk/drag-drop';
import { RenameDocumentModalComponent } from '@components/dialogs/rename-document-modal/rename-document-modal.component';

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

  disableCollectionDragging = true;
  disableCollectionDraggingAutoscroll = false;
  disableDocumentDragging   = false;
  dropTargetCollection = -1;
  dropTargetCollectionAllow = true;

  /* Selection model for selecting collection documents (for deletion) */
  documentsDisplayedColumns: string[] = ['select', 'id', 'name'/*,
    'owner', 'updated_at', 'updated_by'*/];
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
        // this.dataForTheTree.forEach((row, index) => {row.row_number = index;});
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
    this.documentsDataSource.data = [];
    this.documentsSelectionClear();
    if (this.documentsTable !== undefined) {
      this.documentsTable.renderRows();
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

  //function to be called when a user wants to rename a document
  renameDocument(){
    console.log(this.selectedDocuments)
    if (this.selectedDocuments.length===1){
      var data={
        collectionId: this.selectedCollection.id,
        documentId:this.selectedDocuments[0].id,
        documentName:this.selectedDocuments[0].name,
        documentType:this.selectedDocuments[0].type
      }
      var dialogData = new RenameDialogData(data);
      var dialogRef = this.dialog.open(RenameDocumentModalComponent, {
        data: dialogData, width: this.dialogWidth
      });
      dialogRef.afterClosed().subscribe(modalResult => {
        this.initializeCollections();
        this.initializeCollectionData();
      });
    }
  }/*renameDocument*/


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

  // Function to be called when the drag is over a collection with a document to be dropped..
  onCollectionDropOver = (index: number, drag: CdkDrag<number>, drop) => {
    // console.error("ManageCollectionsComponent: onCollectionDropEnter():", index);
    if (this.dropTargetCollection == undefined ||
        this.dataForTheTree == undefined ||
        index >= this.dataForTheTree.length) {
      // We have the wrong this...
      return false;
    }
    this.dropTargetCollection = index;
    let col = this.dataForTheTree[index]
    // Ensure the collection of the dragged document is not the indexed one...
    if (drag.data['collection_id'] == col.id ||
       !col.is_owner) {
      this.dropTargetCollectionAllow = false;
    } else {
      this.dropTargetCollectionAllow = true;
    }
    this.changeDetectorRef.detectChanges();
    return true;
  }; /* onCollectionDropEnter */

  onCollectionDropExit(event=undefined) {
    this.dropTargetCollection = -1;
    this.changeDetectorRef.detectChanges();
  }

  onCollectionDropEnd(event=undefined) {
    this.dropTargetCollection = -1;
    this.changeDetectorRef.detectChanges();
  }

  // Function to be called when the user drops a file on a collection...
  onCollectionDrop(event: CdkDragDrop<unknown>) {
    let doc = event.item.data
    let col = this.dataForTheTree[event.currentIndex]
    // If the drag and the drop containers are the same, ignore the drop
    if (!event.isPointerOverContainer ||
        event.previousContainer == event.container ||
        doc['collection_id'] == col.id ||
        !col.is_owner) {
      // console.error("ManageCollectionsComponent: onCollectionDrop(): Invalid drop!");
      return;
    }
    // console.error("ManageCollectionsComponent: onCollectionDrop():", doc, col);
  }; /* onCollectionDrop */

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

  importDocumentsFromExport() {
    var dialogRef = this.dialog.open(ImportDocumentsFromExportModalComponent,
      { width: this.dialogWidth,
        data: {collection: this.selectedCollection, documents: this.selectedDocuments}});
    dialogRef.afterClosed().subscribe(modalResult => {
      this.initializeCollections();
      this.initializeCollectionData();
    });
  }; /* importDocumentsFromExport */

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
    var promises = [];

    // Add position
    this.collectionDocuments.forEach((element, index) => {
      delete element.text;
      delete element.data_binary;
      element.position = index;
      delete element.data_text;
      delete element.metadata;
      delete element.visualisation_options;
      element.annotations_len = 0;
      element.annotations_attributes_len = 0;
      element.annotations_settings_len = 0;
      element.annotations_total_len = 0;
      element.annotations_temp_len = 0;
      element.annotations_temp_deleted_len = 0;
      element.annotations_temp_attributes_len = 0;
      element.annotations_temp_settings_len = 0;
      element.annotations_temp_total_len = 0;
      // Collect information about annotations...
      promises.push(this.annotationService.getAll(element.collection_id, element.id)
        .then((response) => {
          element.annotations_updated_at = new Date(Math.max(... response['data'].map(e => new Date(e.updated_at))));
          element.annotations_total_len = response['data'].length;
          element.annotations_settings_len =
            response['data'].filter(ann => this.TextWidgetAPI.isSettingAnnotation(ann)).length;
          element.annotations_attributes_len =
            response['data'].filter(ann => this.TextWidgetAPI.isAttributeAnnotation(ann)).length;
          element.annotations_len = element.annotations_total_len -
            element.annotations_attributes_len - element.annotations_settings_len;
        }));
      // Collect information about temporary annotations...
      promises.push(this.tempAnnotationService.getAll(element.collection_id, element.id)
        .then((response) => {
          element.annotations_temp_updated_at = new Date(Math.max(... response['data'].map(e => new Date(e.updated_at))));
          element.annotations_temp_total_len = response['data'].length;
          element.annotations_temp_settings_len =
            response['data'].filter(ann => this.TextWidgetAPI.isSettingAnnotation(ann) &&
              !this.TextWidgetAPI.isDeletedAnnotation(ann)).length;
          element.annotations_temp_attributes_len =
            response['data'].filter(ann => this.TextWidgetAPI.isAttributeAnnotation(ann) &&
              !this.TextWidgetAPI.isDeletedAnnotation(ann)).length;
          element.annotations_temp_deleted_len =
            response['data'].filter(ann => this.TextWidgetAPI.isDeletedAnnotation(ann)).length;
          element.annotations_temp_len = element.annotations_temp_total_len -
            element.annotations_temp_attributes_len -
            element.annotations_temp_settings_len -
            element.annotations_temp_deleted_len;
        }));
      // Get information about users that have opened the document...
      element.opened_by = [];
      promises.push(this.openDocumentService.get(element.id, null).then((response: any) => {
        if (response.success && response.data.length > 0) {
          response.data.forEach((opendoc) => {
            element.opened_by.push({
              email: opendoc.email,
              first_name: opendoc.first_name,
              last_name: opendoc.last_name,
              owner: opendoc.opened,
              annotator: opendoc.annotator_type,
              db_interactions: opendoc.db_interactions
            });
          });
        }
      }, (error) => {
        this.dialog.open(ErrorDialogComponent, {
          data: new ConfirmDialogData("Error", "Database error. Please refresh the page and try again.")
        });
      }));
    });
    Promise.all(promises)
    .then((data) => {
      // this.documentsDataSource = new MatTableDataSource<DocumentInformation>(this.collectionDocuments);
      this.documentsDataSource.data = this.collectionDocuments;
      this.documentsSelectionClear();
      if (this.documentsTable !== undefined) {
        this.documentsTable.renderRows();
      }
    });
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

  /** Close an open document */
  closeDocument(document, open) {
    var modalOptions = new ConfirmDialogData();
    modalOptions.headerType = "warning";
    modalOptions.dialogTitle = this.translate.instant('Warning');
    modalOptions.message = this.translate.instant('Collections.This action is going to close this Document. Do you want to proceed?', { name: document.name });
    modalOptions.buttons = ['No', 'Yes'];

    var dialogRef = this.dialog.open(ConfirmDialogComponent, { data: modalOptions, width: this.dialogWidth });

    dialogRef.afterClosed().subscribe(modalResult => {
      if (modalResult === "Yes") {
        this.openDocumentService.destroy(document.id, open.annotator)
          .then((data) => {
            this.selectedCollection = undefined;
            this.setCollectionDocuments([]);
            this.initializeCollections();
            this.showStaticHeader = true;
            this.selectedCollectionIndex = null;
          }, (error) => {
            this.dialog.open(ConfirmDialogComponent, {
              data: new ConfirmDialogData(this.translate.instant("Error"),
                this.translate.instant("Collections.Error in closing Document.")), width: this.dialogWidth
            });
          });
      }
    });
  }; /* closeDocument */

  /** Annotate Document... */
  annotateDocument(document) {
    this.messageService.requestToAnnotateDocument = document;
    this.router.navigateByUrl('/app/annotation');
    // console.error("ManageCollectionsComponent: annotateDocument():", document);
  }; /* annotateDocument */

}
