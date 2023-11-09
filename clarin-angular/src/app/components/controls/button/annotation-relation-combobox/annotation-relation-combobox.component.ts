import { Component, Input, OnInit } from '@angular/core';
import { BaseControlComponent } from '../../base-control/base-control.component';
import { Message } from 'src/app/models/services/message';
import { MessageService } from 'src/app/services/message-service/message.service';
import { ErrorStateMatcher } from '@angular/material/core';
import { UntypedFormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  public errorState = false;

  isErrorState(control: UntypedFormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    return this.errorState;
  }
}

@Component({
  selector: 'annotation-relation-combobox',
  templateUrl: './annotation-relation-combobox.component.html',
  styleUrls: ['./annotation-relation-combobox.component.scss']
})
export class AnnotationRelationComboboxComponent extends BaseControlComponent implements OnInit {

  super() { }

  ngOnInit(): void {
    this.TextWidgetAPI.registerAnnotationSchemaCallback(this.schemaCallback.bind(this));
    // Make sure we register the callbacks when the component loads
    this.schemaCallback();
    // We want to receive messages, from AnnotationRelationImportBtnComponent components...
    this.messagesSubscribe();
  }

  annotations = [];
  annotationsInvalid = [];
  selectionOrigin = '';
  allowedValues = [];

  matcher = new MyErrorStateMatcher();

  /**
   * Get new annotations to show.
   */
  updateAnnotationList() {
    // Get annotations
    var annotations = this.TextWidgetAPI.getAnnotations();

    this.annotations = annotations.filter((annotation) => {
      // Check if the type is in the allowedValues
      return this.allowedValues.indexOf(this.TextWidgetAPI.getAnnotationAttributeValue(annotation, this.annotationArgumentAttribute)) !== -1;
    });
  }

  annotationSelected() {
    // Get the selected annotation
    var annotation: any = this.TextWidgetAPI.getSelectedAnnotation();
    this.matcher.errorState = false;
    if (this.annotationsInvalid.length) {
      this.annotationsInvalid = [];
    }
    // console.error("AnnotationRelationComboboxComponent: annotationSelected():", annotation);

    // Check if the selected annotation has the same type as this combobox
    if (annotation.type !== this.annotationType) {
      if (this.selectionOrigin != 'm') {
        this.value = '';
      }
      return;
    }
    this.selectionOrigin = '';

    // Check if this annotation concerns this combobox (same relation attribute value)
    var relationAttributeValue = this.TextWidgetAPI.getAnnotationAttributeValue(annotation, this.annotationRelationAttribute);

    if (relationAttributeValue !== this.annotationRelationValue) {
      this.value = '';
      return;
    }

    // Get the selected annotation ID from the attributes of the arrow annotation
    this.value = this.TextWidgetAPI.getAnnotationAttributeValue(annotation, this.annotationAttribute);
    // Is the value in the list of annotations?
    if (this.annotations.some((ann) => ann._id == this.value)) {
    } else {
      this.matcher.errorState = true;
      this.annotationsInvalid = [this.TextWidgetAPI.getAnnotationById(this.value)];
    }
  }

  // Register callback for annotation updates
  schemaCallback() {
    this.allowedValues = this.annotationArgumentValues.split(' ');
    this.TextWidgetAPI.registerAnnotationsCallback(this.updateAnnotationList.bind(this));
    this.TextWidgetAPI.registerSelectedAnnotationCallback(this.annotationSelected.bind(this));
    this.TextWidgetAPI.declareSchemaRelationValue(this.annotationType, this.annotationRelationAttribute,
                                                  this.annotationRelationValue, this.annotationAttribute, {
      annotationType: this.annotationType,
      annotationAttribute: this.annotationAttribute,
      annotationArgumentAnnotation: this.annotationArgumentAnnotation,
      annotationArgumentAttribute: this.annotationArgumentAttribute,
      annotationArgumentValues: this.allowedValues,
      annotationRelationType: this.annotationRelationType,
      annotationRelationAttribute: this.annotationRelationAttribute,
      annotationRelationValue: this.annotationRelationValue
    });
  }

  // Callback for messages...
  onMessageAdded(message: Message) {
    switch(message.name) {
      case MessageService.ANNOTATION_RELATION_COMBOBOX_SELECT_ANNOTATION: {
        if (message.value.element_id == this.id) {
          // console.error("AnnotationRelationComboboxComponent: onMessageAdded()", message, this);
          this.value = message.value.annotation_id;
          if (this.value != '') {
            this.selectionOrigin = 'm';
          }
        }
        break;
      }
    }
  }

  valueModified() {
    this.messageService.annotationRelationComboboxSet(this.id, this.value, this.annotationAttribute /* , {
      annotationType: this.annotationType,
      annotationAttribute: this.annotationAttribute,
      annotationArgumentAnnotation: this.annotationArgumentAnnotation,
      annotationArgumentAttribute: this.annotationArgumentAttribute,
      annotationArgumentValues: this.allowedValues,
      annotationRelationType: this.annotationRelationType,
      annotationRelationAttribute: this.annotationRelationAttribute,
      annotationRelationValue: this.annotationRelationValue
    } */);
  }

}
