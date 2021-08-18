import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AnnotationService {

  constructor(public http: HttpClient) { }

  getAll(collectionId, documentId, annotatorId = null) {
    return new Promise((resolve, reject) => {
      var uri = './api/collections/' + collectionId + '/documents/' + documentId + '/annotations';
      if (annotatorId) {
        uri = uri + '/' + annotatorId;
      }
      this.http.get(uri)
        .subscribe(function (data) {
          resolve(data);
        }, (error) => {
          reject();
        });

    });
  };

  get(collectionId, documentId, annotationId) {
    return new Promise((resolve, reject) => {
      this.http.get('./api/collections/' + collectionId + '/documents/' + documentId + '/annotations/' + annotationId)
        .subscribe(function (data) {
          resolve(data);
        }, (error) => {
          reject();
        });

    });
  };

  save(collectionId, documentId, annotationData) {
    //console.log("annotation save:", annotationData)
    return new Promise((resolve, reject) => {
      this.http.post('./api/collections/' + collectionId + '/documents/' + documentId + '/annotations', { data: annotationData }, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      })
        .subscribe(function (data) {
          resolve(data);
        }, (error) => {
          reject();
        });
    });
  };

  import(collectionId, documentId, annotationData) {
    //console.log("annotation save:", annotationData)
    return new Promise((resolve, reject) => {
      this.http.post('./api/collections/' + collectionId + '/documents/' + documentId + '/annotations/import', { data: annotationData }, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      })
        .subscribe((data) => {
          resolve(data);
        }, (error) => {
          reject();
        });
    });
  }; /* import */

  destroy(collectionId, documentId, annotationId) {
    return new Promise((resolve, reject) => {
      this.http.delete('./api/collections/' + collectionId + '/documents/' + documentId + '/annotations/' + annotationId)
        .subscribe(function (data) {
          resolve(data);
        }, (error) => {
          reject();
        });
    });
  };

}
