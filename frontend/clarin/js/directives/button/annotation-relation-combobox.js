angular.module('clarin-el').directive('relationCombobox', function() {
	return {
		restrict: 'E',
    templateUrl: 'templates/directives/button/annotation-relation-combobox.html',
		scope: {
      annotationType: '@',
      annotationAttribute: '@'
		},
		link: function(scope, element, attrs) {
			console.log('Relation combobox loaded');
		}
	}
});

