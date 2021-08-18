import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { BaseControlComponent } from '../../base-control/base-control.component';

@Component({
  selector: 'annotation-indicator',
  templateUrl: './annotation-indicator.component.html',
  styleUrls: ['./annotation-indicator.component.scss']
})
export class AnnotationIndicatorComponent extends BaseControlComponent implements OnInit {

  @ViewChild("annIndicator") element: ElementRef;

  super() { }

  ngOnInit(): void {
    //register callbacks for the annotation list and the selected annotation
    this.TextWidgetAPI.registerSelectedAnnotationCallback(this.updateAnnotationIndicator);
  }

  updateAnnotationIndicator() {
    var selectedAnnotation: any = this.TextWidgetAPI.getSelectedAnnotation();

    if (Object.keys(selectedAnnotation).length == 0) {
      if (this.element.nativeElement.css('background-color') != "rgb(255, 255, 255)" || this.element.nativeElement.css('color') != "rgb(255, 255, 255)") {
        this.element.nativeElement.css('color', '#fff');
        this.element.nativeElement.css('background-color', '#fff');
      }
    } else {
      var colorCombo: any = this.coreferenceColorService.getColorCombination(selectedAnnotation._id);

      if (Object.keys(colorCombo).length > 0) {
        if (this.TextWidgetAPI.getAnnotatorType() == "Button Annotator") {
          this.element.nativeElement.css('color', colorCombo.fg_color);
          this.element.nativeElement.css('background-color', colorCombo.bg_color);
        } else {
          this.element.nativeElement.css('color', colorCombo["font-color"]);
          this.element.nativeElement.css('background-color', colorCombo["selected-background-colour"]);
        }
      }
    }
  };

}
