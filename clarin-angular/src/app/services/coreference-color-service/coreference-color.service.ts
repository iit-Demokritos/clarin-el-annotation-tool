import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { CoreferenceColorDataService } from '../coreference-color-data-service/coreference-color-data.service';
import { ButtonColorService } from "src/app/services/button-color-service/button-color.service";

@Injectable({
  providedIn: 'root'
})
export class CoreferenceColorService {

  constructor(public coreferenceColorDataService: CoreferenceColorDataService,
              public buttonColorService: ButtonColorService) {
    // Generate the classes for each color on page load
    this.generateColorClasses();
  }

  public optionColourfrom: string;
  public optionLabelfrom:  string;

  colorCursor = -1;
  annotationColors = [];
  colorCombinations = this.coreferenceColorDataService.getColors();
  hexDigits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"];

  getColorCombination(annotation) {
    var annotationId = annotation ? annotation._id : undefined;
    var annotationColorCombo: any = this.annotationColors.filter(s => s._id == annotationId)[0];

    if (typeof(annotationColorCombo) != "undefined") {
      return annotationColorCombo["color"];
    }

    // Maybe we should get the colour from a value?
    if (this.optionColourfrom && "attributes" in annotation) {
      // console.error("CoreferenceColorService: getColorCombination(): optionColourfrom:", this.optionColourfrom, annotation);
      // Is this an attribute?
      var attr = annotation.attributes.find(a => a.name == this.optionColourfrom);
      if (attr) {
        // The attribute matches the colour from attribute. Check if we can get a value...
        var color = this.buttonColorService.getColorCombination(attr["name"] + ":!:" + attr["value"]);
        if (color != this.buttonColorService.defaultColorCombination) {
          // We have found a color!
          var color_combination = {
            "background-colour":          color.colour_background,
            "border-color":               color.colour_border,
            "font-color":                 color.colour_font,
            "selected-background-colour": color.colour_selected_background
          };
          // console.error("CoreferenceColorService: getColorCombination(): !color:", color, color_combination);

          this.annotationColors.push({ _id: annotationId, color: color_combination});
          return color_combination;
        }
      }
    }

    // Ok, get the next available color combination...
    if (this.colorCursor === this.colorCombinations.length) {
      this.colorCursor = -1;
    }

    this.colorCursor++;
    this.annotationColors.push({ _id: annotationId, color: this.colorCombinations[this.colorCursor] });

    return this.colorCombinations[this.colorCursor];
  }; // getColorCombination

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
