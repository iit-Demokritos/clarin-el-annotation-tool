angular.module('clarin-el').controller('AnnotationCtrl', ['$scope', '$timeout', '$ocLazyLoad', 'RestoreAnnotation', 'TextWidgetAPI', 'TempAnnotation', 'OpenDocument', 'Collection', 'Dialog',
  function ($scope, $timeout, $ocLazyLoad, RestoreAnnotation, TextWidgetAPI, TempAnnotation, OpenDocument, Collection, Dialog) {
    $scope.documentSelection = true;
    $scope.annotatorType = "";
    $scope.annotationSchema = {};
    $scope.sidebarSelector = "annotator";
    $scope.maincontentSelector = "document";
    $scope.layout = {
      showEditorTabs: false,
    };

    $scope.$on('$stateChangeStart', function (event) {        //close document selection modal instance when user change page
      console.log('closing modal');
      //$scope.documentSelection = true;
      //detectUnsavedChanges();
      //event.preventDefault();

      if (!angular.isUndefined($scope.selectDocumentModalInstance) && $scope.selectDocumentModalInstance.opened) {
        $scope.selectDocumentModalInstance.close();
        TextWidgetAPI.disableIsRunning();
        //detectUnsavedChanges();
      }
    });

    $scope.$on("$destroy", function () {
      if (!angular.isUndefined($scope.selectDocumentModalInstance) && $scope.selectDocumentModalInstance.opened) {
        $scope.selectDocumentModalInstance.close();
        TextWidgetAPI.disableIsRunning();
      }
    });

    TextWidgetAPI.initializeCallbacks();

    var createDocumentSelectionModal = function () {            //open the modal in order the user to select a document to annotate
      if (!TextWidgetAPI.isRunning())
        TextWidgetAPI.enableIsRunning();
      else
        return false;

      Collection.getData()
        .then(function (response) {
          if (response.success) {
            var inputData = {
              annotator: $scope.annotatorType,
              annotationSchema: $scope.annotationSchema,
              collectionsData: response.data
            };

            $scope.selectDocumentModalInstance = Dialog.custom('select-document-modal.html', 'selectDocumentModalCtrl', inputData, false, "document-selector"); // animated fadeIn
            $scope.selectDocumentModalInstance.result.then(function (result) {
              if (!angular.isUndefined(result)) {
                TextWidgetAPI.disableIsRunning();
                TextWidgetAPI.resetCallbacks();

                TextWidgetAPI.setAnnotatorType(result.newAnnotator);
                TextWidgetAPI.setAnnotationSchemaOptions(result.newAnnotationSchemaOptions);
                TextWidgetAPI.setAnnotationSchema(result.newAnnotationSchema);

                TextWidgetAPI.setCurrentCollection(result.newCollection);
                result.newDocument.annotator_id = TextWidgetAPI.getAnnotatorTypeId();
                TextWidgetAPI.setCurrentDocument(result.newDocument);

                $timeout(function () { $scope.documentSelection = false; }, 800);
              }
            });
          } else {
            TextWidgetAPI.disableIsRunning();
            var modalOptions = { body: 'Error during the restoring of your documents. Please refresh the page and try again.' };
            Dialog.error(modalOptions);
          }
        });
    };

    var detectUnsavedChanges = function () { //function to detect unsaved changes before leaving the current document
      var currentDocument = TextWidgetAPI.getCurrentDocument();

      OpenDocument.get(currentDocument.id, currentDocument.annotator_id)
        .then(function (response) {
          if (response.success && response.data.length > 0) {
            var documentFound = _.findWhere(response.data, { opened: 1 });  //search if the user has an open document         

            if (!angular.isUndefined(documentFound) && documentFound.db_interactions > 0) {                //if changes have been done on the document
              if ($scope.autoSaveIndicator) {                            //auto save functionality enabled
                var AnnotatorTypeId = TextWidgetAPI.getAnnotatorTypeId();
                RestoreAnnotation.autoSave(currentDocument.collection_id, currentDocument.id, AnnotatorTypeId)
                  .then(function (response) {
                    if (response.success) {
                      createDocumentSelectionModal();
                      $scope.documentSelection = true;
                    } else {
                      var modalOptions = { body: 'Error during the save annotations. Please refresh the page and try again.' };
                      Dialog.error(modalOptions);
                    }
                  }, function (error) {
                    var modalOptions = { body: 'Database error. Please refresh the page and try again.' };
                    Dialog.error(modalOptions);
                  });
              } else {
                $ocLazyLoad.load('detectOpenDocModalCtrl').then(function () {
                  var detectOpenDocModalInstance = Dialog.custom('detect-open-doc-modal.html', 'detectOpenDocModalCtrl', currentDocument, true, "");

                  detectOpenDocModalInstance.result.then(function (response) {
                    if (response.success) {
                      createDocumentSelectionModal();
                      $scope.documentSelection = true;
                    } else {
                      var modalOptions = { body: 'Database error. Please refresh the page and try again.' };
                      Dialog.error(modalOptions);
                    }
                  });
                });
              }
            } else {
              createDocumentSelectionModal();
              $scope.documentSelection = true;
            }
          }
        }, function (error) {
          var modalOptions = { body: 'Database error. Please refresh the page and try again.' };
          Dialog.error(modalOptions);
        });
    };

    var detectOpenDocument = function () {                                //function to detect if the user has left any document open in the database
      OpenDocument.getAll()
        .then(function (response) {
          if (response.success && response.data.length > 0) {
            var documentFound = _.findWhere(response.data, { opened: 1 });                                //search if the user has an open document 

            if (!angular.isUndefined(documentFound)) {                                                    //user has left a document opened
              if (_.where(response.data, { document_id: documentFound.document_id }).length == 1 && (documentFound.db_interactions == 0 || documentFound.confirmed == 1)) {         //document has been opened only from the current user & no db_interactions have occurred    
                TempAnnotation.destroy(documentFound.collection_id, documentFound.document_id, null)
                  .then(function (response) {
                    createDocumentSelectionModal();
                  }, function (error) {
                    var modalOptions = { body: 'Database error. Please refresh the page and try again.' };
                    Dialog.error(modalOptions);
                  });
              } else if (!documentFound.confirmed && documentFound.db_interactions > 0) {                //document not shared and db_interactions > 0, open modal informing users about the work in proggress
                $ocLazyLoad.load('detectChangesModalCtrl').then(function () {
                  var detectChangesModalInstance = Dialog.custom('detect-changes-modal.html', 'detectChangesModalCtrl', documentFound, true, "");

                  detectChangesModalInstance.result.then(function (response) {
                    if (response.success) {
                      if (!angular.isUndefined(response.resume) && response.resume)
                        $timeout(function () { $scope.documentSelection = false; }, 800);
                      else
                        createDocumentSelectionModal();
                    } else {
                      var modalOptions = { body: 'Error during the restoration of your annotations. Please refresh the page and try again.' };
                      Dialog.error(modalOptions);
                    }
                  }, function (error) {
                    var modalOptions = { body: 'Database error. Please refresh the page and try again.' };
                    Dialog.error(modalOptions);
                  });
                });
              } else
                createDocumentSelectionModal();
            } else                                    //user has a document open
              createDocumentSelectionModal();
          } else if (response.success) {
            createDocumentSelectionModal();
          } else {
            var modalOptions = { body: 'Database error. Please refresh the page and try again.' };
            Dialog.error(modalOptions)
          }
        }, function (error) {
          var modalOptions = { body: 'Database error. Please refresh the page and try again.' };
          Dialog.error(modalOptions);
        });
    };

    $scope.openDocumentSelectionModal = function () {
      if (TextWidgetAPI.isRunning()) {
        alert('running');
        return false;
      }

      detectUnsavedChanges();
    };

    $scope.$on('selectDocument', function (event) {
      $scope.documentSelection = true;
      createDocumentSelectionModal();
      TextWidgetAPI.resetData();
    });

    detectOpenDocument();
    $ocLazyLoad.load('annotationWidgets')
  }]);
