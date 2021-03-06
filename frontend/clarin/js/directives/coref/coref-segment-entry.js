angular.module('clarin-el').directive('corefSegmentEntry', ['TextWidgetAPI', function(TextWidgetAPI){
	return {
	 	restrict: 'E',
	 	replace: true,
		template: '<textarea class="form-control coref-segment-entry" readonly></textarea>',
	    scope: {
	      annotationType: '@',
	      annotationAttribute: '@'
	    },
		link: function(scope, element, attrs) {
			var updateCorefSegmentEntry = function () { 
		        var selectedAnnotation = TextWidgetAPI.getSelectedAnnotation();

		        if (!angular.equals({}, selectedAnnotation)) { //is selected annotation is not empty 
		        	//search for the specific attribute of the annotation
		        	var selAnnotationAttribute = _.findWhere(selectedAnnotation.attributes, {name: attrs.annotationAttribute});

		        	//if attribute found and has segment inside, assign it to the input element
		        	/*if (!angular.isUndefined(selAnnotationAttribute.value.segment) && selAnnotationAttribute.value.segment != $(element).text()) {
		        		$(element).text(selAnnotationAttribute.value.segment);
		        		$(element).attr('title', selAnnotationAttribute.value.segment);
		        	}*/
		        	
					if (!angular.isUndefined(selAnnotationAttribute.value)) {
						var span = selAnnotationAttribute.value.split(" ");
						if (span.length==2) {
							var selSpan = _.findWhere(selectedAnnotation.spans, {start: parseInt(span[0]), end: parseInt(span[1])}); 
							if (!angular.isUndefined(selSpan.segment) && selSpan.segment != $(element).text()) {
								$(element).text(selSpan.segment);
								$(element).attr('title', selSpan.segment);
							}
						}
					}
		        } else if (angular.equals({}, selectedAnnotation) && $(element).text().length > 0) { //else clear the input element
					$(element).text('');
					$(element).attr('title', '');
				}	
	      	};

	      	//register callbacks for the annotation list and the selected annotation
	      	TextWidgetAPI.registerSelectedAnnotationCallback(updateCorefSegmentEntry); 
		}
	};
}]);