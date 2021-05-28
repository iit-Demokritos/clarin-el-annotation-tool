import { Component, OnInit } from '@angular/core';
import { ErrorDialogComponent } from 'src/app/components/dialogs/error-dialog/error-dialog.component';
import { ConfirmDialogData } from 'src/app/models/dialogs/confirm-dialog';
import { BaseControlComponent } from '../../base-control/base-control.component';
import { cloneDeep, findWhere,indexOf,where,contains } from "lodash";

@Component({
  selector: 'coref-annotate-btn',
  templateUrl: './coref-annotate-btn.component.html',
  styleUrls: ['./coref-annotate-btn.component.scss']
})
export class CorefAnnotateBtnComponent extends BaseControlComponent implements OnInit {

  super() { }

  ngOnInit(): void {
    
      //register callbacks for the selected annotation
      this.TextWidgetAPI.registerSelectedAnnotationCallback(this.annotationSelectionUpdate);
  }

  addAnnotation() { //save the annotation to the db
    var currentDocument:any = this.TextWidgetAPI.getCurrentDocument();
    var validationResult:any = this.validateAnnotation();

    if (validationResult.valid) { //if the annotation is valid save it
      this.tempAnnotationService.save(currentDocument.collection_id, currentDocument.id, validationResult.annotation)
        .then((response:any)=> {
          if (response.success)
            this.TextWidgetAPI.addAnnotation(validationResult.annotation, false);
          else {
            this.dialog.open(ErrorDialogComponent, { data: new ConfirmDialogData("Error", "Error during saving your annotation. Please refresh the page and try again.") })
          }
        }, function(error) {
          this.dialog.open(ErrorDialogComponent, { data: new ConfirmDialogData("Error", "Database error. Please refresh the page and try again.") })
        });
    }
  };

  updateAnnotation(){ //update current annotation
    var validationResult =  this.validateAnnotation();
    var selectedAnnotation:any = (this.TextWidgetAPI.getSelectedAnnotation());

    if (Object.keys(selectedAnnotation).length > 0 && validationResult.valid) { //if the user has already selected an annotation, update it
      selectedAnnotation.type = this.annotationType;

      if (selectedAnnotation.spans != validationResult.annotation.spans) //if the spans have changed
        selectedAnnotation.spans = cloneDeep(validationResult.annotation.spans); //assign the updated annotation spans to the existing annotation 

      for (var i = 0; i < validationResult.annotation.attributes.length; i++) { //iterate through all the attributes of the annotation that returned from validation
        var selectedAnnotationAttribute = where(selectedAnnotation.attributes, {
          name: validationResult.annotation.attributes[i].name
        })[0];

        if (typeof(selectedAnnotationAttribute) != "undefined") //the specific attribute does not exist in the current annotation, so add it 
          selectedAnnotation.attributes.push(validationResult.annotation.attributes[i]);
        else { //the specific attribute exists in the current annotation, so update it 
          var index = selectedAnnotation.attributes.indexOf(selectedAnnotationAttribute);
          selectedAnnotation.attributes[index] = cloneDeep(validationResult.annotation.attributes[i]);
        }
      }

      this.tempAnnotationService.update(selectedAnnotation)
        .then((data)=> {
            this.TextWidgetAPI.updateAnnotation(selectedAnnotation, false);
        },(error)=> {
          this.dialog.open(ErrorDialogComponent, { data: new ConfirmDialogData("Error", "Error in update Annotation. Please refresh the page and try again") })
        });
    }
  }

  showAnnotateBtn = true;

  validateAnnotation() {
        var result:any = {
          valid: true,
          annotation: {}
        };

        var tableRows = document.querySelectorAll('.button-widget-wrapper table tr'); //;$('.button-widget-wrapper table tr');
        var annotationType = document.querySelectorAll('.button-widget-wrapper table tr * [annotation-type]')[0].getAttribute("annotation-type");//.eq(0).attr("annotation-type");
        var selectedAnnotation:any = this.TextWidgetAPI.getSelectedAnnotation();

        if (Object.keys(selectedAnnotation).length == 0) {
          var currentDocument:any = this.TextWidgetAPI.getCurrentDocument();
          result.annotation = {
            //TODO: Get objectid lib _id: new ObjectId().toString(),
            document_id: currentDocument.id,
            collection_id: currentDocument.collection_id,
            annotator_id: currentDocument.annotator_id,
            type: annotationType,
            spans: [],
            attributes: []
          };
        } else {
          result.annotation = cloneDeep(selectedAnnotation);
          result.annotation["spans"] = [];
          result.annotation["attributes"] = [];
        }

        tableRows.forEach(value=>{
          if (value.querySelectorAll('.coref-segment-entry').length > 0) { //if row contains coreference annotation segment entry
            var startOffset = -1,
              endOffset = -1;
            var corefSegmentElement = value.querySelector('.coref-segment-entry');
            var elementIdNumber = corefSegmentElement.getAttribute('id').match(/\d+/)[0];
            var segment = corefSegmentElement.innerHTML;

            if (segment.length > 0 && document.querySelectorAll("#x_s" + elementIdNumber).length && document.querySelectorAll("#x_e" + elementIdNumber).length) { //if segment has segment, startOffset and endOffset
              startOffset = parseInt(document.querySelector("#x_s" + elementIdNumber).innerHTML.trim());
              endOffset = parseInt(document.querySelector("#x_e" + elementIdNumber).innerHTML.trim());

              var annotationSpan = {
                segment: segment,
                start: startOffset,
                end: endOffset
              };

              result.annotation.spans.push(annotationSpan);
              result.annotation.attributes.push({
                name: corefSegmentElement.getAttribute('annotation-attribute'),
                value: annotationSpan.start + " " + annotationSpan.end
              });
            } else { //validation section 
              //result.valid = false;
              result.annotation.attributes.push({
                name: corefSegmentElement.getAttribute('annotation-attribute'),
                value: ""
              });
            }
          } else if (value.querySelectorAll('.coref-multi-entry').length > 0) { //if row contains coreference annotation segment entry
            var startOffset = -1,
              endOffset = -1;
            var corefMultiElement = value.querySelector('.coref-multi-entry');
            var elementIdNumber = corefMultiElement.getAttribute('id').match(/\d+/)[0];
            var segment = corefMultiElement.innerHTML;

            if (segment.length > 0 && document.querySelectorAll("#x_s" + elementIdNumber).length && document.querySelectorAll("#x_e" + elementIdNumber).length) { //if segment has segment, startOffset and endOffset
              startOffset = parseInt(document.querySelector("#x_s" + elementIdNumber).innerHTML.trim());
              endOffset = parseInt(document.querySelector("#x_e" + elementIdNumber).innerHTML.trim());

              var annotationSpan = {
                segment: segment,
                start: startOffset,
                end: endOffset
              };

              result.annotation.spans.push(annotationSpan);
              result.annotation.attributes.push({
                name: corefMultiElement.getAttribute('annotation-attribute'),
                value: annotationSpan.start + " " + annotationSpan.end
              });
            } else { //validation section 
              //result.valid = false;
              result.annotation.attributes.push({
                name: corefMultiElement.getAttribute('annotation-attribute'),
                value: ""
              });
            }
          } else if (value.querySelectorAll('.coref-entry').length > 0) { //if row contains coreference text entry
            var corefEntryElement = value.querySelector('.coref-entry');
            var segment = corefEntryElement.innerHTML;

            if (segment.length > 0) {
              result.annotation.attributes.push({
                name: corefEntryElement.getAttribute('annotation-attribute'),
                value: segment
              });
            } else { //validation section
              //result.valid = false; 
              result.annotation.attributes.push({
                name: corefEntryElement.getAttribute('annotation-attribute'),
                value: ""
              });
            }
          } else if (value.querySelectorAll('.coref-combobox').length > 0) { //if row contains coreference combobox
            var corefComboboxElement = document.querySelector('.coref-combobox');
            var comboboxValue = corefComboboxElement.querySelector('option:selected').innerHTML;

            if (comboboxValue != "") {
              result.annotation.attributes.push({
                name: corefComboboxElement.getAttribute('annotation-attribute'),
                value: comboboxValue
              });
            } else { //validation section 
              //result.valid = false; 
              result.annotation.attributes.push({
                name: corefComboboxElement.getAttribute('annotation-attribute'),
                value: ""
              });
            }
          } else if (value.querySelectorAll('.coref-checkbox').length > 0) { //if row contains coreference checkbox 
            var corefCheckboxElement = value.querySelector('.coref-checkbox');
            var corefCheckboxInputElement = corefCheckboxElement.querySelector('input');

            if (corefCheckboxInputElement.checked) {
              result.annotation.attributes.push({
                name: corefCheckboxElement.getAttribute('annotation-attribute'),
                value: 1
              });
            } else {
              result.annotation.attributes.push({
                name: corefCheckboxElement.getAttribute('annotation-attribute'),
                value: 0
              });
            }
          } else if (value.querySelectorAll('.coref-btn.active').length > 0) { //if row contains coreference checkbox
            var corefBtnElement = value.querySelector('.coref-btn.active');
            result.annotation.attributes.push({
              name: corefBtnElement.getAttribute('annotation-attribute'),
              value: corefBtnElement.getAttribute('annotation-value')
            });

            corefBtnElement.classList.remove('active');
            corefBtnElement.setAttribute("style","color:#333");
            corefBtnElement.setAttribute("style","background:#fff");
          }
        });

        if (result.annotation.spans.length == 0)
          result.valid = false;
        
        return result;
      };

      annotationSelectionUpdate() {
        var selectedAnnotation = this.TextWidgetAPI.getSelectedAnnotation();

        if (Object.keys(selectedAnnotation).length == 0) //selected annotation exists
          this.showAnnotateBtn = true;
        else //selected annotation not empty
          this.showAnnotateBtn = false;
      }

}
