import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ValueAccessorComponent } from '../value-accessor/value-accessor.component';
import { Message } from 'src/app/models/services/message';
import { Subscription } from 'rxjs';

@Component({
  selector: 'base-control',
  templateUrl: './base-control.component.html',
  styleUrls: ['./base-control.component.scss']
})
export class BaseControlComponent extends ValueAccessorComponent<any> implements OnInit, OnDestroy {

  @Input() id;
  @Input() annotationType;
  @Input() annotationAttribute;
  @Input() annotationValue;
  @Input() annotationArgumentAnnotation;
  @Input() annotationArgumentAttribute;
  @Input() annotationArgumentValues;
  @Input() annotationRelationType;
  @Input() annotationRelationAttribute;
  @Input() annotationRelationValue;

  @Input() bgColor;
  @Input() fgColor;
  @Input() colourBackground;
  @Input() colourBorder;
  @Input() colourSelectedBackground;
  @Input() colourFont;
  @Input() readonly;

  @Input() annotationRelationWidgetId;
  @Input() annotationWidgetIds;

  @Input() cols;

  // We do not use these, but they may exist in annotation schemes,
  // and Angular will complain...
  @Input() textvariable;
  @Input() groupType;

  n = require("bson-objectid");

  messagesSubscriptions: Subscription[] = [];

  super() { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    // prevent memory leaks when component destroyed
    this.messagesSubscriptions.forEach(subscription => subscription.unsubscribe());
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

  messagesSubscribe() {
    this.messagesSubscriptions.push(
      this.messageService.messageAdded$.subscribe(message => this.onMessageAdded(message))
    );
  }

  onMessageAdded(message: Message) {
  }
}
