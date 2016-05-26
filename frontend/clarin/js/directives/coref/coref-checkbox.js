angular.module('clarin-el').directive('corefCheckbox', ['TextWidgetAPI', function(TextWidgetAPI){
	return {
	 	restrict: 'E',
	 	replace: true,
		scope: {
	      	annotationType: '@',
	      	annotationAttribute: '@'
	    },
		template: '<div class="checkbox coref-checkbox"><label><input type="checkbox"> ({{annotationAttribute}})</label></div>',
		link: function(scope, element, attrs) {
			var updateCorefCheckbox = function () {
		        var selectedAnnotation = TextWidgetAPI.getSelectedAnnotation();

		        if (!angular.equals({}, selectedAnnotation)) { //is selected annotation is not empty 
		        	var selAnnotationAttribute = _.findWhere(selectedAnnotation.attributes, {name: attrs.annotationAttribute});

		        	// if element has the specific attribute, it is not checked and the attribute value is 1
		        	if (!angular.isUndefined(selAnnotationAttribute) && !$(element).find('input').prop('checked') && 
		        		/^\d+$/.test(selAnnotationAttribute.value) && selAnnotationAttribute.value == 1) 
		        		$(element).find('input').prop('checked', true);			        
				} else if (angular.equals({}, selectedAnnotation) && $(element).find('input').prop('checked')) //if selected annotation not empty and checkbox checked 
						$(element).find('input').prop('checked', false);
	      	}

	      	//register callbacks for the annotation list and the selected annotation
	      	TextWidgetAPI.registerSelectedAnnotationCallback(updateCorefCheckbox); 
		}
	};
}]);