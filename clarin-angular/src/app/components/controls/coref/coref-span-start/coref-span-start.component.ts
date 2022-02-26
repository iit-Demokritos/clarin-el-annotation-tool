import { Component, OnInit } from '@angular/core';
import { BaseControlComponent } from '../../base-control/base-control.component';
import { Message } from 'src/app/models/services/message';
import { MessageService } from 'src/app/services/message-service/message.service';

@Component({
  selector: 'coref-span-start',
  templateUrl: './coref-span-start.component.html',
  styleUrls: ['./coref-span-start.component.scss']
})
export class CorefSpanStartComponent extends BaseControlComponent implements OnInit {

  super() { }

  visible_data = "";

  ngOnInit(): void {
    //register callbacks for the annotation list and the selected annotation
    // this.TextWidgetAPI.registerSelectedAnnotationCallback(this.updateCorefSpanStart.bind(this));
    // We want to receive messages for COREF_ATTRIBUTE_VALUE...
    this.messagesSubscribe();
  }

  // updateCorefSpanStart() {
  //   var selectedAnnotation: any = this.TextWidgetAPI.getSelectedAnnotation();

  //   if (Object.keys(selectedAnnotation).length > 0) { //if selected annotation is not empty 
  //     var selAnnotationAttribute = selectedAnnotation.attributes.find(attr => attr.name === this.annotationAttribute);

  //     if (typeof (selAnnotationAttribute.value) != "undefined") {
  //       var span = selAnnotationAttribute.value.split(" ");
  //       if (span.length == 2) {
  //         this.visible_data = span[0];
  //       }
  //     }
  //   } else {
  //     this.visible_data = "";
  //   }
  // }; /* updateCorefSpanStart */

  // Callback for messages...
  onMessageAdded(message: Message) {
    switch(message.name) {
      case MessageService.COREF_ATTRIBUTE_VALUE: {
        if (message.value.annotation_type == this.annotationType &&
            message.value.attribute_name  == this.annotationAttribute) {
          // If the value is correct, highlight the button...
          if (typeof (message.value.value) != "undefined" &&
              typeof (message.value.value.start) != "undefined") {
            this.visible_data = message.value.value.start;
          } else {
            this.visible_data = "";
          }
        }
        break;
      }
    }
  }; /* onMessageAdded */

}
