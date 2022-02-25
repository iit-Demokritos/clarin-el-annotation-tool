import { Component, OnInit } from '@angular/core';
import { BaseControlComponent } from '../../base-control/base-control.component';

@Component({
  selector: 'coref-clear-btn',
  templateUrl: './coref-clear-btn.component.html',
  styleUrls: ['./coref-clear-btn.component.scss']
})
export class CorefClearBtnComponent extends BaseControlComponent implements OnInit {

  super() { }

  ngOnInit(): void {
    //register callbacks for the selected annotation
    this.TextWidgetAPI.registerSelectedAnnotationCallback(this.annotationSelectionUpdate.bind(this));
  }

  showClearBtn = true;

  resetInputFields() {
    // Reset everything...
    var data = this.messageService.attributeValueMemoryGet(this.annotationType);
    for (const k in data) {
      if (Object.keys(data[k]).length > 0) {
        this.messageService.attributeValueMemorySetAttributeValue(this.annotationType, k, {});
      }
    }
  }

  cancelSelectedAnnotation() {
    // this.TextWidgetAPI.clearSelection();
    this.TextWidgetAPI.clearSelectedAnnotation();
  }; /* cancelSelectedAnnotation */

  annotationSelectionUpdate() {
    var selectedAnnotation = this.TextWidgetAPI.getSelectedAnnotation();
    if (Object.keys(selectedAnnotation).length == 0) //selected annotation exists
      this.showClearBtn = true;
    else //selected annotation not empty
      this.showClearBtn = false;
  }
}
