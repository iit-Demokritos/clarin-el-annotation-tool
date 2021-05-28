angular.module('clarin-el').factory('SharedCollection', function($http, $q) {
	var getAll = function(collectionId) {
		var deferred = $q.defer(); 
		$http.get('./api/collections/' + collectionId  + '/share')
		.success(function(data) {
			deferred.resolve(data);
		}).error(function(data){
			deferred.reject(data);
		});

		return deferred.promise;
	};

	var confirm = function(collectionId, confirmationCode) {
		var deferred = $q.defer(); 
		$http.get('./api/collections/' + collectionId + '/share_verify/' + confirmationCode)
		.success(function(data) {   
			deferred.resolve(data);
		}).error(function(data){
			deferred.reject(data);
		});

		return deferred.promise;
	};

	var save = function (collectionId, collectionData) {
		var deferred = $q.defer();  
		$http({
			method: 'POST',
			url: './api/collections/' + collectionId + '/share',
			headers: { 'Content-Type' : 'application/json' },
			data: {data : collectionData}
		}).success(function(data) { 
			deferred.resolve(data);
		}).error(function(data){
			deferred.reject(data);
		});
	  
		return deferred.promise;
	};

	var destroy = function(collectionId, confirmationCode) {
		var deferred = $q.defer();  
		$http.delete('./api/collections/' + collectionId + '/share/' + confirmationCode)
		.success(function(data) {   
			deferred.resolve(data);
		}).error(function(){
			deferred.reject(data);
		});

		return deferred.promise;
	};
	
	return {
		getAll: getAll,
		confirm: confirm,
		save: save,
		destroy: destroy
	}
});