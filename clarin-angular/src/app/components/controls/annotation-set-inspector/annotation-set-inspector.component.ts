import { Component, EventEmitter, Input, AfterViewInit, Output, ViewEncapsulation, ViewChild, ChangeDetectionStrategy, ElementRef } from '@angular/core';
import { MainComponent } from 'src/app/components/views/main/main.component';
import { Collection } from 'src/app/models/collection';
import { Document } from 'src/app/models/document';
import { Annotation } from 'src/app/models/annotation';
import { annotationSortingDataAccessor } from 'src/app/helpers/annotation';
import { TextWidgetIsolatedComponent } from '../text-widget-isolated/text-widget-isolated.component';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { AnnotationPropertyToDisplayObject } from 'src/app/helpers/annotation';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { AnnotationDetailComponent } from '../annotation-detail/annotation-detail.component';
import { ScrollStatus } from 'src/app/models/services/scrollstatus';
import { Minimatch } from "minimatch";
import { MatTableExporterDirective, Exporter, Options } from 'mat-table-exporter';
import ObjectID from "bson-objectid";

export class SkipDetailRowsExporter implements Exporter<Options> {
  export(rows: Array<any>, options?: Options) {
    console.log(rows);
  }
}


@Component({
  selector: 'annotation-set-inspector',
  templateUrl: './annotation-set-inspector.component.html',
  styleUrls: ['./annotation-set-inspector.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
  encapsulation: ViewEncapsulation.None,
})
export class AnnotationSetInspectorComponent extends MainComponent implements AfterViewInit  {

  @Input() collections: Collection|Collection[];
  @Input() documents:   Document|Document[];
  // @Input() annotator:  any;
  @Input() annotations: any[];
  // annotatorType: string;

  // @Output() selectedAnnotations = new EventEmitter<Annotation | Annotation[]>();
  @Output() onScroll = new EventEmitter<ScrollStatus>();
  selectedAnnotation: Annotation;
  selectedIndex = "";
  selectedAnnotationDataSource=[];
  @ViewChild(TextWidgetIsolatedComponent)
  private textWidgetComponent!: TextWidgetIsolatedComponent;
  /* Variable for isolated TextWidgetAPI of textWidgetComponent */
  private TWA;
  @ViewChild(MatTable) table: MatTable<any>;
  @ViewChild(MatSort)  sort: MatSort;
  @ViewChild('annotationList') annotationList: ElementRef;
  @ViewChild('documentViewer') documentViewer: ElementRef;
  @ViewChild(MatTableExporterDirective, { static: false }) exporter: MatTableExporterDirective;
  collapsed_status:number[] = [];
  annotationsDataSource = new MatTableDataSource<Annotation>();
  annotationListDisplayedColumns: string[] = ['id', 'type', 'value', 'spans'];

  annotationsInEditor = [];
  documentInEditor: Document;

  footer_caret_show      = false;
  footer_caret_line      = "";
  footer_caret_column    = "";
  footer_caret_offset    = "";
  footer_caret_selection = "[]";

  filter: string = "";
  minimatchOptions = { nocase: true, nocomment: true };
  mm: any; // Minimatch object

  skipDetailRowsExporter: SkipDetailRowsExporter = new SkipDetailRowsExporter();

  super() { }

  getCaret() {
    if (this.textWidgetComponent) {
      let cursor    = this.textWidgetComponent.editor.getCursor();
      let selection = this.textWidgetComponent.getSelectionInfo();
      this.footer_caret_line = cursor.line + 1;
      this.footer_caret_column = cursor.ch;
      this.footer_caret_offset = this.textWidgetComponent.editor.indexFromPos(cursor);
      if (selection.segment) {
        this.footer_caret_selection = "["+selection.startOffset+":"+selection.endOffset+"]";
      } else {
        this.footer_caret_selection = "[]";
      }
      this.footer_caret_show = true;
    }
  }

  collapseInit(index) {
    var length = this.annotations.length;
    var temp   = 0;
    if (index >= 0) {
      temp = this.collapsed_status[index];
    }
    this.collapsed_status = [];
    for (let i = 0; i <length ; i++) {
      if (index == i) {
        continue;
      }
      this.collapsed_status.push(0);
    }
    return temp;
  }

  ngAfterViewInit(): void {
    this.TWA = this.textWidgetComponent.TextWidgetAPI;
    this.textWidgetComponent.editor.on("cursorActivity", () => {
      this.getCaret();
    });
    this.annotationsDataSource.sort = this.sort;
    this.annotationsDataSource.sortingDataAccessor = annotationSortingDataAccessor;
    this.annotationsDataSource.filterPredicate = this.filterAnnotations.bind(this);
  }

  onClear() {
    this.annotations = [];
    this.documentInEditor = undefined;
    this.onUpdate();
  }; /* onClear */

  onUpdate() {
    if (this.documentInEditor) {
      if (typeof this.documentInEditor.visualisation_options == "string") {
        this.documentInEditor.visualisation_options = JSON.parse(this.documentInEditor.visualisation_options);
      }
      this.textWidgetComponent.initialiseEditor({type: "text", text: this.documentInEditor.text},
                                                this.documentInEditor.visualisation_options);
    } else {
      this.textWidgetComponent.initialiseEditor({type: "text", text: ""}, {});
    }

    // console.error("AnnotationSetInspectorComponent: onApply(): annotaions", this.annotations);
    // this.TWA.addAnnotations(this.annotations /*, this.annotator._id*/);
    // console.error("AnnotationSetInspectorComponent: onApply(): after match:", this.TWA.getAnnotations());

    // this.annotatorType = this.TWA.getAnnotatorTypeFromAnnotatorTypeId(this.annotator._id);
    this.annotationsDataSource.data = this.annotations;
    this.table.renderRows();
  }; /* onUpdate */

  onApply(event = undefined) {
    //  console.error("AnnotationSetInspectorComponent: onApply():", this.annotator._id);

    // Is there a single document, or many?
    if (Array.isArray(this.documents)) {
      this.documentInEditor = this.documents[0];
    } else {
      this.documentInEditor = this.documents;
    }
    this.onUpdate();
  }; /* onApply */

  clearAnnotations() {
    this.textWidgetComponent.removeAnnotationsFromEditor(this.annotationsInEditor);
    this.annotationsInEditor = [];
  }

  getAndAddAnnotation(id) {
    let ann = this.annotations.find(e => e._id == id);
    if (ann) {
      this.TWA.addAnnotation(ann, false);
      this.annotationsInEditor.push(ann);
      return ann;
    }
    return new Promise((resolve, reject) => {
      this.analyticsService.findById(id)
      .then((response) => {
        ann = response['data'][0];
        this.TWA.addAnnotation(ann, false);
        this.annotationsInEditor.push(ann);
        resolve(ann);
      }, (error) => reject(error));
    });
  }

  setSelectedAnnotation(selectedAnnotation) {
    // console.error("AnnotationSetInspectorComponent: setSelectedAnnotation()",
    //               selectedAnnotation);
    // Is it an empty row?
    if (Object.keys(selectedAnnotation).length == 0) {
      return;
    }
    this.clearAnnotations();
    var previndex = this.annotations.findIndex(item => item._id === this.selectedIndex);
    var index     = this.annotations.findIndex(item => item._id === selectedAnnotation._id);
    var status    = this.collapseInit(index);
    if (status > 2) {
      this.collapsed_status[index] = 0;
    } else {
      this.collapsed_status[index] = status;
    }
    if (this.selectedIndex == selectedAnnotation._id) {
      this.collapsed_status[index]++;
    }
    //fixed bug: close other annotations when select other
    if (previndex != index) {
      this.collapsed_status[previndex] = 0;
    }
    this.selectedIndex = selectedAnnotation._id;
    this.selectedAnnotationDataSource = Object.entries(selectedAnnotation)
        .map(AnnotationPropertyToDisplayObject)
        .filter(e => e != null);

    // Are there any arguments in attributes?
    let relation_args = this.TWA.getAnnotationRelationLinks(selectedAnnotation);
    let promises = [];
    if (relation_args.length) {
      this.TWA.setAnnotationSchemaAnnotationTypes([selectedAnnotation.type]);
      relation_args.forEach((attr) => {
        let p = this.getAndAddAnnotation(attr.value);
        if (p instanceof Promise) {promises.push(p);}
      });
    }
    Promise.all(promises).then((data) => {
      this.TWA.addAnnotation(selectedAnnotation, false);
      this.annotationsInEditor.push(selectedAnnotation);
      this.TWA.setSelectedAnnotation(selectedAnnotation);
      this.textWidgetComponent.scrollToAnnotation(selectedAnnotation);
    });
    if (this.collapsed_status[index] < 1) {
      return null;
    }
    return this.selectedAnnotation = this.selectedAnnotation === selectedAnnotation ? null : selectedAnnotation;
  }

  onScrollAnnotations(element: HTMLElement) {
    // console.error("AnnotationSetInspectorComponent: onScroll():", element.scrollTop, element.scrollLeft, element.scrollBy);
    this.onScroll.emit({widget: "anns", scrollTop: element.scrollTop, scrollLeft: element.scrollLeft});
  }; /* onScrollAnnotations */

  onScrollDocument(element: HTMLElement) {
    // console.error("AnnotationSetInspectorComponent: onScroll()", element.scrollTop, element.scrollLeft, element.scrollBy);
    this.onScroll.emit({widget: "doc", scrollTop: element.scrollTop, scrollLeft: element.scrollLeft});
  }; /* onScrollDocument */

  setScrollStatus(status: ScrollStatus) {
    var widget;
    if (status.widget == "anns") {
      widget = this.annotationList;
    } else {
      widget = this.documentViewer;
    }
    widget.nativeElement.scrollTop  = status.scrollTop;
    widget.nativeElement.scrollLeft = status.scrollLeft;
  }; /* setScrollStatus */

  filterAnnotations(ann: Annotation, filter: string) {
    // console.error("AnnotationVisualizerComponent: filterAnnotations():", ann, filter, this.mm);
    if (this.mm.empty) { return true; }
    return ann.attributes.some((attr) => {
      // console.error("attr:", attr, attr.value, this.mm.match(attr.value));
      if (attr.value.indexOf(filter) !== -1) { return true; }
      return this.mm.match(attr.value)
    });
  }; /* filterAnnotations */

  // This method is called each time the user releases a key in
  // the "Filter Annotations" search field.
  onApplyFilter(event: Event) {
    // const filterValue = (event.target as HTMLInputElement).value;
    this.mm = new Minimatch(this.filter.trim(), this.minimatchOptions);
    // console.error("AnnotationVisualizerComponent: applyFilter():",
    //   this.mm, this.mm.pattern);
    this.annotationsDataSource.filter = this.mm.pattern;
  }; /* onApplyFilter */

}
