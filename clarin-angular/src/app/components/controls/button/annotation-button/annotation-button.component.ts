import { Component, ElementRef, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { BaseControlComponent } from '../../base-control/base-control.component';
import * as _ from 'lodash';
import { ErrorDialogComponent } from 'src/app/components/dialogs/error-dialog/error-dialog.component';
import { ConfirmDialogData } from 'src/app/models/dialogs/confirm-dialog';
import { element } from 'protractor';

@Component({
  selector: 'annotation-button',
  templateUrl: './annotation-button.component.html',
  styleUrls: ['./annotation-button.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AnnotationButtonComponent extends BaseControlComponent implements OnInit {

  @ViewChild('btn', { static: true }) el: ElementRef<HTMLButtonElement>;
  element: HTMLButtonElement;

  @Input() buttonTooltip;
  @Input() label;

  super() { }

  ngOnInit(): void {
    this.element = this.el.nativeElement;
    this.buttonColorService.addColorCombination({
      value: this.annotationValue, bg_color: this.bgColor, fg_color: this.fgColor,
      colour_background: this.colourBackground, colour_font: this.colourFont,
      colour_border: this.colourBorder, colour_selected_background: this.colourSelectedBackground
    });

    //if IE add button color
    var ua = window.navigator.userAgent;
    if (ua.indexOf("MSIE ") > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./))
      this.element.querySelector('i').setAttribute('color', this.bgColor);

    //register callbacks for the annotation list and the selected annotation
    this.TextWidgetAPI.registerSelectedAnnotationCallback(this.updateSelectedAnnotationButton.bind(this));
  }

  updateSelectedAnnotationButton() {
    var selectedAnnotation: any = this.TextWidgetAPI.getSelectedAnnotation();

    if (Object.keys(selectedAnnotation).length > 0) { //if selected annotation is not empty 
      /* var selectedAnnotationAttribute = _.where(selectedAnnotation.attributes, {
        name: this.annotationAttribute,
        value: this.annotationValue
      })[0]; */
      var selectedAnnotationAttribute = selectedAnnotation.attributes.find(attr =>
        attr.name === this.annotationAttribute &&
        attr.value === this.annotationValue
      );

      if(typeof(selectedAnnotationAttribute) == "undefined" || !selectedAnnotationAttribute){
        return;
      }

      var attributeIndex = selectedAnnotation.attributes.indexOf(selectedAnnotationAttribute);

      if (attributeIndex > -1 && !this.element.classList.contains('active')) {       //if the element has the same attribute and it is not active 
        this.element.classList.add('active');
        this.element.setAttribute("style","color:"+this.fgColor);
        this.element.setAttribute("style","background:"+this.bgColor);
      } else if (attributeIndex < 0 && this.element.classList.contains('active')) {     //if the element has different attribute and it is active
        this.element.classList.remove('active');
        this.element.setAttribute("style","color:#333");
        this.element.setAttribute("style","background:#fff");
      }
    } else if (Object.keys(selectedAnnotation).length == 0 && this.element.classList.contains('active')) {  //if selected annotation is empty and the specific element is active
      this.element.classList.remove('active');
      this.element.setAttribute("style","color:#333");
      this.element.setAttribute("style","background:#fff");
    }
  }

  addAnnotation(annotationType, annotationAttribute, annotationValue) {
    /*        if(TextWidgetAPI.isRunning())
              return false;*/
    var selectedAnnotation: any = this.TextWidgetAPI.getSelectedAnnotation();     //if the user has already selected an annotation, update it

    if (Object.keys(selectedAnnotation).length > 0) {
      selectedAnnotation.type = annotationType;

      //search for the selected attribute inside the annotation
      // var selectedAnnotationAttribute = _.where(selectedAnnotation.attributes, { name: annotationAttribute })[0];
      var selectedAnnotationAttribute = selectedAnnotation.attributes.find(attr => attr.name === annotationAttribute);
      var newAttribute = {
        name: annotationAttribute,
        value: annotationValue
      };

      if (typeof (selectedAnnotationAttribute) == "undefined")     //the specific attribute does not exist in the current annotation, so add it 
        selectedAnnotation.attributes.push(newAttribute);
      else {                                                    //the specific attribute exists in the current annotation, so update it 
        var index = selectedAnnotation.attributes.indexOf(selectedAnnotationAttribute);
        selectedAnnotation.attributes[index] = _.cloneDeep(newAttribute);
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
        _id: this.ObjectId().toString(),
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
