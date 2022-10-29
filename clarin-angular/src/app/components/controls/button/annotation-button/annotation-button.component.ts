import { Component, ElementRef, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import * as _ from 'lodash';
import { ErrorDialogComponent } from 'src/app/components/dialogs/error-dialog/error-dialog.component';
import { ConfirmDialogData } from 'src/app/models/dialogs/confirm-dialog';
import { BaseControlComponent } from '../../base-control/base-control.component';
import { AnnotationMode, Selection } from 'src/app/models/selection';

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
  @Input() customAttribute;
  disabled = false;

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

    if (Object.keys(selectedAnnotation).length > 0) {
      //if selected annotation is not empty 
      /* var selectedAnnotationAttribute = _.where(selectedAnnotation.attributes, {
        name: this.annotationAttribute,
        value: this.annotationValue
      })[0]; */
      // Check if the selected annotation has the same type as this button...
      if (selectedAnnotation.type !== this.annotationType) {
        // We cannot handle this annotation!
        if (!this.disabled) {this.disabled = true;}
        return;
      }
      if (this.disabled) {this.disabled = false;}

      var selectedAnnotationAttribute = selectedAnnotation.attributes.find(attr =>
        attr.name === this.annotationAttribute &&
        attr.value === this.annotationValue
      );
      var attributeIndex = -1;

      if (!(typeof (selectedAnnotationAttribute) == "undefined" || !selectedAnnotationAttribute)) {
        attributeIndex = selectedAnnotation.attributes.indexOf(selectedAnnotationAttribute);
      }

      if (attributeIndex > -1 && !this.element.classList.contains('active')) {
        // if the element has the same attribute and it is not active 
        this.element.classList.add('active');
        this.element.setAttribute("style", "color:" + this.fgColor);
        this.element.setAttribute("style", "background:" + this.bgColor);
      } else if (attributeIndex < 0 && this.element.classList.contains('active')) {
        // if the element has different attribute and it is active
        this.element.classList.remove('active');
        this.element.setAttribute("style", "color:#333");
        this.element.setAttribute("style", "background:#fff");
      }
    } else if (Object.keys(selectedAnnotation).length == 0) {
      if (this.disabled) {this.disabled = false;}
      if (this.element.classList.contains('active')) {
        //if selected annotation is empty and the specific element is active
        this.element.classList.remove('active');
        this.element.setAttribute("style", "color:#333");
        this.element.setAttribute("style", "background:#fff");
      }
    }
  }

  addAnnotation(annotationType, annotationAttribute, annotationValue) {
    /*        if(TextWidgetAPI.isRunning())
              return false;*/
    // console.error("AnnotationButtonComponent: addAnnotation():", annotationType, annotationAttribute, annotationValue);
    //if the user has already selected an annotation, update it
    var selectedAnnotation: any = this.TextWidgetAPI.getSelectedAnnotation();
    // console.error("Selected Annotation:", selectedAnnotation);
    var newAttribute = {
      name: annotationAttribute,
      value: annotationValue
    };
    if (typeof this.customAttribute != "undefined") {
      // This is a custom annotation button, preserve its label...
      newAttribute["label"] = this.customAttribute
    }

    if (Object.keys(selectedAnnotation).length > 0) {
      selectedAnnotation.type = annotationType;

      // search for the selected attribute inside the annotation
      // var selectedAnnotationAttribute = _.where(selectedAnnotation.attributes, { name: annotationAttribute })[0];
      var selectedAnnotationAttribute = selectedAnnotation.attributes.find(attr => attr.name === annotationAttribute);

      if (typeof (selectedAnnotationAttribute) == "undefined")
        //the specific attribute does not exist in the current annotation, so add it 
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

    // If there is selected text/image rectangle, add new annotation...
    var currentSelection: Selection | any = this.TextWidgetAPI.getCurrentSelection();
    // console.error("AnnotationButtonComponent: addAnnotation(): Selected Region:", currentSelection);

    if ("type" in currentSelection && currentSelection.type != null) {
      var currentDocument: any = this.TextWidgetAPI.getCurrentDocument();
      var newAnnotation = newAnnotation = {
          _id: this.ObjectId().toString(),
          document_id: currentDocument.id,
          collection_id: currentDocument.collection_id,
          annotator_id: currentDocument.annotator_id,
          type: annotationType,
          spans: [],
          attributes: [newAttribute]
        };
      switch (currentSelection.mode) {
        case AnnotationMode.TEXT:
          newAnnotation.spans = [{
            type: "text",
            segment: currentSelection.segment,
            start: currentSelection.startOffset,
            end: currentSelection.endOffset
          }];
          break;
        case AnnotationMode.IMAGE:
          newAnnotation.spans = [{
            type: currentSelection.type,
            segment: "",
            start: -1,
            end: -1,
            x: currentSelection.x,
            y: currentSelection.y,
            width: currentSelection.width,
            height: currentSelection.height,
            rotation: currentSelection.rotation
          }];
          break;
        case AnnotationMode.AUDIO:
        case AnnotationMode.VIDEO:
          newAnnotation.spans = [{
            type:    currentSelection.type,
            segment: "",
            start:   currentSelection.startOffset,
            end:     currentSelection.endOffset
          }];
          break;
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
      // console.log("empty");
    }
  }
}
