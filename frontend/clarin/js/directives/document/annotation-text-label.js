angular.module('clarin-el').directive('annotationTextLabel',
  function() {
    return {
      restrict: 'E',
      transclude: true,
      scope: {
        groupType: '@',
        title: '@'
      },
      template: '<div group-type="{{groupType}}"><ng-transclude></ng-transclude></div>',
      link: function(scope, elem, attrs) {
      }
    }
  }
);
