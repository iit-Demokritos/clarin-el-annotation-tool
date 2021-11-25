angular.module('clarin-el').directive('annotationRelationCombobox', ['$timeout', 'TextWidgetAPI',
  function ($timeout, TextWidgetAPI) {
    return {
      restrict: 'E',
      templateUrl: 'templates/directives/button/annotation-relation-combobox.html',
      scope: {
        annotationType: '@',
        annotationAttribute: '@',
        annotationArgumentAnnotation: '@',
        annotationArgumentAttribute: '@',
        annotationArgumentValues: '@',
	annotationRelationType: '@',
        annotationRelationAttribute: '@',
        annotationRelationValue: '@'
      },
      link: function (scope, elem, attrs) {
        scope.annotations = [];
        scope.selectedAnnotationId = '';

        // Create object used to filter selected annotations
        var selAnnotationFilter = {
          name: scope.annotationRelationAttribute
        };

        /**
         * Get new annotations to show.
         */
        var updateAnnotationList = function () {
          $timeout(function () {
            // Get annotations
            scope.annotations = TextWidgetAPI.selectAnnotations(scope.annotationArgumentAnnotation,
                    scope.annotationArgumentAttribute, scope.annotationArgumentValues.split(' '));
          }, 0);
        };

        var annotationSelected = function () {
          // Get the selected annotation
          var annotation = TextWidgetAPI.getSelectedAnnotation();

          // Check if the selected annotation has the same type as this combobox
          if (annotation.type !== scope.annotationType) {
            scope.selectedAnnotationId = '';
            return;
          }

          // Check if this annotation concerns this combobox (same relation attribute value)
          var relationAttributeValue = _.findWhere(annotation.attributes, selAnnotationFilter).value;

          if (relationAttributeValue !== scope.annotationRelationValue) {

            scope.selectedAnnotationId = '';
            return;
          }

          // Get the selected annotation ID from the attributes of the arrow annotation
          var id = _.findWhere(annotation.attributes, { name: scope.annotationAttribute }).value;

          // Find the annotation with this ID in the list of annotations and select it
          scope.selectedAnnotationId = id;
        }

        // Register callback for annotation updates
        var schemaCallback = function () {
          TextWidgetAPI.registerAnnotationsCallback(updateAnnotationList);
          TextWidgetAPI.registerSelectedAnnotationCallback(annotationSelected);
        }
        TextWidgetAPI.registerAnnotationSchemaCallback(schemaCallback);

        // Make sure we register the callbacks when the component loads
        schemaCallback();
      }
    }
  }
]);

