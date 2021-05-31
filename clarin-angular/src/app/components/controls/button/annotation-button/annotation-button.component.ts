import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { BaseControlComponent } from '../../base-control/base-control.component';
import { cloneDeep, findWhere, indexOf, where, contains } from "lodash";
import { ErrorDialogComponent } from 'src/app/components/dialogs/error-dialog/error-dialog.component';
import { ConfirmDialogData } from 'src/app/models/dialogs/confirm-dialog';
import { element } from 'protractor';

@Component({
  selector: 'annotation-button',
  templateUrl: './annotation-button.component.html',
  styleUrls: ['./annotation-button.component.scss']
})
export class AnnotationButtonComponent extends BaseControlComponent implements OnInit {

  @ViewChild('btn') el: ElementRef;
  element:any;

  @Input() buttonTooltip;
  @Input() label;

  super() { }

  ngOnInit(): void {
    this.element = this.el.nativeElement;

    this.buttonColorService.addColorCombination({value:this.annotationValue, bg_color:this.bgColor, fg_color:this.fgColor,
      colour_background:this.colourBackground, colour_font:this.colourFont,
      colour_border:this.colourBorder, colour_selected_background:this.colourSelectedBackground});

//if IE add button color
var ua = window.navigator.userAgent;
if (ua.indexOf("MSIE ") > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./))
this.element.find('i').css('color', this.bgColor);

var updateSelectedAnnotationButton = function () {
var selectedAnnotation = this.TextWidgetAPI.getSelectedAnnotation();   

if (Object.keys(selectedAnnotation).length > 0) { //if selected annotation is not empty 
var selectedAnnotationAttribute = where(selectedAnnotation.attributes, { name: this.annotationAttribute, 
                                                                  value: this.annotationValue })[0];

var attributeIndex = selectedAnnotation.attributes.indexOf(selectedAnnotationAttribute);

if (attributeIndex > -1 && !this.element.hasClass('active')) {       //if the element has the same attribute and it is not active 
  this.element.addClass('active'); 
  this.element.css('color', this.fgColor);
  this.element.css('background', this.bgColor);
} else if (attributeIndex < 0 && this.element.hasClass('active')) {     //if the element has different attribute and it is active
  this.element.removeClass('active');
  this.element.css('color', '#333');
  this.element.css('background', '#fff'); 
}
} else if (Object.keys(selectedAnnotation).length == 0 && this.element.hasClass('active')) {  //if selected annotation is empty and the specific element is active
  this.element.removeClass('active');
  this.element.css('color', '#333');
  this.element.css('background', '#fff');
}
}

//register callbacks for the annotation list and the selected annotation
this.TextWidgetAPI.registerSelectedAnnotationCallback(updateSelectedAnnotationButton);
  }

  addAnnotation(annotationType, annotationAttribute, annotationValue) {
    /*        if(TextWidgetAPI.isRunning())
              return false;*/
    var selectedAnnotation: any = this.TextWidgetAPI.getSelectedAnnotation();     //if the user has already selected an annotation, update it

    if (Object.keys(selectedAnnotation).length > 0) {
      selectedAnnotation.type = annotationType;

      //search for the selected attribute inside the annotation
      var selectedAnnotationAttribute = where(selectedAnnotation.attributes, { name: annotationAttribute })[0];
      var newAttribute = {
        name: annotationAttribute,
        value: annotationValue
      };

      if (typeof (selectedAnnotationAttribute) == "undefined")     //the specific attribute does not exist in the current annotation, so add it 
        selectedAnnotation.attributes.push(newAttribute);
      else {                                                    //the specific attribute exists in the current annotation, so update it 
        var index = selectedAnnotation.attributes.indexOf(selectedAnnotationAttribute);
        selectedAnnotation.attributes[index] = cloneDeep(newAttribute);
      }

      this.tempAnnotationService.update(selectedAnnotation)
        .then((data) => {
          this.TextWidgetAPI.updateAnnotation(selectedAnnotation, true);
        }, (error) => {
          this.dialog.open(ErrorDialogComponent, { data: new ConfirmDialogData("Error", "Error in update Annotation. Please refresh the page and try again") })
        });

      return false;
    }

    //if their is selected text, add new annotation
    var currentSelection: any = this.TextWidgetAPI.getCurrentSelection();

    if (typeof (currentSelection) != "undefined" && Object.keys(currentSelection).length > 0 && currentSelection.segment.length > 0) {
      var currentDocument: any = this.TextWidgetAPI.getCurrentDocument();
      var newAnnotation = {
        //TODO : _id: new ObjectId().toString(),
        document_id: currentDocument.id,
        collection_id: currentDocument.collection_id,
        annotator_id: currentDocument.annotator_id,
        type: annotationType,
        spans: [{
          segment: currentSelection.segment,
          start: currentSelection.startOffset,
          end: currentSelection.endOffset
        }],
        attributes: [{
          name: annotationAttribute,
          value: annotationValue
        }]
      };

      //newAnnotation.spans.push(annotationSpan);
      //newAnnotation.attributes.push(newAttribute);                        //remove if no need

      this.tempAnnotationService.save(currentDocument.collection_id, currentDocument.id, newAnnotation)
        .then((response: any) => {
          if (response.success) {
            this.TextWidgetAPI.addAnnotation(newAnnotation, true);
          } else {
            this.dialog.open(ErrorDialogComponent, { data: new ConfirmDialogData("Error", "Error during saving your annotation. Please refresh the page and try again.") })
          }
        }, (error) => {
          this.dialog.open(ErrorDialogComponent, { data: new ConfirmDialogData("Error", "Database error. Please refresh the page and try again.") })
        });
    } else {
      this.TextWidgetAPI.clearSelection();
      this.TextWidgetAPI.clearSelectedAnnotation();
      console.log("empty");
    }
  }
}