import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { SelectionModel } from '@angular/cdk/collections';
import { cloneDeep } from "lodash";
import { Minimatch } from "minimatch";
import { Subscription } from 'rxjs';
import { Annotation } from 'src/app/models/annotation';
import { ConfirmDialogData } from 'src/app/models/dialogs/confirm-dialog';
import { ErrorDialogComponent } from '../../dialogs/error-dialog/error-dialog.component';
import { BaseControlComponent } from '../base-control/base-control.component';
import { AnnotationPropertyToDisplayObject, annotationSortingDataAccessor } from 'src/app/helpers/annotation';
import { sortAnnotationSet } from 'src/app/helpers/annotation';

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

  @ViewChild(MatSort, { static: true })
  sort: MatSort;

  annotationListDisplayedColumns: string[] = ['select', 'id', 'type', 'spans'];
  selectedAannotationDisplayedColumns: string[] = ['name', 'value'];
  annotations = [];
  annotationsDataSource = new MatTableDataSource<Annotation>(this.annotations);
  selection = new SelectionModel<Annotation>(true, []);
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
    this.annotationsDataSource.sort = this.sort;
    this.annotationsDataSource.sortingDataAccessor = (item, property) => {
      if (property === 'id') {
        return this.TextWidgetAPI.getAnnotationPresentableId(item);
      }
      return annotationSortingDataAccessor(item, property);
    };
    //register callbacks for the annotation list and the selected annotation
    this.TextWidgetAPI.registerAnnotationSchemaCallback(
      this.annotationSchemaUpdate.bind(this));
    this.annotationsDataSource.filterPredicate = this.filterAnnotations.bind(this);
  }i

  ngOnDestroy() {
    if (this.sseEventSubscription) {
      this.sseEventSubscription.unsubscribe();
    }
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numRows = this.annotationsDataSource.filteredData.length;
    return numRows > 0 && this.annotationsDataSource.filteredData.every(row => this.selection.isSelected(row));
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if (this.isAllSelected()) {
      this.annotationsDataSource.filteredData.forEach(row => this.selection.deselect(row));
      if (this.selection.isEmpty()) {
        this.selectedIndex = "";
        this.selectedAnnotation = {};
        this.selectedAnnotationDataSource = undefined;
        this.TextWidgetAPI.clearSelectedAnnotation();
      }
    } else {
      this.annotationsDataSource.filteredData.forEach(row => this.selection.select(row));
      if (this.annotationsDataSource.filteredData.length > 0) {
        this.setSelectedAnnotation(this.annotationsDataSource.filteredData[0], 'api');
      }
    }
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: Annotation): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row._id}`;
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
  // the "Filter Annotations" search field.
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
    const selectedIds = this.selection.selected.map(s => s._id);

    this.annotations = this.TextWidgetAPI.getAnnotations()
      // Filter out setting annotations...  
      .filter((ann) => (!this.TextWidgetAPI.isSettingAnnotation(ann)) &&
        this.TextWidgetAPI.isSettingsCompliantAnnotation(ann));
    this.annotations = sortAnnotationSet(this.annotations);
    // console.error("updateAnnotationList():", _.cloneDeep(this.annotations));
    this.annotationsDataSource.data = this.annotations;

    // Refresh selection model with new object references
    this.selection.clear();
    this.annotationsDataSource.data.forEach(row => {
      if (selectedIds.includes(row._id)) {
        this.selection.select(row);
      }
    });

    if (this.annotations.length) {
      // console.log(this.annotations)
      this.table.renderRows();
    } else {
      this.selectedAnnotationDataSource = undefined;
    };
  };

  updateSelectedAnnotationDetails() {
    //function to be called when the selected annotation being updated
    const ann: any = this.TextWidgetAPI.getSelectedAnnotation();

    if (ann && Object.keys(ann).length > 0) {
      if (this.selectedIndex != ann._id) {
        // Selection originates from a different component. Clear selection...
        this.selection.clear();
      }
      this.selectedAnnotation = ann;
      this.selectedIndex = ann._id;
      this.selectedAnnotationDataSource =
        Object.entries(this.selectedAnnotation)
          .map(AnnotationPropertyToDisplayObject)
          .filter(e => e != null);

      // Ensure the row is selected in the selection model
      const row = this.annotationsDataSource.data.find(r => r._id === ann._id);
      if (row) {
        this.selection.select(row);
      }
    } else {
      this.selection.clear();
      this.selectedIndex = "";
      this.selectedAnnotation = {};
      this.selectedAnnotationDataSource = undefined;
    }
  };

  setSelectedAnnotation(selectedAnnotation, mode: 'row' | 'checkbox' | 'api' = 'row') {
    // console.log("setSelectedAnnotation:", selectedAnnotation, mode)
    // function to visualize the annotation that the user selected from
    // the annotation list
    // console.log(this.TextWidgetAPI.getAnnotationPresentableId(selectedAnnotation))
    if (mode === 'row') {
      this.selection.clear();
      this.selection.select(selectedAnnotation);
    } else if (mode === 'checkbox') {
      this.selection.toggle(selectedAnnotation);
    } else {
      this.selection.select(selectedAnnotation);
    }

    if (this.selection.isSelected(selectedAnnotation)) {
      this.selectedIndex = selectedAnnotation._id;
      this.selectedAnnotation = cloneDeep(selectedAnnotation);
      this.selectedAnnotationDataSource = Object.entries(selectedAnnotation)
        .map(AnnotationPropertyToDisplayObject)
        .filter(e => e != null);
      this.TextWidgetAPI.setSelectedAnnotation(selectedAnnotation);
      this.TextWidgetAPI.scrollToAnnotation(selectedAnnotation);
      this.TextWidgetAPI.clearOverlappingAreas();
    } else {
      if (this.selectedIndex === selectedAnnotation._id) {
        this.selectedIndex = "";
        this.selectedAnnotation = {};
        this.selectedAnnotationDataSource = undefined;
        this.TextWidgetAPI.clearSelectedAnnotation();
      }
    }
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

        var selection_changed = false;
        for (var i = 0; i < serviceResponse.length; i++) {
          //if (!serviceResponse[i].modified_by==1) return;
          if (!this.TextWidgetAPI.belongsToSchema(serviceResponse[i]))
            continue;
          // console.error("AnnotationVisualizerComponent: getSSEvent():", serviceResponse[i]);

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
          selection_changed = true;
        }

        if (selection_changed) {
          this.TextWidgetAPI.setCurrentSelection(currentSelection, true);
        }

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
