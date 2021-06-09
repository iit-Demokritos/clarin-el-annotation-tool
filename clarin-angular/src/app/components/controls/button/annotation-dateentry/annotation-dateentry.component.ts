import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { BaseControlComponent } from '../../base-control/base-control.component';
import * as _ from 'lodash';
import { ErrorDialogComponent } from 'src/app/components/dialogs/error-dialog/error-dialog.component';
import { ConfirmDialogData } from 'src/app/models/dialogs/confirm-dialog';

@Component({
  selector: 'annotation-dateentry',
  templateUrl: './annotation-dateentry.component.html',
  styleUrls: ['./annotation-dateentry.component.scss']
})
export class AnnotationDateentryComponent extends BaseControlComponent implements OnInit {

  dt;
  opened;
  @ViewChild('date') el: ElementRef;
  @ViewChild('datepickerInput') datepickerInput: ElementRef;
  @ViewChild('datepickerBtn') datepickerBtn: ElementRef;
  @ViewChild('annotationEntry') annotationEntry:ElementRef;
  element;
  pipe:DatePipe = new DatePipe('en-US');

  super() { }

  ngOnInit(): void {

    this.element = this.el.nativeElement;

    //register callbacks for the annotation list and the selected annotation
    this.TextWidgetAPI.registerSelectedAnnotationCallback(this.updateSelectedAnnotationDateEntry);

  }

  open($event) {
    $event.preventDefault();
    $event.stopPropagation();

    if (typeof(this.element.children[0])!="undefined") {
      var newDt = new Date(this.element.children[0].value);
      var newDtFormatted = this.pipe.transform(newDt,'MM/dd/yyyy 00:00:00 UTC');/*$filter('date')(newDt, 'MM/dd/yyyy 00:00:00 UTC');*/

      this.dt = newDtFormatted;
    }

    this.opened = true;
  };

  updateSelectedAnnotationDateEntry() {
    var selectedAnnotation:any = this.TextWidgetAPI.getSelectedAnnotation();

    if (Object.keys(selectedAnnotation).length > 0) { //is selected annotation is not empty 
      var selectedAnnotationButton = this.annotationEntry.nativeElement.parent().closest("tr").find('.annotation-btn.active');//$(element).closest("tr").find('.annotation-btn.active'); //search for active .annotation-btn in the same row that the element belongs

      if (selectedAnnotationButton.length > 0 && this.datepickerInput.nativeElement.disabled) {                  //if .annotation-btn is active and element is disabled
        var selectedAnnotationAttribute = _.where(selectedAnnotation.attributes, { name: this.annotationAttribute })[0];
        
        if (typeof(selectedAnnotationAttribute) != "undefined")
          this.datepickerInput.nativeElement.value = selectedAnnotationAttribute.value;
        
          this.datepickerInput.nativeElement.disabled = false;
          this.datepickerBtn.nativeElement.disabled = false; 
      } else if (selectedAnnotationButton.length == 0 && !this.datepickerInput.nativeElement.disabled) {        //if no active .annotation-btn was found on the same row
        this.datepickerInput.nativeElement.disabled = true;
        this.datepickerInput.nativeElement.value = "";
        this.datepickerBtn.nativeElement.disabled = true;
      }     
    } else if (Object.keys(selectedAnnotation).length == 0 && !this.datepickerInput.nativeElement.disabled) {
      this.datepickerInput.nativeElement.disabled = true;
      this.datepickerInput.nativeElement.value = "";
      this.datepickerBtn.nativeElement.disabled = true;
    }
  }

  dateOptions = {
    formatYear: 'yy',
    startingDay: 1
  };

  format = 'MM/dd/yyyy 00:00:00 UTC';

  addAttribute(type, attribute) { 
    var selectedAnnotation = this.TextWidgetAPI.getSelectedAnnotation();
    if (Object.keys(selectedAnnotation).length > 0) {
      var updatedAnnotation = _.cloneDeep(selectedAnnotation);
      updatedAnnotation.type = type;

      var selectedAnnotationAttribute = _.where(updatedAnnotation.attributes, { name : this.annotationAttribute })[0];
      var attributeIndex = updatedAnnotation.attributes.indexOf(selectedAnnotationAttribute);

      if (attributeIndex > -1 && this.dt == null)       //if date cleared, remove the attribute
        updatedAnnotation.attributes.splice(attributeIndex, 1);
      else if (attributeIndex > -1 && this.dt != null)  //update the existing value of the specific attribute
        updatedAnnotation.attributes[attributeIndex].value = this.pipe.transform(this.dt,this.format);//$filter('date')($scope.dt, $scope.format);
      else                                                //format date and add it to the annotation atrributes 
        updatedAnnotation.attributes.push({ name : this.annotationAttribute, 
                                            value: this.pipe.transform(this.dt,this.format) }); 

      this.tempAnnotationService.update(updatedAnnotation)
      .then(function(data){
        this.TextWidgetAPI.updateAnnotation(updatedAnnotation, true);
      }, function(error){
          this.dialog.open(ErrorDialogComponent, { data: new ConfirmDialogData("Error", "Error in update Annotation. Please refresh the page and try again") });
      });
             
      return false;
    }
  }

}
