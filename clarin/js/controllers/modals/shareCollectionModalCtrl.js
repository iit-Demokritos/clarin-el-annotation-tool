angular.module('clarin-el').controller('shareCollectionModalCtrl', function ($scope, $modalInstance, externalData, SharedCollection, Dialog){
	//var EMAIL_REGEXP = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
	$scope.invitations = [];
  	$scope.flash = "";
  	$scope.sharingData = {
  		cname : externalData.collectionName,
  		cid :  externalData.collectionId,
  		to : ""
  	};

  	var initializeSharingData = function() {				//initialize the collections tree
    	SharedCollection.getAll(externalData.collectionId).then(function(response) { 
      		if(!response.success) {
        		var modalOptions = { body: 'Error during the restoring of your collections. Please refresh the page and try again.' };
        		Dialog.error(modalOptions);
      		} else
        		$scope.invitations = response.data;
    	});
  	};
  	
  	$scope.share = function () {
    	SharedCollection.save($scope.sharingData.cid, $scope.sharingData)
      	.then(function(response) {
        	if (response.success){
				$scope.flash = "";
				$scope.sharingData.to = "";
	          	initializeSharingData();
	        } else
	          	$scope.flash = response.message;
      	}, function(error){
        	$scope.$destroy();
        	$modalInstance.close();
        	var modalOptions = { body: 'Error in share collection. Please refresh the page and try again' };
        	Dialog.error(modalOptions);
      	});
  	};

  	$scope.remove = function (collectionId, invitationId) {	
    	SharedCollection.destroy(collectionId, invitationId)
      	.then(function(response) {
        	if (response.success){
	          	$scope.flash = "";
	          	initializeSharingData();
	        } else
	          	$scope.flash = response.message;
      	}, function(error){
        	$scope.$destroy();
        	$modalInstance.close();
        	var modalOptions = { body: 'Error in share collection. Please refresh the page and try again' };
        	Dialog.error(modalOptions);
      	});
  	};

  	$scope.cancel = function () {
    	$modalInstance.dismiss("cancel");
    	$scope.$destroy();
  	};

  	initializeSharingData();
});