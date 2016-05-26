angular.module('clarin-el').factory('Flash', ['$rootScope', function($rootScope) {
	var show = function(msg) {
		$rootScope.flash = msg;
	};

	var clear = function() {
		if (_.isUndefined($rootScope.flash) || $rootScope.flash.length > 0)
			$rootScope.flash = "";
	};

	return {
		show: show,
		clear: clear
	}
}]);