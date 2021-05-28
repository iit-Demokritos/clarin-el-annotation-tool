angular.module('clarin-el').controller('importModalCtrl', function($scope, $modalInstance, externalData, Collection) {
  $scope.filterFiles = false;
  $scope.$parent.flash = "";

  $scope.$on('flowEvent', function(event, data) {
    $scope.userFiles = data.userFiles;
    if (data.msg !== "")
      $scope.$parent.flash = data.msg;
    else if ($scope.$parent.flash !== "")
      $scope.$parent.flash = "";
  });

  $scope.import = function() {
    if (angular.isUndefined($scope.userFiles) || $scope.userFiles.length === 0) {
      $scope.$parent.flash = "Please add at least one document";
      return false;
    } else if (angular.isUndefined($scope.collectionName) || $scope.collectionName.length === 0) {
      $scope.$parent.flash = "Please enter a collection name";
      return false;
    } else {
      // Reset error
      $scope.$parent.flash = "";

      // Import files
      Collection.importFiles($scope.collectionName, $scope.userFiles)
        .then(function(data) {
          $modalInstance.close();
          $scope.$destroy();
        });
    }
  };

  $scope.cancel = function() {
    $modalInstance.dismiss("cancel");
    $scope.$destroy();
  };
});
