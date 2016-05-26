angular.module('clarin-el').directive('annotationDateentry', function(TextWidgetAPI, TempAnnotation, Dialog, $filter) {
  return {
    restrict: 'E',
    replace: true,
    /*require: '^annotationManagerWidget',*/
    template: '<div class="input-group col-md-12 annotation-date-entry">'
                + '<input disabled readonly="readonly" annotation-type="{{annotationType}}" annotation-attribute="{{annotationAttribute}}" ng-click="open($event)" ng-change="addAttribute(annotationType, annotationAttribute)" type="text" class="form-control datepicker-input" datepicker-popup="{{format}}" ng-model="dt" is-open="opened" datepicker-options="dateOptions" ng-required="true" close-text="Close"/>'
                + '<span class="input-group-btn date-entry-btn">'
                  + '<button type="button" class="btn btn-default btn-sm datepicker-btn" ng-click="open($event)" disabled><i class="fa fa-calendar-minus-o"></i></button>'
                + '</span>'
            + '</div>',
    scope: { 
      annotationType: '@',
      annotationAttribute: '@'
    },
    link: function(scope, element, attrs) { 
      scope.open = function($event) {
        $event.preventDefault();
        $event.stopPropagation();

        if (!angular.isUndefined($(element).children().eq(0).val())) {
          var newDt = new Date($(element).children().eq(0).val());
          var newDtFormatted = $filter('date')(newDt, 'MM/dd/yyyy 00:00:00 UTC');

          scope.dt = newDtFormatted;
        }

        scope.opened = true;
      };

      var updateSelectedAnnotationDateEntry = function () {
        var selectedAnnotation = TextWidgetAPI.getSelectedAnnotation();

        if (!angular.equals({}, selectedAnnotation)) { //is selected annotation is not empty 
          var selectedAnnotationButton = $(element).closest("tr").find('.annotation-btn.active'); //search for active .annotation-btn in the same row that the element belongs

          if (selectedAnnotationButton.length > 0 && $(element).find('.datepicker-input').is(':disabled')) {                  //if .annotation-btn is active and element is disabled
            var selectedAnnotationAttribute = _.where(selectedAnnotation.attributes, { name: attrs.annotationAttribute })[0];
            
            if (!angular.isUndefined(selectedAnnotationAttribute))
              $(element).find('.datepicker-input').val(selectedAnnotationAttribute.value);
            
            $(element).find('.datepicker-input').prop("disabled", false);
            $(element).find('.datepicker-btn').prop("disabled", false); 
          } else if (selectedAnnotationButton.length == 0 && !$(element).find('.datepicker-input').is(':disabled')) {        //if no active .annotation-btn was found on the same row
            $(element).find('.datepicker-input').val("").prop("disabled", true);
            $(element).find('.datepicker-btn').prop("disabled", true); 
          }     
        } else if (angular.equals({}, selectedAnnotation) && !$(element).find('.datepicker-input').is(':disabled')) {
          $(element).find('.datepicker-input').val("").prop("disabled", true);
          $(element).find('.datepicker-btn').prop("disabled", true);
        }
      }

      //register callbacks for the annotation list and the selected annotation
      TextWidgetAPI.registerSelectedAnnotationCallback(updateSelectedAnnotationDateEntry); 
    },
    controller: function($scope, $rootScope) {
      $scope.dt = null;
      $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
      };

      $scope.format = 'MM/dd/yyyy 00:00:00 UTC';

      $scope.addAttribute = function (type, attribute) { 
        var selectedAnnotation = TextWidgetAPI.getSelectedAnnotation();
        if (!angular.equals({}, selectedAnnotation)) {
          var updatedAnnotation = angular.copy(selectedAnnotation);
          updatedAnnotation.type = type;

          var selectedAnnotationAttribute = _.where(updatedAnnotation.attributes, { name : $scope.annotationAttribute })[0];
          var attributeIndex = updatedAnnotation.attributes.indexOf(selectedAnnotationAttribute);

          if (attributeIndex > -1 && $scope.dt == null)       //if date cleared, remove the attribute
            updatedAnnotation.attributes.splice(attributeIndex, 1);
          else if (attributeIndex > -1 && $scope.dt != null)  //update the existing value of the specific attribute
            updatedAnnotation.attributes[attributeIndex].value = $filter('date')($scope.dt, $scope.format);
          else                                                //format date and add it to the annotation atrributes 
            updatedAnnotation.attributes.push({ name : $scope.annotationAttribute, 
                                                value: $filter('date')($scope.dt, $scope.format) }); 

          TempAnnotation.update(updatedAnnotation)
          .then(function(data){
            TextWidgetAPI.updateAnnotation(updatedAnnotation, true);
          }, function(error){
              var modalOptions = { body: 'Error in update Annotation. Please refresh the page and try again' };
              Dialog.error(modalOptions);
          });
                 
          return false;
        }
      }
    }
  }
});