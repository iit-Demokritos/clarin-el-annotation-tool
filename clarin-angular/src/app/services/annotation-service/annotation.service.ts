import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ButtonAnnotatorService } from '../button-annotator-service/button-annotator.service';
import { CollectionService } from '../collection-service/collection-service.service';
import { CoreferenceAnnotatorService } from '../coreference-annotator-service/coreference-annotator.service';
import { CoreferenceColorDataService } from '../coreference-color-data-service/coreference-color-data.service';
import { MainService } from '../main/main.service';
import { OpenDocumentService } from '../open-document/open-document.service';
import { TempAnnotationService } from '../temp-annotation-service/temp-annotation.service';
import { TextWidgetAPI } from '../text-widget/text-widget.service';

@Injectable({
  providedIn: 'root'
})
export class AnnotationService {

  constructor(public http:HttpClient) {}

  
  getAll(collectionId, documentId, annotatorId=null) {
    return new Promise((resolve, reject) => {
    var uri = './api/collections/' + collectionId + '/documents/' + documentId + '/annotations';
    if (annotatorId) {
        uri = uri + '/' + annotatorId;
    }
    this.http.get(uri)
      .subscribe(function (data) {
        resolve(data);
      },(error) =>{
        reject();
      });

    });
  };

  get(collectionId, documentId, annotationId) {
    return new Promise((resolve, reject) => {
    this.http.get('./api/collections/' + collectionId + '/documents/' + documentId + '/annotations/' + annotationId)
      .subscribe(function (data) {
        resolve(data);
      },(error) =>{
        reject();
      });

    });
  };

  save(collectionId, documentId, annotationData) {
    //console.log("annotation save:", annotationData)
    return new Promise((resolve, reject) => {
      this.http.post('./api/collections/' + collectionId + '/documents/' + documentId + '/annotations',{ data: annotationData },{
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      })
        .subscribe(function (data) {
          resolve(data);
        },(error) =>{
          reject();
        });
    });
  };

  import(collectionId, documentId, annotationData) {
    //console.log("annotation save:", annotationData)
    return new Promise((resolve, reject) => {
      this.http.post('./api/collections/' + collectionId + '/documents/' + documentId + '/annotations/import',{ data: annotationData },{
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      })
        .subscribe((data) => {
          resolve(data);
        },(error) =>{
          reject();
        });
    });
  }; /* import */

  destroy(collectionId, documentId, annotationId) {
    return new Promise((resolve, reject) => {
    this.http.delete('./api/collections/' + collectionId + '/documents/' + documentId + '/annotations/' + annotationId)
      .subscribe(function (data) {
        resolve(data);
      },(error)=> {
        reject();
      });
    });
  };

}
