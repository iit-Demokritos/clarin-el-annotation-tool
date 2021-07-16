import { Component, Input, OnInit } from '@angular/core';
import { BaseControlComponent } from '../../base-control/base-control.component';
import * as _ from 'lodash';
import { ErrorDialogComponent } from 'src/app/components/dialogs/error-dialog/error-dialog.component';
import { ConfirmDialogData } from 'src/app/models/dialogs/confirm-dialog';

@Component({
  selector: 'annotation-text-text',
  templateUrl: './annotation-text-text.component.html',
  styleUrls: ['./annotation-text-text.component.scss']
})
export class AnnotationTextTextComponent extends BaseControlComponent implements OnInit {

  @Input() groupType;
  @Input() annotationType;
  @Input() annotationAttribute;
  @Input() annotationValue;
  @Input() annotationDocumentAttribute;
  @Input() cols;
  @Input() rows;
  @Input() broadcastedEvent: any = {};
  attributeValue = "";

  super() { }

  ngOnInit(): void {
  }

  ngOnChanges(changes) {
    // We are interested only on broadcasted events...
    if (!changes.hasOwnProperty("broadcastedEvent")) {
      return;
    }
    if (changes.broadcastedEvent.currentValue.event!="sendDocumentAttribute") {
      return;
    }
    if (changes.broadcastedEvent.currentValue.attributeName ==
        this.annotationDocumentAttribute) {
      this.setElementValue(this.getAnnotationValue());
    }
  }; /* ngOnChanges */

  onFocus() { // Called when element gained focus
    this.setElementValue(this.getAnnotationValue());
  };

  onBlur() { // Called when focus is lost
    this.setAnnotationValue(this.getElementValue());
  };

  getElementValue() {
    return this.attributeValue;
  }; // getElementValue

  setElementValue(value) {
    if (this.getElementValue() != value) {
      this.attributeValue = value;
    }
  }; // getElementValue

  getAnnotationValue() {
    return this.getAnnotationAttribute().value;
  }; // getAnnotationValue

  setAnnotationValue(value) {
    var annotation = this.getAnnotation();
    var index = this.getAnnotationAttributeIndex();
    if (annotation.attributes[index].value == value) return;
    annotation.attributes[index].value = _.cloneDeep(value);
    this.tempAnnotationService.update(annotation)
      .then((data)=> {
        this.TextWidgetAPI.updateAnnotation(annotation, false);
      }, function(error) {
        this.dialog.open(ErrorDialogComponent, {
          data: new ConfirmDialogData("Error",
         "Error in update Annotation. Please refresh the page and try again")});
      });
  }; // setAnnotationValue

  getAnnotationAttributeIndex() {
    var annotation = this.getAnnotation();
    // var attribute  = _.where(annotation.attributes, {name: this.annotationDocumentAttribute})[0];
    var attribute  = annotation.attributes.find(attr =>
      attr.name === this.annotationDocumentAttribute);
    return annotation.attributes.indexOf(attribute);
  }; // getAnnotationAttributeIndex

  getAnnotationAttribute() {
    var annotation = this.getAnnotation();
    // return _.where(annotation.attributes, {name: this.annotationDocumentAttribute})[0];
    return annotation.attributes.find(attr =>
      attr.name === this.annotationDocumentAttribute);
  }; // getAnnotationAttribute

  getAnnotation() {
    var annotation = this.TextWidgetAPI.getAnnotationForDocumentAttribute(
                                          this.annotationDocumentAttribute);
    if (typeof(annotation) != "undefined") {
      return annotation;
    }

    // The annotation does not exists. We must add it...
    var currentDocument = this.TextWidgetAPI.getCurrentDocument();
    if (!currentDocument.hasOwnProperty("id")) {
      // No document is open!
      return null;
    }
    var annotation = {
      _id:                this.ObjectId().toString(),
      document_id:        currentDocument["id"],
      collection_id:      currentDocument["collection_id"],
      annotator_id:       currentDocument["annotator_id"],
      document_attribute: this.annotationDocumentAttribute,
      type:               this.annotationType,
      spans:              [],
      attributes:         [{
        name:  this.annotationAttribute,
        value: this.annotationValue
      },{
        name:  this.annotationDocumentAttribute,
        value: ""
      }]
    };
    // Save annotation to temp & our model...
    this.tempAnnotationService.save(currentDocument["collection_id"],
                             currentDocument["id"], annotation)
      .then((response: any) => { 
        if (response.success) { 
          return annotation;
        } else {
          this.dialog.open(ErrorDialogComponent, {
            data: new ConfirmDialogData("Error",
            "Error during saving your annotation. Please refresh the page and try again.")
          })
        }
      }, (error) => {
        this.dialog.open(ErrorDialogComponent, {
            data: new ConfirmDialogData("Error",
            "Database error. Please refresh the page and try again.")
          })
      }
    );
    this.TextWidgetAPI.addAnnotation(annotation, false);
    return annotation;
  }; // getAnnotation
}
