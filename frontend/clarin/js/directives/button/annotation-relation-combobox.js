angular.module('clarin-el').directive('relationCombobox', ['$timeout', 'TextWidgetAPI',
  function($timeout, TextWidgetAPI) {
	  return {
		  restrict: 'E',
      templateUrl: 'templates/directives/button/annotation-relation-combobox.html',
		  scope: {
        annotationType: '@',
        annotationAttribute: '@',
        annotationArgumentValues: '@'
		  },
		  link: function(scope, elem, attrs) {
        scope.annotations = [];
        scope.selectedAnnotation = null;
        
			  /**
			   * Get new annotations to show.
			   */
			  var updateAnnotationList = function() {
          $timeout(function() {
            // Get annotations
            var annotations = TextWidgetAPI.getAnnotations();
            
            // Filter annotations
            var allowedValues = scope.annotationArgumentValues.split(' ');
            
            scope.annotations =  _.filter(annotations, function(annotation) {
              // Check if the type is in the allowedValues
              var type = _.findWhere(annotation.attributes, {name: 'type'}).value;
              
              return allowedValues.indexOf(type) !== -1;
            });
          }, 0);
        };

        // Register callback for annotation updates
        TextWidgetAPI.registerAnnotationSchemaCallback(function() {
          TextWidgetAPI.registerAnnotationsCallback(updateAnnotationList);
        });
        
        // Register annotations callback manually as well (because when this loads, the annotation
        // schema has already loaded...)
        TextWidgetAPI.registerAnnotationsCallback(updateAnnotationList);
		  }
	  }
  }
]);

