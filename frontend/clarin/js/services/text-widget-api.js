angular.module('clarin-el').factory('TextWidgetAPI', function() {
  var isRunning = false; //flag that indicates if a process is running

  var annotatorType = ""; //the type of the annotator (Button of Coreference Annotator)
  var annotationSchemaOptions = {}; //the available options of the annotation schema

  var annotationSchema = {}; //the annotation schema that user selected for the current document
  var annotationSchemaCallbacks = []; //registered callbacks for the current annotation schema

  var currentCollection = {}; //the collection that the document belongs
  var currentCollectionCallbacks = []; //registered callbacks for the current collection

  var currentDocument = {}; //the document that is currently open
  var currentDocumentCallbacks = []; //registered callbacks for the current document

  var currentSelection = {}; //the text that is currently selected
  var currentSelectionCallbacks = []; //registered callbacks for the current selection

  var annotations = []; //the document's annotations that match the annotation schema selected
  var annotationsCallbacks = []; //registered callbacks for the matching annotations of the current document

  var selectedAnnotation = {}; //the annotation that is currently selected by the user
  var selectedAnnotationCallbacks = []; //registered callbacks for the annotation that is currently selected by the user

  var annotationsToBeAdded = []; //the annotations that are going to be added on the text-widget
  var annotationsToBeAddedCallbacks = []; //registered callbacks for the annotations that are going to be added on the text-widget

  var annotationsToBeDeleted = []; //the annotations that are going to be removed from the text-widget
  var annotationsToBeDeletedCallbacks = []; //registered callbacks for the annotations that are going to be removed from the text-widget

  var overlappingAreas = []; //the areas that are being overlapped by other annotated areas
  var overlappingAreasCallbacks = []; //registed callbacks for the overlapping areas of the text

  var foundInCollection = [];
  var foundInCollectionCallbacks = [];

  var scrollIntoView = [];
  var scrollIntoViewCallbacks = [];

  var notifyObservers = function(observerStack) {
    angular.forEach(observerStack, function(callback) {
      callback();
    });
  }; //function to trigger the callbacks of observers

  return {
    initializeCallbacks: function() {
      annotationSchemaCallbacks = [];
      currentCollectionCallbacks = [];
      currentDocumentCallbacks = [];
      currentSelectionCallbacks = [];
      annotationsCallbacks = [];
      selectedAnnotationCallbacks = [];
      annotationsToBeAddedCallbacks = [];
      annotationsToBeDeletedCallbacks = [];
      overlappingAreasCallbacks = [];
      scrollIntoViewCallbacks = [];
    },

    isRunning: function() {
      return isRunning;
    },
    enableIsRunning: function() {
      isRunning = true;
    },
    disableIsRunning: function() {
      isRunning = false;
    },

    /*** New Annotations Methods ***/
    getAnnotationsToBeAdded: function() {
      return annotationsToBeAdded;
    },
    clearAnnotationsToBeAdded: function() {
      annotationsToBeAdded = [];
    },
    registerNewAnnotationsCallback: function(callback) {
      annotationsToBeAddedCallbacks.push(callback);
    },

    /*** Annotations to be deleted ***/
    getAnnotationsToBeDeleted: function() {
      return annotationsToBeDeleted;
    },
    clearAnnotationsToBeDeleted: function() {
      annotationsToBeDeleted = [];
    },
    registerDeletedAnnotationsCallback: function(callback) {
      annotationsToBeDeletedCallbacks.push(callback);
    },

    /*** Individual Annotation Methods ***/
    getAnnotations: function() {
      return annotations;
    },
    getAnnotationById: function(annotationId) {
      return _.findWhere(annotations, {
        _id: annotationId
      });
      /*return annotationsFound;*/
      /*if (annotationsFound.length>0)
              return annotationsFound[0];
          else
            return -1;*/
    },
    addAnnotation: function(newAnnotation, selected) {
      if (angular.isUndefined(newAnnotation._id)) return false;

      annotations.push(newAnnotation);
      annotationsToBeAdded.push({
        "annotation": newAnnotation,
        "selected": selected
      });

      notifyObservers(annotationsCallbacks);
      notifyObservers(annotationsToBeAddedCallbacks);

      if (selected)
        selectedAnnotation = angular.copy(newAnnotation);
      else
        selectedAnnotation = {};

      notifyObservers(selectedAnnotationCallbacks);
      this.clearOverlappingAreas();
      this.clearSelection();
    },
    updateAnnotation: function(updatedAnnotation, selected) {
      if (angular.isUndefined(updatedAnnotation._id)) return false

      for (var i = 0; i < annotations.length; i++) {
        if (angular.equals(annotations[i]._id, updatedAnnotation._id)) {
          annotations[i] = angular.copy(updatedAnnotation);
          break;
        }
      }

      annotationsToBeAdded.push({
        "annotation": updatedAnnotation,
        "selected": selected
      });

      notifyObservers(annotationsCallbacks);
      notifyObservers(annotationsToBeAddedCallbacks);

      if (selected)
        selectedAnnotation = angular.copy(updatedAnnotation);
      else
        selectedAnnotation = {};

      currentSelection = {};
      notifyObservers(selectedAnnotationCallbacks);
      this.clearOverlappingAreas();
    },
    deleteAnnotation: function(annotationId) {
      var deletedAnnotation = _.findWhere(annotations, {
        _id: annotationId
      });
      if (angular.isUndefined(deletedAnnotation)) return false;

      var deletedAnnotationIndex = _.indexOf(annotations, deletedAnnotation);
      annotations.splice(deletedAnnotationIndex, 1);
      annotationsToBeDeleted.push(deletedAnnotation);

      selectedAnnotation = {};

      notifyObservers(selectedAnnotationCallbacks);
      notifyObservers(annotationsToBeDeletedCallbacks);

      this.clearOverlappingAreas();
      this.clearSelection();
    },
    registerAnnotationsCallback: function(callback) {
      annotationsCallbacks.push(callback)
    },

    /*** Batch Annotation Methods ***/
    belongsToSchema: function(newAnnotation) { //annotation belongs to the annotation schema if has the same type and has at least one of the schema's attributes
      switch (annotatorType) {
        case "Button Annotator":
          if (angular.equals(annotationSchema.annotation_type, newAnnotation.type) && _.where(newAnnotation.attributes, {
              name: annotationSchema.attribute
            }).length > 0)
            return true;

          return false;
        case "Coreference Annotator":
          if (angular.equals(annotationSchema.annotation_type, newAnnotation.type)) {
            for (var j = 0; j < newAnnotation.attributes.length; j++) {
              if (_.contains(annotationSchemaOptions.attributes, newAnnotation.attributes[j].name))
                return true;
            }
          }

          return false;
      }
    },
    selectAnnotationsMatchingSchema: function(Annotations, annotator_id) {
      var belong = [];
      for (var i = 0; i < Annotations.length; i++) {
        var annotation = Annotations[i];
        if (!this.belongsToSchema(annotation)) {continue}
	if ("annotator_id" in annotation) {
          if (annotation["annotator_id"] != annotator_id) {continue}
	} else {
          annotation["annotator_id"] = annotator_id;
	}
	belong.push(annotation);
      }
      return belong;
    },
    matchAnnotationsToSchema: function(newAnnotations, annotator_id) { //match the document's annotations to the annotation schema
      for (var i = 0; i < newAnnotations.length; i++) {
        var annotation = newAnnotations[i];
        
        if (this.belongsToSchema(annotation)) {
          // If annotation does not have the annotator_id property, add it...
          if ("annotator_id" in annotation) {
	  } else {
            annotation["annotator_id"] = annotator_id;
	  }
          if (angular.equals(annotatorType, "Button Annotator")) {
            for (var j = 0; j < annotation.attributes.length; j++) {
              if (!_.contains(annotationSchemaOptions.values, annotation.attributes[j].value)) { //check if the annotation belongs to the "found in collection"
                foundInCollection.push(annotation);
                break;
              }
            }
          }

          annotations.push(annotation);
          annotationsToBeAdded.push({
            "annotation": annotation,
            "selected": false
          });
        } else if (annotation.type === 'argument_relation') {
          // Always add argument relation annotations
          annotations.push(annotation);
          annotationsToBeAdded.push({
            "annotation": annotation,
            "selected": false
          });
        }
      }

      notifyObservers(annotationsCallbacks);
      notifyObservers(foundInCollectionCallbacks);
      notifyObservers(annotationsToBeAddedCallbacks);
    },
    resetCallbacks: function() {
      annotationsCallbacks = [];
      foundInCollectionCallbacks = [];
      selectedAnnotationCallbacks = [];
    },
    resetData: function() {
      currentSelection = {};
      selectedAnnotation = {};
      annotations = [];
      annotationsToBeAdded = [];
      annotationsToBeDeleted = [];
      overlappingAreas = [];
      foundInCollection = [];
      scrollIntoView = [];

      notifyObservers(currentSelectionCallbacks);
      notifyObservers(selectedAnnotationCallbacks);
      notifyObservers(annotationsCallbacks);
      notifyObservers(annotationsToBeAddedCallbacks);
      notifyObservers(annotationsToBeDeletedCallbacks);
      notifyObservers(overlappingAreasCallbacks);
      notifyObservers(foundInCollectionCallbacks);
    },

    /*** Current Collection Methods ***/
    registerCurrentCollectionCallback: function(callback) {
      currentCollectionCallbacks.push(callback);
    },
    getCurrentCollection: function() {
      return currentCollection;
    },
    setCurrentCollection: function(newCurrentCollection) {
      currentCollection = angular.copy(newCurrentCollection);
      notifyObservers(currentCollectionCallbacks);
    },

    /*** Current Document Methods ***/
    registerCurrentDocumentCallback: function(callback) {
      currentDocumentCallbacks.push(callback);
    },
    getCurrentDocument: function() {
      return currentDocument;
    },
    setCurrentDocument: function(newDocument) {
      currentDocument = angular.copy(newDocument);
      notifyObservers(currentDocumentCallbacks);
    },

    /*** Current Selection Methods ***/
    registerCurrentSelectionCallback: function(callback) {
      currentSelectionCallbacks.push(callback)
    },
    getCurrentSelection: function() {
      return currentSelection;
    },
    setCurrentSelection: function(newCurrentSelection, notify) {
      currentSelection = angular.copy(newCurrentSelection);

      if (notify)
        notifyObservers(currentSelectionCallbacks);
    },
    clearSelection: function() {
      currentSelection = {};
      notifyObservers(currentSelectionCallbacks);
    },

    /*** Annotator Type Methods ***/
    getAnnotatorType: function() {
      return annotatorType;
    },
    setAnnotatorType: function(newAnnotatorType) {
      annotatorType = angular.copy(newAnnotatorType);
    },
    clearAnnotatorType: function() {
      annotatorType = {};
    },
    getAnnotatorTypeId: function() {
      var ann_id = annotatorType;
      if ("language" in annotationSchema) {
        ann_id = ann_id + "_" + annotationSchema.language;
      }
      if ("annotation_type" in annotationSchema) {
        ann_id = ann_id + "_" + annotationSchema.annotation_type;
      }
      if ("attribute" in annotationSchema) {
        ann_id = ann_id + "_" + annotationSchema.attribute;
      }
      if ("alternative" in annotationSchema) {
        ann_id = ann_id + "_" + annotationSchema.alternative;
      }
      return ann_id.split(' ').join('_');
    },

    /*** Annotator Schema Options Methods ***/
    getAnnotationSchemaOptions: function() {
      return annotationSchemaOptions;
    },
    setAnnotationSchemaOptions: function(newAnnotationSchemaOptions) {
      annotationSchemaOptions = angular.copy(newAnnotationSchemaOptions);
    },
    clearAnnotationSchemaOptions: function() {
      annotationSchemaOptions = {};
    },

    /*** Annotation Schema Methods ***/
    registerAnnotationSchemaCallback: function(callback) {
      annotationSchemaCallbacks.push(callback);
    },
    getAnnotationSchema: function() {
      return annotationSchema;
    },
    setAnnotationSchema: function(newAnnotationSchema) {
      annotationSchema = angular.copy(newAnnotationSchema);
      notifyObservers(annotationSchemaCallbacks);
    },
    clearAnnotationSchema: function() {
      annotationSchema = {};
    },

    /*** Selected Annotation Methods ***/
    registerSelectedAnnotationCallback: function(callback) {
      selectedAnnotationCallbacks.push(callback)
    },
    getSelectedAnnotation: function() {
      return selectedAnnotation;
    },
    setSelectedAnnotation: function(newSelectedAnnotation) {
      if (angular.isUndefined(newSelectedAnnotation) || angular.equals(newSelectedAnnotation, {})) {
        return false;
      }

      //CHECK
      if (!angular.equals(selectedAnnotation, {}))
        annotationsToBeAdded.push({
          "annotation": selectedAnnotation,
          "selected": false
        });

      selectedAnnotation = angular.copy(newSelectedAnnotation);
      annotationsToBeAdded.push({
        "annotation": newSelectedAnnotation,
        "selected": true
      });
      currentSelection = {};
      this.clearOverlappingAreas();

      notifyObservers(annotationsToBeAddedCallbacks);
      notifyObservers(selectedAnnotationCallbacks);
    },
    setSelectedAnnotationById: function(annotationId) {
      if (angular.isUndefined(annotationId)) {
        return false;
      }

      /*
                  if(!angular.equals(selectedAnnotation,{}))
                      annotationsToBeAdded.push({"annotation": selectedAnnotation, "selected": false}); */

      var newSelectedAnnotation = _.findWhere(annotations, {
        _id: annotationId
      });
      if (angular.isUndefined(newSelectedAnnotation))
        return false;

      selectedAnnotation = angular.copy(newSelectedAnnotation);
      annotationsToBeAdded.push({
        "annotation": newSelectedAnnotation,
        "selected": true
      });
      currentSelection = {};
      this.clearOverlappingAreas();

      notifyObservers(annotationsToBeAddedCallbacks);
      notifyObservers(selectedAnnotationCallbacks);
    },
    clearSelectedAnnotation: function() {
      if (!angular.isUndefined(selectedAnnotation) && !angular.equals(selectedAnnotation, {})) {
        annotationsToBeAdded.push({
          "annotation": selectedAnnotation,
          "selected": false
        });
        selectedAnnotation = {};

        notifyObservers(annotationsToBeAddedCallbacks);
        notifyObservers(selectedAnnotationCallbacks);
        this.clearOverlappingAreas();
      }
    },

    /*** Overlapping Annotation Methods ***/
    registerOverlappingAreasCallback: function(callback) {
      overlappingAreasCallbacks.push(callback);
    },
    getOverlappingAreas: function() {
      return overlappingAreas;
    },
    clearOverlappingAreas: function() {
      overlappingAreas = [];
      notifyObservers(overlappingAreasCallbacks);
    },
    computeOverlappingAreas: function(offset) {
      var newOverlaps = [];

      for (var i = 0; i < annotations.length; i++) {
        for (var j = 0; j < annotations[i].spans.length; j++) {
          if (parseInt(offset) >= parseInt(annotations[i].spans[j].start) && parseInt(offset) <= parseInt(annotations[i].spans[j].end)) {
            newOverlaps.push(annotations[i]);
            break;
          }
        }
      }

      overlappingAreas = newOverlaps;
      notifyObservers(overlappingAreasCallbacks);
    },

    /*** Annotations Found In Collection Methods ***/
    registerFoundInCollectionCallback: function(callback) {
      foundInCollectionCallbacks.push(callback);
    },
    getFoundInCollection: function() {
      return foundInCollection;
    },
    setFoundInCollection: function(newFoundInCollection) {
      foundInCollection = angular.copy(newFoundInCollection);
    },
    clearFoundInCollection: function() {
      foundInCollection = [];
    },

    /*** Scroll Callbacks ***/
    registerScrollIntoViewCallback: function(callback) {
      scrollIntoViewCallbacks.push(callback);
    },
    scrollToAnnotation: function(annotation) {
      scrollIntoView = angular.copy(annotation);
      notifyObservers(scrollIntoViewCallbacks);
      scrollIntoView = [];
    },
    getScrollToAnnotation: function() {
      return scrollIntoView;
    }
  }
});
