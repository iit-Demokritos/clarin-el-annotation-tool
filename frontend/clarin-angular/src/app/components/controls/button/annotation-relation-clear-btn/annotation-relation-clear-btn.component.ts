import { Component, OnInit } from '@angular/core';
import { BaseControlComponent } from '../../base-control/base-control.component';

@Component({
  selector: 'annotation-relation-clear-btn',
  templateUrl: './annotation-relation-clear-btn.component.html',
  styleUrls: ['./annotation-relation-clear-btn.component.scss']
})
export class AnnotationRelationClearBtnComponent extends BaseControlComponent implements OnInit {

  showClearBtn = true;

  super() { }

  ngOnInit(): void {
  }

  resetInputFields(){
    //TODO: Find function
  }

}
