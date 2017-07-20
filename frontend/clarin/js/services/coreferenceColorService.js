angular.module("clarin-el").factory("CoreferenceColor", ["$filter", "CoreferenceColorData",
    function ($filter, CoreferenceColorData) {
        var colorCursor = -1;
        var annotationColors = [];
        var colorCombinations = CoreferenceColorData.getColors();
        var hexDigits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"];

        var getColorCombination = function (annotationId) {
            var annotationColorCombo = $filter("filter")(annotationColors, {_id: annotationId})[0];

            if (angular.isUndefined(annotationColorCombo) || angular.isUndefined(annotationId)) {
                if (colorCursor === colorCombinations.length)
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

        /**
         * For each color combination, generate a CSS class that adds the corresponding background color to the
         * pseudo-element that contains the marker's key/type
         */
        var generateColorClasses = function () {
            var classesString = "";

            // Generate a string with the classes
            _.each(colorCombinations, function (combo) {
                classesString += ".mark_color_" + (combo["border-color"].replace("#", "")) + ":after{" +
                    "background-color:" + combo["border-color"] + "}";
            });

            // Add the classes to the page
            $("<style>")
                .prop("type", "text/css")
                .html(classesString)
                .appendTo("head");
        };

        /**
         * Convert RGB to HEX (source: https://stackoverflow.com/a/1740716)
         * @param rgb
         * @returns {string}
         */
        var rgb2hex = function (rgb) {
            rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
            return hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
        };

        var hex = function (x) {
            return isNaN(x) ? "00" : hexDigits[(x - x % 16) / 16] + hexDigits[x % 16];
        };

        // Generate the classes for each color on page load
        generateColorClasses();

        return {
            /*** Coreference Annotator Color Combinations Service ***/
            getColorCombination: getColorCombination,
            clearColorCombinations: clearColorCombinations,
            rgb2hex: rgb2hex
        }
    }
]);
