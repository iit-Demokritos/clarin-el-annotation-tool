angular.module('clarin-el').factory('AnnotatorsTemplate', function($http, $q, CLARIN_CONSTANTS) {
	
	var getTemplate = function(annotatorType , annotationSchema) {
		if (annotatorType == "Coreference Annotator") {			//Coreference Annotator
			var deferred = $q.defer();  
			$http({
				method: 'GET',
				url: CLARIN_CONSTANTS.ELLOGON_SERVICES 
						+ '/annotation_scheme_multi_ui.tcl?'
						+ 'language=' + encodeURIComponent(annotationSchema.language)
						+ '&annotation=' + encodeURIComponent(annotationSchema.annotation_type)
						+ '&alternative=' + encodeURIComponent(annotationSchema.alternative),
				headers: {'Content-Type': 'application/json; charset=utf-8',
						  'Accept': 'application/json; charset=utf-8'}
			}).success(function(data) {
				deferred.resolve(data);
			}).error(function(){
				deferred.reject();
			});

			return deferred.promise;
		} else if (annotatorType == "Button Annotator"){		//Button Annotator
			var deferred = $q.defer();  
			$http({
				method: 'GET',
				url: CLARIN_CONSTANTS.ELLOGON_SERVICES
						+ '/annotation_scheme_ui.tcl?'
						+ 'language=' + encodeURIComponent(annotationSchema.language) 
						+ '&annotation=' + encodeURIComponent(annotationSchema.annotation_type)
						+ '&attribute=' + encodeURIComponent(annotationSchema.attribute)
						+ '&alternative=' + encodeURIComponent(annotationSchema.alternative),
				headers: {'Content-Type': 'application/json; charset=utf-8',
						  'Accept': 'application/json; charset=utf-8'}
			}).success(function(data) {  
				deferred.resolve(data);
			}).error(function(){
				deferred.reject();
			});

			return deferred.promise;
		}
	};
	
	return {
		getTemplate: getTemplate
	}
});