import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class OpenDocumentService {

  constructor(public http:HttpClient) {}

  getAll() {
    return new Promise((resolve, reject) => {
      this.http.get('./api/open_documents')
        .subscribe((data) => {
          resolve(data);
        }, (error) => {
          reject(error);
        });
    });
  }; /* getAll */

  get(documentId, annotatorId) {
    return new Promise((resolve, reject) => {
      this.http.get('./api/open_documents/' + documentId + '/' + annotatorId)
        .subscribe((data) => {
          resolve(data);
        }, (error) => {
          reject(error);
        });
    });
  }; /* get */

  save(documentData) {
    return new Promise((resolve, reject) => {
      this.http.post('./api/open_documents', { data: documentData }, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      }).subscribe((data) => {
        resolve(data);
      }, (error) => {
        reject(error);
      });

    });
  }; /* save */

  destroy(documentId, annotatorId) {
    return new Promise((resolve, reject) => {
      this.http.delete('./api/open_documents/' + documentId + '/' + annotatorId)
        .subscribe((data) => {
          resolve(data);
        }, (error) => {
          reject(error);
        });
    });
  }; /* destroy */
}; /* OpenDocumentService */
