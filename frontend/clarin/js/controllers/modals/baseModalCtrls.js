angular.module('clarin-el').controller('confirmModalCtrl', function ($scope, $modalInstance, modalOptions){
	$scope.modalOptions = modalOptions;
	$scope.modalOptions.headerType = (angular.isDefined(modalOptions.headerType)) ? modalOptions.headerType : 'primary';
	$scope.modalOptions.header = (angular.isDefined(modalOptions.header)) ? modalOptions.header : 'Confirmation';
	$scope.modalOptions.body = (angular.isDefined(modalOptions.body)) ? modalOptions.body : 'Confirmation required.';

	$scope.confirm = function (data) {
		$modalInstance.close(data);
		$scope.$destroy();
	};

	$scope.cancel = function () {
		$modalInstance.dismiss("cancel");
		$scope.$destroy();
	};
});

angular.module('clarin-el').controller('errorModalCtrl', function ($scope, $modalInstance, modalOptions){
	$scope.modalOptions = modalOptions;
	$scope.modalOptions.headerType = (angular.isDefined(modalOptions.headerType)) ? modalOptions.headerType : 'error';
	$scope.modalOptions.header = (angular.isDefined(modalOptions.header)) ? modalOptions.header : 'Error';
	$scope.modalOptions.body = (angular.isDefined(modalOptions.body)) ? modalOptions.body : 'An unknown error has occurred.';

	$scope.cancel = function () {
		$modalInstance.close("cancel");
		$scope.$destroy();
	};
});