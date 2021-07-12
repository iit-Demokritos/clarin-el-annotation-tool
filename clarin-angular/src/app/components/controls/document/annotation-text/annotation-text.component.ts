import { Component, Input, OnInit } from '@angular/core';
import { BaseControlComponent } from '../../base-control/base-control.component';

@Component({
  selector: 'annotation-text',
  templateUrl: './annotation-text.component.html',
  styleUrls: ['./annotation-text.component.scss']
})
export class AnnotationTextComponent extends BaseControlComponent implements OnInit {

  @Input() groupType;

  super() { }

  ngOnInit(): void {
  }

}
