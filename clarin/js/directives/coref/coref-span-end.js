angular.module('clarin-el').directive('corefSpanEnd', ['TextWidgetAPI', function(TextWidgetAPI){
	return {
	 	restrict: 'E',
	 	replace: true,
		template : '<textarea class="form-control coref-span-end" readonly></textarea>',
		scope: {
	      annotationType: '@',
	      annotationAttribute: '@'
	    },
		link: function(scope, element, attrs) {
			var updateCorefSpanEnd = function () { 
		        var selectedAnnotation = TextWidgetAPI.getSelectedAnnotation();

		        if (!angular.equals({}, selectedAnnotation)) { //is selected annotation is not empty 
		        	//search for the specific attribute of the annotation
		        	var selAnnotationAttribute = _.findWhere(selectedAnnotation.attributes, {name: attrs.annotationAttribute});

		        	/*// if element has the specific attribute and the attribute value is different from the element's value
		        	if (!angular.isUndefined(selectedAnnotationAttribute.value.end) && selectedAnnotationAttribute.value.end != $(element).text())
		        		$(element).text(selectedAnnotationAttribute.value.end); */

		        	if (!angular.isUndefined(selAnnotationAttribute.value)) {
						var span = selAnnotationAttribute.value.split(" ");
						if (span.length==2)
							$(element).text(span[1]);
					}
		        } else if (angular.equals({}, selectedAnnotation) && $(element).text().length>0)	//else clear the input element
					$(element).text('');
	      	};

	      	//register callbacks for the annotation list and the selected annotation
	      	TextWidgetAPI.registerSelectedAnnotationCallback(updateCorefSpanEnd); 
		}
	};
}]);