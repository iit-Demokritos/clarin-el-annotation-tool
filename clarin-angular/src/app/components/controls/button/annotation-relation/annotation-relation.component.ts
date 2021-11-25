import { Component, Input, OnInit } from '@angular/core';
import { BaseControlComponent } from '../../base-control/base-control.component';

@Component({
  selector: 'annotation-relation',
  templateUrl: './annotation-relation.component.html',
  styleUrls: ['./annotation-relation.component.scss']
})
export class AnnotationRelationComponent extends BaseControlComponent implements OnInit {

  @Input() title;
  @Input() annotationArgumentNumber;

  super() { }

  ngOnInit(): void {
  }

}
