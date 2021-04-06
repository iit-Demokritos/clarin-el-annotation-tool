angular.module('clarin-el').controller('detectOpenDocModalCtrl', function ($scope, $modalInstance, externalData, RestoreAnnotation, Dialog) {
  var currentDocument = angular.copy(externalData);

  $scope.saveChanges = function () {
    var AnnotatorTypeId = TextWidgetAPI.getAnnotatorTypeId();
    RestoreAnnotation.autoSave(currentDocument.collection_id, currentDocument.id, AnnotatorTypeId)
      .then(function (response) {
        if (response.success)
          $modalInstance.close(response);
        else
          $modalInstance.close(response);
      }, function (error) {
        $modalInstance.close(error);
      });
  };

  $scope.discardChanges = function () {
    if (!angular.isUndefined(currentDocument.confirmed) && currentDocument.confirmed) {
      $modalInstance.close({ success: true });
      return false;
    }

    var AnnotatorTypeId = TextWidgetAPI.getAnnotatorTypeId();
    //delete the old annotations of the document
    RestoreAnnotation.discard(currentDocument.collection_id, currentDocument.id, AnnotatorTypeId)
      .then(function (response) {
        if (response.success)
          $modalInstance.close(response);
        else
          $modalInstance.close(response);
      }, function (error) {
        $modalInstance.close(error);
      });
  };
});
