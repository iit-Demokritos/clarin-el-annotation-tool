import { Component, OnInit } from '@angular/core';
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

  attributeValue;
  annotationDocumentAttribute;
  groupType;

  super() { }

  ngOnInit(): void {
  }

  onFocus() { // Called when element gained focus
    this.setElementValue(this.getAnnotationValue());
  };
  onBlur() { // Called when focus is lost
    this.setAnnotationValue(this.getElementValue());
  };
  /*TODO: Set event sub. scope.$on('sendDocumentAttribute:'+scope.annotationDocumentAttribute, function(event, ann) {
    setElementValue(getAnnotationValue());
  });*/
  getElementValue() {
    //TODO: Set retrieving of attribute values
    /*if ("attributeValue" in scope) {
      return scope.attributeValue;
    }*/
    return null;
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
        this.dialog.open(ErrorDialogComponent, { data: new ConfirmDialogData("Error", "Error in update Annotation. Please refresh the page and try again") });
      });
  }; // setAnnotationValue

  getAnnotationAttributeIndex() {
    var annotation = this.getAnnotation();
    var attribute  = _.where(annotation.attributes, {name: this.annotationDocumentAttribute})[0];
    return annotation.attributes.indexOf(attribute);
  }; // getAnnotationAttributeIndex
  
  getAnnotationAttribute() {
    var annotation = this.getAnnotation();
    return _.where(annotation.attributes, {name: this.annotationDocumentAttribute})[0];
  }; // getAnnotationAttribute
  
  getAnnotation() {
    var annotation = this.TextWidgetAPI.getAnnotationForDocumentAttribute(this.annotationDocumentAttribute);
    if (typeof(annotation) != "undefined") {
      return annotation;
    }
    
  }; // getAnnotation
}