angular.module('clarin-el').directive('annotationRelation',
  function() {
	  return {
		  restrict: 'E',
		  transclude: true,
      templateUrl: 'templates/directives/button/annotation-relation.html',
		  scope: {
        title: '@',
        annotationAttribute: '@',
        annotationValue: '@'
		  },
		  link: function(scope, elem, attrs) {
        
		  }
	  }
  }
);

