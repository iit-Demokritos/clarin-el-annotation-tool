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

  public annotationCanBeDeletedMessage = '';
  annotationCanBeDeletedCallbacks = []; 

  schemaRelationValue = {};

  settings = undefined;
  settingsCallbacks = [];
  public settingsComplianceFields = ['created_by', 'updated_by'];
  public annotatorTypeIdToAnnotationSchema = {
    Button_Annotator_neutral_VAST_value_type_Generic: {language: "neutral", annotation_type: "VAST_value", attribute: "type", alternative: "Generic"},
    Button_Annotator_neutral_argument_type_Generic: {language: "neutral", annotation_type: "argument", attribute: "type", alternative: "Generic"},
    Button_Annotator_neutral_argument_type_Mixed_Argument_Stance_Relations: {language: "neutral", annotation_type: "argument", attribute: "type", alternative: "Mixed Argument-Stance Relations"}
  }
  
  annotationSchemaAutoAnn = {};
  annotationSchemaAutoAnnCallbacks = [];

  notifyObservers(observerStack: any[]) {
    let promises = [];
    let possiblePromise;
    observerStack.forEach((callback) => {
      possiblePromise = callback();
      if (possiblePromise instanceof Promise) {
        promises.push(possiblePromise);
      }
    });
    return promises;
  }; //function to trigger the callbacks of observers


  initializeCallbacks() {
    // console.error("initializeCallbacks()");
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
    this.settingsCallbacks = [];
    this.annotationCanBeDeletedCallbacks = [];
    this.annotationSchemaAutoAnnCallbacks = [];
  }

  resetCallbacks() {
    // console.error("resetCallbacks()");
    //this.initializeCallbacks();
    this.annotationsCallbacks = [];
    this.foundInCollectionCallbacks = [];
    this.selectedAnnotationCallbacks = [];
    this.annotationCanBeDeletedCallbacks = [];
    this.annotationSchemaAutoAnnCallbacks = [];
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
    this.settings = undefined;

    return [
      ... this.notifyObservers(this.currentSelectionCallbacks),
      ... this.notifyObservers(this.selectedAnnotationCallbacks),
      ... this.notifyObservers(this.annotationsCallbacks),
      ... this.notifyObservers(this.annotationsToBeAddedCallbacks),
      ... this.notifyObservers(this.annotationsToBeDeletedCallbacks),
      ... this.notifyObservers(this.overlappingAreasCallbacks),
      ... this.notifyObservers(this.foundInCollectionCallbacks),
      ... this.notifyObservers(this.settingsCallbacks)
    ];
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
    return this.annotations.find(e => e._id == annotationId);
  }

  getAnnotationForDocumentAttribute(attribute) {
    return this.annotations.find(e => e.document_attribute == attribute);
  }

  getAnnotationForDocumentSetting(attribute, owner) {
    return this.annotations.find(e => e.document_setting == attribute &&
      e.created_by == owner);
  }

  getAnnotationForCollectionSetting(attribute, owner) {
    return this.annotations.find(e => e.collection_setting == attribute &&
      e.created_by == owner);
  }

  getAnnotationAttributeValue(annotation, attribute) {
    var attr = annotation.attributes.find(e => e.name == attribute)
    if (attr === undefined) { return attr; }
    return attr['value'];
  }

  /**
   * This method returns an id we can present to the user.
   */
  getAnnotationPresentableId(annotation) {
    if (this.annotatorType == "Button Annotator") {
      var value = this.getAnnotationAttributeValue(annotation,
        this.annotationSchema['attribute'])
      if (value != undefined) { return value; }
    }
    if ('document_setting' in annotation) { return annotation['document_setting']; }
    if ('collection_setting' in annotation) { return annotation['collection_setting']; }
    return annotation._id;
  }; /* getAnnotationPresentableId */

  selectAnnotations(type, attribute, attributeValues) {
    var anns = this.annotations.filter((ann) => {
      return ann.type === type;
    });
    if (typeof attribute != "undefined") {
      if (typeof attributeValues != "undefined") {
        anns = anns.filter((ann) => {
          return ann.attributes.some((attr) => {
            return (attr.name === attribute &&
              attributeValues.includes(attr.value));
          });
        });
      } else {
        anns = anns.filter((ann) => {
          return ann.attributes.some((attr) => {
            return attr.name === attribute;
          });
        });
      }
    }
    return anns;
  }

  addAnnotations(newAnnotations) {
    // console.error("TextWidgetAPI: addAnnotations():",
    //               newAnnotations.length);
    newAnnotations.forEach(annotation => {
      this.annotations.push(annotation);
      this.annotationsToBeAdded.push({
        "annotation": annotation,
        "selected": false,
        "action": "matches"
      });
    });

    return [
      ... this.notifyObservers(this.foundInCollectionCallbacks),
      ... this.notifyObservers(this.annotationsCallbacks),
      ... this.notifyObservers(this.annotationsToBeAddedCallbacks)
    ];
  }; /* addAnnotations */

  addAnnotation(newAnnotation, selected=false) {
    if (typeof newAnnotation._id == "undefined") return false;

    this.annotations.push(newAnnotation);
    this.annotationsToBeAdded.push({
      "annotation": newAnnotation,
      "selected": selected,
      "action": "add"
    });

    // console.error("addAnnotation():", newAnnotation, selected);
    let promises = [
      ... this.notifyObservers(this.annotationsCallbacks),
      ... this.notifyObservers(this.annotationsToBeAddedCallbacks)
    ];

    if (selected)
      this.selectedAnnotation = _.cloneDeep(newAnnotation);
    else
      this.selectedAnnotation = {};

    promises = promises.concat(
      this.notifyObservers(this.selectedAnnotationCallbacks)
    );
    this.clearOverlappingAreas();
    this.clearSelection();
    return promises;
  }

  updateAnnotation(updatedAnnotation, selected) {
    if (typeof updatedAnnotation._id == "undefined") return false;

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

    // console.error("updateAnnotation():", updatedAnnotation, selected);
    let promises = [
      ... this.notifyObservers(this.annotationsCallbacks),
      ... this.notifyObservers(this.annotationsToBeAddedCallbacks)
    ];

    if (selected)
      this.selectedAnnotation = _.cloneDeep(updatedAnnotation);
    else
      this.selectedAnnotation = {};

    this.currentSelection = {};
    promises = promises.concat(
      this.notifyObservers(this.selectedAnnotationCallbacks)
    );
    this.clearOverlappingAreas();
    return promises;
  }

  deleteAnnotation(annotationId) {
    var deletedAnnotation = this.annotations.find(e => e._id == annotationId);
    if (typeof deletedAnnotation == "undefined") { return false };

    var deletedAnnotationIndex = _.indexOf(this.annotations, deletedAnnotation);
    this.annotations.splice(deletedAnnotationIndex, 1);
    this.annotationsToBeDeleted.push(deletedAnnotation);

    this.selectedAnnotation = {};

    // console.error("deleteAnnotation():", annotationId);
    let promises = [
      ... this.notifyObservers(this.selectedAnnotationCallbacks),
      ... this.notifyObservers(this.annotationsCallbacks),
      ... this.notifyObservers(this.annotationsToBeDeletedCallbacks)
    ];

    this.clearOverlappingAreas();
    this.clearSelection();
    return promises;
  }

  registerAnnotationsCallback(callback) {
    this.annotationsCallbacks.push(callback);
  }

  /*** Relation Annotation Methods ***/
  declareSchemaRelationValue(type: string, attribute: string, value: string, arg: string, options: any) {
    if (!(type in this.schemaRelationValue)) {this.schemaRelationValue[type] = {};}
    if (!(attribute in this.schemaRelationValue[type])) {this.schemaRelationValue[type][attribute] = {};}
    if (!(value in this.schemaRelationValue[type][attribute])) {this.schemaRelationValue[type][attribute][value] = {};}
    this.schemaRelationValue[type][attribute][value][arg] = options;
  }; /* declareSchemaRelation */

  isValidRelationAnnotation(annotation) {
    if (!(annotation["type"] in this.schemaRelationValue)) {
      return false;
    }
    var value = this.getAnnotationRelationValue(annotation)[0];
    var links = this.getAnnotationRelationLinks(annotation);
    var options = this.schemaRelationValue[annotation["type"]][value["name"]][value["value"]];
    return links.every((attr) => {
      // Get Annotation...
      var ann = this.getAnnotationById(attr["value"]);
      if (!ann) {return false;}
      return options[attr["name"]]["annotationArgumentValues"].includes(
        this.getAnnotationAttributeValue(ann, this.annotationSchema["attribute"])
      );
    });
  }; /* isValidRelationAnnotation */

  /*** Batch Annotation Methods ***/
  getAnnotationRelationValue(annotation) {
    return annotation.attributes.filter(attr => attr["name"] in this.schemaRelationValue[annotation["type"]]);
  }

  getAnnotationRelationLinks(annotation) {
    return annotation.attributes.filter(attr => attr["name"] == "arg1" ||
                                                attr["name"] == "arg2");
  }

  isDeletedAnnotation(annotation) {
    return ("deleted_at" in annotation);
  }

  isRelationAnnotationType(annotation) {
    //if (annotation.type === "argument_relation") return true;
    return this.annotationSchemaAnnotationTypes.includes(annotation.type);
  }

  isSettingAnnotation(annotation) {
    return (("document_setting" in annotation) ||
            ("collection_setting" in annotation));
  }; /* isSettingAnnotation */

  isAttributeAnnotation(annotation) {
    return (("document_attribute" in annotation) ||
            ("collection_attribute" in annotation));
  }; /* isAttributeAnnotation */

  isSettingsCompliantAnnotation(annotation) {
    if (this.settings == undefined) {
      // No settings, everything is compliant...
      return true;
    }
    // console.error("isSettingsCompliantAnnotation:", annotation);
    for (var k = 0; k < this.settingsComplianceFields.length; k++) {
      var field = this.settingsComplianceFields[k];
      if (field in this.settings) {
        var s = this.settings[field];
        if (!s.value && !s.checked.includes(annotation[field])) {
          // console.error("FALSE:", field, s.value, annotation[field], s.checked);
          return false;
        }
        // console.error("TRUE:", field, s.value, annotation[field], s.checked);
      }
    }
    return true;
  }; /* isSettingsCompliantAnnotation */

  belongsToSchemaAsSetting(newAnnotation, annotator_id) {
    // Settings Annotations must always have an Annotator ID!
    if (!("annotator_id" in newAnnotation)) { return false; }
    if (newAnnotation["annotator_id"] != annotator_id) { return false; }
    if (newAnnotation["type"] != "setting annotation") { return false; }
    if (this.isSettingAnnotation(newAnnotation)) { return true; }
    return false;
  }; /* belongsToSchemaAsSetting */

  belongsToSchemaAsSupportiveAnnotationType(newAnnotation) {
    // Annotation belongs to schema, but its annotation type can be different
    // than the main annotation type (i.e. the case of relations in Button
    // Annotator)
    return this.annotationSchemaAnnotationTypes.includes(newAnnotation.type);
  }; /* belongsToSchemaAsSupportiveAnnotationType */

  belongsToSchema(newAnnotation) {
    // Annotation belongs to the annotation schema if it has the same type
    // and has at least one of the schema's attributes
    if (this.annotationSchema["annotation_type"] != newAnnotation.type) {
      return false;
    }
    switch (this.annotatorType) {
      case "Button Annotator":
        // if (_.where(newAnnotation.attributes, {
        if (newAnnotation.attributes.filter(attr =>
          attr.name === this.annotationSchema["attribute"]).length > 0) return true;

        return false;
      case "Coreference Annotator":
        for (var j = 0; j < newAnnotation.attributes.length; j++) {
          if (_.includes(this.annotationSchemaOptions["attributes"], newAnnotation.attributes[j].name))
            return true;
        }

        return false;
    }
  }; /* belongsToSchema */

  selectAnnotationsMatchingSchema(Annotations, annotator_id) {
    var belong = [];
    for (var i = 0; i < Annotations.length; i++) {
      var annotation = Annotations[i];
      if (!(this.belongsToSchema(annotation) ||
        this.belongsToSchemaAsSupportiveAnnotationType(annotation) ||
        this.belongsToSchemaAsSetting(annotation, annotator_id))) { continue }
      if ("annotator_id" in annotation) {
        if (annotation["annotator_id"] != annotator_id) { continue }
      } else {
        annotation["annotator_id"] = annotator_id;
      }
      belong.push(annotation);
    }
    return belong;
  }; /* selectAnnotationsMatchingSchema */

  matchAnnotationsToSchema(newAnnotations, annotator_id) {
    // Match the document's annotations to the annotation schema
    // console.error("TextWidgetAPI: matchAnnotationsToSchema():",
    //               newAnnotations.length, annotator_id);
    for (var i = 0; i < newAnnotations.length; i++) {
      var annotation = newAnnotations[i];

      if (this.belongsToSchema(annotation) ||
          this.belongsToSchemaAsSetting(annotation, annotator_id)) {
        // If annotation does not have the annotator_id property, add it...
        if ("annotator_id" in annotation) {
        } else {
          annotation["annotator_id"] = annotator_id;
        }
        if ((this.annotatorType == "Button Annotator") &&
          (!(("document_attribute" in annotation) ||
            ("document_setting" in annotation) ||
            ("collection_setting" in annotation)))) {
          for (var j = 0; j < annotation.attributes.length; j++) {
            if (!_.includes(this.annotationSchemaOptions["values"],
              annotation.attributes[j].value)) {
              //check if the annotation belongs to the "found in collection"
              this.foundInCollection.push(annotation);
              // console.error("FoundInCollection:", annotation);
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
      } else if (this.belongsToSchemaAsSupportiveAnnotationType(annotation)) {
        // Always add argument relation annotations
        this.annotations.push(annotation);
        this.annotationsToBeAdded.push({
          "annotation": annotation,
          "selected": false,
          "action": "matches"
        });
      }
    }

    // console.error("matchAnnotationsToSchema():", newAnnotations);
    return [
      ... this.notifyObservers(this.foundInCollectionCallbacks),
      ... this.notifyObservers(this.annotationsCallbacks),
      ... this.notifyObservers(this.annotationsToBeAddedCallbacks)
    ];
  }; /* matchAnnotationsToSchema */

  /*** Current Collection Methods ***/
  registerCurrentCollectionCallback(callback) {
    this.currentCollectionCallbacks.push(callback);
  }

  getCurrentCollection() {
    return this.currentCollection;
  }

  setCurrentCollection(newCurrentCollection) {
    this.currentCollection = _.cloneDeep(newCurrentCollection);
    return this.notifyObservers(this.currentCollectionCallbacks);
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
    return this.notifyObservers(this.currentDocumentCallbacks);
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
    // console.error("TextWidgetAPI: setCurrentSelection():", newCurrentSelection);

    if (notify) {
      return this.notifyObservers(this.currentSelectionCallbacks);
    }
  }

  clearSelection() {
    // console.error("TextWidgetAPI: clearSelection()");
    this.currentSelection = {};
    return this.notifyObservers(this.currentSelectionCallbacks);
  }

  /*** Annotator Type Methods ***/
  getAnnotatorType() {
    return this.annotatorType;
  }

  getAnnotatorTypeFromAnnotatorTypeId(newAnnotatorType: string) {
    if (newAnnotatorType.startsWith("Button_Annotator_")) {
      return "Button Annotator";
    } else if (newAnnotatorType.startsWith("Coreference_Annotator_")) {
      return "Coreference Annotator";
    } else {
      return newAnnotatorType;
    }
  }

  setAnnotatorType(newAnnotatorType: string) {
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
    if ("attribute" in this.annotationSchema &&
        this.annotationSchema["attribute"].length > 0) {
      ann_id = ann_id + "_" + this.annotationSchema["attribute"];
    }
    if ("alternative" in this.annotationSchema) {
      ann_id = ann_id + "_" + this.annotationSchema["alternative"];
    }
    console.error('TextWidgetAPI: getAnnotatorTypeId():', this.annotationSchema, ann_id.split(' ').join('_'));
    return ann_id.split(' ').join('_');
  }

  getAnnotationSchemaFromAnnotatorTypeId(ann_id) {
    if (ann_id in this.annotatorTypeIdToAnnotationSchema) {
      return this.annotatorTypeIdToAnnotationSchema[ann_id];
    } else if (ann_id.replace(/-/g, '_') in this.annotatorTypeIdToAnnotationSchema) {
      return this.annotatorTypeIdToAnnotationSchema[ann_id.replace(/-/g, '_')];
    }
    throw new Error('TextWidgetAPI: getAnnotationSchemaFromAnnotatorTypeId(): '+ann_id);
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
    // console.error("TextWidgetAPI: setAnnotationSchema():", newAnnotationSchema);
    this.annotationSchema = _.cloneDeep(newAnnotationSchema);
    this.annotationSchemaAnnotationTypes = [];
    this.annotationSchemaAutoAnn = {};
    return this.notifyObservers(this.annotationSchemaCallbacks);
  }

  clearAnnotationSchema() {
    this.annotationSchema = {};
    this.annotationSchemaAnnotationTypes = [];
    this.annotationSchemaAutoAnn = {};
  }

  getAnnotationSchemaAutoAnn() {
    return this.annotationSchemaAutoAnn;
  }

  registerAnnotationSchemaAutoAnnCallback(callback) {
    this.annotationSchemaAutoAnnCallbacks.push(callback);
  }

  registerAnnotationSchemaAutoAnn(type, value, title, annotation, attribute) {
    if (type in this.annotationSchemaAutoAnn) {
      this.annotationSchemaAutoAnn[type].push({
        type: type,
        value: value,
        title: title,
        annotation: annotation,
        attribute: attribute
      });
    } else {
      this.annotationSchemaAutoAnn[type] = [{
        type: type,
        value: value,
        title: title,
        annotation: annotation,
        attribute: attribute
      }];
    }
    return this.notifyObservers(this.annotationSchemaAutoAnnCallbacks);
  }

  getAnnotationSchemaAnnotationTypes() {
    return this.annotationSchemaAnnotationTypes;
  }

  setAnnotationSchemaAnnotationTypes(newAnnotationSchemaAnnotationTypes) {
    // Ensure that the annotationSchema.annotation_type is not included...
    this.annotationSchemaAnnotationTypes = _.cloneDeep(newAnnotationSchemaAnnotationTypes)
      .filter((type) => {
        return type != this.annotationSchema["annotation_type"];
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
    if (typeof newSelectedAnnotation == "undefined" ||
      newSelectedAnnotation == {}) {
      return false;
    }

    //CHECK
    if ((this.selectedAnnotation != {}))
      this.annotationsToBeAdded.push({
        "annotation": this.selectedAnnotation,
        "selected": false,
        "action": "deselect"
      });
    //console.log(this.selectedAnnotation)
    this.selectedAnnotation = _.cloneDeep(newSelectedAnnotation);
    this.annotationsToBeAdded.push({
      "annotation": newSelectedAnnotation,
      "selected": true,
      "action": "select"
    });
    //console.log(this.annotationsToBeAdded)
    this.currentSelection = {};
    this.clearOverlappingAreas();
    //console.log(this.annotationsToBeAddedCallbacks)
    //console.log(this.annotationsToBeAddedCallbacks)
    return [
      ... this.notifyObservers(this.annotationsToBeAddedCallbacks),
      ... this.notifyObservers(this.selectedAnnotationCallbacks)
    ];
  }

  setSelectedAnnotationById(annotationId) {
    if (typeof annotationId == "undefined") {
      return false;
    }

    var newSelectedAnnotation = this.annotations.find(e => e._id == annotationId);

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

    return [
      ... this.notifyObservers(this.annotationsToBeAddedCallbacks),
      ... this.notifyObservers(this.selectedAnnotationCallbacks)
    ];
  }

  clearSelectedAnnotation() {
    if (typeof (this.selectedAnnotation) != "undefined" && (this.selectedAnnotation != {})) {
      this.annotationsToBeAdded.push({
        "annotation": this.selectedAnnotation,
        "selected": false,
        "action": "deselect"
      });
      this.selectedAnnotation = {};

      let promises = [
        ... this.notifyObservers(this.annotationsToBeAddedCallbacks),
        ... this.notifyObservers(this.selectedAnnotationCallbacks)
      ];
      this.clearOverlappingAreas();
      return promises;
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
    return this.notifyObservers(this.overlappingAreasCallbacks);
  }

  setOverlappingAreas(annotationIDs) {
    // console.error("TextWidgetComponent: setOverlappingAreas():", annotationIDs);
    this.overlappingAreas = this.annotations.filter(annotation => annotationIDs.includes(annotation._id));
    return this.notifyObservers(this.overlappingAreasCallbacks);
  }; /* setOverlappingAreas */

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
    return this.notifyObservers(this.overlappingAreasCallbacks);
  }

  computeImageOverlappingAreas(x, y) {
  }; /* computeImageOverlappingAreas */

  /*** Annotations Found In Collection Methods ***/
  registerFoundInCollectionCallback(callback) {
    this.foundInCollectionCallbacks.push(callback);
  }

  getFoundInCollection() {
    return this.foundInCollection;
  }

  setFoundInCollection(newFoundInCollection) {
    this.foundInCollection = _.cloneDeep(newFoundInCollection);
    return this.notifyObservers(this.foundInCollectionCallbacks);
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
    let promises = this.notifyObservers(this.scrollIntoViewCallbacks);
    this.scrollIntoView = [];
    return promises;
  }

  /*** Request Callbacks ***/
  registerAnnotationCanBeDeletedCallback(callback) {
    this.annotationCanBeDeletedCallbacks.push(callback);
  } /* registerAnnotationCanBeDeletedCallback */

  annotationCanBeDeleted(ann) {
    this.annotationCanBeDeletedMessage = '';
    return this.annotationCanBeDeletedCallbacks.some((callback) => {
      var possiblePromise = callback(ann);
      if (possiblePromise instanceof Promise) {
        possiblePromise.then((data) => {
          console.error("Data from promise:", data);
        });
      } else {
        if (possiblePromise === true) {
          return true;
        }
      }
      return false;
    });
  }; /* annotationCanBeDeleted */

  getScrollToAnnotation() {
    return this.scrollIntoView;
  }

  /*** Settings Methods ***/
  registerSettingsCallback(callback) {
    // console.error("registerSettingsCallback():", callback);
    this.settingsCallbacks.push(callback);
  }

  getSettings() {
    return this.settings;
  }

  setSettings(newSettings) {
    // console.error("TextWidgetComponent: setSettings():", _.isEqual(this.settings, newSettings), newSettings, "->", this.settings);
    // Try to check if objects are equal...
    if (_.isEqual(this.settings, newSettings)) {
      // console.error("TextWidgetComponent: setSettings(): settings are equal!");
      return;
    }
    this.settings = _.cloneDeep(newSettings);
    return this.notifyObservers(this.settingsCallbacks);
  }

  clearSettings() {
    this.settings = undefined;
  }

  /*
   * Replacement for "_.findWhere()", which exists in underscore,
   * but got removed from lodash 4.x.
   */
  findWhere(array, criteria) {
    return array.find(item => Object.keys(criteria).every(key => item[key] === criteria[key]))
  } /* findWhere */

  /*
   * Replacement for "_.where()", which exists in underscore,
   * but got removed from lodash 4.x.
   */
  where(array, object) {
    let keys = Object.keys(object);
    return array.filter(item => keys.every(key => item[key] === object[key]));
  }
}
