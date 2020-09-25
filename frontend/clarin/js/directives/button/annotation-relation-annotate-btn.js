angular.module('clarin-el').directive('relationAnnotateBtn', ['TextWidgetAPI', 
  function(TextWidgetAPI) {
	  return {
		  restrict: 'E',
      templateUrl: 'templates/directives/button/annotation-relation-annotate-btn.html',
		  scope: {
		    annotationRelationWidgetId: '@',
        annotationWidgetIds: '@',
        textvariable: '@'
		  },
		  link: function(scope, element, attrs) {
		    // Get the <annotation-relation> element and its scope
		    var relElem = $('#' + scope.annotationRelationWidgetId).children().first()[0];
		    var relationScope = angular.element(relElem).scope();
		    
		    // Create the annotation attribute & value
		    var annotationAttribute = {
		      name: relationScope.annotationAttribute,
		      value: relationScope.annotationValue
		    }
		    
		    // Initialize the annotate btn variable
		    scope.showAnnotateBtn = true;
		    
		    scope.addAnnotation = function() {
		      var currentDocument = TextWidgetAPI.getCurrentDocument();

            // Create annotation object
            var annotation = {
              _id: new ObjectId().toString(),
					    document_id: currentDocument.id,
					    collection_id: currentDocument.collection_id,
					    type: null,
					    spans: [],
					    attributes: [
					      annotationAttribute
					    ]
            };
		    
		      // Get IDs of annotation comboboxes
		      var ids = scope.annotationWidgetIds.split(' ');
		      
		      _.each(ids, function(id) {
            // Get div of combobox component from its id (the first child node is the div)
            var elem = $('#' + id).children().first()[0];

            // Get angular scope from the element
            var elemScope = angular.element(elem).scope();

            var annotationAttribute = elemScope.annotationAttribute;
            var annotationType = elemScope.annotationType;
            var selectedAnnotation = elemScope.selectedAnnotation;

            //console.log('selected annotation', selectedAnnotation);

            // Set annotation type of the annotation
            annotation.type = annotationType;

            var attribute = {
              name: annotationAttribute,
              value: selectedAnnotation._id
            };
            
            // Add attribute from this combobox to the annotation
            annotation.attributes.push(attribute);
		      });
		      
		      console.log('result', annotation);
		      
		      /*
          TempAnnotation.save(currentDocument.collection_id, currentDocument.id, validationResult.annotation)
            .then(function(response){
              if (response.success)
                TextWidgetAPI.addAnnotation(validationResult.annotation, false);
              else {
                var modalOptions = { body: 'Error during saving your annotation. Please refresh the page and try again.' };
                Dialog.error(modalOptions);
              }
            }, function(error){
              var modalOptions = { body: 'Database error. Please refresh the page and try again.' };
              Dialog.error(modalOptions);
            });
          */
		    };
		    
		    scope.updateAnnotation = function() {
		      console.log('Update annotation');
		    }
		  }
	  }
  }
]);

