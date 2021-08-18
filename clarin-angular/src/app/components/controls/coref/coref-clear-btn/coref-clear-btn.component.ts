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
    this.TextWidgetAPI.registerSelectedAnnotationCallback(this.annotationSelectionUpdate);
  }

  showClearBtn = true;

  resetInputFields() {     //reset all annotator's widgets 
    document.querySelector('.coref-combobox').innerHTML = ('');
    document.querySelector('.coref-entry').innerHTML = ('');
    document.querySelector('.coref-multi-entry').innerHTML = ('');
    document.querySelector('.coref-segment-entry').innerHTML = ('');
    document.querySelector('.coref-span-end').innerHTML = ('');
    document.querySelector('.coref-span-start').innerHTML = ('');
    (document.querySelector('.coref-checkbox input') as HTMLInputElement).checked = false;
    document.querySelector('.coref-btn.active').setAttribute("style", "color:#333");
    document.querySelector('.coref-btn.active').setAttribute("style", "background:#fff");
    document.querySelector('.coref-btn.active').classList.remove('active');
  }

  annotationSelectionUpdate() {
    var selectedAnnotation = this.TextWidgetAPI.getSelectedAnnotation();
    if (Object.keys(selectedAnnotation).length == 0) //selected annotation exists
      this.showClearBtn = true;
    else									                      //selected annotation not empty
      this.showClearBtn = false;
  }
}
