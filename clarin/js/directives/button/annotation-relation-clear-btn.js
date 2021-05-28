angular.module('clarin-el').directive('relationClearBtn', function() {
	return {
		restrict: 'E',
    templateUrl: 'templates/directives/button/annotation-relation-clear-btn.html',
		scope: {
      annotationType: '@',
      annotationAttribute: '@'
		},
		link: function(scope, element, attrs) {
		  console.log('Clear button loaded');
			scope.showClearBtn = true;
		}
	}
});

