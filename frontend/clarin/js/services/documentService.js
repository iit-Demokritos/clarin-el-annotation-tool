angular.module('clarin-el').factory('Document', function($http, $q) {
  	var readDocument = function(collection_id, documentFile) {
	    var deferred = $q.defer();
	    var docData = {};
	    var reader = new FileReader();

	    reader.onload = function(e) {
	      	docData.name = documentFile.name;
	      	docData.text = reader.result;
	      	docData.collection_id = collection_id;
	      	docData.external_name = documentFile.name;
	      	docData.encoding = documentFile.encoding; 

	     	deferred.resolve(docData);
	    }

	    reader.readAsText(documentFile.file);
	    return deferred.promise; 
	};

	 
	var getAll = function(collectionId) {
		var deferred = $q.defer(); 
		$http.get('./api/collections/' + collectionId  + '/documents')
		.success(function(data) {
			deferred.resolve(data);
		}).error(function(data){
			deferred.reject(data);
		});

		return deferred.promise;
	};
 
	var get = function(collectionId, documentId) {
		var deferred = $q.defer(); 
		$http.get('./api/collections/' + collectionId + '/documents/' + documentId)
		.success(function(data) {   
			deferred.resolve(data);
		}).error(function(data){
			deferred.reject(data);
		});

		return deferred.promise;
	};
	 
	var save = function (collectionId, documents) {   //read and save multiple documents
		var promises = [];
		angular.forEach(documents, function(doc, key){  
			var deferred = $q.defer(); 

			readDocument(collectionId, doc)
			.then(function(readData) {         
				$http({
					method: 'POST',
					url: './api/collections/' + collectionId + '/documents',
					headers: { 'Content-Type' : 'application/json' },
					data: {data : readData}
				}).success(function(data) {  
					deferred.resolve(data);
				}).error(function(data) {
					deferred.reject(data);
				}); 
			});

			promises.push(deferred.promise);
		});

		return $q.all(promises);
	};
 
	var destroy = function(collectionId, documentId) {
		var deferred = $q.defer();  
		$http.delete('./api/collections/' + collectionId + '/documents/' + documentId)
		.success(function(data) {   
			deferred.resolve(data);
		}).error(function(){
			deferred.reject();
		});

		return deferred.promise;
	};
	 
	return {
		getAll: getAll,
		get : get,
		save: save,
		destroy: destroy
	}
});