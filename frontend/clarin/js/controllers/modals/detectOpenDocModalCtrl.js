angular.module('clarin-el').controller('detectOpenDocModalCtrl', function ($scope, $modalInstance, externalData, RestoreAnnotation, Dialog){
	var currentDocument = angular.copy(externalData);

	$scope.saveChanges = function () {
		RestoreAnnotation.autoSave(currentDocument.collection_id, currentDocument.id)
        .then(function(response) {
            if(response.success)
                $modalInstance.close(response);
            else
            	$modalInstance.close(response);
        }, function(error) { 
            $modalInstance.close(error);
        });
	};

	$scope.discardChanges = function () {
		if (!angular.isUndefined(currentDocument.confirmed) && currentDocument.confirmed) {
			$modalInstance.close({success: true});
			return false;
		}

		RestoreAnnotation.discard(currentDocument.collection_id, currentDocument.id)     //delete the old annotations of the document
        .then(function(response) {
            if(response.success)
               	$modalInstance.close(response);
            else
            	$modalInstance.close(response);
        }, function(error) { 
            $modalInstance.close(error);
        });
	};
});