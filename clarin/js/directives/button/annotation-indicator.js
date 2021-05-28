angular.module('clarin-el').directive('annotationIndicator', ['TextWidgetAPI', 'CoreferenceColor', function(TextWidgetAPI, CoreferenceColor) {
  return {
    restrict: 'E',
    replace: true,
    scope: {},
    template: '<span class="annotation-indicator">Editing..</span>',
    link: function(scope, elem, attrs) {
      //function to be called when the selected annotation being updated
      var updateAnnotationIndicator = function () {
        var selectedAnnotation = TextWidgetAPI.getSelectedAnnotation();
  
        if (angular.equals(selectedAnnotation, {})) {
          if (!angular.equals(elem.css('background-color'), "rgb(255, 255, 255)") || !angular.equals(elem.css('color'), "rgb(255, 255, 255)")) {
            elem.css('color', '#fff');
            elem.css('background-color', '#fff');
          }
        } else {
          var colorCombo = CoreferenceColor.getColorCombination(selectedAnnotation._id);

          if (!angular.equals(colorCombo, {})) {
            if (TextWidgetAPI.getAnnotatorType() == "Button Annotator") {
                elem.css('color', colorCombo.fg_color);
                elem.css('background-color', colorCombo.bg_color);
            } else {
                elem.css('color', colorCombo["font-color"]);
                elem.css('background-color', colorCombo["selected-background-colour"]);
            }
          }
        }
      };

      //register callbacks for the annotation list and the selected annotation
      TextWidgetAPI.registerSelectedAnnotationCallback(updateAnnotationIndicator);      
    }
  };
}]);

