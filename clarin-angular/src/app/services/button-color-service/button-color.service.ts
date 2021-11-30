import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ButtonColorService {

  constructor() { }

  colorCombinations = [];
  defaultColorCombination = {
    value: '',
    bg_color: '#a6e22d',
    fg_color: 'black',
    colour_background: '#DBF3AB',
    colour_font: 'black',
    colour_border: '#a6e22d',
    colour_selected_background: '#C0EA6C'
  }

  /*** Button Annotator Color Combinations Service ***/
  addColorCombination(colorCombination) {
   // console.error("addColorCombination:", colorCombination);
    this.colorCombinations.push(colorCombination);
  }; /* addColorCombination */

  clearColorCombinations() { this.colorCombinations = []; };

  getColorCombinations(){
    return this.colorCombinations
  }

  getColorCombination(annotationValue) {
    // console.log(this.colorCombinations)
    // var colorCombo = _.where(this.colorCombinations, { value: annotationValue });
    var colorCombo = this.colorCombinations.filter(col => col.value === annotationValue);

    if (colorCombo.length == 1) {
      return colorCombo[0];
    } else if (colorCombo.length) {
      console.error("ButtonColorService: getColorCombination(): Multiple colors for value:", annotationValue, colorCombo.length);
      return colorCombo[0];
    } else {
      return this.defaultColorCombination;
    }
  };
}
