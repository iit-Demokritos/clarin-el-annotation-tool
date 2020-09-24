angular.module('clarin-el').directive('relationAnnotateBtn', function() {
	return {
		restrict: 'E',
    templateUrl: 'templates/directives/button/annotation-relation-annotate-btn.html',
		scope: {
      annotationType: '@',
      annotationAttribute: '@'
		},
		link: function(scope, element, attrs) {
		  scope.showAnnotateBtn = true;
			console.log('Annotate button loaded');
		}
	}
});

