import { Component, Input, OnInit } from '@angular/core';
import { BaseControlComponent } from '../../base-control/base-control.component';

@Component({
  selector: 'annotation-relation-import-btn',
  templateUrl: './annotation-relation-import-btn.component.html',
  styleUrls: ['./annotation-relation-import-btn.component.scss']
})
export class AnnotationRelationImportBtnComponent extends BaseControlComponent implements OnInit {

  disabled = true;
  selectedAnnotationId = '';
  allowedValues = [];

  super() { }

  ngOnInit(): void {
    this.TextWidgetAPI.registerAnnotationSchemaCallback(this.schemaCallback.bind(this));
    // Make sure we register the callbacks when the component loads
    this.schemaCallback();
  }

  annotationSelected() {
    // Get the selected annotation
    var annotation: any = this.TextWidgetAPI.getSelectedAnnotation();

    // Check if the selected annotation has the same type as this combobox
    if (annotation.type !== this.annotationArgumentAnnotation) {
      this.selectedAnnotationId = '';
      if (!this.disabled) {this.disabled = true;}
      return;
    }

    // Check if this annotation concerns the related combobox
    var type = this.TextWidgetAPI.getAnnotationAttributeValue(annotation, this.annotationArgumentAttribute);

    if (this.allowedValues.indexOf(type) == -1) {
      this.selectedAnnotationId = '';
      if (!this.disabled) {this.disabled = true;}
      return;
    }

    // Get the selected annotation ID
    this.selectedAnnotationId = annotation['_id'];
    if (this.disabled) {this.disabled = false;}
  }

  importSelectedAnnotation() {
    // In order to import this annotation to the relevant
    // AnnotationRelationComboboxComponent, we are going to broadcast a message,
    // through the this.messageService.
    // This message will contain the ids of the combobox(es), which are stored
    // in this.annotationWidgetIds
    this.messageService.annotationRelationComboboxSelectAnnotation(
      this.annotationWidgetIds, this.selectedAnnotationId
    );
  }

  // Register callback for annotation updates
  schemaCallback() {
    this.allowedValues = this.annotationArgumentValues.split(' ');
    this.TextWidgetAPI.registerSelectedAnnotationCallback(this.annotationSelected.bind(this));
  }

}
