import { Component, Input, OnInit } from '@angular/core';
import * as _ from 'lodash';
import { ErrorDialogComponent } from 'src/app/components/dialogs/error-dialog/error-dialog.component';
import { ConfirmDialogData } from 'src/app/models/dialogs/confirm-dialog';
import { BaseControlComponent } from '../../base-control/base-control.component';
import { AnnotationRelationComponent } from '../annotation-relation/annotation-relation.component';

@Component({
  selector: 'annotation-relation-annotate-btn',
  templateUrl: './annotation-relation-annotate-btn.component.html',
  styleUrls: ['./annotation-relation-annotate-btn.component.scss']
})
export class AnnotationRelationAnnotateBtnComponent extends BaseControlComponent implements OnInit {

  comboboxIds: [];
  showAnnotateBtn = true;

  super() { }

  ngOnInit(): void {
    // We expect a series of comboboxes, the elements of a relation
    this.comboboxIds = this.annotationWidgetIds.split(' ');
    // Create the annotation attribute & value
    this.annotationAttribute = {
      name:  this.annotationRelationAttribute,
      value: this.annotationRelationValue
    }
    // Initialize the annotate btn variable
    this.showAnnotateBtn = true;
    //register callbacks for the selected annotation
    this.TextWidgetAPI.registerSelectedAnnotationCallback(this.annotationSelectionUpdate.bind(this));
  }

  /**
   * Save a new annotation
   */
  addAnnotation() {
    var currentDocument: any = this.TextWidgetAPI.getCurrentDocument();

    // Create annotation object
    var annotation = {
      _id:           this.ObjectId().toString(),
      document_id:   currentDocument.id,
      collection_id: currentDocument.collection_id,
      annotator_id:  currentDocument.annotator_id,
      type:          this.annotationRelationType,
      spans:         [],
      attributes:    [this.annotationAttribute]
    };
    // The current statues of all relation comboboxes is available at:
    // this.messageService.annotationRelationComboboxStatus
    // Create attributes for each combobox
    for (let id of this.comboboxIds) {
      let status = this.messageService.annotationRelationComboboxGetForElement(id);
      if (status.annotation_id) {
        var attribute = {
          name:  status.annotation_attribute,
          value: status.annotation_id
        };
        // Add attribute from this combobox to the annotation
        annotation.attributes.push(attribute);
      } else {
        this.dialog.open(ErrorDialogComponent, { data: new ConfirmDialogData("Error", "Please fill all relation arguments and try again.") });
        return;
      }
    }

    // Save the annotation
    this.tempAnnotationService.save(currentDocument.collection_id, currentDocument.id, annotation)
      .then((response: any) => {
        if (response.success) {
          this.TextWidgetAPI.clearSelection();
          this.TextWidgetAPI.addAnnotation(annotation, false);
          this.TextWidgetAPI.setSelectedAnnotation(annotation);
        } else {
          this.dialog.open(ErrorDialogComponent, { data: new ConfirmDialogData("Error", "Error during saving your annotation. Please refresh the page and try again.") });
        }
      }, (error) => {
        this.dialog.open(ErrorDialogComponent, { data: new ConfirmDialogData("Error", "Database error. Please refresh the page and try again.") });
      });
  };

  /**
   * Update the annotation with new values.
   */
  updateAnnotation() {
    // Create copy of the selected annotation (to update its values)
    var annotation: any = _.cloneDeep(this.TextWidgetAPI.getSelectedAnnotation());
    // The current statues of all relation comboboxes is available at:
    // this.messageService.annotationRelationComboboxStatus
    // Update attributes of the comboboxes
    this.comboboxIds.forEach(id => {
      let status = this.messageService.annotationRelationComboboxGetForElement(id);
      var attribute = annotation.attributes.find(attr => attr.name == status.annotation_attribute);
      attribute.value = status.annotation_id;
    });

    this.tempAnnotationService.update(annotation)
      .then((response: any) => {
        if (response.success) {
          this.TextWidgetAPI.clearSelection();
          this.TextWidgetAPI.updateAnnotation(annotation, false);
          this.TextWidgetAPI.setSelectedAnnotation(annotation);
        } else {
          this.dialog.open(ErrorDialogComponent, { data: new ConfirmDialogData("Error", "Error during updating your annotation. Please refresh the page and try again.") });
        }
      }, (error) => {
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
      // Selected annotation does not exist
      this.showAnnotateBtn = true;
      return;
    }

    // Check if the selected annotation concerns this button to show the update button
    // var attr = _.findWhere(selectedAnnotation.attributes, this.annotationAttribute);
    //* in .js: var attr = _.findWhere(selectedAnnotation.attributes, annotationAttribute);*//
    var attr = this.TextWidgetAPI.findWhere(selectedAnnotation.attributes, this.annotationAttribute);

    // Show the annotate button if we didn't find this button's attribute in the selected annotation
    this.showAnnotateBtn = (typeof (attr) == "undefined");
  }
}
