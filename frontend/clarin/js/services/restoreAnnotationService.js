angular.module('clarin-el').factory('RestoreAnnotation', function($q, TextWidgetAPI, Annotation, TempAnnotation, OpenDocument) {
  var restoreFromTemp = function(collectionId, documentId) {
    var deferred = $q.defer();

    TempAnnotation.getAll(collectionId, documentId)
      .then(function(response) {
        if (response.success)
          deferred.resolve(response);
        else
          deferred.reject(response);
      }, function(error) {
        deferred.reject(error);
      });

    return deferred.promise;
  };

  var restoreFromDB = function(collectionId, documentId) {
    var annotationsResponse;
    var deferred = $q.defer();

    TempAnnotation.destroy(collectionId, documentId, null) //clear the temp annotations of the doc
      .then(function(response) {
        if (response.success)
          return Annotation.getAll(collectionId, documentId); //get the document's annotations
        else
          return $q.reject(response);
      })
      .then(function(response) {
        annotationsResponse = response;
        if (response.success && response.data.length > 0) //if annotations number is greater than 0 save them to Temp
          return TempAnnotation.save(collectionId, documentId, response.data)
        else if (response.success && response.data.length == 0) //if annotations number is equals 0 save dont save nothing
          return response;
        else if (!response.success)
          return $q.reject(response);
      })
      .then(function(response) {
        if (!response.success)
          deferred.reject(response);
        else
          deferred.resolve(annotationsResponse);
      }, function(error) {
        deferred.reject(error);
      });

    return deferred.promise;
  };

  var save = function(collectionId, documentId) {
    var deferred = $q.defer();

    OpenDocument.get(documentId)
      .then(function(response) {
        if (response.success && response.data.length > 0) {
          var documentFound = _.findWhere(response.data, {
            opened: 1
          });

          if (!angular.isUndefined(documentFound) && documentFound.db_interactions > 0) {
            var annotations = [];

            TempAnnotation.getAll(collectionId, documentId) //get document's temp_annotations
              .then(function(response) {
                if (response.success) {
                  annotations = response.data;
                  return Annotation.destroy(collectionId, documentId, null); //delete the old annotations of the document
                } else
                  return $q.reject(response);
              }).then(function(response) {
                if (response.success) {
                  if (annotations.length == 0) //if there are not annotations, resolve promise
                    return response;
                  else
                    return Annotation.save(collectionId, documentId, annotations); //if there are annotations save them 
                } else
                  return $q.reject(response);
              }).then(function(response) {
                if (response.success)
                  deferred.resolve(response);
                else
                  deferred.reject(response);
              }, function(error) {
                deferred.reject(error);
              });
          } else
            deferred.resolve({
              success: true
            });
        }
      }, function(error) {
        deferred.reject(error);
      });

    return deferred.promise;
  };

  var autoSave = function(collectionId, documentId) { //saveChanges
    var annotations = [];
    var deferred = $q.defer();

    TempAnnotation.getAll(collectionId, documentId) //get the temp annotations of the document
      .then(function(response) {
        if (response.success) {
          annotations = response.data;
          return Annotation.destroy(collectionId, documentId, null)
        } else
          return $q.reject(response);
      }).then(function(response) { //empty the document annotations 
        if (response.success)
          return Annotation.save(collectionId, documentId, annotations);
        else
          return $q.reject(response);
      }).then(function(response) { //save all the annotations 
        if (response.success)
          return TempAnnotation.destroy(collectionId, documentId, null)
        else
          return $q.reject(response);
      }).then(function(response) { //delete the temp annotations
        if (response.success)
          return OpenDocument.destroy(documentId);
        else
          return $q.reject(response); //return OpenDocument.destroy(documentId);
      }).then(function(response) { //delete the temp annotations
        if (response.success)
          deferred.resolve(response);
        else
          deferred.reject(response);
      }, function(error) {
        deferred.reject(error);
      });

    return deferred.promise;
  };

  var discard = function(collectionId, documentId) {
    var deferred = $q.defer();

    TempAnnotation.destroy(collectionId, documentId, null) //delete the old annotations of the document*/
      .then(function(response) {
        if (response.success)
          return OpenDocument.destroy(documentId);
        else
          return $q.reject(response);
      }).then(function(response) { //delete the temp annotations
        if (response.success)
          deferred.resolve(response);
        else
          deferred.reject(response);
      }, function(error) {
        deferred.reject(error);
      });

    return deferred.promise;
  };

  return {
    restoreFromTemp: restoreFromTemp,
    restoreFromDB: restoreFromDB,
    save: save,
    autoSave: autoSave,
    discard: discard
  }
});
