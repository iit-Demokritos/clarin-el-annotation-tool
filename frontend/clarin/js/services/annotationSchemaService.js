angular.module('clarin-el').factory('AnnotationSchema', function ($q, TextWidgetAPI, ButtonAnnotator, CoreferenceAnnotator, $timeout) {

  var restore = function (annotatorType) {
    var deferred = $q.defer();
    var responseData = {
      success: true,
      savedAnnotationSchema: {
        language: "",
        annotation_type: "",
        attribute: "",
        alternative: ""
      },
      annotationSchemaOptions: {
        languages: [],
        annotation_types: [],
        attributes: [],
        alternatives: [],
        values: []
      }
    };

    if (annotatorType.startsWith("Button_Annotator_")) {
      annotatorType = "Button Annotator";
    } else if (annotatorType.startsWith("Coreference_Annotator_")) {
      annotatorType = "Coreference Annotator";
    };

    switch (annotatorType) {
      case "Button Annotator":
        ButtonAnnotator.checkForSavedSchema() //clear the temp annotations of the doc
          .then(function (response) {
            if (response.success) {
              if (!angular.isUndefined(response.data) && response.data != null)
                responseData.savedAnnotationSchema = response.data;
              return ButtonAnnotator.getLanguages();
            } else
              return $q.reject(response);
          })
          .then(function (response) { /*if (!angular.isUndefined(response.languages) && !angular.equals(responseData.savedAnnotationSchema, {})) {*/
            responseData.annotationSchemaOptions.languages = response.languages;
            if (angular.equals(responseData.savedAnnotationSchema.language, ""))
              return $q.reject(responseData);

            return ButtonAnnotator.getAnnotationTypes(responseData.savedAnnotationSchema.language);
          })
          .then(function (response) {
            responseData.annotationSchemaOptions.annotation_types = response.annotation_types;
            return ButtonAnnotator.getAnnotationAttributes(responseData.savedAnnotationSchema.language,
              responseData.savedAnnotationSchema.annotation_type);
          })
          .then(function (response) {
            responseData.annotationSchemaOptions.attributes = response.attributes;
            return ButtonAnnotator.getAttributeAlternatives(responseData.savedAnnotationSchema.language,
              responseData.savedAnnotationSchema.annotation_type, responseData.savedAnnotationSchema.attribute);
          })
          .then(function (response) {
            responseData.annotationSchemaOptions.alternatives = response.alternatives;
            return ButtonAnnotator.getValues(responseData.savedAnnotationSchema.language,
              responseData.savedAnnotationSchema.annotation_type,
              responseData.savedAnnotationSchema.attribute, responseData.savedAnnotationSchema.alternative);
          })
          .then(function (response) {
            angular.forEach(response.groups, function (obj, key) {
              responseData.annotationSchemaOptions.values = responseData.annotationSchemaOptions.values.concat(obj.values);
            });

            deferred.resolve(responseData);
          }, function (response) {
            if (response.success)
              deferred.resolve(responseData);
            else
              deferred.reject(response);
          });

        break;
      case "Coreference Annotator":
        CoreferenceAnnotator.checkForSavedSchema() //clear the temp annotations of the doc
          .then(function (response) {
            if (response.success) {
              if (!angular.isUndefined(response.data) && response.data != null)
                responseData.savedAnnotationSchema = response.data;
              return CoreferenceAnnotator.getLanguages();
            } else
              return $q.reject(response);
          })
          .then(function (response) {
            responseData.annotationSchemaOptions.languages = response.languages;
            if (angular.equals(responseData.savedAnnotationSchema.language, ""))
              return $q.reject(responseData);

            return CoreferenceAnnotator.getAnnotationTypes(responseData.savedAnnotationSchema.language);
          })
          .then(function (response) {
            responseData.annotationSchemaOptions.annotation_types = response.annotation_types;
            return CoreferenceAnnotator.getAttributeAlternatives(responseData.savedAnnotationSchema.language,
              responseData.savedAnnotationSchema.annotation_type);
          })
          .then(function (response) {
            responseData.annotationSchemaOptions.alternatives = response.alternatives;
            return CoreferenceAnnotator.getValues(responseData.savedAnnotationSchema.language,
              responseData.savedAnnotationSchema.annotation_type,
              responseData.savedAnnotationSchema.alternative);
          })
          .then(function (response) {
            angular.forEach(response.attributes, function (obj, key) {
              responseData.annotationSchemaOptions.attributes.push(obj.attribute);
            });

            deferred.resolve(responseData);
          }, function (response) {
            if (response.success)
              deferred.resolve(responseData);
            else
              deferred.reject(response);
          });

        break;
    }

    return deferred.promise;
  };

  var update = function (annotationSchema, annotatorType) {
    var deferred = $q.defer();

    if (annotatorType.startsWith("Button_Annotator_")) {
      annotatorType = "Button Annotator";
    } else if (annotatorType.startsWith("Coreference_Annotator_")) {
      annotatorType = "Coreference Annotator";
    };

    switch (annotatorType) {
      case "Button Annotator":
        ButtonAnnotator.updateSchema(annotationSchema)
          .then(function (response) {
            if (response.success)
              deferred.resolve(response);
            else
              deferred.reject();
          });

        break;
      case "Coreference Annotator":
        CoreferenceAnnotator.updateSchema(annotationSchema)
          .then(function (response) {
            if (response.success)
              deferred.resolve(response)
            else
              deferred.reject();
          });

        break;
    }

    return deferred.promise;
  };


  return {
    restore: restore,
    update: update
  }
});
