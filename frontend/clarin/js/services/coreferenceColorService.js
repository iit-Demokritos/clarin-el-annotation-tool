angular.module('clarin-el').factory("CoreferenceColor", function ($filter, CoreferenceColorData) {
    var colorCursor = -1;
    var annotationColors = [];
    var colorCombinations = CoreferenceColorData.getColors();

    var getColorCombination = function (annotationId) {
        var annotationColorCombo = $filter('filter')(annotationColors, {_id: annotationId})[0];

        if (angular.isUndefined(annotationColorCombo) || angular.isUndefined(annotationId)) {
            if (colorCursor == colorCombinations.length)
                colorCursor = -1;

            colorCursor++;
            annotationColors.push({_id: annotationId, color: colorCombinations[colorCursor]});

            return colorCombinations[colorCursor];
        } else
            return annotationColorCombo.color;
    };

    var clearColorCombinations = function () {
        annotationColors = [];
        colorCursor = -1;
    };

    return {
        /*** Coreference Annotator Color Combinations Service ***/
        getColorCombination: getColorCombination,
        clearColorCombinations: clearColorCombinations
    }
});
