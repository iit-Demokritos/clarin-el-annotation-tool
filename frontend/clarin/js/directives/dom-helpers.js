angular.module('clarin-el').directive('documentAttributes', function () {
/*
    'A' - only matches attribute name
    'E' - only matches element name
    'C' - only matches class name
    'M' - only matches comment
*/
  return {
    restrict: 'C',
    link: function (scope, element, attrs) {
      // This element should be moved to id=main-content-annotate-document-attributes
      var moveTo = angular.element('#main-content-annotate-document-attributes td[class~="main-content-attributes-cell"]:last');
      var toMove = element[0].closest('tr');
      //toMove.appendTo(moveTo);
      element.appendTo(moveTo);
      scope.$on("$destroy", function() {
        element.remove();
      });
      var tr = angular.element('<tr class="main-content-attributes-row"><td class="main-content-attributes-cell"></td></tr>');
      angular.element('#main-content-annotate-document-attributes tbody').append(tr);
    }
  };
});

angular.module('clarin-el').directive('triggerResize', function ($timeout) {//trigger resize when annotation visualizer is pressed in the annotation page, solves ui.layout rendering problem 
  return {
    restrict: 'A',
    link: function (scope, elem, attrs) {
      var triggered = false;

      scope.$watch('sidebarSelector', function (newValue, oldValue) {
        var flowEffectTop = $('#annotation-sidebar-header').hasClass('flow-effect-top');

        if (angular.equals(newValue, "annotator") && !flowEffectTop) {
          $('#annotation-sidebar-header').addClass('flow-effect-top');
        } else if (angular.equals(newValue, "annotationVisualiser") && flowEffectTop) {
          if (!triggered) {
            $timeout(function () { $(window).trigger('resize'); }, 0);
            triggered = true;
          }

          $('#annotation-sidebar-header').removeClass('flow-effect-top');
        }
      });
    }
  }
});

angular.module('clarin-el').directive('modalFocus', function ($timeout) {
  return {
    restrict: 'A',
    link: function (_scope, _element) {
      $timeout(function () {
        _element[0].select();
      }, 100);
    }
  };
});

angular.module('clarin-el').directive('color', function () {
  return {
    restrict: 'A',
    scope: { color: '@' },
    link: function (scope, element, attrs) {
      element.css('color', scope.color);
    }
  };
});

angular.module('clarin-el').directive('slimscroll', function () {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      $(element).slimScroll({
        color: '#444',
        size: '5px',
        height: attrs.scrollHeight + 'px',
        distance: '3px',
        alwaysVisible: false
      });
    }
  };
});

angular.module('clarin-el').directive('autoslimscroll', function () {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      $(element).slimScroll({
        color: '#444',
        size: '5px',
        height: ($(window).height() - attrs.scrollSubtractionHeight) + 'px',
        distance: '3px',
        alwaysVisible: false
      });

      $(window).resize(function () {
        $(element).slimScroll({ height: ($(window).height() - attrs.scrollSubtractionHeight) + 'px' });
      });
    }
  };
});

angular.module('clarin-el').directive('autoheight', function () {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      $(element).height($(window).height() - attrs.scrollSubtractionHeight);
      $(element).css('overflow', 'none');

      $(window).resize(function () {
        $(element).height($(window).height() - attrs.scrollSubtractionHeight);
      });
    }
  };
});
