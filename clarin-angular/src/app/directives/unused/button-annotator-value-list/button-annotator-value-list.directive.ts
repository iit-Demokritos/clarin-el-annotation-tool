import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[buttonAnnotatorValueList]'
})
export class ButtonAnnotatorValueListDirective implements OnInit {

  @Input() buttonAnnotatorValueList: any[] = [];

  constructor(public el: ElementRef, public renderer: Renderer2) {
  }

  ngOnInit() {
    //TODO: Get model and append template
    let template = "";
    if (typeof this.buttonAnnotatorValueList != "undefined" && this.buttonAnnotatorValueList) {
      for (var i = 0; i < this.buttonAnnotatorValueList.length; i++) {
        template += "<li class=\"list-group-item list-group-item-info\">";
        template += this.buttonAnnotatorValueList[i].group;
        template += "</li>";

        for (var j = 0; j < this.buttonAnnotatorValueList[i].values.length; j++) {
          template += "<li class=\"list-group-item\">";
          template += this.buttonAnnotatorValueList[i].values[j];
          template += "</li>";
        }
      }

      //el.nativeElement.innerHtml = template;
      this.renderer.setProperty(this.el.nativeElement, "innerHTML", template);
    }
  }

}
