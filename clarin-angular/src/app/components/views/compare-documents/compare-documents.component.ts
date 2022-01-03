import { Component, Input, ViewEncapsulation } from '@angular/core';
import { LocalStorageService } from '@shared/services/storage.service';

@Component({
  selector: 'app-compare-documents',
  templateUrl: './compare-documents.component.html',
  styleUrls: ['./compare-documents.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CompareDocumentsComponent {

  @Input() showPageHeader: boolean = false;
  @Input() showDocumentSelectionToolbar: boolean = true;
  @Input() allowMultipleCollections: boolean = false;
  @Input() allowMultipleDocuments: boolean = false;
  clearOnDocumentsChange = false;

  selectedCollection         = {};
  selectedDocument           = {};

  constructor(private store: LocalStorageService) {}

  onCollectionsChange(event) {
    this.selectedCollection = event;
    this.selectedDocument   = {}
  }

  onDocumentsChange(event) {
    this.selectedDocument   = event;
  }

}
