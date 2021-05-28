angular.module('clarin-el').directive('corefDelBtn', function(){
	return {
	 	restrict: 'E',
	 	replace: true,
	    scope: {
			annotationType: '@',
			annotationAttribute: '@'
	    },
	    template: '<button type="button" class="btn btn-danger btn-sm btn-block coref-del-btn" ng-click="deleteAttribute()"><i class="fa fa-times"></i></button>',
		link: function(scope, element, attrs) {
			scope.deleteAttribute = function() {
				$(element).closest("tr").find(".coref-span-start").text('');
				$(element).closest("tr").find(".coref-span-end").text('');

				var elementIdNumber = $(element).attr('id').match(/\d+/)[0];

				if ($("#x_t" + elementIdNumber).length) {
					var segmentElement = $("#x_t" + elementIdNumber);
					segmentElement.text('');
					segmentElement.removeAttr('title')
				} /*else if ($(element).closest("tr").find(".coref-multi-entry").length) {
					$(element).closest("tr").find(".coref-multi-entry").text('');
					$(element).closest("tr").find(".coref-multi-entry").removeAttr('title')
				}*/
			}
		}
	};
});