import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { BaseControlComponent } from '../../base-control/base-control.component';
import * as _ from 'lodash';

@Component({
  selector: 'coref-combobox',
  templateUrl: './coref-combobox.component.html',
  styleUrls: ['./coref-combobox.component.scss']
})
export class CorefComboboxComponent extends BaseControlComponent implements OnInit {

  @Input() values;
  comboOptions;

  @ViewChild("element") element: HTMLSelectElement;

  super() { }

  ngOnInit(): void {
    if (typeof (this.values) != "undefined")
      this.comboOptions = this.values.split(";");

    //register callbacks for the annotation list and the selected annotation
    this.TextWidgetAPI.registerSelectedAnnotationCallback(this.updateCorefCombobox);
  }

  updateCorefCombobox() {
    var selectedAnnotation: any = this.TextWidgetAPI.getSelectedAnnotation();

    if (Object.keys(selectedAnnotation).length > 0) { //is selected annotation is not empty 
      var selectedAnnotationAttribute = _.where(selectedAnnotation.attributes, { name: this.annotationAttribute })[0];

      // if element has the specific attribute, the attribute value is inside comboOptions and the option selected is different
      if (typeof (selectedAnnotationAttribute) != "undefined" &&
        typeof (selectedAnnotationAttribute.value) != "undefined" &&
        selectedAnnotationAttribute.value != this.element.value &&
        this.comboOptions.indexOf(selectedAnnotationAttribute.value) > -1)
        this.element.value = (selectedAnnotationAttribute.value);
    } else if (Object.keys(selectedAnnotation).length == 0 && this.element.value.length > 0) {	//if selected annotation is empty and not the default value is selected in select
      this.element.value = "";
    }
  }
}