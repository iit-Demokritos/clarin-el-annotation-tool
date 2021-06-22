import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AnnotationService } from '../annotation-service/annotation.service';
import { ButtonAnnotatorService } from '../button-annotator-service/button-annotator.service';
import { CollectionService } from '../collection-service/collection-service.service';
import { CoreferenceAnnotatorService } from '../coreference-annotator-service/coreference-annotator.service';
import { CoreferenceColorDataService } from '../coreference-color-data-service/coreference-color-data.service';
import { MainService } from '../main/main.service';
import { OpenDocumentService } from '../open-document/open-document.service';
import { TextWidgetAPI } from '../text-widget/text-widget.service';

@Injectable({
  providedIn: 'root'
})
export class TempAnnotationService {

  constructor(public http:HttpClient) {}
  
  getAll = function (collectionId, documentId, annotatorId=null) {
    return new Promise((resolve, reject) => {
    var uri = './api/collections/' + collectionId + '/documents/' + documentId + '/temp_annotations';
    if (annotatorId) {
        uri = uri + '/' + annotatorId;
    }
    this.http.get(uri)
      .subscribe(function (data) {
        resolve(data);
      },(error)=> {
        reject(error);
      });

    });
  };

  get(collectionId, documentId, annotationId) {
    return new Promise((resolve, reject) => {
    this.http.get('./api/collections/' + collectionId + '/documents/' + documentId + '/temp_annotations/' + annotationId)
      .subscribe(function (data) {
        resolve(data);
      },(error)=> {
        reject(error);
      });

    });
  };

  save = function (collectionId, documentId, annotationData) {
    return new Promise((resolve, reject) => {
    this.http.post('./api/collections/' + collectionId + '/documents/' + documentId + '/temp_annotations',{
      data: annotationData
    },{
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }).subscribe(function (data) {
        resolve(data);
      },(error)=> {
        reject(error);
      });

    });
  };

  update(annotationData) {
    return new Promise((resolve, reject) => {
    this.http.put('./api/collections/' + annotationData.collection_id + '/documents/' + annotationData.document_id + '/temp_annotations/' + annotationData._id,{
      data: annotationData
    },{
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }).subscribe(function (data) {
      resolve(data);
    },(error)=> {
      reject(error);
    });

    });
  };

  destroy = function (collectionId, documentId, annotationId) {
    return new Promise((resolve, reject) => {
    this.http.delete('api/collections/' + collectionId + '/documents/' + documentId + '/temp_annotations/' + annotationId)
      .subscribe((data)=> {
        resolve(data);
      },(error)=> {
        reject(error);
      });

    });
  };

}
