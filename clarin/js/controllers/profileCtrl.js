angular.module('clarin-el').controller("ProfileCtrl", ['$scope', '$state', '$timeout','User', 'Flash',
	function($scope, $state, $timeout, User, Flash) {
	$scope.updateInfo = {};
	$scope.userStats = {
		collections: 0,
		documents: 0,
		annotations: 0
	};

	var initializeInfo = function() {
		$scope.updateInfo = {
			oldPassword: "",
			newPassword: "",
			retypePassword: ""
		};
	};

	var getUserStats = function() {
		User.getStats()
		.then(function(response) {
			$scope.userStats = response.data;
		}, function(error){
			console.log(error);
		});
	};


	$scope.updatePassword = function(updateForm) {
		if (!updateForm.$valid) {
			Flash.show("The password fields must contain at least 6 characters.");
			return false;
		} else if($scope.updateInfo.newPassword !== $scope.updateInfo.retypePassword) {
			Flash.show("New password does not match the confirm password.");
			return false;
		}

		var passwordData = {
			old_password: $scope.updateInfo.oldPassword,
			new_password: $scope.updateInfo.newPassword
		};

		User.updatePassword(passwordData)
		.then(function(response) {
			initializeInfo();
			$timeout(function(){
				Flash.show(response.message);
			},200);
		}, function(error){
			Flash.show(error.message);
		});
	};



	$scope.$watch('updateInfo', function() {
		Flash.clear();
	}, true);

	getUserStats();
	initializeInfo();
}]);