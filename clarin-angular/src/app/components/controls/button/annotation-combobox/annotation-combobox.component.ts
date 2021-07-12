import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MainComponent } from 'src/app/components/views/main/main.component';
import { BaseControlComponent } from '../../base-control/base-control.component';

@Component({
  selector: 'annotation-combobox',
  templateUrl: './annotation-combobox.component.html',
  styleUrls: ['./annotation-combobox.component.scss']
})
export class AnnotationComboboxComponent extends BaseControlComponent implements OnInit {

  values;
  comboOptions;

  @ViewChild('cb') element: ElementRef;

  super() { }

  ngOnInit(): void {
    if (typeof (this.values) != "undefined") {
      this.comboOptions = this.values.split(";");
    }

    //register callbacks for the annotation list and the selected annotation
    this.TextWidgetAPI.registerSelectedAnnotationCallback(this.updateCorefCombobox);
  }

  updateCorefCombobox(attrs: any) {
    var selectedAnnotation: any = this.TextWidgetAPI.getSelectedAnnotation();

    if (Object.keys(selectedAnnotation).length > 0) { //is selected annotation is not empty 
      // var selectedAnnotationAttribute = _.where(selectedAnnotation.attributes, { name: attrs.annotationAttribute })[0];
      var selectedAnnotationAttribute = selectedAnnotation.attributes.find(attr => attr.name === attrs.annotationAttribute);

      // if element has the specific attribute, the attribute value is inside comboOptions and the option selected is different
      if (typeof (selectedAnnotationAttribute) != "undefined" &&
        typeof (selectedAnnotationAttribute.value) != "undefined" &&
        selectedAnnotationAttribute.value != this.element.nativeElement.value &&
        this.comboOptions.indexOf(selectedAnnotationAttribute.value) > -1)
        this.element.nativeElement.value = selectedAnnotationAttribute.value;
    } else if (Object.keys(selectedAnnotation).length > 0 && this.element.nativeElement.value.length > 0)	//if selected annotation is empty and not the default value is selected in select 
      this.element.nativeElement.value = '';
  }
}
