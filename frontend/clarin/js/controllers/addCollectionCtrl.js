angular.module('clarin-el').controller('AddCollectionCtrl', ['$scope', '$timeout', '$q', 'Collection', 'Document', 'Dialog', function( $scope, $timeout, $q, Collection, Document, Dialog) {
  $scope.sidebarSelector = "myCollections";
  $scope.encodingOptions = ["UTF-8", "Unicode"];
  $scope.handlerOptions = [
    {name: 'No Handler', value: 'noHandler'},
    {name: 'Handler 1', value: 'handler1'},
    {name: 'Handler 2', value: 'handler2'}
  ];


  function initializeCollections() {
    Collection.getAll()
      .then(function(response) {
        if(!response.success) {
          var modalOptions = { body: 'Error during the restoring of your collections. Please refresh the page and try again.' };
          Dialog.error(modalOptions);
        } else {
          /*$scope.collections = response.data;
        $scope.dataForTheTree = $scope.collections;*/
          $scope.dataForTheTree =  angular.copy(response.data);
        }
      });
  };

  function initializeForm() {
    $scope.userFiles = [];
    $scope.collectionData = {};
    $scope.collectionData.name = "";
    $scope.collectionData.encoding = $scope.encodingOptions[0];
    $scope.handlerOption = $scope.handlerOptions[0];
    $scope.encodingChange();
  };

  function validateCollection () {
    var deferred = $q.defer();
    if (angular.isUndefined($scope.userFiles) || $scope.userFiles.length === 0) {
      var modalOptions = {
        headerType: 'warning',
        header: 'Warning',
        body: 'The collection does not contain any documents. Do you want to proceed?' ,
        buttons : ['No', 'Yes'],
        showCalcelButton : false
      };

      Dialog.confirm(modalOptions).result.then(function (result) {
        deferred.resolve(result);
      }, function () {
        deferred.reject();
      });
    } else
      deferred.resolve("Yes");

    return deferred.promise;
  };

  $scope.submitCollection = function() {
    validateCollection().then(function(modalResult) {
      if (modalResult === "Yes") {
        $scope.collectionData.handler =  $scope.handlerOption.value;
        $scope.collectionData.overwrite = false;

        Collection.save($scope.collectionData)
          .then(function(response) {             
            if (response.success && response.exists) {              // collection already exists
              var modalOptions = {
                headerType: 'warning',
                header: 'Warning',
                body: 'The collection "' + $scope.collectionData.name + '" already exists. What do you want to do?' ,
                buttons : ['Rename', 'Overwrite'],
                showCalcelButton : true
              };

              var modalInstance =  Dialog.confirm(modalOptions);
              modalInstance.result.then(function (modalResult) {
                if (modalResult==="Rename") {
                  angular.element(document.querySelector('#collectionName')).focus();
                  angular.element(document.querySelector('#collectionName')).select();
                  return false;
                } else if (modalResult==="Overwrite") {
                  $scope.collectionData.overwrite = true;
                  $scope.collectionData.id = response.collection_id;

                  Collection.save($scope.collectionData)
                    .then(function(newCollectionResponse) {           // execute after saving collection
                      if(newCollectionResponse.success) {
                        $scope.collectionData.overwrite = false;
                        return Document.save (newCollectionResponse.collection_id, $scope.userFiles )
                      } else {
                        var modalOptions = { body: 'Error during collection save. Please refresh the page and try again.' };
                        Dialog.error(modalOptions);
                        return false;
                      }
                    }).then(function() {              // all collection documents saved
                      initializeForm();
                      initializeCollections()
                      $scope.$broadcast("initializeUploaderFiles");
                    }, function(error) {
                      var modalOptions = { body: 'Error during collection save. Please refresh the page and try again.' };
                      Dialog.error(modalOptions);
                    });
                } else {
                  return false;
                }
              });
            } else if (response.success && !response.exists) {        // new collection
              Document.save (response.collection_id, $scope.userFiles )
                .then(function() {                    // all collection documents saved
                  initializeForm();
                  initializeCollections();
                  $scope.$broadcast("initializeUploaderFiles");
                });
            }
          }, function(error) {
            var modalOptions = { body: 'Error in saving Collection. Please refresh the page and try again.' };
            Dialog.error(modalOptions);
          });
      }
    });
  };

  $scope.encodingChange = function () {
    $scope.$broadcast("initializeUploaderEncoding", {encoding : $scope.collectionData.encoding});
  }

  $scope.$on('flowEvent', function(event, data) {    
    $scope.userFiles = data.userFiles;
    if (data.msg!=="") {
      var modalOptions = { body: data.msg };
      Dialog.error(modalOptions);
    }
  });

  initializeForm();
  initializeCollections();
}]);
