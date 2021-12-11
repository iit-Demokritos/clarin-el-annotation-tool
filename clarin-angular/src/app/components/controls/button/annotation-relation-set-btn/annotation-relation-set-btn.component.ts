import { Component, Input, OnInit } from '@angular/core';
import { BaseControlComponent } from '../../base-control/base-control.component';
import * as _ from 'lodash';

@Component({
  selector: 'annotation-relation-set-btn',
  templateUrl: './annotation-relation-set-btn.component.html',
  styleUrls: ['./annotation-relation-set-btn.component.scss']
})
export class AnnotationRelationSetBtnComponent extends BaseControlComponent implements OnInit {

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
    if (annotation.type !== this.annotationType) {
      this.selectedAnnotationId = '';
      if (!this.disabled) {this.disabled = true;}
      return;
    }

    // Check if this annotation concerns this relation...
    var value = this.TextWidgetAPI.getAnnotationAttributeValue(annotation, this.annotationAttribute);

    // We are not interested in annotations that already belong to this relation...
    if (value == this.annotationValue) {
      this.selectedAnnotationId = '';
      if (!this.disabled) {this.disabled = true;}
      return;
    }

    // Get the selected annotation ID
    this.selectedAnnotationId = annotation['_id'];
    if (this.disabled) {this.disabled = false;}
  }

  setSelectedAnnotation() {
    if (!this.selectedAnnotationId) return;
    // Create copy of the selected annotation (to update its values)
    var annotation: any = _.cloneDeep(this.TextWidgetAPI.getSelectedAnnotation());
    if (annotation['_id'] != this.selectedAnnotationId) {
      this.toastrService.error("Mismatch between selected Annotation and the selected id!");
      return;
    }
    // Set the new attribute...
    var attribute = annotation.attributes.find(attr => attr.name == this.annotationAttribute);
    attribute.value = this.annotationValue;
    this.tempAnnotationService.update(annotation)
      .then((response: any) => {
        if (response.success) {
          this.TextWidgetAPI.clearSelection();
          this.TextWidgetAPI.updateAnnotation(annotation, false);
          this.TextWidgetAPI.setSelectedAnnotation(annotation);
        } else {
          this.toastrService.error("Error during updating your annotation. Please refresh the page and try again.");
        }
      }, (error) => {
        this.toastrService.error("Error during updating your annotation. Please refresh the page and try again.");
      });
  }

  // Register callback for annotation updates
  schemaCallback() {
    this.TextWidgetAPI.registerSelectedAnnotationCallback(this.annotationSelected.bind(this));
  }

}
