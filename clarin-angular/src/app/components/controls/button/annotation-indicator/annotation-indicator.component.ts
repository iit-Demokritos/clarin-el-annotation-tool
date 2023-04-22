import { Component, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { BaseControlComponent } from '../../base-control/base-control.component';

@Component({
  selector: 'annotation-indicator',
  templateUrl: './annotation-indicator.component.html',
  styleUrls: ['./annotation-indicator.component.scss']
})
export class AnnotationIndicatorComponent extends BaseControlComponent implements AfterViewInit {

  color = 'transparent';
  backgroundColor = 'transparent';

  super() { }

  ngAfterViewInit(): void {
    //register callbacks for the annotation list and the selected annotation
    this.TextWidgetAPI.registerSelectedAnnotationCallback(this.updateAnnotationIndicator.bind(this));
  }; // ngAfterViewInit

  updateAnnotationIndicator() {
    var selectedAnnotation: any = this.TextWidgetAPI.getSelectedAnnotation();

    if (Object.keys(selectedAnnotation).length == 0) {
      this.color = this.backgroundColor = 'transparent';
    } else {
      var colorCombo: any = this.coreferenceColorService.getColorCombination(selectedAnnotation);

      if (Object.keys(colorCombo).length > 0) {
        if (this.TextWidgetAPI.getAnnotatorType() == "Button Annotator") {
          this.color           = colorCombo.fg_color;
          this.backgroundColor = colorCombo.bg_color;
        } else {
          this.color           = colorCombo["font-color"];
          this.backgroundColor = colorCombo["selected-background-colour"];
        }
      }
    }
  };

}
