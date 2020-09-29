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
        
        scope.change = function () {
         console.log(scope.selectedAnnotation);
        }
        
        var annotationSelected = function() {
          var annotation = TextWidgetAPI.getSelectedAnnotation();
          
          // Check that the selected annotation type is the same as this combobox
          if (annotation.type !== scope.annotationType) {
            return;
          }
          
          // TODO: we need to filter by the attack/support information here...
          
          // Get the selected annotation ID from the attributes of the arrow annotation
          var id = _.findWhere(annotation.attributes, {name: scope.annotationAttribute}).value;
          
          // Find the annotation with this ID in the list of annotations and select it
          scope.selectedAnnotation = _.findWhere(scope.annotations, {_id: id});
        }

        // Register callback for annotation updates
        var schemaCallback = function() {
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

