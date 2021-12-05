import { Component, Input, Output, ViewEncapsulation, ViewChildren, QueryList } from '@angular/core';
import { MainComponent } from '../main/main.component';
import { AnnotationSetInspectorComponent } from 'src/app/components/controls/annotation-set-inspector/annotation-set-inspector.component';
import { Collection } from 'backbone';
import { sortAnnotationSet } from 'src/app/helpers/annotation';

@Component({
  selector: 'app-compare-annotations',
  templateUrl: './compare-annotations.component.html',
  styleUrls: ['./compare-annotations.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class CompareAnnotationsComponent extends MainComponent {

  @Input() showPageHeader: boolean = true;
  @Input() showDocumentSelectionToolbar: boolean = true;
  @Input() allowMultipleCollections: boolean = false;
  @Input() allowMultipleDocuments: boolean = false;
  @Input() allowMultipleAnnotators: boolean = false;
  @Input() showAnnotatorSelectionToolbar: boolean = false;
  @Input() showAnnotationSetFilter: boolean = true;

  @ViewChildren(AnnotationSetInspectorComponent)
  private annotationSetInspectorComponent!: QueryList<AnnotationSetInspectorComponent>;

  selectedCollection         = {};
  selectedDocument           = {};
  annotators                 = [];
  selectedAnnotator          = [{}, {}];
  annotations: any[][]       = [[], []];
  selectedDocumentId: number = 0;

  super() { }
 
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

  onAnnotatorsChange(child, event) {
    this.selectedAnnotator[child] = event;
  }

  filterAnnotations(annotations) {
    return annotations.filter((ann) => 
      !(this.TextWidgetAPI.isSettingAnnotation(ann) ||
        this.TextWidgetAPI.isAttributeAnnotation(ann))
    );
  }; /* filterAnnotations */

  onApply(child, event) {
    this.annotationService.get(this.selectedCollection['id'],
                               this.selectedDocument['id'],
                               this.selectedAnnotator[child]['name'])
    .then((response) => {
      if (response["success"]) {
        this.annotations[child] = this.filterAnnotations(response["data"])
        this.annotations[child] = sortAnnotationSet(this.annotations[child]);
        this.changeDetectorRef.detectChanges(); // forces change detection to run
        this.annotationSetInspectorComponent.get(child).onApply(event);
      } else {
        this.annotators= [];
      }
    },
    (error) => {
      this.annotators = [];
    });
  }

  onApplyFilter(child, event) {
    // console.error("CompareAnnotationsComponent: onApplyFilter()", child, event);
    if (!event) {return;}
    this.analyticsService.find(event)
    .then((response) => {
      if (response["success"]) {
        this.annotations[child] = this.filterAnnotations(response["data"])
        let ann = this.annotations[child].find(obj => 'annotator_id' in obj)
        if (ann) {
          this.selectedAnnotator[child] = {
            _id: ann['annotator_id']
          }
        }
        
        this.annotations[child] = this.filterAnnotations(response["data"]);
        this.annotations[child] = sortAnnotationSet(this.annotations[child]);
        this.changeDetectorRef.detectChanges(); // forces change detection to run
        this.annotationSetInspectorComponent.get(child).onApply(event);
      } else {
      }
    }, (error) => {
    });
  }

}
