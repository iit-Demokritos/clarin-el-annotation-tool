angular.module('clarin-el').factory("Dialog", function ($modal) {
	var error = function (modalOptions) {
		return $modal.open({
			keyboard: false,
			backdrop: "static",
			templateUrl: 'templates/modals/error.html',
			controller: 'errorModalCtrl',
			resolve: {
				modalOptions: function () {
					return modalOptions;
				}
			}
		});
	};

	var confirm = function (modalOptions) {
		return $modal.open({
			keyboard: false,
			backdrop: "static",
			templateUrl: 'templates/modals/confirm.html',
			controller: 'confirmModalCtrl',
			resolve: {
				modalOptions: function () {
					return modalOptions;
				}
			}
		});
	};

	var custom = function (templateUrl, ctrl, externalData, backdropOption, windowClassOption) {
		var backdrop = (typeof backdropOption === "undefined") ? "static" : backdropOption;
		var windowClass = (typeof windowClassOption === "undefined") ? "" : windowClassOption;
		return $modal.open({
			keyboard: false,
			backdrop: backdrop,
			windowClass: windowClass,
			templateUrl: 'templates/modals/' + templateUrl,
			controller: ctrl,
			resolve: {
				externalData: function () {
					return externalData;
				}
			}
		});
	};

	return {
		error: error,
		confirm: confirm,
		custom: custom
	}
});