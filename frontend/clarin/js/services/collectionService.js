angular.module('clarin-el').factory('Collection', function ($http, $q) {
  var getAll = function () {
    var deferred = $q.defer();

    $http.get('./api/collections')
      .success(function (data) {
        deferred.resolve(data);
      }).error(function (data) {
        deferred.reject(data);
      });

    return deferred.promise;
  };

  var getData = function () {
    var deferred = $q.defer();

    $http.get('./api/collections_data')
      .success(function (response) {
        if (response.success && response.data.length > 0) {    //initialize the documents tree
          var treeData = [];
          var currentCollectionId = -1;

          for (var i = 0; i < response.data.length; i++) {
            if (response.data[i].collection_id !== currentCollectionId) {
              currentCollectionId = response.data[i].collection_id;

              if (response.data[i].name) {
                treeData.push({
                  "id": response.data[i].collection_id,
                  "name": response.data[i].collection_name,
                  "document_count": 0,
                  "is_owner": response.data[i].is_owner,
                  "confirmed": response.data[i].confirmed,
                  "children": [{
                    "id": response.data[i].id,
                    "name": response.data[i].name,
                    "collection_id": response.data[i].collection_id,
                    "collection_name": response.data[i].collection_name
                  }]
                });

                treeData[treeData.length - 1].document_count++;
              } else {
                treeData.push({
                  "id": response.data[i].collection_id,
                  "name": response.data[i].collection_name,
                  "document_count": 0,
                  "is_owner": response.data[i].is_owner,
                  "confirmed": response.data[i].confirmed,
                  "children": {}
                });
              }
            } else {
              treeData[treeData.length - 1].children.push({
                "id": response.data[i].id,
                "name": response.data[i].name,
                "collection_id": response.data[i].collection_id,
                "collection_name": response.data[i].collection_name
              });

              treeData[treeData.length - 1].document_count++;
            }
          }

          //$scope.dataForTheTree = treeData;
          response.data = angular.copy(treeData);
        }

        deferred.resolve(response);
      }).error(function (data) {
        deferred.reject(data);
      });

    return deferred.promise;
  };

  var get = function (collectionId) {
    var deferred = $q.defer();

    $http.get('./api/collections/' + collectionId)
      .success(function (data) {
        deferred.resolve(data);
      }).error(function (data) {
        deferred.reject(data);
      });

    return deferred.promise;
  };

  var update = function (collectionData) {
    var deferred = $q.defer();
    $http({
      method: 'PATCH',
      url: './api/collections/' + collectionData.id,
      headers: {'Content-Type': 'application/json'},
      data: {data: collectionData}
    }).success(function (data) {
      deferred.resolve(data);
    }).error(function (data) {
      deferred.reject(data);
    });

    return deferred.promise;
  };

  var save = function (collectionData) {
    var deferred = $q.defer();
    $http({
      method: 'POST',
      url: './api/collections',
      headers: {'Content-Type': 'application/json'},
      data: {data: collectionData}
    }).success(function (data) {
      deferred.resolve(data);
    }).error(function (data) {
      deferred.reject(data);
    });

    return deferred.promise;
  };

  var destroy = function (collectionId) {
    var deferred = $q.defer();
    $http.delete('./api/collections/' + collectionId)
      .success(function (data) {
        deferred.resolve(data);
      }).error(function () {
        deferred.reject(data);
      });

    return deferred.promise;
  };

  return {
    getAll: getAll,
    getData: getData,
    get: get,
    update: update,
    save: save,
    destroy: destroy
  }
});


