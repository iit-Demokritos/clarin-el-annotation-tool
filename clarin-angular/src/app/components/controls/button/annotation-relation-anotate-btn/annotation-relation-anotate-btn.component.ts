import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import * as _ from 'lodash';
import { ErrorDialogComponent } from 'src/app/components/dialogs/error-dialog/error-dialog.component';
import { ConfirmDialogData } from 'src/app/models/dialogs/confirm-dialog';
import { BaseControlComponent } from '../../base-control/base-control.component';

@Component({
  selector: 'annotation-relation-anotate-btn',
  templateUrl: './annotation-relation-anotate-btn.component.html',
  styleUrls: ['./annotation-relation-anotate-btn.component.scss']
})
export class AnnotationRelationAnotateBtnComponent extends BaseControlComponent implements OnInit {

  textvariable;
  comboboxIds: [];
  @ViewChildren(BaseControlComponent) viewChildren: QueryList<BaseControlComponent>;
  relElement;
  showAnnotateBtn;

  super() { }

  ngOnInit(): void {

    this.viewChildren.forEach(element => {
      if (element.annotationRelationWidgetId == this.annotationRelationWidgetId) {
        this.relElement = element;
      }
    });

    // Create list of combobox element IDs
    this.comboboxIds = this.annotationWidgetIds.split(' ');

    // Get the <annotation-relation> element and its scope
    //this.relElem = $('#' + this.annotationRelationWidgetId).children().first()[0];
    //TODO:Get element's model => this.relationScope = angular.element(relElem).scope();

    // Create the annotation attribute & value
    this.annotationAttribute = {
      name: this.relElement.annotationAttribute,
      value: this.relElement.annotationValue
    }

    // Initialize the annotate btn variable
    this.showAnnotateBtn = true;
    //register callbacks for the selected annotation
    this.TextWidgetAPI.registerSelectedAnnotationCallback(this.annotationSelectionUpdate);
  }

  /**
   * Save a new annotation
   */
  addAnnotation() {
    var currentDocument: any = this.TextWidgetAPI.getCurrentDocument();

    // Create annotation object
    var annotation = {
      _id: this.ObjectId().toString(),
      document_id: currentDocument.id,
      collection_id: currentDocument.collection_id,
      annotator_id: currentDocument.annotator_id,
      type: null,
      spans: [],
      attributes: [
        this.annotationAttribute
      ]
    };

    // Create attributes for each combobox
    this.comboboxIds.forEach((id) => {
      // Get div of combobox component from its id (the first child node is the div)
      //var elem = $('#' + id).children().first()[0];
      let elem = document.querySelector("#" + id).children.item(0).firstChild;

      // Get angular scope from the element
      var elemScope: any = {};//TODO:Get model from cb angular.element(elem).scope();

      var annotationAttribute = elemScope.annotationAttribute;
      var annotationType = elemScope.annotationType;
      var selectedAnnotationId = elemScope.selectedAnnotationId;

      // Set annotation type of the annotation
      annotation.type = annotationType;

      if (selectedAnnotationId.length > 0) {
        var attribute = {
          name: annotationAttribute,
          value: selectedAnnotationId
        };

        // Add attribute from this combobox to the annotation
        annotation.attributes.push(attribute);
      }
    });

    // We must have 3 attributes.
    if (annotation.attributes.length < 1 + this.comboboxIds.length) {
      // Show error
      this.dialog.open(ErrorDialogComponent, { data: new ConfirmDialogData("Error", "Please select two annotations to connect and try again.") });
      return;
    }

    // Save the annotation
    this.tempAnnotationService.save(currentDocument.collection_id, currentDocument.id, annotation)
      .then((response: any) => {
        if (response.success) {
          this.TextWidgetAPI.addAnnotation(annotation, false);
        } else {
          this.dialog.open(ErrorDialogComponent, { data: new ConfirmDialogData("Error", "Error during saving your annotation. Please refresh the page and try again.") });
        }
      }, function (error) {
        this.dialog.open(ErrorDialogComponent, { data: new ConfirmDialogData("Error", "Database error. Please refresh the page and try again.") });
      });
  };

  /**
   * Update the annotation with new values.
   */
  updateAnnotation() {
    // Create copy of the selected annotation (to update its values)
    var annotation: any = _.cloneDeep(this.TextWidgetAPI.getSelectedAnnotation());

    // Update attributes of the comboboxes
    this.comboboxIds.forEach(id => {
      //var elem = $('#' + id).children().first()[0];
      let elem = document.querySelector("#" + id).children.item(0).firstChild;

      // Get angular scope from the element
      var elemScope: any = {};//TODO:Get cb model; angular.element(elem).scope();

      // Get the attribute name and its new value
      var annotationAttribute = elemScope.annotationAttribute;
      var newValue = elemScope.selectedAnnotationId;

      // Find the attribute with annotationAttribute as its name and update the value
      // var attribute = _.findWhere(annotation.attributes, { name: annotationAttribute });
      var attribute = annotation.attributes.find(attr => attr.name === annotationAttribute);

      attribute.value = newValue;

    });

    this.tempAnnotationService.update(annotation)
      .then(function (data) {
        this.TextWidgetAPI.updateAnnotation(annotation, false);
      }, function (error) {
        this.dialog.open(ErrorDialogComponent, { data: new ConfirmDialogData("Error", "Error in update Annotation. Please refresh the page and try again") });
      });
  };

  /**
   * Show the appropriate button text based on the selected annotation.
   */
  annotationSelectionUpdate() {
    var selectedAnnotation: any = this.TextWidgetAPI.getSelectedAnnotation();

    // For empty annotation, show the annotate button
    if (Object.keys(selectedAnnotation).length == 0) {
      // Selected annotation exists
      this.showAnnotateBtn = true;
      return;
    }

    // Check if the selected annotation concerns this button to show the update button
    // var attr = _.findWhere(selectedAnnotation.attributes, this.annotationAttribute);
    var attr = this.TextWidgetAPI.findWhere(selectedAnnotation.attributes, this.annotationAttribute);

    // Show the annotate button if we didn't find this button's attribute in the selected annotation
    this.showAnnotateBtn = (typeof (attr) == "undefined");
  }
}
