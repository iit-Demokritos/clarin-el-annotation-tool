import { Component, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { MainComponent } from '../main/main.component';

@Component({
  selector: 'inspect-document',
  templateUrl: './inspect-document.component.html',
  styleUrls: ['./inspect-document.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class InspectDocumentComponent extends MainComponent implements OnInit {

  @Input() showPageHeader: boolean = true;
  @Input() showDocumentSelectionToolbar: boolean = true;
  @Input() allowMultipleCollections: boolean = false;
  @Input() allowMultipleDocuments: boolean = false;

  selectedCollection = {};
  selectedDocument   = {};
  
  super() { }
  
  ngOnInit(): void {
  }

  onCollectionsChange(event) {
    // console.error("InspectDocumentComponent: onCollectionChange()", event);
    this.selectedCollection = event;
    this.selectedDocument   = {};
  }

  onDocumentsChange(event) {
    // console.error("InspectDocumentComponent: onDocumentChange()", event);
    this.selectedDocument = event;
  }

}
