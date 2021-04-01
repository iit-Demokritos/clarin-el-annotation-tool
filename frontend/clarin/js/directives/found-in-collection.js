//angular.module('clarin-el').directive('foundInCollection', ['$compile','$rootScope', 'TextWidgetAPI', 'CoreferenceColor','OpenCreateButtonModalCtrl' function($compile,$rootScope,TextWidgetAPI, CoreferenceColor,OpenCreateButtonModalCtrl) {
angular.module('clarin-el').directive('foundInCollection', ['$compile', 'TextWidgetAPI', 'CoreferenceColor', function ($compile, TextWidgetAPI, CoreferenceColor) {
  return {
    restrict: 'A',
    replace: true,
    scope: {},
    link: function (scope, elem, attrs) {
      scope.foundInCollectionItems = 0;

      var updateFoundInCollection = function () {
        var annotationSchema  = TextWidgetAPI.getAnnotationSchema();
        var foundInCollection = TextWidgetAPI.getFoundInCollection();
        var template = "";
        // var colsNumber = 1;
        var colsNumber = elem[0].rows[0].cells[0].colSpan
        /* var colSpans = elem[0].outerHTML.match(/colspan="[0-9]*"/g);
        
         if (colSpans.length > 0) {
           splittedColSpan = colSpans[colSpans.length - 1].split("\"");
           var colsNumber = parseInt(splittedColSpan[1]);
           
         }*/

        for (var i = 0; i < foundInCollection.length; i++, scope.foundInCollectionItems++) {
          var colorCombo = CoreferenceColor.getColorCombination();
          // console.log(colorCombo)
          if (scope.foundInCollectionItems % colsNumber == 0) {
            template += "<tr>";
          }

          template += "<td><annotation-button id=\"x_button123\" annotation-type=\"" + annotationSchema.annotation_type +
            "\" annotation-attribute=\"" + annotationSchema.attribute +
            "\" annotation-value=\"" + foundInCollection[i].attributes[0].value +
            "\" label=\"" + foundInCollection[i].attributes[0].value +
            "\" custom_attribute=\"" + foundInCollection[i].attributes[0].custom_attribute +
            "\" bg-color=\"" + colorCombo["background-colour"] +
            "\" fg-color=\"" + colorCombo["font-color"] +
            "\" colour-background=\"" + colorCombo["background-colour"] +
            "\" colour-border=\"" + colorCombo["border-color"] +
            "\" colour-font=\"" + colorCombo["font-color"] +
            "\" colour-selected-background=\"" + colorCombo["selected-background-colour"] +
            "\"></annotation-button></td>";


          // change condition to put buttons horizontally
          if (scope.foundInCollectionItems == foundInCollection.length - 1 ||
              (scope.foundInCollectionItems != 0 && (scope.foundInCollectionItems + 1) % colsNumber == 0)) {
            template += "</tr>";
          }
        }
        var compiledTemplate = $compile(template)(scope);

        if (template.startsWith("<tr")) {
          elem.append(compiledTemplate);
        } else {
          var newCell = elem[0].rows[elem[0].rows.length - 1];
          $(newCell).append(compiledTemplate);
        }
      };

      TextWidgetAPI.registerFoundInCollectionCallback(updateFoundInCollection);
    },
  }
}]);

angular.module('clarin-el')
  .controller('annotationButtonCustomValueAddController', ['$scope', '$ocLazyLoad', 'Dialog', function ($scope, $ocLazyLoad, Dialog) {
    $scope.openCustomValueModal = function () {
      $ocLazyLoad.load('addCustomValueModalCtrl').then(function () {
        var modalInstance = Dialog.custom('add-custom-value-modal.html', 'addCustomValueModalCtrl', {});
      });
    };
  }])
  .directive('annotationButtonCustomValueAdd', function () {
    return {
      restrict: 'E',
      replace: true,
      scope: { label: '@' },
      template: '<a class="btn btn-xs btn-success found_in_collection_add" ng-click="openCustomValueModal()"><i class=\"fa fa-plus\"></i> {{label}}</a>',
      controller: 'annotationButtonCustomValueAddController',
    };
  });
