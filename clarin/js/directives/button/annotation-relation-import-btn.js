angular.module('clarin-el').directive('relationImportBtn', function() {
	return {
		restrict: 'E',
    templateUrl: 'templates/directives/button/annotation-relation-import-btn.html',
		scope: {
      annotationType: '@',
      annotationAttribute: '@'
		},
		link: function(scope, element, attrs) {
			console.log('Import button loaded');
		}
	}
});

