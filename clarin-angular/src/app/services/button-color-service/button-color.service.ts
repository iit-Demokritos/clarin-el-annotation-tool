import { Injectable, NgZone } from '@angular/core';
import { MainService } from '../main/main.service';
import { cloneDeep, findWhere,indexOf,where,contains } from "lodash";
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { AnnotationService } from '../annotation-service/annotation.service';
import { ButtonAnnotatorService } from '../button-annotator-service/button-annotator.service';
import { CollectionService } from '../collection-service/collection-service.service';
import { CoreferenceAnnotatorService } from '../coreference-annotator-service/coreference-annotator.service';
import { CoreferenceColorDataService } from '../coreference-color-data-service/coreference-color-data.service';
import { OpenDocumentService } from '../open-document/open-document.service';
import { TempAnnotationService } from '../temp-annotation-service/temp-annotation.service';
import { TextWidgetAPI } from '../text-widget/text-widget.service';

@Injectable({
  providedIn: 'root'
})
export class ButtonColorService {

  constructor() {}

  colorCombinations = [];

  /*** Button Annotator Color Combinations Service ***/
  addColorCombination(colorCombination) { this.colorCombinations.push(colorCombination); };
  clearColorCombinations() { this.colorCombinations = []; };
  getColorCombination(annotationValue) {
    var colorCombo = where(this.colorCombinations, { value: annotationValue });

    if (colorCombo.length == 1)
      return colorCombo[0];
    else
      return {};
  };
}
