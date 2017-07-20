angular.module("clarin-el").factory("CoreferenceColor", ["$filter", "CoreferenceColorData",
    function ($filter, CoreferenceColorData) {
        var colorCursor = -1;
        var annotationColors = [];
        var colorCombinations = CoreferenceColorData.getColors();

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
         * Create CSS classes and add them to the page. Modified version of: https://stackoverflow.com/a/22697964
         * @param rules Object containing selector (key)/rule (value) pairs
         */
        var addCSSRulesToPage = function (rules) {
            var style = document.createElement("style");
            style.type = "text/css";
            document.getElementsByTagName("head")[0].appendChild(style);

            if (!(style.sheet || {}).insertRule) {
                _.each(rules, function (rule, selector) {
                    console.log(rule, selector);
                    (style.styleSheet || style.sheet).addRule(selector, rule);
                });
            } else {
                _.each(rules, function (rule, selector) {
                    style.sheet.insertRule(selector + "{" + rule + "}", 0);
                });
            }
        };

        /**
         * For each color combination, generate a CSS class that adds the corresponding background color to the
         * pseudo-element that contains the marker's key/type
         */
        var generateColorClasses = function () {
            var rules = {};

            // Generate the rules
            _.each(colorCombinations, function (combo) {
                var className = ".mark_color_" + (combo["border-color"].replace("#", "")) + ":after";

                rules[className] = "background-color:" + combo["border-color"];
            });

            // Add rules to the page
            addCSSRulesToPage(rules);
        };

        // Generate the classes for each color on page load
        generateColorClasses();

        return {
            /*** Coreference Annotator Color Combinations Service ***/
            getColorCombination: getColorCombination,
            clearColorCombinations: clearColorCombinations,
        }
    }
]);
