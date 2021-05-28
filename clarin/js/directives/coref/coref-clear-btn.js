angular.module('clarin-el').directive('corefClearBtn', ['TextWidgetAPI', function(TextWidgetAPI){
	return {
	 	restrict: 'E',
	 	replace: true,
	 	scope: {
      		annotationType: '@',
      		annotationAttribute: '@'
	  	},
		template: 	'<div>'
    					+ '<button type="button" class="btn btn-danger btn-block coref-clear-btn" ng-show="showClearBtn" ng-click="resetInputFields()">Clear</button>'
    					+ '<button type="button" class="btn btn-danger btn-block coref-clear-btn" ng-hide="showClearBtn" ng-click="resetInputFields()">Cancel</button>'
    				+ '</div>',
		link: function(scope, element, attrs) {
			scope.showClearBtn = true;

			scope.resetInputFields = function () {     //reset all annotator's widgets 
	    		$('.coref-combobox').val('');
	    		$('.coref-entry').val('');
	    		$('.coref-multi-entry').val('');
	    		$('.coref-segment-entry').text('');
	    		$('.coref-span-end').text('');
	    		$('.coref-span-start').text('');
	    		$('.coref-checkbox input').attr('checked', false);
	        	$('.coref-btn.active').css('color', '#333');
	        	$('.coref-btn.active').css('background', '#fff');
	        	$('.coref-btn.active').removeClass('active');
	  		}

	  		var annotationSelectionUpdate = function () {
	  			var selectedAnnotation = TextWidgetAPI.getSelectedAnnotation();
	  			if (angular.equals({}, selectedAnnotation)) //selected annotation exists
	  				scope.showClearBtn = true;
	  			else									                      //selected annotation not empty
	  				scope.showClearBtn = false;
	  		}

  			//register callbacks for the selected annotation
  			TextWidgetAPI.registerSelectedAnnotationCallback(annotationSelectionUpdate);
		}
	};
}]);