import { Injectable, NgZone } from '@angular/core';
import { MainService } from '../main/main.service';
import { TextWidgetAPI } from '../text-widget/text-widget.service';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { AnnotationService } from '../annotation-service/annotation.service';
import { ButtonAnnotatorService } from '../button-annotator-service/button-annotator.service';
import { CollectionService } from '../collection-service/collection-service.service';
import { CoreferenceAnnotatorService } from '../coreference-annotator-service/coreference-annotator.service';
import { CoreferenceColorDataService } from '../coreference-color-data-service/coreference-color-data.service';
import { OpenDocumentService } from '../open-document/open-document.service';
import { TempAnnotationService } from '../temp-annotation-service/temp-annotation.service';

@Injectable({
  providedIn: 'root'
})
export class RestoreAnnotationService {

  constructor(public http:HttpClient, public openDocumentService:OpenDocumentService, public annotationService:AnnotationService, public tempAnnotationService:TempAnnotationService, public TextWidgetAPI:TextWidgetAPI) {}

  restoreFromTemp(collectionId, documentId, annotatorId) {
    return new Promise((resolve, reject) => {

    this.tempAnnotationService.getAll(collectionId, documentId, annotatorId)
      .then(function (response) {
        if (response["success"])
          resolve(response);
        else
          reject(response);
      }, function (error) {
        reject(error);
      });

    });
  }

  restoreFromDB(collectionId, documentId, annotatorId) {
    var annotationsResponse;
    var reset_db_interactions = false;
    return new Promise((resolve, reject) => {

    this.tempAnnotationService.destroy(collectionId, documentId, null /*null*/) //clear the temp annotations of the doc
      .then((response)=> {
        if (response["success"]) {
          return this.annotationService.getAll(collectionId, documentId/*, annotatorId*/); //get the document's annotations
        } else {
          reject(response);
        }
      })
      .then((response)=> {
        annotationsResponse = response;
        if (response["success"] && response["data"].length > 0) {
          // If annotations number is greater than 0 save them to Temp
          annotationsResponse.data = this.TextWidgetAPI.selectAnnotationsMatchingSchema(response["data"], annotatorId);
          reset_db_interactions = true;
          return this.tempAnnotationService.save(collectionId, documentId, annotationsResponse.data);
        } else if (response["success"] && response["data"].length == 0) {
          // If annotations number is equals 0 don't save anything
          return response;
        } else if (!response["success"]) {
          reject(response);
        }
      })
      .then((response:any)=> {
        if (!response.success) {
          reject(response);
        } else {
          if (reset_db_interactions) {
          return this.openDocumentService.save({
              document_id: documentId,
              collection_id: collectionId,
              annotator_type: annotatorId,
              db_interactions: -1 // A value < 0 will set 0 for all users
            });
          } else {
            return response;
          }
        }
      }, (error)=> {
        reject(error);
      })
      .then((response:any)=> {
        if (!response.success) {
          reject(response);
        } else {
          resolve(annotationsResponse);
        }
      },(error)=> {
        reject(error);
      });

    });
  }

  updateToTemp(annotation) {
    this.tempAnnotationService.update(annotation);
  }; /* updateToTemp */

  save(collectionId, documentId, annotatorId) {
    return new Promise((resolve, reject) => {

    this.openDocumentService.get(documentId, annotatorId)
      .then((response:any)=> {
        if (response["success"] && response["data"].length > 0) {
          /*var documentFound = _.findWhere(response["data"], {
            opened: 1
          });*/
          var documentFound = response["data"].find(doc => doc.opened === 1);

          if (typeof(documentFound) != "undefined" && documentFound.db_interactions > 0) {
            var annotations = [];

            this.tempAnnotationService.getAll(collectionId, documentId, annotatorId) //get document's temp_annotations
              .then((response:any)=> {
                if (response["success"]) {
                  annotations = response.data;
                  return this.annotationService.destroy(collectionId, documentId, annotatorId /*null*/); //delete the old annotations of the document
                } else
                  return reject(response);
              }).then((response)=> {
                if (response["success"]) {
                  if (annotations.length == 0) //if there are not annotations, resolve promise
                    return response;
                  else
                    return this.annotationService.save(collectionId, documentId, annotations); //if there are annotations save them
                } else
                  return reject(response);
              }).then((response:any)=> {
                if (response.success)
                  resolve(response);
                else
                  reject(response);
              },(error)=> {
                reject(error);
              });
          } else
            resolve({
              success: true
            });
        }
      },(error)=> {
        reject(error);
      });

    });
  };

  autoSave (collectionId, documentId, annotatorId) { //saveChanges
    var annotations = [];
    return new Promise((resolve, reject) => {

    this.tempAnnotationService.getAll(collectionId, documentId, annotatorId) //get the temp annotations of the document
      .then((response:any)=> {
        if (response.success) {
          annotations = response.data;
          return this.annotationService.destroy(collectionId, documentId, annotatorId /*null*/)
        } else
          return reject(response);
      }).then((response:any)=> { //empty the document annotations
        if (response.success)
          return this.annotationService.save(collectionId, documentId, annotations);
        else
          return reject(response);
      }).then((response:any)=> { //save all the annotations
        if (response.success)
          return this.tempAnnotationService.destroy(collectionId, documentId, annotatorId /*null*/)
        else
          return reject(response);
      }).then((response:any)=> { //delete the temp annotations
        if (response.success)
          return this.openDocumentService.destroy(documentId, annotatorId);
        else
          return reject(response); //return this.openDocumentService.destroy(documentId);
      }).then((response:any)=> { //delete the temp annotations
        if (response.success)
          resolve(response);
        else
          reject(response);
      }, function (error) {
        reject(error);
      });

    });
  };

  discard(collectionId, documentId, annotatorId) {
    return new Promise((resolve, reject) => {

    this.tempAnnotationService.destroy(collectionId, documentId, annotatorId /*null*/) //delete the old annotations of the document*/
      .then((response:any)=> {
        if (response.success)
          return this.openDocumentService.destroy(documentId, annotatorId);
        else
          return reject(response);
      }).then((response:any)=> { //delete the temp annotations
        if (response.success)
          resolve(response);
        else
          reject(response);
      },(error)=> {
        reject(error);
      });

    });
  };
}
