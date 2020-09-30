angular.module('clarin-el').directive('corefAnnotateBtn', ['Dialog', 'TextWidgetAPI', 'TempAnnotation', function(Dialog, TextWidgetAPI, TempAnnotation) {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      annotationType: '@',
      annotationAttribute: '@'
    },
    template: '<div>' +
      '<button type="button" class="btn btn-primary btn-block coref-annotate-btn" ng-show="showAnnotateBtn" ng-click="addAnnotation()">Annotate</button>' +
      '<button type="button" class="btn btn-primary btn-block coref-annotate-btn" ng-hide="showAnnotateBtn" ng-click="updateAnnotation()">Update</button>' +
      '</div>',
    controller: function($scope) {
      $scope.addAnnotation = function() { //save the annotation to the db
        var currentDocument = TextWidgetAPI.getCurrentDocument();
        var validationResult = $scope.validateAnnotation();

        if (validationResult.valid) { //if the annotation is valid save it
          TempAnnotation.save(currentDocument.collection_id, currentDocument.id, validationResult.annotation)
            .then(function(response) {
              if (response.success)
                TextWidgetAPI.addAnnotation(validationResult.annotation, false);
              else {
                var modalOptions = {
                  body: 'Error during saving your annotation. Please refresh the page and try again.'
                };
                Dialog.error(modalOptions);
              }
            }, function(error) {
              var modalOptions = {
                body: 'Database error. Please refresh the page and try again.'
              };
              Dialog.error(modalOptions);
            });
        }
      };

      $scope.updateAnnotation = function() { //update current annotation
        var validationResult = $scope.validateAnnotation();
        var selectedAnnotation = angular.copy(TextWidgetAPI.getSelectedAnnotation());

        if (!angular.equals({}, selectedAnnotation) && validationResult.valid) { //if the user has already selected an annotation, update it
          selectedAnnotation.type = $scope.annotationType;

          if (!angular.equals(selectedAnnotation.spans, validationResult.annotation.spans)) //if the spans have changed
            selectedAnnotation.spans = angular.copy(validationResult.annotation.spans); //assign the updated annotation spans to the existing annotation 

          for (var i = 0; i < validationResult.annotation.attributes.length; i++) { //iterate through all the attributes of the annotation that returned from validation
            var selectedAnnotationAttribute = _.where(selectedAnnotation.attributes, {
              name: validationResult.annotation.attributes[i].name
            })[0];

            if (angular.isUndefined(selectedAnnotationAttribute)) //the specific attribute does not exist in the current annotation, so add it 
              selectedAnnotation.attributes.push(validationResult.annotation.attributes[i]);
            else { //the specific attribute exists in the current annotation, so update it 
              var index = selectedAnnotation.attributes.indexOf(selectedAnnotationAttribute);
              selectedAnnotation.attributes[index] = angular.copy(validationResult.annotation.attributes[i]);
            }
          }

          TempAnnotation.update(selectedAnnotation)
            .then(function(data) {
              TextWidgetAPI.updateAnnotation(selectedAnnotation, false);
            }, function(error) {
              var modalOptions = {
                body: 'Error in update Annotation. Please refresh the page and try again'
              };
              Dialog.error(modalOptions);
            });
        }
      };
    },
    link: function(scope, element, attrs) {
      scope.showAnnotateBtn = true;

      scope.validateAnnotation = function() {
        var result = {
          valid: true,
          annotation: {}
        };

        var tableRows = $('.button-widget-wrapper table tr');
        var annotationType = $('.button-widget-wrapper table tr * [annotation-type]').eq(0).attr("annotation-type");
        var selectedAnnotation = TextWidgetAPI.getSelectedAnnotation();

        if (angular.equals({}, selectedAnnotation)) {
          var currentDocument = TextWidgetAPI.getCurrentDocument();
          result.annotation = {
            _id: new ObjectId().toString(),
            document_id: currentDocument.id,
            collection_id: currentDocument.collection_id,
            type: annotationType,
            spans: [],
            attributes: []
          };
        } else {
          result.annotation = angular.copy(selectedAnnotation);
          result.annotation.spans = [];
          result.annotation.attributes = [];
        }

        $.each(tableRows, function(index, value) {
          if ($(value).find('.coref-segment-entry').length > 0) { //if row contains coreference annotation segment entry
            var startOffset = -1,
              endOffset = -1;
            var corefSegmentElement = $(value).find('.coref-segment-entry');
            var elementIdNumber = corefSegmentElement.attr('id').match(/\d+/)[0];
            var segment = corefSegmentElement.text();

            if (segment.length > 0 && $("#x_s" + elementIdNumber).length && $("#x_e" + elementIdNumber).length) { //if segment has segment, startOffset and endOffset
              startOffset = parseInt($("#x_s" + elementIdNumber).text().trim());
              endOffset = parseInt($("#x_e" + elementIdNumber).text().trim());

              var annotationSpan = {
                segment: segment,
                start: startOffset,
                end: endOffset
              };

              result.annotation.spans.push(annotationSpan);
              result.annotation.attributes.push({
                name: corefSegmentElement.attr('annotation-attribute'),
                value: annotationSpan.start + " " + annotationSpan.end
              });
            } else { //validation section 
              //result.valid = false;
              result.annotation.attributes.push({
                name: corefSegmentElement.attr('annotation-attribute'),
                value: ""
              });
            }
          } else if ($(value).find('.coref-multi-entry').length > 0) { //if row contains coreference annotation segment entry
            var startOffset = -1,
              endOffset = -1;
            var corefMultiElement = $(value).find('.coref-multi-entry');
            var elementIdNumber = corefMultiElement.attr('id').match(/\d+/)[0];
            var segment = corefMultiElement.text();

            if (segment.length > 0 && $("#x_s" + elementIdNumber).length && $("#x_e" + elementIdNumber).length) { //if segment has segment, startOffset and endOffset
              startOffset = parseInt($("#x_s" + elementIdNumber).text().trim());
              endOffset = parseInt($("#x_e" + elementIdNumber).text().trim());

              var annotationSpan = {
                segment: segment,
                start: startOffset,
                end: endOffset
              };

              result.annotation.spans.push(annotationSpan);
              result.annotation.attributes.push({
                name: corefMultiElement.attr('annotation-attribute'),
                value: annotationSpan.start + " " + annotationSpan.end
              });
            } else { //validation section 
              //result.valid = false;
              result.annotation.attributes.push({
                name: corefMultiElement.attr('annotation-attribute'),
                value: ""
              });
            }
          } else if ($(value).find('.coref-entry').length > 0) { //if row contains coreference text entry
            var corefEntryElement = $(value).find('.coref-entry');
            var segment = corefEntryElement.val();

            if (segment.length > 0) {
              result.annotation.attributes.push({
                name: corefEntryElement.attr('annotation-attribute'),
                value: segment
              });
            } else { //validation section
              //result.valid = false; 
              result.annotation.attributes.push({
                name: corefEntryElement.attr('annotation-attribute'),
                value: ""
              });
            }
          } else if ($(value).find('.coref-combobox').length > 0) { //if row contains coreference combobox
            var corefComboboxElement = $(value).find('.coref-combobox');
            var comboboxValue = corefComboboxElement.find('option:selected').val();

            if (comboboxValue != "") {
              result.annotation.attributes.push({
                name: corefComboboxElement.attr('annotation-attribute'),
                value: comboboxValue
              });
            } else { //validation section 
              //result.valid = false; 
              result.annotation.attributes.push({
                name: corefComboboxElement.attr('annotation-attribute'),
                value: ""
              });
            }
          } else if ($(value).find('.coref-checkbox').length > 0) { //if row contains coreference checkbox 
            var corefCheckboxElement = $(value).find('.coref-checkbox');
            var corefCheckboxInputElement = corefCheckboxElement.find('input');

            if (corefCheckboxInputElement.is(':checked')) {
              result.annotation.attributes.push({
                name: corefCheckboxElement.attr('annotation-attribute'),
                value: 1
              });
            } else {
              result.annotation.attributes.push({
                name: corefCheckboxElement.attr('annotation-attribute'),
                value: 0
              });
            }
          } else if ($(value).find('.coref-btn.active').length > 0) { //if row contains coreference checkbox
            var corefBtnElement = $(value).find('.coref-btn.active');
            result.annotation.attributes.push({
              name: corefBtnElement.attr('annotation-attribute'),
              value: corefBtnElement.attr('annotation-value')
            });

            corefBtnElement.removeClass('active');
            corefBtnElement.css('color', '#333');
            corefBtnElement.css('background', '#fff');
          }
        });

        if (result.annotation.spans.length == 0)
          result.valid = false;
        
        return result;
      };

      var annotationSelectionUpdate = function() {
        var selectedAnnotation = TextWidgetAPI.getSelectedAnnotation();

        if (angular.equals({}, selectedAnnotation)) //selected annotation exists
          scope.showAnnotateBtn = true;
        else //selected annotation not empty
          scope.showAnnotateBtn = false;
      }

      //register callbacks for the selected annotation
      TextWidgetAPI.registerSelectedAnnotationCallback(annotationSelectionUpdate);
    }
  };
}]);
