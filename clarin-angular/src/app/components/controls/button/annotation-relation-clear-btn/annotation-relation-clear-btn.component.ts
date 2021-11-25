import { Component, Input, OnInit } from '@angular/core';
import { BaseControlComponent } from '../../base-control/base-control.component';

@Component({
  selector: 'annotation-relation-clear-btn',
  templateUrl: './annotation-relation-clear-btn.component.html',
  styleUrls: ['./annotation-relation-clear-btn.component.scss']
})
export class AnnotationRelationClearBtnComponent extends BaseControlComponent implements OnInit {

  showClearBtn = true;
  inputFields;

  super() { }

  ngOnInit(): void {
    this.inputFields = this.annotationWidgetIds.split(' ');
  }

  resetInputFields() {
    this.inputFields.forEach(field =>
      this.messageService.annotationRelationComboboxSelectAnnotation(field, ''));
    this.TextWidgetAPI.clearSelectedAnnotation();
  }

}
