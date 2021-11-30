import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation, ViewChild } from '@angular/core';
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
export class AnnotationSetInspectorComponent extends MainComponent implements OnInit  {

  @Input() collection: Collection;
  @Input() document:   Document;
  @Input() annotator:  any;
  @Input() annotations: any[];
  annotatorType: string;

  @Output() selectedAnnotations = new EventEmitter<Annotation | Annotation[]>();
  selectedAnnotation: Annotation;

  @ViewChild(TextWidgetIsolatedComponent)
  private textWidgetComponent!: TextWidgetIsolatedComponent;
  
  @ViewChild(MatTable)
  table: MatTable<any>;

  annotationsDataSource = new MatTableDataSource<Annotation>();
  annotationListDisplayedColumns: string[] = ['id','value', 'type', 'spans'];

  super() { }

  ngOnInit(): void {
  }

  onApply(event) {
    this.TextWidgetAPI.resetData();
    this.TextWidgetAPI.matchAnnotationsToSchema(this.annotations, this.annotator._id);

    this.annotatorType = this.TextWidgetAPI.getAnnotatorTypeFromAnnotatorTypeId(this.annotator._id);
    this.annotationsDataSource.data = this.annotations;
    this.table.renderRows();
    this.textWidgetComponent.initialiseEditor(this.document.text,
                                              this.document.visualisation_options);
    return;
  }; /* onApply */

  clearAnnotations() {
    this.textWidgetComponent.removeAnnotationsFromEditor(this.annotations);
  }

  setSelectedAnnotation(selectedAnnotation) {
    // console.error("AnnotationSetInspectorComponent: setSelectedAnnotation()",
    //               selectedAnnotation, this.annotator._id);
    this.clearAnnotations();
    this.textWidgetComponent.addVisualsForAnnotation({
      "annotation": selectedAnnotation,
      "selected":   true,
      "action":     "add"
    }, this.annotatorType);
    this.textWidgetComponent.scrollToAnnotation(selectedAnnotation);
  }

}
