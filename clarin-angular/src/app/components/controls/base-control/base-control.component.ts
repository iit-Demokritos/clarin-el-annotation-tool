import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ValueAccessorComponent } from '../value-accessor/value-accessor.component';
import { Message } from 'src/app/models/services/message';
import { Subscription } from 'rxjs';
import { ErrorDialogComponent } from 'src/app/components/dialogs/error-dialog/error-dialog.component';
import { ConfirmDialogData } from 'src/app/models/dialogs/confirm-dialog';
import { AnnotationMode, Selection } from 'src/app/models/selection';
import * as _ from 'lodash';

@Component({
  selector: 'base-control',
  templateUrl: './base-control.component.html',
  styleUrls: ['./base-control.component.scss']
})
export class BaseControlComponent extends ValueAccessorComponent<any> implements OnInit, OnDestroy {

  @Input() id;
  @Input() annotationType;
  @Input() annotationAttribute;
  @Input() annotationValue;
  @Input() annotationArgumentAnnotation;
  @Input() annotationArgumentAttribute;
  @Input() annotationArgumentValues;
  @Input() annotationRelationType;
  @Input() annotationRelationAttribute;
  @Input() annotationRelationValue;

  @Input() bgColor;
  @Input() fgColor;
  @Input() colourBackground;
  @Input() colourBorder;
  @Input() colourSelectedBackground;
  @Input() colourFont;
  @Input() readonly;

  @Input() annotationRelationWidgetId;
  @Input() annotationWidgetIds;

  @Input() cols;

  // We do not use these, but they may exist in annotation schemes,
  // and Angular will complain...
  @Input() textvariable;
  @Input() groupType;

  n = require("bson-objectid");

  messagesSubscriptions: Subscription[] = [];

  super() { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    // prevent memory leaks when component destroyed
    this.messagesSubscriptions.forEach(subscription => subscription.unsubscribe());
  }

  ObjectId() {
    /* WARNING: If this function changes, the change must be also reflected
     * in CollectionImportService (app/services/collection-import-service)
     * and in AnnotationComponent (app/components/views/annotation) */
    // var n = require("bson-objectid");

    //if (this.n === undefined) {
    //  this.n = require("bson-objectid");
    //}
    return this.n();

    //return Guid.newGuid();
  }

  messagesSubscribe() {
    this.messagesSubscriptions.push(
      this.messageService.messageAdded$.subscribe(message => this.onMessageAdded(message))
    );
  }

  onMessageAdded(message: Message) {
  }

  getSelectedAnnotation() {
    var selectedAnnotation: any = this.TextWidgetAPI.getSelectedAnnotation();
    if (Object.keys(selectedAnnotation).length > 0) {
      return selectedAnnotation;
    }
    return undefined;
  }; /* getSelectedAnnotation */

  getSelectedAnnotationAttribute() {
    var selectedAnnotation: any = this.getSelectedAnnotation();
    if (selectedAnnotation !== undefined) {
      // Check if the selected annotation has the same type as this button...
      if (selectedAnnotation.type !== this.annotationType) {
        // We cannot handle this annotation!
        return undefined;
      }

      return selectedAnnotation.attributes.find(attr =>
        attr.name === this.annotationAttribute
      );
    }
    return undefined;
  }; /* getSelectedAnnotationAttribute */

  addOrUpdateAnnotation(annotationType, annotationAttribute, annotationValue) {
    // console.error("BaseControlComponent(): addOrUpdateAnnotation():", annotationType, annotationAttribute, annotationValue);
    var selectedAnnotation: any = this.TextWidgetAPI.getSelectedAnnotation();
    // console.error("Selected Annotation:", selectedAnnotation);
    var newAttribute = {
      name:  annotationAttribute,
      value: annotationValue
    };
    if ('customAttribute' in this) {
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
      else {
        // The specific attribute exists in the current annotation, so update it
        var index = selectedAnnotation.attributes.indexOf(selectedAnnotationAttribute);
        // Is the value actually different?
        if (selectedAnnotation.attributes[index].name  == annotationAttribute &&
            selectedAnnotation.attributes[index].value == annotationValue) {
          // Nothing to do...
          // console.error("BaseControlComponent(): addOrUpdateAnnotation(): NOTHING TO DO!", annotationType, annotationAttribute, annotationValue);
          return false;
        }
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
      var newAnnotation = {
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
  }; /* addOrUpdateAnnotation */
}
