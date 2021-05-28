angular.module('clarin-el').directive('corefSpanStart', ['TextWidgetAPI', function(TextWidgetAPI){
	return {
	 	restrict: 'E',
	 	replace: true,
		template : '<textarea class="form-control coref-span-start" readonly></textarea>',
	    scope: {
	      annotationType: '@',
	      annotationAttribute: '@'
	    },
		link: function(scope, element, attrs) {
			var updateCorefSpanStart = function () { 
		        var selectedAnnotation = TextWidgetAPI.getSelectedAnnotation();

		        if (!angular.equals({}, selectedAnnotation)) { //if selected annotation is not empty 
		        	//search for the specific attribute of the annotation
		        	var selAnnotationAttribute = _.findWhere(selectedAnnotation.attributes, {name: attrs.annotationAttribute});
		        	
		        	/*// if element has the specific attribute and the attribute value is different from the element's value
		        	if (!angular.isUndefined(selectedAnnotationAttribute.value.start) && selectedAnnotationAttribute.value.start != $(element).text())
		        		$(element).text(selectedAnnotationAttribute.value.start); */	

		        	if (!angular.isUndefined(selAnnotationAttribute.value)) {
						var span = selAnnotationAttribute.value.split(" ");
						if (span.length==2)
							$(element).text(span[0]);
					}
		        } else if (angular.equals({}, selectedAnnotation) && $(element).text().length>0)	//else clear the input element
					$(element).text('');
	      	};

	      	//register callbacks for the annotation list and the selected annotation
	      	TextWidgetAPI.registerSelectedAnnotationCallback(updateCorefSpanStart); 
		}
	};
}]);