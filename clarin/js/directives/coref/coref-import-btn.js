angular.module('clarin-el').directive('corefImportBtn', ['TextWidgetAPI', function(TextWidgetAPI){
	return {
	 	restrict: 'E',
	 	replace: true,
	 	scope: {
      annotationType: '@',
      annotationAttribute: '@'
	  },
	  template: '<button type="button" class="btn btn-success btn-sm btn-block coref-import-btn" disabled><i class="fa fa-arrow-circle-left"></i></button>',
		link: function(scope, element, attrs) {

			/*var annotationSelectionUpdate = function () {
				var selectedAnnotation = TextWidgetAPI.getSelectedAnnotation();
	
				if (angular.equals({}, selectedAnnotation)) {	//selected annotation exists
					scope.showClearBtn = true;
				} else {										//selected annotation not empty
					scope.showClearBtn = false;
				}
			}

  			//register callbacks for the selected annotation
  			TextWidgetAPI.registerSelectedAnnotationCallback(annotationSelectionUpdate);*/
		}
	};
}]);