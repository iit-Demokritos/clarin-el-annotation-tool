import { Component, OnInit } from '@angular/core';
import { BaseControlComponent } from '../../base-control/base-control.component';
import { Message } from 'src/app/models/services/message';
import { MessageService } from 'src/app/services/message-service/message.service';

@Component({
  selector: 'coref-segment-entry',
  templateUrl: './coref-segment-entry.component.html',
  styleUrls: ['./coref-segment-entry.component.scss']
})
export class CorefSegmentEntryComponent extends BaseControlComponent implements OnInit {

  super() { }

  visible_data = "";

  ngOnInit(): void {
    //register callbacks for the annotation list and the selected annotation
    this.TextWidgetAPI.registerSelectedAnnotationCallback(this.updateCorefSegmentEntry.bind(this));
    // We want to receive messages for COREF_ATTRIBUTE_VALUE...
    this.messagesSubscribe();
  }

  updateCorefSegmentEntry() {
    var selectedAnnotation: any = this.TextWidgetAPI.getSelectedAnnotation();

    if (Object.keys(selectedAnnotation).length > 0) { //is selected annotation is not empty 
      var selAnnotationAttribute = selectedAnnotation.attributes.find(attr => attr.name === this.annotationAttribute);

      if (typeof (selAnnotationAttribute.value) != "undefined") {
        var span = selAnnotationAttribute.value.split(" ");
        span[0] = parseInt(span[0]); span[1] = parseInt(span[1]);
        if (span.length == 2) {
          var selSpan = selectedAnnotation.spans.find(sp => sp.start == span[0] && sp.end == span[1]);
          if (typeof (selSpan) != "undefined" && typeof (selSpan.segment) != "undefined") {
            this.messageService.attributeValueMemorySetAttributeValue(this.annotationType, this.annotationAttribute, {
              start: span[0], end: span[1], segment: selSpan.segment
            });

            this.visible_data = selSpan.segment;
          }
        } else {
          this.messageService.attributeValueMemorySetAttributeValue(this.annotationType, this.annotationAttribute, {});
        }
      }
    } else {
      this.messageService.attributeValueMemorySetAttributeValue(this.annotationType, this.annotationAttribute, {});
      this.visible_data = ""; 
    }
  };

  // Callback for messages...
  onMessageAdded(message: Message) {
    switch(message.name) {
      case MessageService.COREF_ATTRIBUTE_VALUE: {
        if (message.value.annotation_type == this.annotationType &&
            message.value.attribute_name  == this.annotationAttribute) {
          // If the value is correct, highlight the button...
          if (typeof (message.value.value) != "undefined" &&
              typeof (message.value.value.segment) != "undefined") {
            this.visible_data = message.value.value.segment;
          } else {
            this.visible_data = "";
          }
        }
        break;
      }
    }
  }; /* onMessageAdded */

}
