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
  
  super() { }
  
  ngOnInit(): void {
  }

  onCollectionsChange(event) {
    // console.error("InspectDocumentComponent: onCollectionChange()", event);
  }

  onDocumentsChange(event) {
    // console.error("InspectDocumentComponent: onDocumentChange()", event);
  }

}
