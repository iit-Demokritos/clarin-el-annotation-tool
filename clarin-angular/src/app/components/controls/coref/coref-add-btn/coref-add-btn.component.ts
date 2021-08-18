import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { BaseControlComponent } from '../../base-control/base-control.component';

@Component({
  selector: 'coref-add-btn',
  templateUrl: './coref-add-btn.component.html',
  styleUrls: ['./coref-add-btn.component.scss']
})
export class CorefAddBtnComponent extends BaseControlComponent implements OnInit {

  @ViewChild("input") element: ElementRef;

  super() { }

  ngOnInit(): void {
  }

  addAttribute(annotationType, annotationAttribute) {
    var currentSelection: any = this.TextWidgetAPI.getCurrentSelection();

    if (Object.keys(currentSelection).length > 0) {
      this.element.nativeElement.parent().closest("tr").find(".coref-span-start").text(currentSelection.startOffset);
      this.element.nativeElement.parent().closest("tr").find(".coref-span-end").text(currentSelection.endOffset);

      var elementIdNumber = this.element.nativeElement.parent().attr('id').match(/\d+/)[0];

      if (document.querySelectorAll("#x_t" + elementIdNumber).length) {
        var segmentElement = document.querySelector("#x_t" + elementIdNumber);
        segmentElement.textContent = (currentSelection.segment);
        segmentElement.setAttribute("title", currentSelection.segment);
      } /*else if ($(element).closest("tr").find(".coref-multi-entry").length) {
        $(element).closest("tr").find(".coref-multi-entry").text(currentSelection.segment);
        $(element).closest("tr").find(".coref-multi-entry").attr("title", currentSelection.segment);
      }
*/
      this.TextWidgetAPI.clearSelection();
    }
  }

}
