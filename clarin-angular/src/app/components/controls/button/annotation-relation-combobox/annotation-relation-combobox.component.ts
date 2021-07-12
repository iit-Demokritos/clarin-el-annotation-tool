import { Component, Input, OnInit } from '@angular/core';
import { BaseControlComponent } from '../../base-control/base-control.component';
import * as _ from 'lodash';

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
  }

  @Input() annotationArgumentValues;
  
  annotations = [];
  selectedAnnotationId = '';

  // Create object used to filter selected annotations
  selAnnotationFilter = {
    name: this.annotationRelationAttribute
  };

  /**
   * Get new annotations to show.
   */
  updateAnnotationList() {

    // Get annotations
    var annotations = this.TextWidgetAPI.getAnnotations();

    // Filter annotations
    var allowedValues = this.annotationArgumentValues.split(' ');

    this.annotations = _.filter(annotations, function (annotation) {
      // Check if the type is in the allowedValues
      // var type = _.findWhere(annotation.attributes, { name: 'type' }).value;
      var type = annotation.attributes.find(attr => attr.name === 'type').value;

      return allowedValues.indexOf(type) !== -1;
    });

  }

  annotationSelected() {
    // Get the selected annotation
    var annotation: any = this.TextWidgetAPI.getSelectedAnnotation();

    // Check if the selected annotation has the same type as this combobox
    if (annotation.type !== this.annotationType) {
      this.selectedAnnotationId = '';
      return;
    }

    // Check if this annotation concerns this combobox (same relation attribute value)
    // var relationAttributeValue = _.findWhere(annotation.attributes, this.selAnnotationFilter).value;
    var relationAttributeValue = this.TextWidgetAPI.findWhere(annotation.attributes, this.selAnnotationFilter).value;

    if (relationAttributeValue !== this.annotationRelationValue) {

      this.selectedAnnotationId = '';
      return;
    }

    // Get the selected annotation ID from the attributes of the arrow annotation
    // var id = _.findWhere(annotation.attributes, { name: this.annotationAttribute }).value;
    var id = annotation.attributes.find(attr => attr.name === this.annotationAttribute).value;

    // Find the annotation with this ID in the list of annotations and select it
    this.selectedAnnotationId = id;
  }

  // Register callback for annotation updates
  schemaCallback() {
    this.TextWidgetAPI.registerAnnotationsCallback(this.updateAnnotationList.bind(this));
    this.TextWidgetAPI.registerSelectedAnnotationCallback(this.annotationSelected.bind(this));
  }

}
