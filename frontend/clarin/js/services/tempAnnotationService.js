angular.module('clarin-el').factory('TempAnnotation', function ($http, $q) {

  var getAll = function (collectionId, documentId, annotatorId=null) {
    var deferred = $q.defer();
    var uri = './api/collections/' + collectionId + '/documents/' + documentId + '/temp_annotations';
    if (annotatorId) {
        uri = uri + '/' + annotatorId;
    }
    $http.get(uri)
      .success(function (data) {
        deferred.resolve(data);
      }).error(function (data) {
        deferred.reject(data);
      });

    return deferred.promise;
  };

  var get = function (collectionId, documentId, annotationId) {
    var deferred = $q.defer();
    $http.get('./api/collections/' + collectionId + '/documents/' + documentId + '/temp_annotations/' + annotationId)
      .success(function (data) {
        deferred.resolve(data);
      }).error(function (data) {
        deferred.reject(data);
      });

    return deferred.promise;
  };

  var save = function (collectionId, documentId, annotationData) {
    var deferred = $q.defer();
    $http({
      method: 'POST',
      url: './api/collections/' + collectionId + '/documents/' + documentId + '/temp_annotations',
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        data: annotationData
      }
    })
      .success(function (data) {
        deferred.resolve(data);
      }).error(function (data) {
        deferred.reject(data);
      });

    return deferred.promise;
  };

  var update = function (annotationData) {
    var deferred = $q.defer();
    $http({
      method: 'PUT',
      url: './api/collections/' + annotationData.collection_id + '/documents/' + annotationData.document_id + '/temp_annotations/' + annotationData._id,
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        data: annotationData
      }
    }).success(function (data) {
      deferred.resolve(data);
    }).error(function (data) {
      deferred.reject(data);
    });

    return deferred.promise;
  };

  var destroy = function (collectionId, documentId, annotationId) {
    var deferred = $q.defer();
    $http.delete('./api/collections/' + collectionId + '/documents/' + documentId + '/temp_annotations/' + annotationId)
      .success(function (data) {
        deferred.resolve(data);
      }).error(function (data) {
        deferred.reject(data);
      });

    return deferred.promise;
  };

  return {
    getAll: getAll,
    get: get,
    save: save,
    update: update,
    destroy: destroy
  }
});
