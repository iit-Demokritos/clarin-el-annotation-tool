angular.module('clarin-el').factory('CoreferenceAnnotator', function($http, $q, CLARIN_CONSTANTS) {

	var checkForSavedSchema = function() {
		var deferred = $q.defer();
		$http({
			method: 'GET',
			url: './api/coreference_annotators',
			headers: {'Content-Type': 'application/json; charset=utf-8',
					  'Accept': 'application/json; charset=utf-8'}
		}).success(function(data) {   // Asynchronous Service calling
			deferred.resolve(data);
		}).error(function(){
			deferred.reject();
		});

		return deferred.promise;
	};
	
	var updateSchema = function(annotationSchema) {
		var deferred = $q.defer();  
		$http({
			method: 'POST',
			url: './api/coreference_annotators',
			headers: { 'Content-Type' : 'application/json' },
			data: {data : annotationSchema}
		}).success(function(data) {
			deferred.resolve(data);
		}).error(function(){
			deferred.reject();
		});
	  
		return deferred.promise;
	};
	
	var getLanguages = function() {
		var deferred = $q.defer();
		$http({
			method: 'GET',
			url: CLARIN_CONSTANTS.ELLOGON_SERVICES + '/annotation_scheme_multi.tcl',
			headers: {'Content-Type': 'application/json; charset=utf-8',
					  'Accept': 'application/json; charset=utf-8'}
		}).success(function(data) {   // Asynchronous Service calling
			deferred.resolve(data);
		}).error(function(){
			deferred.reject();
		});
	  
		return deferred.promise;
	};
	
	var getAnnotationTypes = function(language) {
		var deferred = $q.defer();  
		$http({
			method: 'GET',
			url: CLARIN_CONSTANTS.ELLOGON_SERVICES 
					+ '/annotation_scheme_multi.tcl/' 
					+ encodeURIComponent(language),
			headers: {'Content-Type': 'application/json; charset=utf-8',
					  'Accept': 'application/json; charset=utf-8'}
		}).success(function(data) {   // Asynchronous Service calling
			deferred.resolve(data);
		}).error(function(){
			deferred.reject();
		});
	  
		return deferred.promise;
	};
	
	var getAttributeAlternatives = function(language, annotationType) {
		var deferred = $q.defer();  
		$http({
			method: 'GET',
			url: CLARIN_CONSTANTS.ELLOGON_SERVICES 
					+ '/annotation_scheme_multi.tcl/'
					+ encodeURIComponent(language)  + '/' 
					+ encodeURIComponent(annotationType),
			headers: {'Content-Type': 'application/json; charset=utf-8',
					  'Accept': 'application/json; charset=utf-8'}
		}).success(function(data) {   // Asynchronous Service calling
			deferred.resolve(data);
		}).error(function(){
			deferred.reject();
		});
	  
		return deferred.promise;
	};
	var getValues = function(language, annotationType, attributeAlternative) {
		var deferred = $q.defer();  
		$http({
			method: 'GET',
			url: CLARIN_CONSTANTS.ELLOGON_SERVICES 
					+ '/annotation_scheme_multi.tcl/'
					+ encodeURIComponent(language)  + '/' 
					+ encodeURIComponent(annotationType) + '/' 
					+ encodeURIComponent(attributeAlternative),
			headers: {'Content-Type': 'application/json; charset=utf-8',
					  'Accept': 'application/json; charset=utf-8'}
		}).success(function(data) {   // Asynchronous Service calling
			deferred.resolve(data);
		}).error(function(){
			deferred.reject();
		});
	  
		return deferred.promise;
	};

	return {
		checkForSavedSchema: checkForSavedSchema,
		updateSchema: updateSchema,
		getLanguages: getLanguages,
		getAnnotationTypes: getAnnotationTypes,
		getAttributeAlternatives: getAttributeAlternatives,
		getValues: getValues
	}
});