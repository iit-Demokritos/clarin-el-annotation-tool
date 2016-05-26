angular.module('clarin-el').controller('renameCollectionModalCtrl', function ($scope, $modalInstance, externalData, Collection, Dialog){
  	$scope.collectionData = externalData;
  	$scope.flash = "";
  	var oldCollectionName = $scope.collectionData.collectionName;

  	$scope.rename = function () {
    	if (oldCollectionName === $scope.collectionData.collectionName){  
      		$modalInstance.close(oldCollectionName);
      		$scope.$destroy();
      		return false;
    	}

    	if (!angular.isUndefined($scope.collectionData.collectionName)){
      		var updateData = {
        		id : $scope.collectionData.collectionId,
        		name : $scope.collectionData.collectionName
      		};

	      	Collection.update(updateData)
	      	.then(function(response) {
	        	if (response.success && !response.exists){
	          		$modalInstance.close(updateData.name);
	          		$scope.$destroy();
	        	} else if (response.success && response.exists){
	          		$scope.flash = response.flash;
	    		} else {
	          		$scope.flash = "An error occurred during the renaming of your collection" 
	        	}
	      	}, function(error){
	        	$scope.$destroy();
	        	$modalInstance.close();
	        	var modalOptions = { body: 'Error in edit Collection. Please refresh the page and try again' };
	        	Dialog.error(modalOptions);
	      	});
    	}
  	};

  	$scope.cancel = function () {
    	$modalInstance.dismiss("cancel");
    	$scope.$destroy();
  	};
});