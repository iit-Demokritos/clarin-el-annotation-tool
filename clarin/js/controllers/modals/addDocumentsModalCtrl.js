angular.module('clarin-el').controller('addDocumentsModalCtrl', function ($scope, $modalInstance, externalData, Document, Collection){
  	$scope.collectionData = externalData;
  	$scope.$parent.flash = "";

  	//$scope.$broadcast("initializeUploader", {encoding : $scope.collectionData.encoding});
  	$scope.$on('flowEvent', function(event, data) { 
    	$scope.userFiles = data.userFiles;
    	if (data.msg!=="")
     	 	$scope.$parent.flash = data.msg;
    	else if ($scope.$parent.flash!=="")
      		$scope.$parent.flash = "";
  	});

  	$scope.add = function () {
    	if(angular.isUndefined($scope.userFiles) || $scope.userFiles.length === 0){
      		$scope.$parent.flash = "Please add at least one document";
      		return false;
    	}else {
      		if (!angular.isUndefined($scope.$parent.flash) || !($scope.$parent.flash==="")) 
        		$scope.$parent.flash = "";

      		Document.save($scope.collectionData.collectionId, $scope.userFiles)
      		.then(function(data) {  
        		$modalInstance.close();
        		$scope.$destroy();
      		});
    	}
  	};

  	$scope.cancel = function () {
    	$modalInstance.dismiss("cancel");
    	$scope.$destroy();
  	};
});

