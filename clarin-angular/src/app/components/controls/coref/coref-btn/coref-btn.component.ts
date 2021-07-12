import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { threadId } from 'node:worker_threads';
import { BaseControlComponent } from '../../base-control/base-control.component';
import * as _ from 'lodash';

@Component({
  selector: 'coref-btn',
  templateUrl: './coref-btn.component.html',
  styleUrls: ['./coref-btn.component.scss']
})
export class CorefBtnComponent extends BaseControlComponent implements OnInit {

  @Input() compound;
  image;
  imageSize;
  label;
  @ViewChild("element") element:Element;

  super() { }

  ngOnInit(): void {

    if (typeof this.compound != "undefined") {
      if (this.compound == "none") {
        var imagePath = this.image.replace("/opt/Ellogon/share", "");
        this.element.innerHTML = '<img src="images' + imagePath + '" width="' + this.imageSize + '" height="' + this.imageSize + '"/>';
      } else {
        /*element.css('color', scope.fgColor);*/
        this.element.innerHTML =('<span style="float:' + this.compound + '">' +
          '<i class="fa fa-minus fa-rotate-90" style="float:' + this.compound + '; color:' + this.bgColor + '"></i>' + this.label +
          '</span>');
      }
    }

      //register callbacks for the annotation list and the selected annotation
      this.TextWidgetAPI.registerSelectedAnnotationCallback(this.updateCorefBtn);
  }

  addAttribute(annotationType, annotationAttribute) {
    if (!this.element.classList.contains('active')) {
      var elementGroup = this.element.getAttribute("id").split("_")[0] + "_" + this.element.getAttribute("id").split("_")[1];
      var pressedButton = document.querySelector("button[id*='" + elementGroup + "']").querySelectorAll(".active");

      if (pressedButton.length > 0) {							//if other button is pressed remove active class and restore bg/fg color
        pressedButton[0].classList.remove('active');
        pressedButton[0].setAttribute("style","color:#333");
        pressedButton[0].setAttribute("style","background:#fff");
      }

      this.element.classList.add('active');
      this.element.setAttribute("style","color:" + this.fgColor);
      this.element.setAttribute("style","background:" + this.bgColor);
    }

    this.TextWidgetAPI.clearSelection();
  }

  updateCorefBtn() {
    var selectedAnnotation:any = this.TextWidgetAPI.getSelectedAnnotation();

    if (Object.keys(selectedAnnotation).length > 0) { //is selected annotation is not empty 
      // var selectedAnnotationAttribute = _.where(selectedAnnotation.attributes, { name: this.annotationAttribute })[0];
      var selectedAnnotationAttribute = selectedAnnotation.attributes.find(attr => attr.name === this.annotationAttribute);

      //if element has the specific attribute, it is not active and has the specific annotation value
      if (typeof(selectedAnnotationAttribute) != "undefined" && !this.element.classList.contains('active') &&
        (this.element.getAttribute('annotation-value') == selectedAnnotationAttribute.value)) {
        this.element.classList.add('active');
        this.element.setAttribute("style","color:"+this.fgColor);
        this.element.setAttribute("style","background" + this.bgColor);
      }
    } else if (Object.keys(selectedAnnotation).length == 0 && this.element.classList.contains('active')) { //if selected annotation not empty and checkbox checked 
      this.element.classList.remove('active');
      this.element.setAttribute("style","color:#333");
      this.element.setAttribute("style","background:#fff");
    }
  }


}
