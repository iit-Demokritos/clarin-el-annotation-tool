angular.module('clarin-el').controller('detectChangesModalCtrl', function ($scope, $modalInstance, externalData, TextWidgetAPI, Collection, AnnotationSchema, RestoreAnnotation){
	var documentFound = angular.copy(externalData);

	$scope.continueAnnotation = function () {
		Collection.getData()
	    .then(function(response) {
	    	if(response.success) {
	            var openCollection = _.findWhere(response.data, {id : documentFound.collection_id});
	            var openDocument = _.findWhere(openCollection.children, {id : documentFound.document_id});

	            AnnotationSchema.restore(documentFound.annotator_type)
	            .then(function(response) {
                	if (response.success && !angular.isUndefined(response.savedAnnotationSchema) && !angular.isUndefined(response.annotationSchemaOptions)) {
                  		TextWidgetAPI.disableIsRunning();
			          	TextWidgetAPI.resetCallbacks();

		              	TextWidgetAPI.setAnnotatorType(documentFound.annotator_type);
						TextWidgetAPI.setAnnotationSchemaOptions(response.annotationSchemaOptions);
						TextWidgetAPI.setAnnotationSchema(response.savedAnnotationSchema);

						TextWidgetAPI.setCurrentCollection(openCollection);
                                                openDocument.annotator_id = TextWidgetAPI.getAnnotatorTypeId();
						TextWidgetAPI.setCurrentDocument(openDocument);

						var modalResponse = { success : true, resume : true };
						$modalInstance.close(modalResponse);
                	} else 
                		$modalInstance.close(response);
              	}, function(error){ 
                  	$modalInstance.close(error);
              	});
	        } else {
	            $modalInstance.close(response);
	        }
	    });
	};

	$scope.saveChanges = function () {
		var AnnotatorTypeId = TextWidgetAPI.getAnnotatorTypeId();
		RestoreAnnotation.autoSave(documentFound.collection_id, documentFound.document_id, AnnotatorTypeId)
      	.then(function(response) {
			$modalInstance.close(response);
      	}, function(error){ 
          	$modalInstance.close(error);
      	});
	};

	$scope.discardChanges = function () {
		var AnnotatorTypeId = TextWidgetAPI.getAnnotatorTypeId();
		RestoreAnnotation.discard(documentFound.collection_id, documentFound.document_id, AnnotatorTypeId)     //delete the old annotations of the document
		.then(function(response) {
			$modalInstance.close(response);
		}, function(error){ 
	    	$modalInstance.close(error);
		});
	};
});
