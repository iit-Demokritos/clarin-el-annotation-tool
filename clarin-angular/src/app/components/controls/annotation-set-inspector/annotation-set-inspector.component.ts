import { Component, EventEmitter, Input, AfterViewInit, Output, ViewEncapsulation, ViewChild } from '@angular/core';
import { MainComponent } from 'src/app/components/views/main/main.component';
import { Collection } from 'src/app/models/collection';
import { Document } from 'src/app/models/document';
import { Annotation } from 'src/app/models/annotation';
import { TextWidgetIsolatedComponent } from '../text-widget-isolated/text-widget-isolated.component';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { AnnotationPropertyToDisplayObject } from 'src/app/helpers/annotation';

@Component({
  selector: 'annotation-set-inspector',
  templateUrl: './annotation-set-inspector.component.html',
  styleUrls: ['./annotation-set-inspector.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AnnotationSetInspectorComponent extends MainComponent implements AfterViewInit  {

  @Input() collection: Collection;
  @Input() document:   Document;
  @Input() annotator:  any;
  @Input() annotations: any[];
  // annotatorType: string;

  @Output() selectedAnnotations = new EventEmitter<Annotation | Annotation[]>();
  selectedAnnotation: Annotation;
  selectedIndex;
  selectedAnnotationDataSource;
  @ViewChild(TextWidgetIsolatedComponent)
  private textWidgetComponent!: TextWidgetIsolatedComponent;
  /* Variable for isolated TextWidgetAPI of textWidgetComponent */
  private TWA;
  
  @ViewChild(MatTable)
  table: MatTable<any>;

  annotationsDataSource = new MatTableDataSource<Annotation>();
  annotationListDisplayedColumns: string[] = ['id', 'type', 'value', 'spans'];

  super() { }

  ngAfterViewInit(): void {
    this.TWA = this.textWidgetComponent.TextWidgetAPI;
  }

  onApply(event) {
    // console.error("AnnotationSetInspectorComponent: onApply():", this.annotator._id);
    this.textWidgetComponent.initialiseEditor(this.document.text,
                                              this.document.visualisation_options);

    // console.error("AnnotationSetInspectorComponent: onApply(): annotaions", this.annotations);
    // this.TWA.addAnnotations(this.annotations /*, this.annotator._id*/);
    // console.error("AnnotationSetInspectorComponent: onApply(): after match:", this.TWA.getAnnotations());

    // this.annotatorType = this.TWA.getAnnotatorTypeFromAnnotatorTypeId(this.annotator._id);
    this.annotationsDataSource.data = this.annotations;
    this.table.renderRows();
  }; /* onApply */

  clearAnnotations() {
    this.textWidgetComponent.removeAnnotationsFromEditor(this.annotations);
  }

  setSelectedAnnotation(selectedAnnotation) {
    // console.error("AnnotationSetInspectorComponent: setSelectedAnnotation()",
    //               selectedAnnotation, this.annotator._id);
    this.clearAnnotations();
    this.selectedIndex = selectedAnnotation._id;
    // Are there any arguments in attributes?
    let relation_args = this.TWA.getAnnotationRelationLinks(selectedAnnotation);
    if (relation_args.length) {
      this.TWA.setAnnotationSchemaAnnotationTypes([selectedAnnotation.type]);
    }
    relation_args.forEach((attr) => {
      this.TWA.addAnnotation(this.annotations.find(e => e._id == attr.value), false);
    });
    this.TWA.addAnnotation(selectedAnnotation, false);
    this.TWA.setSelectedAnnotation(selectedAnnotation);
    this.textWidgetComponent.scrollToAnnotation(selectedAnnotation);
  }

}
