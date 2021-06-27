import { Injectable } from '@angular/core';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class TextWidgetAPI {

  constructor() { }

  isRunning = false; //flag that indicates if a process is running

  annotatorType: any = ""; //the type of the annotator (Button of Coreference Annotator)
  annotationSchemaOptions = {}; //the available options of the annotation schema

  annotationSchema = {}; //the annotation schema that user selected for the current document
  annotationSchemaAnnotationTypes = []; // A list of annotation types for the schema
  annotationSchemaCallbacks = []; //registered callbacks for the current annotation schema

  currentCollection = {}; //the collection that the document belongs
  currentCollectionCallbacks = []; //registered callbacks for the current collection

  currentDocument = {}; //the document that is currently open
  currentDocumentCallbacks = []; //registered callbacks for the current document

  currentSelection = {}; //the text that is currently selected
  currentSelectionCallbacks = []; //registered callbacks for the current selection

  annotations = []; //the document's annotations that match the annotation schema selected
  annotationsCallbacks = []; //registered callbacks for the matching annotations of the current document

  selectedAnnotation = {}; //the annotation that is currently selected by the user
  selectedAnnotationCallbacks = []; //registered callbacks for the annotation that is currently selected by the user

  annotationsToBeAdded = []; //the annotations that are going to be added on the text-widget
  annotationsToBeAddedCallbacks = []; //registered callbacks for the annotations that are going to be added on the text-widget

  annotationsToBeDeleted = []; //the annotations that are going to be removed from the text-widget
  annotationsToBeDeletedCallbacks = []; //registered callbacks for the annotations that are going to be removed from the text-widget

  overlappingAreas = []; //the areas that are being overlapped by other annotated areas
  overlappingAreasCallbacks = []; //registed callbacks for the overlapping areas of the text

  foundInCollection = [];
  foundInCollectionCallbacks = [];

  scrollIntoView = [];
  scrollIntoViewCallbacks = [];

  notifyObservers(observerStack: any[]) {
    observerStack.forEach((callback) => {
      callback();
    });
  }; //function to trigger the callbacks of observers


  initializeCallbacks() {
    this.annotationSchemaCallbacks = [];
    this.currentCollectionCallbacks = [];
    this.currentDocumentCallbacks = [];
    this.currentSelectionCallbacks = [];
    this.annotationsCallbacks = [];
    this.selectedAnnotationCallbacks = [];
    this.annotationsToBeAddedCallbacks = [];
    this.annotationsToBeDeletedCallbacks = [];
    this.overlappingAreasCallbacks = [];
    this.scrollIntoViewCallbacks = [];
  }

  checkIsRunning() {
    return this.isRunning;
  }

  enableIsRunning() {
    this.isRunning = true;
  }

  disableIsRunning() {
    this.isRunning = false;
  }

  /*** New Annotations Methods ***/
  getAnnotationsToBeAdded() {
    return this.annotationsToBeAdded;
  }

  clearAnnotationsToBeAdded() {
    this.annotationsToBeAdded = [];
  }

  registerNewAnnotationsCallback(callback) {
    this.annotationsToBeAddedCallbacks.push(callback);
  }

  /*** Annotations to be deleted ***/
  getAnnotationsToBeDeleted() {
    return this.annotationsToBeDeleted;
  }

  clearAnnotationsToBeDeleted() {
    this.annotationsToBeDeleted = [];
  }

  registerDeletedAnnotationsCallback(callback) {
    this.annotationsToBeDeletedCallbacks.push(callback);
  }

  /*** Individual Annotation Methods ***/
  getAnnotations() {
    return this.annotations;
  }

  getAnnotationById(annotationId) {
    return _.find(this.annotations, {
      _id: annotationId
    });
    /*return annotationsFound;*/
    /*if (annotationsFound.length>0)
            return annotationsFound[0];
        else
          return -1;*/
  }

  getAnnotationForDocumentAttribute(attribute) {
    return _.find(this.annotations, {
      document_attribute: attribute
    });
  }

  getAnnotationAttributeValue(annotation, attribute) {
    return _.find(annotation.attributes, {
      name: attribute
    });
  }

  // TODO: FIX
  selectAnnotations(type, attribute, attributeValues) {
    // console.warn("selectAnnotations:", type, attribute, attributeValues);
    var anns = this.annotations.filter(function (ann) {
      return ann.type === type;
    });
    if (typeof attribute != "undefined") {
      if (typeof attributeValues != "undefined") {
        anns = anns.filter(function (ann) {
          return ann.attributes.some(function (attr) {
            return (attr.name === attribute &&
              attributeValues.includes(attr.value));
          });
        });
      } else {
        anns = anns.filter(function (ann) {
          return ann.attributes.some(function (attr) {
            return attr.name === attribute;
          });
        });
      }
    }
    // console.warn("result:", anns);
    return anns;
  }

  addAnnotation(newAnnotation, selected) {
    if (typeof newAnnotation._id == "undefined") return false;

    this.annotations.push(newAnnotation);
    this.annotationsToBeAdded.push({
      "annotation": newAnnotation,
      "selected": selected,
      "action": "add"

    });

    this.notifyObservers(this.annotationsCallbacks);
    this.notifyObservers(this.annotationsToBeAddedCallbacks);

    if (selected)
      this.selectedAnnotation = _.cloneDeep(newAnnotation);
    else
      this.selectedAnnotation = {};

    this.notifyObservers(this.selectedAnnotationCallbacks);
    this.clearOverlappingAreas();
    this.clearSelection();
  }

  updateAnnotation(updatedAnnotation, selected) {
    if (typeof updatedAnnotation._id == "undefined") return false

    for (var i = 0; i < this.annotations.length; i++) {
      if (this.annotations[i]._id == updatedAnnotation._id) {
        this.annotations[i] = _.cloneDeep(updatedAnnotation);
        break;
      }
    }

    this.annotationsToBeAdded.push({
      "annotation": updatedAnnotation,
      "selected": selected,
      "action": "update"
    });

    this.notifyObservers(this.annotationsCallbacks);
    this.notifyObservers(this.annotationsToBeAddedCallbacks);

    if (selected)
      this.selectedAnnotation = _.cloneDeep(updatedAnnotation);
    else
      this.selectedAnnotation = {};

    this.currentSelection = {};
    this.notifyObservers(this.selectedAnnotationCallbacks);
    this.clearOverlappingAreas();
  }

  deleteAnnotation(annotationId) {
    var deletedAnnotation = _.find(this.annotations, {
      _id: annotationId
    });
    if (typeof deletedAnnotation == "undefined") return false;

    var deletedAnnotationIndex = _.indexOf(this.annotations, deletedAnnotation);
    this.annotations.splice(deletedAnnotationIndex, 1);
    this.annotationsToBeDeleted.push(deletedAnnotation);

    this.selectedAnnotation = {};

    this.notifyObservers(this.selectedAnnotationCallbacks);
    this.notifyObservers(this.annotationsToBeDeletedCallbacks);
    this.notifyObservers(this.currentDocumentCallbacks);

    this.clearOverlappingAreas();
    this.clearSelection();
  }

  registerAnnotationsCallback(callback) {
    this.annotationsCallbacks.push(callback);
  }

  /*** Batch Annotation Methods ***/
  // TODO: FIX
  isRelationAnnotationType(annotation) {
    //if (annotation.type === "argument_relation") return true;
    return this.annotationSchemaAnnotationTypes.includes(annotation.type);
  }

  // TODO: FIX
  belongsToSchemaAsSupportiveAnnotationType(newAnnotation) {
    // Annotation belongs to schema, but its annotation type can be different
    // than the main annotation type (i.e. the case of relations in Button Annotator)
    return this.annotationSchemaAnnotationTypes.includes(newAnnotation.type);
  }

  belongsToSchema(newAnnotation) {
    // Annotation belongs to the annotation schema if it has the same type
    // and has at least one of the schema's attributes
    if (this.annotationSchema["annotation_type"] != newAnnotation.type) {
      return false;
    }
    switch (this.annotatorType) {
      case "Button Annotator":
        if (_.where(newAnnotation.attributes, {
          name: this.annotationSchema["attribute"]
        }).length > 0) return true;

        return false;
      case "Coreference Annotator":
        for (var j = 0; j < newAnnotation.attributes.length; j++) {
          if (_.contains(this.annotationSchemaOptions["attributes"], newAnnotation.attributes[j].name))
            return true;
        }

        return false;
    }
  }

  selectAnnotationsMatchingSchema(Annotations, annotator_id) {
    var belong = [];
    for (var i = 0; i < Annotations.length; i++) {
      var annotation = Annotations[i];
      if (!(this.belongsToSchema(annotation) ||
        this.belongsToSchemaAsSupportiveAnnotationType(annotation))) { continue }
      if ("annotator_id" in annotation) {
        if (annotation["annotator_id"] != annotator_id) { continue }
      } else {
        annotation["annotator_id"] = annotator_id;
      }
      belong.push(annotation);
    }
    return belong;
  }

  matchAnnotationsToSchema(newAnnotations, annotator_id) {
    // Match the document's annotations to the annotation schema
    for (var i = 0; i < newAnnotations.length; i++) {
      var annotation = newAnnotations[i];

      if (this.belongsToSchema(annotation)) {
        // If annotation does not have the annotator_id property, add it...
        if ("annotator_id" in annotation) {
        } else {
          annotation["annotator_id"] = annotator_id;
        }
        if ((this.annotatorType == "Button Annotator") && (!("document_attribute" in annotation))) {
          for (var j = 0; j < annotation.attributes.length; j++) {
            if (!_.contains(this.annotationSchemaOptions["values"], annotation.attributes[j].value)) {
              //check if the annotation belongs to the "found in collection"
              this.foundInCollection.push(annotation);
              break;
            }
          }
        }

        this.annotations.push(annotation);
        this.annotationsToBeAdded.push({
          "annotation": annotation,
          "selected": false,
          "action": "matches"
        });
      } else if (annotation.type === 'argument_relation') {
        // Always add argument relation annotations
        this.annotations.push(annotation);
        this.annotationsToBeAdded.push({
          "annotation": annotation,
          "selected": false,
          "action": "matches"
        });
      }
    }

    this.notifyObservers(this.annotationsCallbacks);
    this.notifyObservers(this.foundInCollectionCallbacks);
    this.notifyObservers(this.annotationsToBeAddedCallbacks);
  }

  resetCallbacks() {
    this.annotationsCallbacks = [];
    this.foundInCollectionCallbacks = [];
    this.selectedAnnotationCallbacks = [];
  }

  resetData() {
    this.currentSelection = {};
    this.selectedAnnotation = {};
    this.annotations = [];
    this.annotationsToBeAdded = [];
    this.annotationsToBeDeleted = [];
    this.overlappingAreas = [];
    this.foundInCollection = [];
    this.scrollIntoView = [];

    this.notifyObservers(this.currentSelectionCallbacks);
    this.notifyObservers(this.selectedAnnotationCallbacks);
    this.notifyObservers(this.annotationsCallbacks);
    this.notifyObservers(this.annotationsToBeAddedCallbacks);
    this.notifyObservers(this.annotationsToBeDeletedCallbacks);
    this.notifyObservers(this.overlappingAreasCallbacks);
    this.notifyObservers(this.foundInCollectionCallbacks);
  }

  /*** Current Collection Methods ***/
  registerCurrentCollectionCallback(callback) {
    this.currentCollectionCallbacks.push(callback);
  }

  getCurrentCollection() {
    return this.currentCollection;
  }

  setCurrentCollection(newCurrentCollection) {
    this.currentCollection = _.cloneDeep(newCurrentCollection);
    this.notifyObservers(this.currentCollectionCallbacks);
  }

  /*** Current Document Methods ***/
  registerCurrentDocumentCallback(callback) {
    this.currentDocumentCallbacks.push(callback);
  }

  getCurrentDocument() {
    return this.currentDocument;
  }

  setCurrentDocument(newDocument) {
    this.currentDocument = _.cloneDeep(newDocument);
    this.notifyObservers(this.currentDocumentCallbacks);
  }

  /*** Current Selection Methods ***/
  registerCurrentSelectionCallback(callback) {
    this.currentSelectionCallbacks.push(callback)
  }

  getCurrentSelection() {
    return this.currentSelection;
  }

  setCurrentSelection(newCurrentSelection, notify) {
    this.currentSelection = _.cloneDeep(newCurrentSelection);

    if (notify)
      this.notifyObservers(this.currentSelectionCallbacks);
  }

  clearSelection() {
    this.currentSelection = {};
    this.notifyObservers(this.currentSelectionCallbacks);
  }

  /*** Annotator Type Methods ***/
  getAnnotatorType() {
    return this.annotatorType;
  }

  // TODO: FIX
  setAnnotatorType(newAnnotatorType) {
    if (newAnnotatorType.startsWith("Button_Annotator_")) {
      this.annotatorType = "Button Annotator";
    } else if (newAnnotatorType.startsWith("Coreference_Annotator_")) {
      this.annotatorType = "Coreference Annotator";
    } else {
      this.annotatorType = _.cloneDeep(newAnnotatorType);
    }
  }

  clearAnnotatorType() {
    this.annotatorType = {};
  }

  getAnnotatorTypeId() {
    var ann_id = this.annotatorType;
    if ("language" in this.annotationSchema) {
      ann_id = ann_id + "_" + this.annotationSchema["language"];
    }
    if ("annotation_type" in this.annotationSchema) {
      ann_id = ann_id + "_" + this.annotationSchema["annotation_type"];
    }
    if ("attribute" in this.annotationSchema) {
      ann_id = ann_id + "_" + this.annotationSchema["attribute"];
    }
    if ("alternative" in this.annotationSchema) {
      ann_id = ann_id + "_" + this.annotationSchema["alternative"];
    }
    return ann_id.split(' ').join('_');
  }

  /*** Annotator Schema Options Methods ***/
  getAnnotationSchemaOptions() {
    return this.annotationSchemaOptions;
  }

  setAnnotationSchemaOptions(newAnnotationSchemaOptions) {
    this.annotationSchemaOptions = _.cloneDeep(newAnnotationSchemaOptions);
  }

  clearAnnotationSchemaOptions() {
    this.annotationSchemaOptions = {};
  }

  /*** Annotation Schema Methods ***/
  registerAnnotationSchemaCallback(callback) {
    this.annotationSchemaCallbacks.push(callback);
  }

  getAnnotationSchema() {
    return this.annotationSchema;
  }

  setAnnotationSchema(newAnnotationSchema) {
    this.annotationSchema = _.cloneDeep(newAnnotationSchema);
    this.annotationSchemaAnnotationTypes = [];
    this.notifyObservers(this.annotationSchemaCallbacks);
  }

  clearAnnotationSchema() {
    this.annotationSchema = {};
    this.annotationSchemaAnnotationTypes = [];
  }

  getAnnotationSchemaAnnotationTypes() {
    return this.annotationSchemaAnnotationTypes;
  }

  // TODO: FIX
  setAnnotationSchemaAnnotationTypes(newAnnotationSchemaAnnotationTypes) {
    // Ensure that the annotationSchema.annotation_type is not included...
    this.annotationSchemaAnnotationTypes = _.cloneDeep(newAnnotationSchemaAnnotationTypes)
      .filter(function (type) {
        return type != this.annotationSchema.annotation_type;
      });
  }

  clearAnnotationSchemaAnnotationTypes() {
    this.annotationSchemaAnnotationTypes = [];
  }

  /*** Selected Annotation Methods ***/
  registerSelectedAnnotationCallback(callback) {
    this.selectedAnnotationCallbacks.push(callback)
  }

  getSelectedAnnotation() {
    return this.selectedAnnotation;
  }

  setSelectedAnnotation(newSelectedAnnotation) {
    if (typeof newSelectedAnnotation == "undefined" || newSelectedAnnotation == {}) {
      return false;
    }

    //CHECK
    if ((this.selectedAnnotation != {}))
      this.annotationsToBeAdded.push({
        "annotation": this.selectedAnnotation,
        "selected": false,
        "action": "deselect"
      });

    this.selectedAnnotation = _.cloneDeep(newSelectedAnnotation);
    this.annotationsToBeAdded.push({
      "annotation": newSelectedAnnotation,
      "selected": true,
      "action": "select"
    });
    this.currentSelection = {};
    this.clearOverlappingAreas();

    this.notifyObservers(this.annotationsToBeAddedCallbacks);
    this.notifyObservers(this.selectedAnnotationCallbacks);
  }

  setSelectedAnnotationById(annotationId) {
    if (typeof annotationId == "undefined") {
      return false;
    }

    /*
                if(!angular.equals(selectedAnnotation,{}))
                    annotationsToBeAdded.push({"annotation": selectedAnnotation, "selected": false}); */

    var newSelectedAnnotation = _.find(this.annotations, {
      _id: annotationId
    });

    if (typeof (newSelectedAnnotation) == "undefined")
      return false;

    this.selectedAnnotation = _.cloneDeep(newSelectedAnnotation);
    this.annotationsToBeAdded.push({
      "annotation": newSelectedAnnotation,
      "selected": true,
      "action": "select"
    });
    this.currentSelection = {};
    this.clearOverlappingAreas();

    this.notifyObservers(this.annotationsToBeAddedCallbacks);
    this.notifyObservers(this.selectedAnnotationCallbacks);
  }

  clearSelectedAnnotation() {
    if (typeof (this.selectedAnnotation) != "undefined" && (this.selectedAnnotation != {})) {
      this.annotationsToBeAdded.push({
        "annotation": this.selectedAnnotation,
        "selected": false,
        "action": "deselect"
      });
      this.selectedAnnotation = {};

      this.notifyObservers(this.annotationsToBeAddedCallbacks);
      this.notifyObservers(this.selectedAnnotationCallbacks);
      this.clearOverlappingAreas();
    }
  }

  /*** Overlapping Annotation Methods ***/
  registerOverlappingAreasCallback(callback) {
    this.overlappingAreasCallbacks.push(callback);
  }

  getOverlappingAreas() {
    return this.overlappingAreas;
  }

  clearOverlappingAreas() {
    this.overlappingAreas = [];
    this.notifyObservers(this.overlappingAreasCallbacks);
  }

  computeOverlappingAreas(offset) {
    var newOverlaps = [];

    for (var i = 0; i < this.annotations.length; i++) {
      for (var j = 0; j < this.annotations[i].spans.length; j++) {
        if (parseInt(offset) >= parseInt(this.annotations[i].spans[j].start) &&
          parseInt(offset) <= parseInt(this.annotations[i].spans[j].end)) {
          newOverlaps.push(this.annotations[i]);
          break;
        }
      }
    }

    this.overlappingAreas = newOverlaps;
    this.notifyObservers(this.overlappingAreasCallbacks);
  }

  /*** Annotations Found In Collection Methods ***/
  registerFoundInCollectionCallback(callback) {
    this.foundInCollectionCallbacks.push(callback);
  }

  getFoundInCollection() {
    return this.foundInCollection;
  }

  setFoundInCollection(newFoundInCollection) {
    this.foundInCollection = _.cloneDeep(newFoundInCollection);
    this.notifyObservers(this.foundInCollectionCallbacks);
  }

  clearFoundInCollection() {
    this.foundInCollection = [];
  }

  /*** Scroll Callbacks ***/
  registerScrollIntoViewCallback(callback) {
    this.scrollIntoViewCallbacks.push(callback);
  }

  scrollToAnnotation(annotation) {
    this.scrollIntoView = _.cloneDeep(annotation);
    this.notifyObservers(this.scrollIntoViewCallbacks);
    this.scrollIntoView = [];
  }

  getScrollToAnnotation() {
    return this.scrollIntoView;
  }
}
