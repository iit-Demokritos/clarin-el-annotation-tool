import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { BaseControlComponent } from '../../base-control/base-control.component';
import { Message } from 'src/app/models/services/message';
import { MessageService } from 'src/app/services/message-service/message.service';

@Component({
  selector: 'coref-combobox',
  templateUrl: './coref-combobox.component.html',
  styleUrls: ['./coref-combobox.component.scss']
})
export class CorefComboboxComponent extends BaseControlComponent implements OnInit {

  @Input() values;
  comboOptions;
  selected = "";

  super() { }

  ngOnInit(): void {
    if (typeof (this.values) != "undefined")
      this.comboOptions = this.values.split(";");

    //register callbacks for the annotation list and the selected annotation
    this.TextWidgetAPI.registerSelectedAnnotationCallback(this.updateCorefCombobox.bind(this));
    // We want to receive messages for COREF_ATTRIBUTE_VALUE...
    this.messagesSubscribe();
  }

  updateCorefCombobox() {
    var selectedAnnotation: any = this.TextWidgetAPI.getSelectedAnnotation();

    // If the selected annotation is not empty 
    if (Object.keys(selectedAnnotation).length > 0) {
      var selectedAnnotationAttribute = selectedAnnotation.attributes.find(attr => attr.name === this.annotationAttribute);

      // If element has the specific attribute, the attribute value is inside comboOptions and the option selected is different
      if (typeof (selectedAnnotationAttribute) != "undefined" &&
          typeof (selectedAnnotationAttribute.value) != "undefined" &&
          selectedAnnotationAttribute.value != this.selected &&
          this.comboOptions.indexOf(selectedAnnotationAttribute.value) > -1) {
        this.messageService.attributeValueMemorySetAttributeValue(this.annotationType, this.annotationAttribute, {
          value: selectedAnnotationAttribute.value
        });
      }
    } else {
      this.messageService.attributeValueMemorySetAttributeValue(this.annotationType, this.annotationAttribute, {});
    }
  }

  // Callback for messages...
  onMessageAdded(message: Message) {
    switch(message.name) {
      case MessageService.COREF_ATTRIBUTE_VALUE: {
        if (message.value.annotation_type == this.annotationType &&
            message.value.attribute_name  == this.annotationAttribute) {
          // If the value is correct, highlight the button...
          if (typeof (message.value.value) != "undefined" &&
              typeof (message.value.value.value) != "undefined") {
            this.selected = message.value.value.segment;
          } else {
            this.selected = "";
          }
        }
        break;
      }
    }
  }; /* onMessageAdded */

}
