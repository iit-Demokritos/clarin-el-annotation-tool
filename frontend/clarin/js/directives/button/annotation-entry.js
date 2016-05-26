angular.module('clarin-el').directive('annotationEntry', function(TextWidgetAPI, TempAnnotation, Dialog) {
  return {
    restrict: 'E',
    replace: true,
    scope: { 
      annotationType: '@',
      annotationAttribute: '@'
    },
    template: '<textarea class="form-control annotation-entry" ng-blur="addAttribute(annotationType, annotationAttribute)" disabled></textarea>',
    link: function(scope, element, attrs) { 
      scope.addAttribute = function(type, attribute) {
        var selectedAnnotation = TextWidgetAPI.getSelectedAnnotation();

        if (!angular.equals({}, selectedAnnotation)) {
          var updatedAnnotation = angular.copy(selectedAnnotation);
          updatedAnnotation.type = type;

          var selectedAnnotationAttribute = _.where(updatedAnnotation.attributes, { name : attrs.annotationAttribute, 
                                                                                    value: attrs.annotationValue })[0];
          var attributeIndex = updatedAnnotation.attributes.indexOf(selectedAnnotationAttribute);
            
          //if attribute exists in annotation and input is empty, delete attribute from the array of attributes
          if (attributeIndex > -1 && $(element).val().length == 0)         //if attribute exists in the array of object's attributes and input is empty
            updatedAnnotation.attributes.splice(attributeIndex, 1);
          else if (attributeIndex > -1 && $(element).val().length > 0)     //if attribute exists in the array of object's attributes and input not empty
            updatedAnnotation.attributes[attributeIndex].value = $(element).val();
          else                                                         //if attribute doesn't exist in the array of object's attributes 
            updatedAnnotation.attributes.push({ name : attrs.annotationAttribute, value: $(element).val() }); 

          TempAnnotation.update(updatedAnnotation)                    //update the annotion in the temp db
          .then(function(data){ 
              TextWidgetAPI.updateAnnotation(updatedAnnotation, true);
          }, function(error){
              var modalOptions = { body: 'Error in update Annotation. Please refresh the page and try again' };
              Dialog.error(modalOptions);
          });
               
          return false;
        }
      };

      var updateSelectedAnnotationEntry = function () {   
        var selectedAnnotation = TextWidgetAPI.getSelectedAnnotation();

        if (!angular.equals({}, selectedAnnotation)) { //is selected annotation is not empty 
          var selectedAnnotationButton = $(element).closest("tr").find('.annotation-btn.active'); //search for active .annotation-btn in the same row that the element belongs

          if (selectedAnnotationButton.length>0 && $(element).is(':disabled')) {                  //if .annotation-btn is active and element is disabled
            var selectedAnnotationAttribute = _.where(selectedAnnotation.attributes, { name: attrs.annotationAttribute })[0];

            if (!angular.isUndefined(selectedAnnotationAttribute))
              $(element).val(selectedAnnotationAttribute.value);
            
            $(element).prop("disabled", false);
          } else if (selectedAnnotationButton.length==0 && !$(element).is(':disabled'))         //if no active .annotation-btn was found on the same row
            $(element).val('').prop("disabled", true);       
        } else if (angular.equals({}, selectedAnnotation) && !$(element).is(':disabled'))
          $(element).val('').prop("disabled", true);
      };

      //register callbacks for the annotation list and the selected annotation
      TextWidgetAPI.registerSelectedAnnotationCallback(updateSelectedAnnotationEntry); 
    }
  };
});