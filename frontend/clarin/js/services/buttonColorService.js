angular.module('clarin-el').factory("ButtonColor", function() {
   	var colorCombinations = [];

    /*** Button Annotator Color Combinations Service ***/
	var addColorCombination = function(colorCombination) { colorCombinations.push(colorCombination);};
	var clearColorCombinations = function() { colorCombinations = []; };
	var getColorCombination = function(annotationValue) {
		var colorCombo = _.where(colorCombinations, {value: annotationValue});

		if (colorCombo.length == 1)
			return colorCombo[0];
		else
			return {};
	};
	
	return {
		addColorCombination: addColorCombination,
		getColorCombination: getColorCombination,
		clearColorCombinations: clearColorCombinations
	}
});