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
			   * Get new annotations to show
			   */
			  var updateAnnotationList = function() {
          $timeout(function() {
            scope.annotations = TextWidgetAPI.getAnnotations();
            
            // todo: filter annotations by their type based on scope.annotationArgumentValues
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

