import { Component, OnInit, ViewChild } from '@angular/core';
import { BaseControlComponent } from '../../base-control/base-control.component';
import { cloneDeep, findWhere, indexOf, where, contains } from "lodash";

@Component({
  selector: 'coref-segment-entry',
  templateUrl: './coref-segment-entry.component.html',
  styleUrls: ['./coref-segment-entry.component.scss']
})
export class CorefSegmentEntryComponent extends BaseControlComponent implements OnInit {

  @ViewChild("element") element: Element;

  super() { }

  ngOnInit(): void {
    //register callbacks for the annotation list and the selected annotation
    this.TextWidgetAPI.registerSelectedAnnotationCallback(this.updateCorefSegmentEntry);
  }

  updateCorefSegmentEntry() {
    var selectedAnnotation:any = this.TextWidgetAPI.getSelectedAnnotation();

    if (Object.keys(selectedAnnotation).length > 0) { //is selected annotation is not empty 
      //search for the specific attribute of the annotation
      var selAnnotationAttribute = findWhere(selectedAnnotation.attributes, { name: this.annotationAttribute });

      //if attribute found and has segment inside, assign it to the input element
      /*if (!angular.isUndefined(selAnnotationAttribute.value.segment) && selAnnotationAttribute.value.segment != $(element).text()) {
        $(element).text(selAnnotationAttribute.value.segment);
        $(element).attr('title', selAnnotationAttribute.value.segment);
      }*/

      if (typeof (selAnnotationAttribute.value) != "undefined") {
        var span = selAnnotationAttribute.value.split(" ");
        if (span.length == 2) {
          var selSpan = findWhere(selectedAnnotation.spans, { start: parseInt(span[0]), end: parseInt(span[1]) });
          if (typeof (selSpan.segment) != "undefined" && selSpan.segment != this.element.innerHTML) {
            this.element.innerHTML = (selSpan.segment);
            this.element.setAttribute('title', selSpan.segment);
          }
        }
      }
    } else if (Object.keys(selectedAnnotation).length == 0 && this.element.innerHTML.length > 0) { //else clear the input element
      this.element.innerHTML = ('');
      this.element.setAttribute('title', '');
    }
  };
}