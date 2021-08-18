import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SharedCollectionService {

  constructor(public http: HttpClient) { }

  getAll(collectionId) {
    return new Promise((resolve, reject) => {
      this.http.get('./api/collections/' + collectionId + '/share')
        .subscribe(function (data) {
          resolve(data);
        }, (error) => {
          reject(error);
        });

    });
  };

  confirm(collectionId, confirmationCode) {
    return new Promise((resolve, reject) => {
      this.http.get('./api/collections/' + collectionId + '/share_verify/' + confirmationCode)
        .subscribe(function (data) {
          resolve(data);
        }, (error) => {
          reject(error);
        });

    });
  };

  save(collectionId, collectionData) {
    return new Promise((resolve, reject) => {
      this.http.post('./api/collections/' + collectionId + '/share', { data: collectionData }, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      }).subscribe(function (data) {
        resolve(data);
      }, (error) => {
        reject(error);
      });

    });
  };

  destroy(collectionId, confirmationCode) {
    return new Promise((resolve, reject) => {
      this.http.delete('./api/collections/' + collectionId + '/share/' + confirmationCode)
        .subscribe(function (data) {
          resolve(data);
        }, (error) => {
          reject(error);
        });

    });
  };

}
