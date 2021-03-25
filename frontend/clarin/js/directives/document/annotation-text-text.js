angular.module('clarin-el').directive('annotationTextText',
  function() {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        groupType: '@',
        annotationType: '@',
        annotationAttribute: '@',
        cols: '@',
        rows: '@'
      },
      template: '<textarea class="form-control annotation-paragraph-text" group-type="{{groupType}}"></textarea>',
      link: function(scope, elem, attrs) {
      }
    }
  }
);
