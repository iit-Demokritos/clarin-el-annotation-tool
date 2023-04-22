import { Component, ElementRef, Input, AfterViewInit, ViewChild } from '@angular/core';
import { BaseControlComponent } from '../../base-control/base-control.component';
import { Message } from 'src/app/models/services/message';
import { MessageService } from 'src/app/services/message-service/message.service';

@Component({
  selector: 'coref-btn',
  templateUrl: './coref-btn.component.html',
  styleUrls: ['./coref-btn.component.scss']
})
export class CorefBtnComponent extends BaseControlComponent implements AfterViewInit {

  @Input() compound;
  @Input() image;
  @Input() imageSize;
  @Input() label;
  @Input() variable;
  // @ViewChild("element") element: ElementRef;

  disabled   = false;
  btnColor   = "#333";
  btnBgColor = "#fff";

  super() { }

  ngAfterViewInit(): void {
    // if (typeof this.compound != "undefined") {
    //   if (this.compound == "none") {
    //     var imagePath = this.image.replace("/opt/Ellogon/share", "");
    //     this.element.nativeElement.innerHTML = '<img src="images' + imagePath + '" width="' + this.imageSize + '" height="' + this.imageSize + '"/>';
    //   } else {
    //     /*element.css('color', scope.fgColor);*/
    //     this.element.nativeElement.innerHTML = ('<span style="float:' + this.compound + '">' +
    //       '<i class="fa fa-minus fa-rotate-90" style="float:' + this.compound + '; color:' + this.bgColor + '"></i>' + this.label +
    //       '</span>');
    //   }
    // }
    //register callbacks for the annotation list and the selected annotation
    this.TextWidgetAPI.registerSelectedAnnotationCallback(this.updateCorefBtn.bind(this));
    // Declare colours for value...
    this.buttonColorService.addColorCombination({
      value: this.annotationAttribute + ":!:" + this.annotationValue, bg_color: this.bgColor, fg_color: this.fgColor,
      colour_background: this.colourBackground, colour_font: this.colourFont,
      colour_border: this.colourBorder, colour_selected_background: this.colourSelectedBackground
    });
    // console.error("CorefBtnComponent: ngAfterViewInit(): value:", this.annotationAttribute + ":!:" + this.annotationValue);
    // We want to receive messages, from CorefBtnComponent components...
    this.messagesSubscribe();
  }; // ngAfterViewInit

  updateCorefBtn() {
    var selectedAnnotation: any = this.TextWidgetAPI.getSelectedAnnotation();

    // The selected annotation is not empty
    if (Object.keys(selectedAnnotation).length > 0) {
      // Check if the selected annotation has the same type as this button...
      if (selectedAnnotation.type !== this.annotationType) {
        // We cannot handle this annotation!
        return;
      }

      var selectedAnnotationAttribute = selectedAnnotation.attributes.find(attr =>
        attr.name === this.annotationAttribute &&
        attr.value === this.annotationValue
      );

      if (!(typeof (selectedAnnotationAttribute) == "undefined" || !selectedAnnotationAttribute)) {
        this.messageService.attributeValueMemorySetAttributeValue(this.annotationType, this.annotationAttribute, {value: this.annotationValue});
      }
    } else {
        this.messageService.attributeValueMemorySetAttributeValue(this.annotationType, this.annotationAttribute, {});
    }
  }

  addAttribute() {
    this.messageService.attributeValueMemorySetAttributeValue(this.annotationType, this.annotationAttribute, {value: this.annotationValue});
    this.TextWidgetAPI.clearSelection();
  }

  // Callback for messages...
  onMessageAdded(message: Message) {
    switch(message.name) {
      case MessageService.COREF_ATTRIBUTE_VALUE: {
        if (message.value.annotation_type == this.annotationType &&
            message.value.attribute_name  == this.annotationAttribute) {
          // If the value is correct, highlight the button...
          if (message.value.value.value == this.annotationValue) {
            this.btnColor   = this.fgColor;
            this.btnBgColor = this.bgColor;
          } else {
            this.btnColor   = "#333";
            this.btnBgColor = "#fff";
          }
        }
        break;
      }
    }
  }

}
