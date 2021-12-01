import { AfterViewInit, Component, Input, OnInit, Output, ViewEncapsulation, ViewChild } from '@angular/core';
import { MainComponent } from '../main/main.component';
import { AnnotationSetInspectorComponent } from 'src/app/components/controls/annotation-set-inspector/annotation-set-inspector.component';
import { Collection } from 'backbone';

@Component({
  selector: 'inspect-document',
  templateUrl: './inspect-document.component.html',
  styleUrls: ['./inspect-document.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class InspectDocumentComponent extends MainComponent implements OnInit {

  @Input() showPageHeader: boolean = false;
  @Input() showDocumentSelectionToolbar: boolean = true;
  @Input() allowMultipleCollections: boolean = false;
  @Input() allowMultipleDocuments: boolean = false;
  @Input() allowMultipleAnnotators: boolean = false;
  @Input() showAnnotatorSelectionToolbar: boolean = true;

  @ViewChild(AnnotationSetInspectorComponent)
  private annotationSetInspectorComponent!: AnnotationSetInspectorComponent;

  selectedCollection         = {};
  selectedDocument           = {};
  selectedAnnotator          = '';
  annotations: any[]         = [];
  selectedDocumentId: number = 0;
  annotators                 = [];

  super() { }
 
  ngOnInit(): void {
  }

  onCollectionsChange(event) {
    this.selectedCollection = event;
    this.selectedDocument   = {}
    this.selectedDocumentId = 0;
  }

  onDocumentsChange(event) {
    this.selectedDocument   = event;
    this.selectedDocumentId = event.id
    this.analyticsService.getAnnotatorSchemas(this.selectedDocumentId)
    .then((annotators: any[]) => {
      this.annotators = annotators;
    });
  }

  onAnnotatorsChange(event) {
    this.selectedAnnotator = event;
  }

  filterAnnotations(annotations) {
    return annotations.filter((ann) => 
      !(this.TextWidgetAPI.isSettingAnnotation(ann) ||
        this.TextWidgetAPI.isAttributeAnnotation(ann))
    );
  }; /* filterAnnotations */

  onApply(event) {
    this.annotationService.get(this.selectedCollection['id'],
                               this.selectedDocument['id'],
                               this.selectedAnnotator['name'])
    .then((response) => {
      if (response["success"]) {
        this.annotations = this.filterAnnotations(response["data"])
        this.changeDetectorRef.detectChanges(); // forces change detection to run
        this.annotationSetInspectorComponent.onApply(event);
      } else {
        this.annotators= [];
      }
    },
    (error) => {
      this.annotators = [];
    });
  }
 
}
