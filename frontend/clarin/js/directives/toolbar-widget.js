app.directive('toolbarWidget', function ($q, $ocLazyLoad, $timeout, $rootScope, TextWidgetAPI, RestoreAnnotation, TempAnnotation, Dialog, OpenDocument) {
  return {
    restrict: 'E',
    replace: true,
    scope: {},
    templateUrl: 'templates/directives/toolbar.html',
    controller: function ($scope, $element, $document) {
      $scope.selectedDocument = {};
      $scope.autoSaveIndicator = false;

      var detectUnsavedChanges = function (newDocument) {
        var currentDocument = TextWidgetAPI.getCurrentDocument();

        OpenDocument.get(currentDocument.id, currentDocument.annotator_id)
          .then(function (response) {
            if (response.success && response.data.length > 0) {
              var documentFound = _.findWhere(response.data, { opened: 1 }); // search if the user has an open document

              if (!angular.isUndefined(documentFound) && documentFound.db_interactions > 0) {
                if ($scope.autoSaveIndicator) { // auto save functionality enabled
                  var AnnotatorTypeId = TextWidgetAPI.getAnnotatorTypeId();
                  RestoreAnnotation.autoSave(currentDocument.collection_id, currentDocument.id, AnnotatorTypeId)
                    .then(function (response) {
                      if (response.success) {
                        newDocument.annotator_id = AnnotatorTypeId;
                        TextWidgetAPI.setCurrentDocument(newDocument);
                      } else {
                        var modalOptions = { body: 'Error during the save annotations. Please refresh the page and try again.' };
                        Dialog.error(modalOptions);
                      }
                    }, function (error) {
                      var modalOptions = { body: 'Database error. Please refresh the page and try again.' };
                      Dialog.error(modalOptions);
                    });
                } else {
                  currentDocument.confirmed = documentFound.confirmed;

                  $ocLazyLoad.load('detectOpenDocModalCtrl').then(function () {
                    var detectOpenDocModalInstance = Dialog.custom('detect-open-doc-modal.html', 'detectOpenDocModalCtrl', currentDocument, true, "");
                    detectOpenDocModalInstance.result.then(function (response) {
                      if (response.success) {
                        newDocument.annotator_id = TextWidgetAPI.getAnnotatorTypeId();
                        TextWidgetAPI.setCurrentDocument(newDocument);
                      } else {
                        var modalOptions = { body: 'Error during the save annotations. Please refresh the page and try again.' };
                        Dialog.error(modalOptions);
                        return false;
                      }
                    });
                  });
                }
              } else {
                newDocument.annotator_id = TextWidgetAPI.getAnnotatorTypeId();
                TextWidgetAPI.setCurrentDocument(newDocument);
              }
            }
          }, function (error) {
            var modalOptions = { body: 'Database error. Please refresh the page and try again.' };
            Dialog.error(modalOptions);
          });
      };

      $scope.nextDocument = function () {
        if (TextWidgetAPI.isRunning())
          return false;

        var index = _.indexOf($scope.selectedCollectionDocuments, $scope.selectedDocument);
        if (index < $scope.selectedCollectionDocuments.length - 1)
          detectUnsavedChanges($scope.selectedCollectionDocuments[index + 1])
      };

      $scope.prevDocument = function () {
        if (TextWidgetAPI.isRunning())
          return false;

        var index = $scope.selectedCollectionDocuments.indexOf($scope.selectedDocument);
        if (index > 0)
          detectUnsavedChanges($scope.selectedCollectionDocuments[index - 1]);
      };

      $scope.updateDocumentDropdown = function (newDocument) {
        detectUnsavedChanges(newDocument);
      };

      $scope.deleteAnnotation = function () {
        if (TextWidgetAPI.isRunning())
          return false;

        var annotationToBeDeleted = TextWidgetAPI.getSelectedAnnotation();

        if (angular.equals({}, annotationToBeDeleted) && !$scope.deleteAnnotationModalInstance) {   //no annotation has been selected open error modal
          var modalOptions = { body: 'No annotation has been selected.' };
          $scope.deleteAnnotationModalInstance = Dialog.error(modalOptions);
          $scope.deleteAnnotationModalInstance.result.then(function (modalResult) {
            $scope.deleteAnnotationModalInstance = null;
          });

          return false;
        } else if ($scope.deleteAnnotationModalInstance)         //modal already open, return false
          return false;

        TempAnnotation.destroy(annotationToBeDeleted.collection_id, annotationToBeDeleted.document_id, annotationToBeDeleted._id)
          .then(function (response) {
            if (!response.success) {
              var modalOptions = { body: 'Error during the deleting the annotation. Please refresh the page and try again.' };
              Dialog.error(modalOptions);
            } else
              TextWidgetAPI.deleteAnnotation(annotationToBeDeleted._id);
          }, function (error) {
            var modalOptions = { body: 'Error in delete Annotation. Please refresh the page and try again' };
            Dialog.error(modalOptions);
          });
      };

      $scope.saveAnnotations = function () {
        var currentDocument = TextWidgetAPI.getCurrentDocument();
        var AnnotatorTypeId = TextWidgetAPI.getAnnotatorTypeId();

        RestoreAnnotation.save(currentDocument.collection_id, currentDocument.id, AnnotatorTypeId)
          .then(function (response) {
            if (!response.success) {
              var modalOptions = { body: 'Error during the save annotations. Please refresh the page and try again.' };
              Dialog.error(modalOptions);
            }
          }, function (error) {
            var modalOptions = { body: 'Database error. Please refresh the page and try again.' };
            Dialog.error(modalOptions);
          });
      };

      $scope.deleteTempAnnotations = function () {
        var currentDocument = TextWidgetAPI.getCurrentDocument();
        var AnnotatorTypeId = TextWidgetAPI.getAnnotatorTypeId();

        RestoreAnnotation.discard(currentDocument.collection_id, currentDocument.id, AnnotatorTypeId)     //delete the old annotations of the document*/
          .then(function (response) {
            if (!response.success) {
              var modalOptions = { body: 'Error during the saving of your document\'s annotations. Please refresh the page and try again.' };
              Dialog.error(modalOptions);
            }
          }, function (error) {
            var modalOptions = { body: 'Database error. Please refresh the page and try again.' };
            Dialog.error(modalOptions);
          });
      };

      var updateCurrentCollection = function () {
        var newCollection = TextWidgetAPI.getCurrentCollection();
        if (!angular.equals({}, newCollection)) {
          $scope.selectedCollection = angular.copy(newCollection);
          $scope.selectedCollectionName = angular.copy(newCollection.name);
          $scope.selectedCollectionDocuments = angular.copy(newCollection.children);
        }
      };

      var updateCurrentDocument = function () {
        var newDocument = TextWidgetAPI.getCurrentDocument();

        if (!angular.equals({}, newDocument))
          $scope.selectedDocument = _.where($scope.selectedCollectionDocuments, { id: newDocument.id })[0];
      };

      TextWidgetAPI.registerCurrentCollectionCallback(updateCurrentCollection);
      TextWidgetAPI.registerCurrentDocumentCallback(updateCurrentDocument);
    }/*,
    link: function (scope, elem, attrs) {
      var keyUpHandler = function (e) {
        if (e.which == 46)
          scope.deleteAnnotation();
      };

      $(document).on('keyup', keyUpHandler); // register keyup listener
      scope.$on('$destroy', function () { $(document).off('keyup', keyUpHandler); }); // delete keyup listener
    }*/
  }
});
