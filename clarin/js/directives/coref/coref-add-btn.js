angular.module('clarin-el').directive('corefAddBtn', ['TextWidgetAPI', function(TextWidgetAPI){
	return {
	 	restrict: 'E',
	 	replace: true,
	    scope: {
	      	annotationType: '@',
	      	annotationAttribute: '@'
	    },
	    template: '<button type="button" class="btn btn-success btn-sm btn-block coref-add-btn" ng-click="addAttribute(annotationType, annotationAttribute)"><i class="fa fa-arrow-circle-left"></i></button>',
		link: function(scope, element, attrs) {
			scope.addAttribute = function(annotationType, annotationAttribute) {
				var currentSelection = TextWidgetAPI.getCurrentSelection();

				if(!angular.equals(currentSelection, {})) {
					$(element).closest("tr").find(".coref-span-start").text(currentSelection.startOffset);
					$(element).closest("tr").find(".coref-span-end").text(currentSelection.endOffset);

					var elementIdNumber = $(element).attr('id').match(/\d+/)[0];

					if ($("#x_t" + elementIdNumber).length) {
						var segmentElement = $("#x_t" + elementIdNumber);
						segmentElement.text(currentSelection.segment);
						segmentElement.attr("title", currentSelection.segment);
					} /*else if ($(element).closest("tr").find(".coref-multi-entry").length) {
						$(element).closest("tr").find(".coref-multi-entry").text(currentSelection.segment);
						$(element).closest("tr").find(".coref-multi-entry").attr("title", currentSelection.segment);
					}
*/
					TextWidgetAPI.clearSelection();
				}
			}
		},
		controller: function($scope, $rootScope) { }
	};
}]);