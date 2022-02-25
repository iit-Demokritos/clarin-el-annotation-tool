import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';
import { ErrorDialogComponent } from 'src/app/components/dialogs/error-dialog/error-dialog.component';
import { ConfirmDialogData } from 'src/app/models/dialogs/confirm-dialog';
import { BaseControlComponent } from '../../base-control/base-control.component';
import { AttributeValueMemory, AttributeValueMemoryValue } from 'src/app/models/services/message';

@Component({
  selector: 'coref-annotate-btn',
  templateUrl: './coref-annotate-btn.component.html',
  styleUrls: ['./coref-annotate-btn.component.scss']
})
export class CorefAnnotateBtnComponent extends BaseControlComponent implements OnInit {

  super() { }

  ngOnInit(): void {
    //register callbacks for the selected annotation
    this.TextWidgetAPI.registerSelectedAnnotationCallback(this.annotationSelectionUpdate.bind(this));
  }

  addAnnotation() { //save the annotation to the db
    var currentDocument:  any = this.TextWidgetAPI.getCurrentDocument();
    var validationResult: any = this.validateAnnotation();

    if (validationResult.valid) { //if the annotation is valid save it
      this.tempAnnotationService.save(currentDocument.collection_id, currentDocument.id, validationResult.annotation)
        .then((response: any) => {
          if (response.success)
            this.TextWidgetAPI.addAnnotation(validationResult.annotation, false);
          else {
            this.dialog.open(ErrorDialogComponent, { data: new ConfirmDialogData("Error", "Error during saving your annotation. Please refresh the page and try again.") })
          }
        }, function (error) {
          this.dialog.open(ErrorDialogComponent, { data: new ConfirmDialogData("Error", "Database error. Please refresh the page and try again.") })
        });
    }
  };

  updateAnnotation() { //update current annotation
    var validationResult = this.validateAnnotation();

    var selectedAnnotation: any = (this.TextWidgetAPI.getSelectedAnnotation());

    //  if the user has already selected an annotation, update it
    if (Object.keys(selectedAnnotation).length > 0 && validationResult.valid) {
      selectedAnnotation.type = this.annotationType;

      // If the spans have changed
      if (selectedAnnotation.spans != validationResult.annotation.spans) {
        // assign the updated annotation spans to the existing annotation 
        selectedAnnotation.spans = validationResult.annotation.spans;
      }

      if (selectedAnnotation.attributes != validationResult.annotation.attributes) {
        selectedAnnotation.attributes = validationResult.annotation.attributes;
      }

      // // iterate through all the attributes of the annotation that returned from validation
      // for (var i = 0; i < validationResult.annotation.attributes.length; i++) {
      //   var selectedAnnotationAttribute = selectedAnnotation.attributes.find(attr =>
      //     attr.name === validationResult.annotation.attributes[i].name);

      //   // The specific attribute does not exist in the current annotation, so add it 
      //   if (typeof (selectedAnnotationAttribute) != "undefined") {
      //     selectedAnnotation.attributes.push(validationResult.annotation.attributes[i]);
      //   } else {
      //     // Tthe specific attribute exists in the current annotation, so update it 
      //     var index = selectedAnnotation.attributes.indexOf(selectedAnnotationAttribute);
      //     selectedAnnotation.attributes[index] = _.cloneDeep(validationResult.annotation.attributes[i]);
      //   }
      // }
      this.tempAnnotationService.update(selectedAnnotation)
        .then((data) => {
          this.TextWidgetAPI.updateAnnotation(selectedAnnotation, false);
        }, (error) => {
          this.dialog.open(ErrorDialogComponent, { data: new ConfirmDialogData("Error", "Error in update Annotation. Please refresh the page and try again") })
        });
    }
  }

  showAnnotateBtn = true;

  validateAnnotation(): any {
    var result: any = { valid: true, annotation: {} };

    var selectedAnnotation: any = this.TextWidgetAPI.getSelectedAnnotation();
    if (Object.keys(selectedAnnotation).length == 0) {
      var currentDocument: any = this.TextWidgetAPI.getCurrentDocument();
      result.annotation = {
        _id:           this.ObjectId().toString(),
        document_id:   currentDocument.id,
        collection_id: currentDocument.collection_id,
        annotator_id:  currentDocument.annotator_id,
        type:          this.annotationType,
        spans:         [],
        attributes:    []
      };
    } else {
      // result.annotation = _.cloneDeep(selectedAnnotation);
      result.annotation = {...selectedAnnotation};
      result.annotation["spans"] = [];
      result.annotation["attributes"] = [];
      if (result.annotation.type != this.annotationType) {
        result.valid = false;
        return result;
      }
    }

    var data = this.messageService.attributeValueMemoryGet(this.annotationType);

    // Iterate over all attributes...
    for (const [k, v] of Object.entries(data)) {
      // Is this a segment? coref-segment-entry
      if (("start" in v) && ("end" in v) && ("segment" in v)) {
        result.annotation.spans.push({ segment: v["segment"], start: v["start"], end: v["end"]});
        result.annotation.attributes.push({name: k, value: v["start"] + " " + v["end"]});
      } else if (("value" in v)) {
        // coref-btn
        result.annotation.attributes.push({name: k, value: v["value"]});
      }
      // coref-multi-entry
      // coref-entry
      // coref-combobox
      // coref-checkbox
    }
   

//    tableRows.forEach(value => {
//      if (value.querySelectorAll('.coref-segment-entry').length > 0) { //if row contains coreference annotation segment entry
//        var startOffset = -1,
//          endOffset = -1;
//        var corefSegmentElement = value.querySelector('.coref-segment-entry');
//        var elementIdNumber = corefSegmentElement.getAttribute('id').match(/\d+/)[0];
//        var segment = corefSegmentElement.innerHTML;
//
//        if (segment.length > 0 && document.querySelectorAll("#x_s" + elementIdNumber).length && document.querySelectorAll("#x_e" + elementIdNumber).length) { //if segment has segment, startOffset and endOffset
//          startOffset = parseInt(document.querySelector("#x_s" + elementIdNumber).innerHTML.trim());
//          endOffset = parseInt(document.querySelector("#x_e" + elementIdNumber).innerHTML.trim());
//
//          var annotationSpan = {
//            segment: segment,
//            start: startOffset,
//            end: endOffset
//          };
//
//          result.annotation.spans.push(annotationSpan);
//          result.annotation.attributes.push({
//            name: corefSegmentElement.getAttribute('annotation-attribute'),
//            value: annotationSpan.start + " " + annotationSpan.end
//          });
//        } else { //validation section 
//          //result.valid = false;
//          result.annotation.attributes.push({
//            name: corefSegmentElement.getAttribute('annotation-attribute'),
//            value: ""
//          });
//        }
//      } else if (value.querySelectorAll('.coref-multi-entry').length > 0) { //if row contains coreference annotation segment entry
//        var startOffset = -1,
//          endOffset = -1;
//        var corefMultiElement = value.querySelector('.coref-multi-entry');
//        var elementIdNumber = corefMultiElement.getAttribute('id').match(/\d+/)[0];
//        var segment = corefMultiElement.innerHTML;
//
//        if (segment.length > 0 && document.querySelectorAll("#x_s" + elementIdNumber).length && document.querySelectorAll("#x_e" + elementIdNumber).length) { //if segment has segment, startOffset and endOffset
//          startOffset = parseInt(document.querySelector("#x_s" + elementIdNumber).innerHTML.trim());
//          endOffset = parseInt(document.querySelector("#x_e" + elementIdNumber).innerHTML.trim());
//
//          var annotationSpan = {
//            segment: segment,
//            start: startOffset,
//            end: endOffset
//          };
//
//          result.annotation.spans.push(annotationSpan);
//          result.annotation.attributes.push({
//            name: corefMultiElement.getAttribute('annotation-attribute'),
//            value: annotationSpan.start + " " + annotationSpan.end
//          });
//        } else { //validation section 
//          //result.valid = false;
//          result.annotation.attributes.push({
//            name: corefMultiElement.getAttribute('annotation-attribute'),
//            value: ""
//          });
//        }
//      } else if (value.querySelectorAll('.coref-entry').length > 0) { //if row contains coreference text entry
//        var corefEntryElement = value.querySelector('.coref-entry');
//        var segment = corefEntryElement.innerHTML;
//
//        if (segment.length > 0) {
//          result.annotation.attributes.push({
//            name: corefEntryElement.getAttribute('annotation-attribute'),
//            value: segment
//          });
//        } else { //validation section
//          //result.valid = false; 
//          result.annotation.attributes.push({
//            name: corefEntryElement.getAttribute('annotation-attribute'),
//            value: ""
//          });
//        }
//      } else if (value.querySelectorAll('.coref-combobox').length > 0) { //if row contains coreference combobox
//        var corefComboboxElement = document.querySelector('.coref-combobox');
//        var comboboxValue = corefComboboxElement.querySelector('option:selected').innerHTML;
//
//        if (comboboxValue != "") {
//          result.annotation.attributes.push({
//            name: corefComboboxElement.getAttribute('annotation-attribute'),
//            value: comboboxValue
//          });
//        } else { //validation section 
//          //result.valid = false; 
//          result.annotation.attributes.push({
//            name: corefComboboxElement.getAttribute('annotation-attribute'),
//            value: ""
//          });
//        }
//      } else if (value.querySelectorAll('.coref-checkbox').length > 0) { //if row contains coreference checkbox 
//        var corefCheckboxElement = value.querySelector('.coref-checkbox');
//        var corefCheckboxInputElement = corefCheckboxElement.querySelector('input');
//
//        if (corefCheckboxInputElement.checked) {
//          result.annotation.attributes.push({
//            name: corefCheckboxElement.getAttribute('annotation-attribute'),
//            value: 1
//          });
//        } else {
//          result.annotation.attributes.push({
//            name: corefCheckboxElement.getAttribute('annotation-attribute'),
//            value: 0
//          });
//        }
//      } else if (value.querySelectorAll('.coref-btn.active').length > 0) { //if row contains coreference checkbox
//        var corefBtnElement = value.querySelector('.coref-btn.active');
//        result.annotation.attributes.push({
//          name: corefBtnElement.getAttribute('annotation-attribute'),
//          value: corefBtnElement.getAttribute('annotation-value')
//        });
//
//        corefBtnElement.classList.remove('active');
//        corefBtnElement.setAttribute("style", "color:#333");
//        corefBtnElement.setAttribute("style", "background:#fff");
//      }
//    });

    if (result.annotation.spans.length == 0) {
      result.valid = false;
    }

    return result;
  }; /* validateAnnotation */

  annotationSelectionUpdate() {
    var selectedAnnotation = this.TextWidgetAPI.getSelectedAnnotation();

    if (Object.keys(selectedAnnotation).length == 0) {
      //selected annotation exists
      this.showAnnotateBtn = true;
    } else {
      //selected annotation not empty
      this.showAnnotateBtn = false;
    }
  }

}
