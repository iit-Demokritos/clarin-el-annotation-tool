angular.module('clarin-el').factory('Annotation', function($http, $q) {

	var getAll = function(collectionId, documentId) {
		var deferred = $q.defer(); 
		$http.get('./api/collections/' + collectionId + '/documents/' + documentId + '/annotations')
		.success(function(data) {   
			deferred.resolve(data);
		}).error(function(){
			deferred.reject();
		});

		return deferred.promise;
	};

	var get = function(collectionId, documentId, annotationId) {
		var deferred = $q.defer(); 
		$http.get('./api/collections/' + collectionId + '/documents/' + documentId + '/annotations/' + annotationId)
		.success(function(data) {   
			deferred.resolve(data);
		}).error(function(){
			deferred.reject();
		});

		return deferred.promise;
	};

	var save = function(collectionId, documentId, annotationData) {  //console.log("annotation save:", annotationData)
		var deferred = $q.defer();  
		$http({
			method: 'POST',
			url: './api/collections/' + collectionId + '/documents/' + documentId + '/annotations',
			headers: { 'Content-Type' : 'application/json' },
			data: {data : annotationData}
		}).success(function(data) {
			deferred.resolve(data);
		}).error(function(){
			deferred.reject();
		});
	  
		return deferred.promise;
	};

	var destroy = function(collectionId, documentId, annotationId) {
		var deferred = $q.defer();  
		$http.delete('./api/collections/' + collectionId + '/documents/' + documentId + '/annotations/' + annotationId)
		.success(function(data) {  
			deferred.resolve(data);
		}).error(function(data){
			deferred.reject();
		});

		return deferred.promise;
	};
	
	return {
		getAll: getAll,
		get: get,
		save: save,
		destroy: destroy
	}
});