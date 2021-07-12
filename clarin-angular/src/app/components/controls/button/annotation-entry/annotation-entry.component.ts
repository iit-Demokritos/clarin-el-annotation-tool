import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { BaseControlComponent } from '../../base-control/base-control.component';
import { ErrorDialogComponent } from 'src/app/components/dialogs/error-dialog/error-dialog.component';
import { ConfirmDialogData } from 'src/app/models/dialogs/confirm-dialog';
import * as _ from 'lodash';

@Component({
  selector: 'annotation-entry',
  templateUrl: './annotation-entry.component.html',
  styleUrls: ['./annotation-entry.component.scss']
})
export class AnnotationEntryComponent extends BaseControlComponent implements OnInit {

  @ViewChild('textarea') element: ElementRef;

  super() { }

  ngOnInit(): void {
      //register callbacks for the annotation list and the selected annotation
      this.TextWidgetAPI.registerSelectedAnnotationCallback(this.updateSelectedAnnotationEntry); 
  }

  addAttribute = function(type, attribute) {
    var selectedAnnotation = this.TextWidgetAPI.getSelectedAnnotation();

    if (Object.keys(selectedAnnotation).length > 0) {
      var updatedAnnotation = _.cloneDeep(selectedAnnotation);
      updatedAnnotation.type = type;
      // var selectedAnnotationAttribute = _.where(updatedAnnotation.attributes, { name : this.annotationAttribute, 
      //                                                                           value: this.annotationValue })[0];
      var selectedAnnotationAttribute = updatedAnnotation.attributes.find(attr =>
          attr.name === this.annotationAttribute && attr.value === this.annotationValue);
      var attributeIndex = updatedAnnotation.attributes.indexOf(selectedAnnotationAttribute);
        
      //if attribute exists in annotation and input is empty, delete attribute from the array of attributes
      if (attributeIndex > -1 && this.element.nativeElement.value.length == 0)         //if attribute exists in the array of object's attributes and input is empty
        updatedAnnotation.attributes.splice(attributeIndex, 1);
      else if (attributeIndex > -1 && this.element.nativeElement.value.length > 0)     //if attribute exists in the array of object's attributes and input not empty
        updatedAnnotation.attributes[attributeIndex].value = this.element.nativeElement.value;
      else                                                         //if attribute doesn't exist in the array of object's attributes 
        updatedAnnotation.attributes.push({ name : this.annotationAttribute, value: this.element.nativeElement.value }); 

      this.tempAnnotationService.update(updatedAnnotation)                    //update the annotion in the temp db
      .then(function(data){ 
          this.TextWidgetAPI.updateAnnotation(updatedAnnotation, true);
      }, function(error){
          this.dialog.open(ErrorDialogComponent, { data: new ConfirmDialogData("Error", "Error in update Annotation. Please refresh the page and try again") });
      });
           
      return false;
    }
  };

  updateSelectedAnnotationEntry() {   
    var selectedAnnotation:any = this.TextWidgetAPI.getSelectedAnnotation();

    if (Object.keys(selectedAnnotation).length > 0) { //is selected annotation is not empty 
      var selectedAnnotationButton = this.element.nativeElement.closest("tr").find('.annotation-btn.active'); //search for active .annotation-btn in the same row that the element belongs

      if (selectedAnnotationButton.length>0 && this.element.nativeElement.disabled) {                  //if .annotation-btn is active and element is disabled
        // var selectedAnnotationAttribute = _.where(selectedAnnotation.attributes, { name: this.annotationAttribute })[0];
        var selectedAnnotationAttribute = selectedAnnotation.attributes.find(attr => attr.name === this.annotationAttribute);

        if (typeof(selectedAnnotationAttribute) != "undefined")
          this.element.nativeElement.value = selectedAnnotationAttribute.value;
        
        this.element.nativeElement.disabled = false;
      } else if (selectedAnnotationButton.length==0 && !this.element.nativeElement.disabled)         //if no active .annotation-btn was found on the same row
        this.element.nativeElement.value = "";
        this.element.nativeElement.disabled = true;
    } else if (Object.keys(selectedAnnotation).length == 0 && !this.element.nativeElement.disabled)
    this.element.nativeElement.disabled = true;
  };
}
