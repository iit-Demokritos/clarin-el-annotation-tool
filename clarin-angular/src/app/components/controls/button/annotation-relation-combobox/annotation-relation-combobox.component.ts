import { Component, Input, OnInit } from '@angular/core';
import { BaseControlComponent } from '../../base-control/base-control.component';
import { Message } from 'src/app/models/services/message';
import { MessageService } from 'src/app/services/message-service/message.service';

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
  selectionOrigin = '';
  allowedValues = [];

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
  }

  // Register callback for annotation updates
  schemaCallback() {
    this.allowedValues = this.annotationArgumentValues.split(' ');
    this.TextWidgetAPI.registerAnnotationsCallback(this.updateAnnotationList.bind(this));
    this.TextWidgetAPI.registerSelectedAnnotationCallback(this.annotationSelected.bind(this));
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
    this.messageService.annotationRelationComboboxSet(this.id, this.value, this.annotationAttribute);
  }

}
