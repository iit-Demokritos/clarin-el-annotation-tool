import { Component, Input, OnInit } from '@angular/core';
import { MainComponent } from '../../views/main/main.component';
import { cloneDeep, findWhere,indexOf,where,contains } from "lodash";

@Component({
  selector: 'base-control',
  templateUrl: './base-control.component.html',
  styleUrls: ['./base-control.component.scss']
})
export class BaseControlComponent extends MainComponent implements OnInit {

  @Input() annotationAttribute;
  @Input() annotationValue;
  @Input() annotationType;

  @Input() bgColor;
  @Input() fgColor;
  @Input() colourBackground;
  @Input() colourBorder;
  @Input() colourSelectedBackground;
  @Input() colourFont;
  @Input() readonly;

  @Input() annotationRelationWidgetId;
  @Input() annotationRelationAttribute;
  @Input() annotationRelationValue;
  @Input() annotationWidgetIds;


  super() { }

  ngOnInit(): void {
  }

}
