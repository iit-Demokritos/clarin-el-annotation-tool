import { Component, OnInit } from '@angular/core';
import { BaseControlComponent } from '../../base-control/base-control.component';

@Component({
  selector: 'coref-add-btn',
  templateUrl: './coref-add-btn.component.html',
  styleUrls: ['./coref-add-btn.component.scss']
})
export class CorefAddBtnComponent extends BaseControlComponent implements OnInit {

  super() { }

  ngOnInit(): void {
  }

  addAttribute(): void {
    // annotationType, annotationAttribute
    var currentSelection: any = this.TextWidgetAPI.getCurrentSelection();

    if (Object.keys(currentSelection).length > 0) {
      this.messageService.attributeValueMemorySetAttributeValue(this.annotationType, this.annotationAttribute, {
        start: currentSelection.startOffset, end: currentSelection.endOffset, segment: currentSelection.segment
      });

      this.TextWidgetAPI.clearSelection();
    }
  }

}
