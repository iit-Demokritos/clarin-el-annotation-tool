import { Component, OnInit, ViewChild } from '@angular/core';
import { BaseControlComponent } from '../../base-control/base-control.component';

@Component({
  selector: 'coref-span-start',
  templateUrl: './coref-span-start.component.html',
  styleUrls: ['./coref-span-start.component.scss']
})
export class CorefSpanStartComponent extends BaseControlComponent implements OnInit {

  @ViewChild("element") element: Element;

  super() { }

  ngOnInit(): void {
    //register callbacks for the annotation list and the selected annotation
    this.TextWidgetAPI.registerSelectedAnnotationCallback(this.updateCorefSpanStart);
  }

  updateCorefSpanStart() {
    var selectedAnnotation: any = this.TextWidgetAPI.getSelectedAnnotation();

    if (Object.keys(selectedAnnotation).length > 0) { //if selected annotation is not empty 
      //search for the specific attribute of the annotation
      // var selAnnotationAttribute = _.findWhere(selectedAnnotation.attributes, { name: this.annotationAttribute });
      var selAnnotationAttribute = selectedAnnotation.attributes.find(attr => attr.name === this.annotationAttribute);

      /*// if element has the specific attribute and the attribute value is different from the element's value
      if (!angular.isUndefined(selectedAnnotationAttribute.value.start) && selectedAnnotationAttribute.value.start != $(element).text())
        $(element).text(selectedAnnotationAttribute.value.start); */

      if (typeof (selAnnotationAttribute.value) != "undefined") {
        var span = selAnnotationAttribute.value.split(" ");
        if (span.length == 2)
          this.element.innerHTML = (span[0]);
      }
    } else if (Object.keys(selectedAnnotation).length == 0 && this.element.innerHTML.length > 0)	//else clear the input element
      this.element.innerHTML = ('');
  };

}
