import { Component, OnInit, ViewChild } from '@angular/core';
import { BaseControlComponent } from '../../base-control/base-control.component';
import { cloneDeep, findWhere, indexOf, where, contains } from "lodash";

@Component({
  selector: 'coref-span-end',
  templateUrl: './coref-span-end.component.html',
  styleUrls: ['./coref-span-end.component.scss']
})
export class CorefSpanEndComponent extends BaseControlComponent implements OnInit {

  @ViewChild("element") element: Element;

  super() { }

  ngOnInit(): void {
    //register callbacks for the annotation list and the selected annotation
    this.TextWidgetAPI.registerSelectedAnnotationCallback(this.updateCorefSpanEnd);
  }

  updateCorefSpanEnd() {
    var selectedAnnotation:any = this.TextWidgetAPI.getSelectedAnnotation();

    if (Object.keys(selectedAnnotation).length > 0) { //is selected annotation is not empty 
      //search for the specific attribute of the annotation
      var selAnnotationAttribute = findWhere(selectedAnnotation.attributes, { name: this.annotationAttribute });

      /*// if element has the specific attribute and the attribute value is different from the element's value
      if (!angular.isUndefined(selectedAnnotationAttribute.value.end) && selectedAnnotationAttribute.value.end != $(element).text())
        $(element).text(selectedAnnotationAttribute.value.end); */

      if (typeof (selAnnotationAttribute.value) != "undefined") {
        var span = selAnnotationAttribute.value.split(" ");
        if (span.length == 2)
          this.element.innerHTML = (span[1]);
      }
    } else if (Object.keys(selectedAnnotation).length == 0 && this.element.innerHTML.length > 0)	//else clear the input element
      this.element.innerHTML = ('');
  }
}
