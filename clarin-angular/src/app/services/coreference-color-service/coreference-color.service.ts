import { Injectable, NgZone } from '@angular/core';
//import { type } from 'node:os';
import { MainService } from '../main/main.service';
import * as _ from 'lodash';
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
export class CoreferenceColorService {

    constructor(public coreferenceColorDataService: CoreferenceColorDataService) {
      // Generate the classes for each color on page load
      this.generateColorClasses();
    }

    colorCursor = -1;
    annotationColors = [];
    colorCombinations = this.coreferenceColorDataService.getColors();
    hexDigits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"];

    getColorCombination(annotationId) {
      var annotationColorCombo: any = this.annotationColors.filter(s => s._id == annotationId)[0];

      if (typeof (annotationColorCombo) == "undefined" || typeof (annotationId) == "undefined") {
        if (this.colorCursor === this.colorCombinations.length)
            this.colorCursor = -1;

        this.colorCursor++;
        this.annotationColors.push({ _id: annotationId, color: this.colorCombinations[this.colorCursor] });

        return this.colorCombinations[this.colorCursor];
      } else if (typeof (annotationColorCombo) != "undefined") {
        return annotationColorCombo["color"];
      }
    }

    clearColorCombinations() {
      this.annotationColors = [];
      this.colorCursor = -1;
    }

    /**
     * For each color combination, generate a CSS class that adds the corresponding background color to the
     * pseudo-element that contains the marker's key/type
     */
    generateColorClasses() {
      var classesString = "";

      // Generate a string with the classes
      _.each(this.colorCombinations, function (combo) {
          classesString += ".mark_color_" + (combo["border-color"].replace("#", "").toUpperCase()) + ":after{" +
              "background-color:" + combo["border-color"] + "}";
      });

      // Add the classes to the page
      /*
      $("<style>")
          .prop("type", "text/css")
          .html(classesString)
          .appendTo("head");*/
    };

    /**
     * Convert RGB to HEX (source: https://stackoverflow.com/a/1740716)
     * @param rgb
     * @returns {string}
     */
    rgb2hex(rgb) {
      rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
      return this.hex(rgb[1]) + this.hex(rgb[2]) + this.hex(rgb[3]);
    };

    hex(x) {
      return isNaN(x) ? "00" : this.hexDigits[(x - x % 16) / 16] + this.hexDigits[x % 16];
    };


}
