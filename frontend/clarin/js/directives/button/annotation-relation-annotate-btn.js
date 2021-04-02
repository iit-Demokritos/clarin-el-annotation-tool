angular.module('clarin-el').directive('relationAnnotateBtn', ['TextWidgetAPI', 'TempAnnotation', 'Dialog',
  function(TextWidgetAPI, TempAnnotation, Dialog) {
    return {
      restrict: 'E',
      templateUrl: 'templates/directives/button/annotation-relation-annotate-btn.html',
      scope: {
        annotationRelationWidgetId: '@',
        annotationWidgetIds: '@',
        textvariable: '@'
      },
      link: function(scope, element, attrs) {
        // Create list of combobox element IDs
        var comboboxIds = scope.annotationWidgetIds.split(' ');
      
        // Get the <annotation-relation> element and its scope
        var relElem = $('#' + scope.annotationRelationWidgetId).children().first()[0];
        var relationScope = angular.element(relElem).scope();
        // console.warn("relationAnnotateBtn:", relElem, relationScope);

        // Create the annotation attribute & value
        var annotationAttribute = {
          name: relationScope.annotationAttribute,
          value: relationScope.annotationValue
        }

        // Initialize the annotate btn variable
        scope.showAnnotateBtn = true;

        /**
         * Save a new annotation
         */
        scope.addAnnotation = function() {
          var currentDocument = TextWidgetAPI.getCurrentDocument();

          // Create annotation object
          var annotation = {
            _id: new ObjectId().toString(),
            document_id: currentDocument.id,
            collection_id: currentDocument.collection_id,
            annotator_id: currentDocument.annotator_id,
            type: null,
            spans: [],
            attributes: [
              annotationAttribute
            ]
          };

          // Create attributes for each combobox
          _.each(comboboxIds, function(id) {
            // Get div of combobox component from its id (the first child node is the div)
            var elem = $('#' + id).children().first()[0];

            // Get angular scope from the element
            var elemScope = angular.element(elem).scope();

            var annotationAttribute = elemScope.annotationAttribute;
            var annotationType = elemScope.annotationType;
            var selectedAnnotationId = elemScope.selectedAnnotationId;

            // Set annotation type of the annotation
            annotation.type = annotationType;
            
            if (selectedAnnotationId.length > 0) {
              var attribute = {
                name: annotationAttribute,
                value: selectedAnnotationId
              };

              // Add attribute from this combobox to the annotation
              annotation.attributes.push(attribute);
            }
          });
          
          // We must have 3 attributes.
          if (annotation.attributes.length < 1 + comboboxIds.length) {
            // Show error
            Dialog.error({
              body: 'Please select two annotations to connect and try again.'
            });
            return;
          }

          // Save the annotation
          TempAnnotation.save(currentDocument.collection_id, currentDocument.id, annotation)
            .then(function(response) {
              if (response.success) {
                TextWidgetAPI.addAnnotation(annotation, false);
              } else {
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
        };

        /**
         * Update the annotation with new values.
         */
        scope.updateAnnotation = function() {
          // Create copy of the selected annotation (to update its values)
          var annotation = angular.copy(TextWidgetAPI.getSelectedAnnotation());
          
          // Update attributes of the comboboxes
          _.each(comboboxIds, function(id) {
            // Get div of combobox component from its id (the first child node is the div)
            var elem = $('#' + id).children().first()[0];

            // Get angular scope from the element
            var elemScope = angular.element(elem).scope();

            // Get the attribute name and its new value
            var annotationAttribute = elemScope.annotationAttribute;
            var newValue = elemScope.selectedAnnotationId;
            
            // Find the attribute with annotationAttribute as its name and update the value
            var attribute = _.findWhere(annotation.attributes, {name: annotationAttribute});
            
            attribute.value = newValue;
          });
          
          TempAnnotation.update(annotation)
            .then(function(data) {
              TextWidgetAPI.updateAnnotation(annotation, false);
            }, function(error) {
              var modalOptions = {
                body: 'Error in update Annotation. Please refresh the page and try again'
              };
              Dialog.error(modalOptions);
            });
        };

        /**
         * Show the appropriate button text based on the selected annotation.
         */
        var annotationSelectionUpdate = function() {
          var selectedAnnotation = TextWidgetAPI.getSelectedAnnotation();

          // For empty annotation, show the annotate button
          if (angular.equals({}, selectedAnnotation)) {
            // Selected annotation exists
            scope.showAnnotateBtn = true;
            return;
          }
          
          // Check if the selected annotation concerns this button to show the update button
          var attr = _.findWhere(selectedAnnotation.attributes, annotationAttribute);
          
          // Show the annotate button if we didn't find this button's attribute in the selected annotation
          scope.showAnnotateBtn = _.isUndefined(attr);
        }

        //register callbacks for the selected annotation
        TextWidgetAPI.registerSelectedAnnotationCallback(annotationSelectionUpdate);
      }
    }
  }
]);
