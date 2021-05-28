import { Component, OnInit, ViewChild } from '@angular/core';
import { BaseControlComponent } from '../../base-control/base-control.component';
import { cloneDeep, findWhere, indexOf, where, contains } from "lodash";

@Component({
  selector: 'coref-checkbox',
  templateUrl: './coref-checkbox.component.html',
  styleUrls: ['./coref-checkbox.component.scss']
})
export class CorefCheckboxComponent extends BaseControlComponent implements OnInit {

  @ViewChild("element") element: Element;
  super() { }

  ngOnInit(): void {
    //register callbacks for the annotation list and the selected annotation
    this.TextWidgetAPI.registerSelectedAnnotationCallback(this.updateCorefCheckbox);
  }

  updateCorefCheckbox() {
    var selectedAnnotation: any = this.TextWidgetAPI.getSelectedAnnotation();

    if (Object.keys(selectedAnnotation).length > 0) { //is selected annotation is not empty 
      var selAnnotationAttribute = findWhere(selectedAnnotation.attributes, { name: this.annotationAttribute });

      // if element has the specific attribute, it is not checked and the attribute value is 1
      if (typeof (selAnnotationAttribute) != "undefined" && !this.element.querySelector('input').checked &&
        /^\d+$/.test(selAnnotationAttribute.value) && selAnnotationAttribute.value == 1)
        this.element.querySelector('input').checked = true;
    } else if (Object.keys(selectedAnnotation).length == 0 && this.element.querySelector('input').checked) //if selected annotation not empty and checkbox checked 
      this.element.querySelector('input').checked = false;
  }

}
