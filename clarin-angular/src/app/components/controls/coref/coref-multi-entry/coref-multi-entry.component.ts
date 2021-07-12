import { Component, OnInit, ViewChild } from '@angular/core';
import { BaseControlComponent } from '../../base-control/base-control.component';

@Component({
  selector: 'coref-multi-entry',
  templateUrl: './coref-multi-entry.component.html',
  styleUrls: ['./coref-multi-entry.component.scss']
})
export class CorefMultiEntryComponent extends BaseControlComponent implements OnInit {

  @ViewChild("element") element: Element;

  super() { }

  ngOnInit(): void {
    //register callbacks for the annotation list and the selected annotation
    this.TextWidgetAPI.registerSelectedAnnotationCallback(this.updateCorefMultiEntry);
  }

  updateCorefMultiEntry() {
    var selectedAnnotation: any = this.TextWidgetAPI.getSelectedAnnotation();

    if (Object.keys(selectedAnnotation).length > 0) { //is selected annotation is not empty 
      //search for the specific attribute of the annotation
      // var selAnnotationAttribute = _.findWhere(selectedAnnotation.attributes, { name: this.annotationAttribute });
      var selAnnotationAttribute = selectedAnnotation.attributes.find(attr => attr.name === this.annotationAttribute);

      //if attribute found and has segment inside, assign it to the input element
      /*if (!angular.isUndefined(selectedAnnotationAttribute.value.segment) && selectedAnnotationAttribute.value.segment != $(element).text()) {
        $(element).text(selectedAnnotationAttribute.value.segment);
        $(element).attr('title', selectedAnnotationAttribute.value.segment);
      }*/

      if (typeof (selAnnotationAttribute.value) != "undefined") {
        var span = selAnnotationAttribute.value.split(" ");
        if (span.length == 2) {
          // var selSpan = _.findWhere(selectedAnnotation.spans, { start: parseInt(span[0]), end: parseInt(span[1]) });
          var selSpan = selectedAnnotation.spans.find(span =>
              span.start === parseInt(span[0]) && span.end === parseInt(span[1]));
          if (typeof (selSpan.segment) != "undefined" && selSpan.segment != this.element.innerHTML) {
            this.element.innerHTML = (selSpan.segment);
            this.element.setAttribute('title', selSpan.segment);
          }
        }
      }
    } else if (Object.keys(selectedAnnotation).length == 0 && this.element.innerHTML.length > 0) { //else clear the input element
      this.element.innerHTML = "";
      this.element.setAttribute('title', '');
    }
  }
  
}
