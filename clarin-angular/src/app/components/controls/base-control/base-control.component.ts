import { Component, Input, OnInit } from '@angular/core';
import { Guid } from 'src/app/models/guid';
import { MainComponent } from '../../views/main/main.component';
import { ValueAccessorComponent } from '../value-accessor/value-accessor.component';

@Component({
  selector: 'base-control',
  templateUrl: './base-control.component.html',
  styleUrls: ['./base-control.component.scss']
})
export class BaseControlComponent extends ValueAccessorComponent<any> implements OnInit {

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
  n = require("bson-objectid");


  super() { }

  ngOnInit(): void {
  }

  ObjectId() {
    /* WARNING: If this function changes, the change must be also reflected
     * in CollectionImportService (app/services/collection-import-service)
     * and in AnnotationComponent (app/components/views/annotation) */
    // var n = require("bson-objectid");

    //if (this.n === undefined) {
    //  this.n = require("bson-objectid");
    //}
    return this.n();

    //return Guid.newGuid();
  }

}
