angular.module('clarin-el').directive('relationDelBtn', function() {
	return {
		restrict: 'E',
    templateUrl: 'templates/directives/button/annotation-relation-del-btn.html',
		scope: {
      annotationType: '@',
      annotationAttribute: '@'
		},
		link: function(scope, element, attrs) {
		  console.log('Del button loaded');
			
		}
	}
});

