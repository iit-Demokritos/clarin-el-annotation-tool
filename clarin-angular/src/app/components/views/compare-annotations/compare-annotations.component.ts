import { Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-compare-annotations',
  templateUrl: './compare-annotations.component.html',
  styleUrls: ['./compare-annotations.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class CompareAnnotationsComponent {

  @Input() showPageHeader: boolean = false;
  @Input() showDocumentSelectionToolbar: boolean = true;
  @Input() allowMultipleCollections: boolean = false;
  @Input() allowMultipleDocuments: boolean = false;

  selectedCollection         = {};
  selectedDocument           = {};

  onCollectionsChange(event) {
    this.selectedCollection = event;
    this.selectedDocument   = {}
  }

  onDocumentsChange(event) {
    this.selectedDocument   = event;
  }

}
