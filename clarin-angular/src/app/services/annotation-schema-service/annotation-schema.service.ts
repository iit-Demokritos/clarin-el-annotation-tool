import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ButtonAnnotatorService } from '../button-annotator-service/button-annotator.service';
import { CoreferenceAnnotatorService } from '../coreference-annotator-service/coreference-annotator.service';

@Injectable({
  providedIn: 'root'
})
export class AnnotationSchemaService {

  constructor(public http: HttpClient, public buttonAnnotator: ButtonAnnotatorService, public coreferenceAnnotatorService: CoreferenceAnnotatorService) { }

  restore(annotatorType) {
    return new Promise((resolve, reject) => {
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
          this.buttonAnnotator.checkForSavedSchema() //clear the temp annotations of the doc
            .then((response: any) => {
              if (response.success) {
                if (typeof (response.data) != "undefined" && response.data != null)
                  responseData.savedAnnotationSchema = response.data;
                return this.buttonAnnotator.getLanguages();
              } else
                return reject(response);
            })
            .then((response: any) => {	/*if (!angular.isUndefined(response.languages) && !angular.equals(responseData.savedAnnotationSchema, {})) {*/
              responseData.annotationSchemaOptions.languages = response.languages;
              if (responseData.savedAnnotationSchema.language == "")
                return reject(responseData);

              return this.buttonAnnotator.getAnnotationTypes(responseData.savedAnnotationSchema.language);
            })
            .then((response: any) => {
              responseData.annotationSchemaOptions.annotation_types = response.annotation_types;
              return this.buttonAnnotator.getAnnotationAttributes(responseData.savedAnnotationSchema.language, responseData.savedAnnotationSchema.annotation_type);
            })
            .then((response: any) => {
              responseData.annotationSchemaOptions.attributes = response.attributes;
              return this.buttonAnnotator.getAttributeAlternatives(responseData.savedAnnotationSchema.language, responseData.savedAnnotationSchema.annotation_type, responseData.savedAnnotationSchema.attribute);
            })
            .then((response: any) => {
              responseData.annotationSchemaOptions.alternatives = response.alternatives;
              return this.buttonAnnotator.getValues(responseData.savedAnnotationSchema.language, responseData.savedAnnotationSchema.annotation_type, responseData.savedAnnotationSchema.attribute, responseData.savedAnnotationSchema.alternative);
            })
            .then((response: any) => {

              response.groups.forEach(function (value) {
                responseData.annotationSchemaOptions.values = responseData.annotationSchemaOptions.values.concat(value.values);
              });

              resolve(responseData);
            }, (response: any) => {
              if (response.success)
                resolve(responseData);
              else
                reject(response);
            });

          break;
        case "Coreference Annotator":
          this.coreferenceAnnotatorService.checkForSavedSchema() //clear the temp annotations of the doc
            .then((response: any) => {
              if (response.success) {
                if (typeof (response.data) != "undefined" && response.data != null)
                  responseData.savedAnnotationSchema = response.data;
                return this.coreferenceAnnotatorService.getLanguages();
              } else
                return reject(response);
            })
            .then((response: any) => {
              responseData.annotationSchemaOptions.languages = response.languages;
              if (responseData.savedAnnotationSchema.language == "")
                return reject(responseData);

              return this.coreferenceAnnotatorService.getAnnotationTypes(responseData.savedAnnotationSchema.language);
            })
            .then((response: any) => {
              responseData.annotationSchemaOptions.annotation_types = response.annotation_types;
              return this.coreferenceAnnotatorService.getAttributeAlternatives(responseData.savedAnnotationSchema.language, responseData.savedAnnotationSchema.annotation_type);
            })
            .then((response: any) => {
              responseData.annotationSchemaOptions.alternatives = response.alternatives;
              return this.coreferenceAnnotatorService.getValues(responseData.savedAnnotationSchema.language, responseData.savedAnnotationSchema.annotation_type, responseData.savedAnnotationSchema.alternative);
            })
            .then((response: any) => {

              response.attributes.forEach(function (value) {
                responseData.annotationSchemaOptions.attributes.push(value.attribute);
              });

              resolve(responseData);
            }, function (response) {
              if (response.success)
                resolve(responseData);
              else
                reject(response);
            });

          break;
      }

    });
  }

  update(annotationSchema, annotatorType) {
    return new Promise((resolve, reject) => {

      if (annotatorType.startsWith("Button_Annotator_")) {
        annotatorType = "Button Annotator";
      } else if (annotatorType.startsWith("Coreference_Annotator_")) {
        annotatorType = "Coreference Annotator";
      };

      switch (annotatorType) {
        case "Button Annotator":
          this.buttonAnnotator.updateSchema(annotationSchema)
            .then((response: any) => {
              if (response.success)
                resolve(response);
              else
                reject();
            });

          break;
        case "Coreference Annotator":
          this.coreferenceAnnotatorService.updateSchema(annotationSchema)
            .then((response: any) => {
              if (response.success)
                resolve(response)
              else
                reject();
            });

          break;
      }

    });
  };

}
