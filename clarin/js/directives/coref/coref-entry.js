angular.module('clarin-el').directive('corefEntry', ['TextWidgetAPI', function(TextWidgetAPI){
	return {
	 	restrict: 'E',
	 	replace: true,
	    template : '<textarea class="form-control coref-entry" ng-focus="focus()"></textarea>',
	    scope: {
	      annotationType: '@',
	      annotationAttribute: '@'
	    },
		link: function(scope, element, attrs) {
			scope.focus = function() { //remove selection if exists on the text-widget 
				TextWidgetAPI.clearSelection();
			};

			var updateCorefEntry = function () { 
		        var selectedAnnotation = TextWidgetAPI.getSelectedAnnotation();

		        if (!angular.equals({}, selectedAnnotation)) { //is selected annotation is not empty
		        	//search for the specific attribute of the annotation
		        	var selectedAnnotationAttribute = _.where(selectedAnnotation.attributes, {name: attrs.annotationAttribute})[0];
		        	
		        	// if element has the specific attribute, the attribute value is different from the element's value
		        	if (!angular.isUndefined(selectedAnnotationAttribute.value) && 
		        		selectedAnnotationAttribute.value != $(element).val())
		        		$(element).val(selectedAnnotationAttribute.value); 	
		        } else if (angular.equals({}, selectedAnnotation) && $(element).val().length > 0) //if the selected annotation is empty and the element value is not empty
					$(element).val('');
	      	}

	      	//register callbacks for the annotation list and the selected annotation
	      	TextWidgetAPI.registerSelectedAnnotationCallback(updateCorefEntry); 
		}
	};
}]);