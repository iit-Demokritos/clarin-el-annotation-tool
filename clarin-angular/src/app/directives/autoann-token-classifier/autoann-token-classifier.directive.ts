import { AfterViewInit, Directive, ElementRef, Input } from '@angular/core';
import { AnnotationButtonComponent } from '@components/controls/button/annotation-button/annotation-button.component';
import { TextWidgetAPI } from 'src/app/services/text-widget/text-widget.service';

@Directive({
  selector: '[autoannTokenClassifier]'
})
export class AutoannTokenClassifierDirective implements AfterViewInit {

  @Input() autoannTokenClassifier = '';
  @Input() annotationType         = '';
  @Input() annotationAttribute    = '';
  @Input() title                  = '';

  constructor(private el: ElementRef,
              private TextWidgetAPI: TextWidgetAPI) { }

  ngAfterViewInit() {
    this.TextWidgetAPI.registerAnnotationSchemaAutoAnn(
      "TokenClassifier",
      this.autoannTokenClassifier,
      this.title,
      this.annotationType,
      this.annotationAttribute);
  }

}
