import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { LocalStorageService } from '@shared/services/storage.service';

@Component({
  selector: 'app-compare-collections',
  templateUrl: './compare-collections.component.html',
  styleUrls: ['./compare-collections.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CompareCollectionsComponent implements OnInit {

  @Input() showPageHeader: boolean = false;
  @Input() showDocumentSelectionToolbar: boolean = true;
  @Input() allowMultipleCollections: boolean = false;
  @Input() allowMultipleDocuments: boolean = false;
  allowDocumentSelection = false;
  clearOnDocumentsChange = false;

  selectedCollection         = {};
  selectedDocument           = {};

  constructor(private store: LocalStorageService) {}

  ngOnInit(): void {
  }

  onCollectionsChange(event) {
    this.selectedCollection = event;
    this.selectedDocument   = {}
  }

  onDocumentsChange(event) {
    this.selectedDocument   = event;
  }

}
