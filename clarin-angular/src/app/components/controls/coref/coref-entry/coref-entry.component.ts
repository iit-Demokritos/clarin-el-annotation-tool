import { Component, OnInit, ViewChild } from '@angular/core';
import { BaseControlComponent } from '../../base-control/base-control.component';
import * as _ from 'lodash';

@Component({
  selector: 'coref-entry',
  templateUrl: './coref-entry.component.html',
  styleUrls: ['./coref-entry.component.scss']
})
export class CorefEntryComponent extends BaseControlComponent implements OnInit {

  @ViewChild("Element") element: Element;

  super() { }

  ngOnInit(): void {
    //register callbacks for the annotation list and the selected annotation
    this.TextWidgetAPI.registerSelectedAnnotationCallback(this.updateCorefEntry);
  }

  focus() { //remove selection if exists on the text-widget 
    this.TextWidgetAPI.clearSelection();
  }

  updateCorefEntry() {
    var selectedAnnotation: any = this.TextWidgetAPI.getSelectedAnnotation();

    if (Object.keys(selectedAnnotation).length > 0) { //is selected annotation is not empty
      //search for the specific attribute of the annotation
      var selectedAnnotationAttribute = _.where(selectedAnnotation.attributes, { name: this.annotationAttribute })[0];

      // if element has the specific attribute, the attribute value is different from the element's value
      if (typeof (selectedAnnotationAttribute.value) != "undefined" &&
        selectedAnnotationAttribute.value != this.element.innerHTML)
        this.element.innerHTML = (selectedAnnotationAttribute.value);
    } else if (Object.keys(selectedAnnotation).length == 0 && this.element.innerHTML.length > 0) //if the selected annotation is empty and the element value is not empty
      this.element.innerHTML = "";
  }
}