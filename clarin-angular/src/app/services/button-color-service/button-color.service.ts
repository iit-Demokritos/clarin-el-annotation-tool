import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ButtonColorService {

  constructor() { }

  colorCombinations = [];

  /*** Button Annotator Color Combinations Service ***/
  addColorCombination(colorCombination) {
    // console.error("addColorCombination:", colorCombination);
    this.colorCombinations.push(colorCombination);
  }; /* addColorCombination */

  clearColorCombinations() { this.colorCombinations = []; };

  getColorCombination(annotationValue) {
    // var colorCombo = _.where(this.colorCombinations, { value: annotationValue });
    var colorCombo = this.colorCombinations.filter(col => col.value === annotationValue);

    if (colorCombo.length == 1)
      return colorCombo[0];
    else
      return {};
  };
}
