angular.module('clarin-el').directive('annotationText',
  function() {
    return {
      restrict: 'E',
      transclude: true,
      scope: {
        groupType: '@'
      },
      template: '<ng-transclude></ng-transclude>',
      link: function(scope, elem, attrs) {
      }
    }
  }
);
