import { Component, Input, OnInit } from '@angular/core';
import { BaseControlComponent } from '../../base-control/base-control.component';

@Component({
  selector: 'annotation-relation',
  templateUrl: './annotation-relation.component.html',
  styleUrls: ['./annotation-relation.component.scss']
})
export class AnnotationRelationComponent extends BaseControlComponent implements OnInit {

  @Input() title;
  @Input() annotationArgumentNumber;

  selected = false;

  super() { }

  ngOnInit(): void {
    this.TextWidgetAPI.registerAnnotationSchemaCallback(this.schemaCallback.bind(this));
    // Make sure we register the callbacks when the component loads
    this.schemaCallback();
  }

  // Register callback for annotation updates
  schemaCallback() {
    this.TextWidgetAPI.registerSelectedAnnotationCallback(this.annotationSelected.bind(this));
  }

  annotationSelected() {
    // Get the selected annotation
    var annotation: any = this.TextWidgetAPI.getSelectedAnnotation();

    // Check if the selected annotation has the same type as this combobox
    if (annotation.type !== this.annotationType) {
      this.selected = false;
      return;
    }

    // Check if this annotation concerns this relation...
    var value = this.TextWidgetAPI.getAnnotationAttributeValue(annotation, this.annotationAttribute);

    // Does it match the value?
    if (value != this.annotationValue) {
      this.selected = false;
      return;
    }
    this.selected = true;
  }

}
