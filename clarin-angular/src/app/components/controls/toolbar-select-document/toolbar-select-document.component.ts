import { Component, EventEmitter, Input, AfterViewInit, Output, ViewEncapsulation } from '@angular/core';
import { ErrorDialogComponent } from 'src/app/components/dialogs/error-dialog/error-dialog.component';
import { MainComponent } from 'src/app/components/views/main/main.component';
import { ErrorDialogData } from 'src/app/models/dialogs/error-dialog';
import { Collection } from 'src/app/models/collection';
import { Document, DocumentGroup } from 'src/app/models/document';

@Component({
  selector: 'toolbar-select-document',
  templateUrl: './toolbar-select-document.component.html',
  styleUrls: ['./toolbar-select-document.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ToolbarSelectDocumentComponent extends MainComponent implements AfterViewInit {

  collections: Collection[];
  selected_collections: Collection | Collection[];
  @Input() allowMultipleCollections: boolean = false;
  @Output() selectedCollections = new EventEmitter<Collection | Collection[]>();

  @Input() allowDocumentSelection: boolean = true;
  documents: any;
  selected_documents: any;
  @Input() allowMultipleDocuments: boolean = false;
  @Output() selectedDocuments = new EventEmitter<any>();

  @Input() showApplyButton: boolean = false;
  @Input() ApplyButtonLabel: string = "Apply";
  @Output() onApply = new EventEmitter<String>();

  @Input() localStoreKey: string = "ToolbarSelectDocumentComponent";

  super() { }

  ngAfterViewInit(): void {
    this.getCollections();
  }

  load() {
    var state = this.localStorageService.get(this.localStoreKey);
    if (this.collections && 'collections' in state) {
      // Select the collections...
      var selected_collections = this.collections.filter((col) => state.collections.includes(col.id));
      if (this.allowMultipleCollections) {
        this.selected_collections = selected_collections;
      } else {
        this.selected_collections = selected_collections[0];
      }
      if (this.selected_collections) {
        var promises = this.onCollectionSelectionChange();
        Promise.all(promises).then(() => {
          if (this.documents && 'documents' in state) {
            var selected_documents = this.documents.filter((col) => state.documents.includes(col.id));

            if (this.allowMultipleDocuments) {
              this.selected_documents = selected_documents;
            } else {
              this.selected_documents = selected_documents[0];
            }
            if (this.selected_documents) {
              this.onDocumentSelectionChange();
            }
          }
        });
      }
    }
  }; /* load */

  save() {
    var cols: number[] = [];
    var docs: number[] = [];
    if (this.selected_collections) {
      if (Array.isArray(this.selected_collections)) {
        this.selected_collections.forEach((col) => cols.push(col.id));
      } else if ("id" in this.selected_collections) {
        cols.push(this.selected_collections.id);
      }
    }
    if (this.selected_documents) {
      if (Array.isArray(this.selected_documents)) {
        this.selected_documents.forEach((doc) => docs.push(doc.id));
      } else if ("id" in this.selected_documents) {
        docs.push(this.selected_documents.id);
      }
    }
    this.localStorageService.set(this.localStoreKey, {
      collections: cols, documents: docs
    });
  }; /* save */

  onCollectionSelectionChange() {
    var promises;
    if (this.allowDocumentSelection) {
      promises = this.getDocuments();
    }
    this.save();
    this.selectedCollections.emit(this.selected_collections);
    return promises;
  }; /* onCollectionSelectionChange */

  onDocumentSelectionChange() {
    this.save();
    this.selectedDocuments.emit(this.selected_documents);
  }; /* onDocumentSelectionChange */

  onDocumentGroupClick(group) {
    // console.error("Click:", group, this.selected_documents);
  }; /* onDocumentGroupClick */

  nextDocument() {
    // console.error("nextDocument:", this.documents, this.selected_documents);
    if (this.documents == undefined || !this.documents.length) {return;}
    if (this.selected_documents == undefined) {
      this.selected_documents = this.documents[0];
      this.onDocumentSelectionChange()
      return;
    }
    var index = this.documents.indexOf(this.selected_documents);
    if (index < this.documents.length - 1) {
      this.selected_documents = this.documents[index + 1];
      this.onDocumentSelectionChange()
    }
  }; /* nextDocument */

  prevDocument() {
    // console.error("prevDocument:", this.documents, this.selected_documents);
    if (this.documents == undefined || !this.documents.length) {return;}
    if (this.selected_documents == undefined) {
      this.selected_documents = this.documents[this.documents.length - 1];
      this.onDocumentSelectionChange()
      return;
    }
    var index = this.documents.indexOf(this.selected_documents);
    if (index > 0) {
      this.selected_documents = this.documents[index - 1];
      this.onDocumentSelectionChange()
    }
  };

  getCollections() {
    this.collectionService.getAll().then((response) => {
      // console.error("ToolbarSelectDocumentComponent: getCollections():", response);
      if (!response["success"]) {
        this.dialog.open(ErrorDialogComponent, {
          data: new ErrorDialogData(this.translate,
            "ErrorDuringRetrievingCollections"),
          disableClose: true
        });
      } else {
        this.collections = response["data"];
        this.load();
      }
    });
  }; /* getCollections */

  getCollectionDocuments(collection: Collection = undefined,
    addGroup: boolean = false) {
    if (collection == undefined) {
      return;
    }
    return this.documentService.getAll(collection.id)
      .then((response) => {
        if (!response["success"]) {
          this.dialog.open(ErrorDialogComponent, {
            data: new ErrorDialogData(this.translate,
              "ErrorDuringRetrievingCollectionDocuments")
          });
        } else {
          if (addGroup) {
            this.documents.push({
              name: collection.name, count: collection.document_count,
              documents: response["data"], disabled: false, selected: false
            });
          } else {
            this.documents = response["data"];
          }
        }
      });
  }; /* getCollectionDocuments */

  getDocuments() {
    var promises = [];
    this.documents = [];
    this.selected_documents = undefined;
    if (this.selected_collections == undefined) {
      return;
    }
    if (Array.isArray(this.selected_collections)) {
      this.selected_collections.forEach((collection) => {
        promises.push(this.getCollectionDocuments(collection, true));
      });
    } else {
       promises.push(this.getCollectionDocuments(this.selected_collections));
    }
    return promises;
  }; /* getDocuments */

}
