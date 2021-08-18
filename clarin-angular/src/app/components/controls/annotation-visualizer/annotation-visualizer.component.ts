import { formatDate } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { cloneDeep } from "lodash";
import { Subscription } from 'rxjs';
import { ConfirmDialogData } from 'src/app/models/dialogs/confirm-dialog';
import { ErrorDialogComponent } from '../../dialogs/error-dialog/error-dialog.component';
import { BaseControlComponent } from '../base-control/base-control.component';
import { Minimatch } from "minimatch";

export interface Span {
  start: number;
  end: number;
  segment: string;
}
export interface Attribute {
  name: string;
  value: any;
}
export interface Annotation {
  _id: string;
  type: string;
  spans: Span[];
  attributes: Attribute[];
}

@Component({
  selector: 'annotation-visualizer',
  templateUrl: './annotation-visualizer.component.html',
  styleUrls: ['./annotation-visualizer.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AnnotationVisualizerComponent extends BaseControlComponent
  implements OnInit, OnDestroy {

  @ViewChild(MatTable, { static: true })
  table: MatTable<any>;

  annotationListDisplayedColumns: string[] = ['id', 'type', 'spans'];
  selectedAannotationDisplayedColumns: string[] = ['name', 'value'];
  annotations = [];
  annotationsDataSource = new MatTableDataSource<Annotation>(this.annotations);
  selectedAnnotation: any = {};
  selectedIndex;
  selectedAnnotationDataSource;
  sseEventSubscription: Subscription;
  filter: string = "";
  minimatchOptions = { nocase: true, nocomment: true };
  mm: any; // Minimatch object

  super() { }

  ngOnInit(): void {
    this.updateAnnotationList();
    //register callbacks for the annotation list and the selected annotation
    this.TextWidgetAPI.registerAnnotationSchemaCallback(
      this.annotationSchemaUpdate.bind(this));
    this.annotationsDataSource.filterPredicate = this.filterAnnotations.bind(this);
  }

  ngOnDestroy() {
    if (this.sseEventSubscription) {
      this.sseEventSubscription.unsubscribe();
    }
  }

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
  // the "Filter Annotations" serach field.
  applyFilter(event: Event) {
    // const filterValue = (event.target as HTMLInputElement).value;
    this.mm = new Minimatch(this.filter.trim(), this.minimatchOptions);
    // console.error("AnnotationVisualizerComponent: applyFilter():",
    //   this.mm, this.mm.pattern);
    this.annotationsDataSource.filter = this.mm.pattern;
  }; /* applyFilter */

  // Function to be called when the document annotations being updated
  updateAnnotationList() {
    // console.error("AnnotationVisualizerComponent: updateAnnotationList()");
    this.annotations = this.TextWidgetAPI.getAnnotations()
      // Filter out setting annotations...  
      .filter((ann) => (!this.TextWidgetAPI.isSettingAnnotation(ann)) &&
        this.TextWidgetAPI.isSettingsCompliantAnnotation(ann))
      ;
    // console.error("updateAnnotationList():", _.cloneDeep(this.annotations));
    this.annotationsDataSource.data = this.annotations;
    if (this.annotations.length) {
      this.table.renderRows();
    } else {
      this.selectedAnnotationDataSource = undefined;
    };
  };

  updateSelectedAnnotationDetails() {
    //function to be called when the selected annotation being updated
    this.selectedAnnotation = this.TextWidgetAPI.getSelectedAnnotation();

    if (Object.keys(this.selectedAnnotation).length > 0) {
      this.selectedIndex = this.selectedAnnotation._id;
      this.selectedAnnotationDataSource =
        Object.entries(this.selectedAnnotation)
          .map(this.propertyToDisplayObject)
          .filter(e => e != null);
    } else {
      this.selectedIndex = "";
    }
  };

  propertyToDisplayObject(p) {
    switch (p[0]) {
      case "_id":
        return { name: "ID", value: p[1] };
        break;
      case "type":
        return { name: "Type", value: p[1] };
        break;
      case "annotator_id":
        return { name: "Annotator ID", value: p[1] };
        break;
      case "spans":
        return {
          name: "Spans", value: p[1].map(e =>
            e.start.toString() + ":" + e.end.toString() + " [\"" + e.segment + "\"]"
          ).join("\n")
        };
        break;
      case "attributes":
        return {
          name: "Attributes", value: p[1].map(e =>
            e.name + " - \"" + e.value + "\""
          ).join("\n")
        };
        break;
      case "document_attribute":
        return { name: "Document Attribute", value: p[1] };
        break;
      case "collection_setting":
        return { name: "Collection Setting", value: p[1] };
        break;
      case "document_setting":
        return { name: "Document Setting", value: p[1] };
        break;
      case "created_by":
        return { name: "Created By", value: p[1] };
        break;
      case "updated_by":
        return { name: "Updated By", value: p[1] };
        break;
      case "created_at":
        return {
          name: "Created At",
          value: formatDate(p[1], 'd/M/YYYY, HH:mm:ss', 'en-GB')
        };
        break;
      case "updated_at":
        return {
          name: "Updated At",
          value: formatDate(p[1], 'd/M/YYYY, HH:mm:ss', 'en-GB')
        };
        break;
      case "owner_id":
      case "document_id":
      case "collection_id":
        return null;
        break;
      default:
        return { name: p[0], value: JSON.stringify(p[1]) };
        break;
    }
  }; /* propertyToDisplayObject */

  setSelectedAnnotation(selectedAnnotation) {
    // function to visualize the annotation that the user selected from
    // the annotation list
    this.selectedIndex = selectedAnnotation._id;
    this.selectedAnnotation = cloneDeep(selectedAnnotation);
    this.selectedAnnotationDataSource = Object.entries(selectedAnnotation)
      .map(this.propertyToDisplayObject)
      .filter(e => e != null);
    this.TextWidgetAPI.setSelectedAnnotation(selectedAnnotation);
    this.TextWidgetAPI.scrollToAnnotation(selectedAnnotation);
    this.TextWidgetAPI.clearOverlappingAreas();
  }

  liveUpdateDocument() {
    var currentDocument: any = this.TextWidgetAPI.getCurrentDocument();

    this.sseService.getSSEvent("./api/collections/"
      + currentDocument.collection_id
      + "/documents/"
      + currentDocument.id
      + "/live").subscribe((e: any) => {
        // console.error("live:", e);
        var serviceResponse = JSON.parse(e.data);
        // console.error("AnnotationVisualizerComponent: liveUpdateDocument():", serviceResponse.length, serviceResponse, e);

        if (typeof serviceResponse === 'string') {
          // console.error("AnnotationVisualizerComponent: liveUpdateDocument():", serviceResponse);
          //if share is not enabled revoke access
          e.target.close();       //close live connection
          var AnnotatorTypeId = this.TextWidgetAPI.getAnnotatorTypeId();
          this.TextWidgetAPI.resetData();
          this.restoreAnnotationService.save(currentDocument.collection_id,
            currentDocument.id, AnnotatorTypeId);
          this.openDocumentService.destroy(currentDocument.id, null);

          var modalOptions = { body: serviceResponse };
          var dialogRef = this.dialog.open(ErrorDialogComponent,
            { data: new ConfirmDialogData("Error", serviceResponse) });
          dialogRef.afterClosed().subscribe((response) => {
            setTimeout(() => {
              //TODO: Emit selectDocument
              //$scope.$emit('selectDocument');
            }, 500);
          });
          return;
        }

        var currentSelection: any = this.TextWidgetAPI.getCurrentSelection();
        // if (serviceResponse.length) {
        //   console.error("AnnotationVisualizerComponent: liveUpdateDocument():", serviceResponse);
        // }

        for (var i = 0; i < serviceResponse.length; i++) {
          //if (!serviceResponse[i].modified_by==1) return;
          if (!this.TextWidgetAPI.belongsToSchema(serviceResponse[i]))
            continue;

          var oldAnnotation = this.TextWidgetAPI.getAnnotationById(serviceResponse[i]._id);
          var currentSelectedAnnotation: any = cloneDeep(this.TextWidgetAPI.getSelectedAnnotation());
          this.TextWidgetAPI.clearSelectedAnnotation();

          if (typeof (oldAnnotation) == "undefined") {
            //annotation does not exist
            if (typeof (serviceResponse[i].deleted_at) == "undefined")
              this.TextWidgetAPI.addAnnotation(serviceResponse[i], false);
          } else { //annotation exists 
            if (typeof (serviceResponse[i].deleted_at) != "undefined") {
              //if deleted_at field is defined delete annotation
              this.TextWidgetAPI.deleteAnnotation(serviceResponse[i]._id)
            } else if (oldAnnotation != serviceResponse[i]) {
              // console.error("old != new:", oldAnnotation,serviceResponse[i], oldAnnotation != serviceResponse[i]);
              this.TextWidgetAPI.deleteAnnotation(serviceResponse[i]._id)
              this.TextWidgetAPI.addAnnotation(serviceResponse[i], false);
            }
          }

          this.TextWidgetAPI.setSelectedAnnotationById(currentSelectedAnnotation._id);
        }

        this.TextWidgetAPI.setCurrentSelection(currentSelection, true);

      }, (event: any) => {
        var txt;
        console.error("AnnotationVisualizerComponent: liveUpdateDocument(): error", event.target.readyState, event);
        switch (event.target.readyState) {
          case EventSource.CONNECTING:              // if reconnecting
            txt = 'Reconnecting...';
            break;
          case EventSource.CLOSED:              // if error was fatal
            //liveUpdateDocument();
            txt = 'Connection failed. Will not retry.';
            break;
        }
      });
  }

  annotationSchemaUpdate() {
    this.TextWidgetAPI.registerCurrentDocumentCallback(this.liveUpdateDocument.bind(this));
    this.TextWidgetAPI.registerAnnotationsCallback(this.updateAnnotationList.bind(this));
    this.TextWidgetAPI.registerSettingsCallback(this.updateAnnotationList.bind(this));
    this.TextWidgetAPI.registerSelectedAnnotationCallback(this.updateSelectedAnnotationDetails.bind(this));
  };

}
