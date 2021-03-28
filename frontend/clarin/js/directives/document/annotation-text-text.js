angular.module('clarin-el').directive('annotationTextText',
  function(TextWidgetAPI, TempAnnotation, Dialog) {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        groupType: '@',
        annotationType: '@',
        annotationAttribute: '@',
        annotationValue: '@',
        annotationDocumentAttribute: '@',
        cols: '@',
        rows: '@'
      },
      template: '<textarea class="form-control annotation-paragraph-text" group-type="{{groupType}}" ng-model="attributeValue" ng-focus="onFocus()" ng-blur="onBlur()"></textarea>',
      link: function(scope, elem, attrs) {
        scope.onFocus = function() { // Called when element gained focus
          setElementValue(getAnnotationValue());
        };
        scope.onBlur = function() { // Called when focus is lost
          setAnnotationValue(getElementValue());
        };
        scope.$on('sendDocumentAttribute:'+scope.annotationDocumentAttribute, function(event, ann) {
          setElementValue(getAnnotationValue());
        });
        var getElementValue = function() {
          if ("attributeValue" in scope) {
            return scope.attributeValue;
          }
          return null;
        }; // getElementValue
        var setElementValue = function(value) {
          if (getElementValue() != value) {
            scope.attributeValue = value;
          }
        }; // getElementValue
        var getAnnotationValue = function() {
          return getAnnotationAttribute().value;
        }; // getAnnotationValue
        var setAnnotationValue = function(value) {
          var annotation = getAnnotation();
          var index = getAnnotationAttributeIndex();
          if (annotation.attributes[index].value == value) return;
          annotation.attributes[index].value = angular.copy(value);
          TempAnnotation.update(annotation)
            .then(function(data) {
              TextWidgetAPI.updateAnnotation(annotation, false);
            }, function(error) {
              var modalOptions = { body: 'Error in update Annotation. Please refresh the page and try again' };
              Dialog.error(modalOptions);
            });
        }; // setAnnotationValue
        var getAnnotationAttributeIndex = function() {
          var annotation = getAnnotation();
          var attribute  = _.where(annotation.attributes, {name: scope.annotationDocumentAttribute})[0];
          return annotation.attributes.indexOf(attribute);
        }; // getAnnotationAttributeIndex
        var getAnnotationAttribute = function() {
          var annotation = getAnnotation();
          return _.where(annotation.attributes, {name: scope.annotationDocumentAttribute})[0];
        }; // getAnnotationAttribute
        var getAnnotation = function() {
          var annotation = TextWidgetAPI.getAnnotationForDocumentAttribute(scope.annotationDocumentAttribute);
          if (angular.isDefined(annotation)) {
            return annotation;
          }
          // The annotation does not exists. We must add it...
          var currentDocument = TextWidgetAPI.getCurrentDocument();
          annotation = {
            _id:                new ObjectId().toString(),
            document_id:        currentDocument.id,
            collection_id:      currentDocument.collection_id,
            annotator_id:       currentDocument.annotator_id,
            document_attribute: scope.annotationDocumentAttribute,
            type:               scope.annotationType,
            spans:              [],
            attributes:         [{
              name:  scope.annotationAttribute,
              value: scope.annotationValue
            },{
              name:  scope.annotationDocumentAttribute,
              value: ""
            }]
          };
          // Save annotation to temp & our model...
          TempAnnotation.save(currentDocument.collection_id, currentDocument.id, annotation)
            .then(function(response) { 
              if (response.success) { 
                      return annotation;
              } else {
                var modalOptions = {body: 'Error during saving your annotation. Please refresh the page and try again.'};
                Dialog.error(modalOptions);
              }
            }, function(error) {
              var modalOptions = { body: 'Database error. Please refresh the page and try again.' };
              Dialog.error(modalOptions);
            }
          );
          TextWidgetAPI.addAnnotation(annotation, false);
          return annotation;
        }; // getAnnotation
      }
    }
  }
);
