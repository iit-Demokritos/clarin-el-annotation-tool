angular.module('clarin-el').directive('annotatorWidget', ['$compile', '$ocLazyLoad', 'TextWidgetAPI', 'AnnotatorsTemplate', 'ButtonColor' , 'CoreferenceColor', 'AnnotationSchema', 'Dialog',
	function($compile, $ocLazyLoad, TextWidgetAPI, AnnotatorsTemplate, ButtonColor, CoreferenceColor, AnnotationSchema, Dialog) {
 	return {
	    restrict: 'E',
	    replace: true,
	    link: function(scope, elem, attrs) {
			var updateAnnotatorTemplate = function() {
	    		scope.annotatorType = TextWidgetAPI.getAnnotatorType();
	    		scope.annotationSchema = TextWidgetAPI.getAnnotationSchema();

		    	AnnotatorsTemplate.getTemplate(scope.annotatorType, scope.annotationSchema)
		        .then(function(annotatorsTemplate) {
		          	ButtonColor.clearColorCombinations();		
		          	CoreferenceColor.clearColorCombinations();

			    	if (angular.equals(scope.annotatorType, "Button Annotator")) {
			    		var foundInCollectionPosition = annotatorsTemplate.indexOf("<table") + 6;

		          		annotatorsTemplate = annotatorsTemplate.slice(0, foundInCollectionPosition) 
		          			   			   + " found-in-collection"
		          			   			   + annotatorsTemplate.slice(foundInCollectionPosition);
			    	}

		          	elem.html('<div autoslimscroll scroll-subtraction-height="145">' + annotatorsTemplate + '</div>');
		          	$compile(elem.contents())(scope);

			        AnnotationSchema.update(scope.annotationSchema, scope.annotatorType)
			        .then(function(response) {
			            if(!response.success) {
			            	var modalOptions = { body: 'Error during the save annotations. Please refresh the page and try again.' };
			            	Dialog.error(modalOptions);
			            }
			        }, function(error){ 
			            var modalOptions = { body: 'Database error. Please refresh the page and try again.' };
			            Dialog.error(modalOptions);
			        });
		        });
		    };

	      	TextWidgetAPI.registerAnnotationSchemaCallback(updateAnnotatorTemplate);
	    }
  	};
}]);