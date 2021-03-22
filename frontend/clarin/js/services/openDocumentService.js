angular.module('clarin-el').factory('OpenDocument', function ($http, $q) {
  var getAll = function () {
    var deferred = $q.defer();

    $http.get('./api/open_documents')
      .success(function (data) {
        deferred.resolve(data);
      }).error(function (data) {
        deferred.reject(data);
      });

    return deferred.promise;
  };

  var get = function (documentId, annotatorId) {
    var deferred = $q.defer();
    $http.get('./api/open_documents/' + documentId + '/' + annotatorId)
      .success(function (data) {
        deferred.resolve(data);
      }).error(function (data) {
        deferred.reject(data);
      });

    return deferred.promise;
  };
  var save = function (documentData) {
    var deferred = $q.defer();

    $http({
      method: 'POST',
      url: './api/open_documents',
      headers: { 'Content-Type': 'application/json' },
      data: { data: documentData }
    }).success(function (data) {
      deferred.resolve(data);
    }).error(function () {
      deferred.reject();
    });

    return deferred.promise;
  };

  var destroy = function (documentId, annotatorId) {
    var deferred = $q.defer();

    $http.delete('./api/open_documents/' + documentId + '/' + annotatorId)
      .success(function (data) {
        deferred.resolve(data);
      }).error(function () {
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
