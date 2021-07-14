import { Component, ViewChild, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatTable } from '@angular/material/table';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { CLARIN_CONSTANTS } from 'src/app/helpers/constants';
import { ConfirmDialogData } from 'src/app/models/dialogs/confirm-dialog';
import { ErrorDialogComponent } from '../../dialogs/error-dialog/error-dialog.component';
import { MainComponent } from '../../views/main/main.component';
import { BaseControlComponent } from '../base-control/base-control.component';
import { cloneDeep } from "lodash";
import * as _ from 'lodash';

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
export class AnnotationVisualizerComponent extends BaseControlComponent implements OnInit, OnDestroy {

  @ViewChild(MatTable, { static: true })
  table: MatTable<any>;

  super() { }

  ngOnInit(): void {
    this.updateAnnotationList();
    //register callbacks for the annotation list and the selected annotation
    this.TextWidgetAPI.registerAnnotationSchemaCallback(this.annotationSchemaUpdate.bind(this));
  }

  annotationListDisplayedColumns: string[] = ['id', 'type', 'spans'];
  selectedAannotationDisplayedColumns: string[] = ['name', 'value'];
  annotations = [];
  annotationsDataSource = new MatTableDataSource<Annotation>(this.annotations);
  selectedAnnotation: any = {};
  selectedIndex;
  selectedAnnotationDataSource;
  sseEventSubscription: Subscription;

  ngOnDestroy() {
    if(this.sseEventSubscription){
      this.sseEventSubscription.unsubscribe();
    }
  }

  /*$scope.$on('$destroy', function () {  //listen when scope is destroying
    if (!angular.isUndefined($scope.es)) { $scope.es.close(); } //delete previous open connections when leaving
  });*/


  updateAnnotationList() {  //function to be called when the document annotations being updated
    this.annotations = this.TextWidgetAPI.getAnnotations();
    this.annotationsDataSource = new MatTableDataSource<Annotation>(this.annotations);
    if (this.annotations.length) this.table.renderRows();
  };

  updateSelectedAnnotationDetails() {
    //function to be called when the selected annotation being updated
    this.selectedAnnotation = this.TextWidgetAPI.getSelectedAnnotation();

    if (Object.keys(this.selectedAnnotation).length > 0) {
      this.selectedIndex = this.selectedAnnotation._id;
      this.selectedAnnotationDataSource = Object.entries(this.selectedAnnotation)
      .map(this.propertyToDisplayObject)
      .filter(e => e != null);
    } else {
      this.selectedIndex = "";
    }
  };

  propertyToDisplayObject(p) {
    switch (p[0]) {
      case "_id":
        return {name: "ID", value: p[1]};
        break;
      case "type":
        return {name: "Type", value: p[1]};
        break;
      case "annotator_id":
        return {name: "Annotator ID", value: p[1]};
        break;
      case "spans":
        return {name: "Spans", value: p[1].map(e =>
          e.start.toString()+":"+e.end.toString()+" [\""+e.segment+"\"]"
        ).join("\n")};
        break;
      case "attributes":
        return {name: "Attributes", value: p[1].map(e =>
          e.name+" - \""+e.value+"\""
        ).join("\n")};
        break;
      case "document_id":
      case "collection_id":
        return null;
        break;
      default:
        return {name: p[0], value: JSON.stringify(p[1])};
        break;
    }
  }; /* propertyToDisplayObject */

  setSelectedAnnotation(selectedAnnotation, index=null) {
    //function to visualize the annotation that the user selected from
    // the annotation list
    console.error("setSelectedAnnotation:", selectedAnnotation, index);
    this.selectedIndex = selectedAnnotation._id;
    this.selectedAnnotation = cloneDeep(selectedAnnotation);
    this.selectedAnnotationDataSource = Object.entries(selectedAnnotation)
      .map(this.propertyToDisplayObject)
      .filter(e => e != null);
    // console.warn(selectedAnnotation);
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

        var serviceResponse = JSON.parse(e.data);

        if (typeof serviceResponse === 'string') {
          //if share is not enabled revoke access
          e.target.close();       //close live connection
          var AnnotatorTypeId = this.TextWidgetAPI.getAnnotatorTypeId();
          this.TextWidgetAPI.resetData();
          this.restoreAnnotationService.save(currentDocument.collection_id, currentDocument.id, AnnotatorTypeId);
          this.openDocumentService.destroy(currentDocument.id, null);

          var modalOptions = { body: serviceResponse };
          var dialogRef = this.dialog.open(ErrorDialogComponent, { data: new ConfirmDialogData("Error", serviceResponse) })

          dialogRef.afterClosed().subscribe((response) => {

            setTimeout(() => {
              //TODO: Emit selectDocument
              //$scope.$emit('selectDocument');
            }, 500);

          });

          return;
        }

        var currentSelection:any = this.TextWidgetAPI.getCurrentSelection();

        for (var i = 0; i < serviceResponse.length; i++) { //if (!serviceResponse[i].modified_by==1) return;
          if (!this.TextWidgetAPI.belongsToSchema(serviceResponse[i]))
            continue;

          var oldAnnotation = this.TextWidgetAPI.getAnnotationById(serviceResponse[i]._id);
          var currentSelectedAnnotation:any = cloneDeep(this.TextWidgetAPI.getSelectedAnnotation());
          this.TextWidgetAPI.clearSelectedAnnotation();

          if (typeof (oldAnnotation) == "undefined") { //annotation does not exist
            if (typeof (serviceResponse[i].deleted_at) == "undefined")
              this.TextWidgetAPI.addAnnotation(serviceResponse[i], false);
          } else { //annotation exists 
            if (typeof (serviceResponse[i].deleted_at) != "undefined") { //if deleted_at field is defined delete annotation
              this.TextWidgetAPI.deleteAnnotation(serviceResponse[i]._id)
            } else if (oldAnnotation != serviceResponse[i]) {
              this.TextWidgetAPI.deleteAnnotation(serviceResponse[i]._id)
              this.TextWidgetAPI.addAnnotation(serviceResponse[i], false);
            }
          }

          this.TextWidgetAPI.setSelectedAnnotationById(currentSelectedAnnotation._id);
        }

        this.TextWidgetAPI.setCurrentSelection(currentSelection, true);

      }, (event: any) => {
        var txt;
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
    this.TextWidgetAPI.registerSelectedAnnotationCallback(this.updateSelectedAnnotationDetails.bind(this));
  };

}


