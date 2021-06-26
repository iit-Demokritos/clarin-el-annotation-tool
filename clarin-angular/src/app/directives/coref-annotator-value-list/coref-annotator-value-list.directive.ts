import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[corefAnnotatorValueList]'
})
export class CorefAnnotatorValueListDirective implements OnInit {

  @Input() corefAnnotatorValueList: any[] = [];

  constructor(public el: ElementRef, public renderer: Renderer2) {
  }

  ngOnInit() {
    //TODO: Get model and append template
    let template = "";
    if (typeof this.corefAnnotatorValueList != "undefined" && this.corefAnnotatorValueList) {
      for (var i = 0; i < this.corefAnnotatorValueList.length; i++) {
        template += "<li class=\"list-group-item list-group-item-info\">";
        template += this.corefAnnotatorValueList[i].attribute;
        template += "</li>";

        for (var j = 0; j < this.corefAnnotatorValueList[i].values.length; j++) {
          template += "<li class=\"list-group-item\">";
          template += this.corefAnnotatorValueList[i].values[j];
          template += "</li>";
        }
      }

      //el.nativeElement.innerHtml = template;
      this.renderer.setProperty(this.el.nativeElement, "innerHTML", template);
    }
  }


}
