import { Directive, ElementRef, OnDestroy } from '@angular/core';
import * as $ from 'jquery';

@Directive({
  selector: '.document_attributes'
})
export class DocumentAttributesDirective implements OnDestroy {
  el;
  
  constructor(el: ElementRef) {
    this.el = el;
    var moveTo = $('#main-content-annotate-document-attributes > tbody > tr:last > td[class~="main-content-attributes-cell"]:last');
    $(el.nativeElement).appendTo(moveTo);

    var tr = $('<tr class="main-content-attributes-row"><td class="main-content-attributes-cell"></td></tr>');
    $('#main-content-annotate-document-attributes > tbody').append(tr);
  }; /* constructor */

  ngOnDestroy() {
    this.el.nativeElement.remove();
  }
}
