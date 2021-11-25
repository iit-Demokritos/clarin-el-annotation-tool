angular.module('clarin-el').directive('annotationRelation',
  function() {
          return {
                  restrict: 'E',
                  transclude: true,
      templateUrl: 'templates/directives/button/annotation-relation.html',
                  scope: {
        title: '@',
        annotationType: '@',
        annotationAttribute: '@',
        annotationValue: '@',
        annotationArgumentNumber: '@',
        annotationWidgetIds: '@'
                  },
                  link: function(scope, elem, attrs) {
        
                  }
          }
  }
);

