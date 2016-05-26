angular.module('clarin-el').directive('annotationCombobox', ['TextWidgetAPI', function(TextWidgetAPI){
	return {
	 	restrict: 'E',
	 	replace: true,
		/*require: '^annotationManagerWidget',*/
		scope: {
	    	annotationType: '@',
	      	annotationAttribute: '@',
	      	values: '@'
	    },
		template: '<select class="form-control coref-combobox" disabled>' +
					'<option value="">Please select an option</option>' +
					'<option ng-repeat="option in comboOptions" value="{{option}}">' +
			     		'{{option}}' +
			    	'</option>'
				+ '</select>',
		controller: function($scope) {
			if (!angular.isUndefined($scope.values))
				$scope.comboOptions = $scope.values.split(";");
		}, link: function(scope, element, attrs) {
			var updateCorefCombobox = function () {
		        var selectedAnnotation = TextWidgetAPI.getSelectedAnnotation();

		        if (!angular.equals({}, selectedAnnotation)) { //is selected annotation is not empty 
		        	var selectedAnnotationAttribute = _.where(selectedAnnotation.attributes, {name: attrs.annotationAttribute})[0];
		        										
		        	// if element has the specific attribute, the attribute value is inside comboOptions and the option selected is different
		        	if (!angular.isUndefined(selectedAnnotationAttribute) && 
		        		!angular.isUndefined(selectedAnnotationAttribute.value) &&  
		        		selectedAnnotationAttribute.value != $(element).val() &&
		        		scope.comboOptions.indexOf(selectedAnnotationAttribute.value) > -1 )
		        		$(element).val(selectedAnnotationAttribute.value); 	
		        } else if (angular.equals({}, selectedAnnotation) && $(element).val().length > 0)	//if selected annotation is empty and not the default value is selected in select 
					$(element).val('');
	      	}

	      	//register callbacks for the annotation list and the selected annotation
	      	TextWidgetAPI.registerSelectedAnnotationCallback(updateCorefCombobox); 
		}
	};
}]);