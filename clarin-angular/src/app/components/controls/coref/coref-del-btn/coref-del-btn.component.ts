import { Component, OnInit, ViewChild } from '@angular/core';
import { BaseControlComponent } from '../../base-control/base-control.component';

@Component({
  selector: 'coref-del-btn',
  templateUrl: './coref-del-btn.component.html',
  styleUrls: ['./coref-del-btn.component.scss']
})
export class CorefDelBtnComponent extends BaseControlComponent implements OnInit {

  @ViewChild("element") element: HTMLButtonElement;

  super() { }

  ngOnInit(): void {
  }

  deleteAttribute() {
    this.element.closest("tr").querySelector(".coref-span-start").innerHTML = ('');
    this.element.closest("tr").querySelector(".coref-span-end").innerHTML = ('');

    var elementIdNumber = this.element.getAttribute('id').match(/\d+/)[0];

    if (document.querySelectorAll("#x_t" + elementIdNumber).length) {
      var segmentElement = document.querySelector("#x_t" + elementIdNumber);
      segmentElement.innerHTML = ('');
      segmentElement.removeAttribute('title')
    } /*else if ($(element).closest("tr").find(".coref-multi-entry").length) {
      $(element).closest("tr").find(".coref-multi-entry").text('');
      $(element).closest("tr").find(".coref-multi-entry").removeAttr('title')
    }*/
  }

}
