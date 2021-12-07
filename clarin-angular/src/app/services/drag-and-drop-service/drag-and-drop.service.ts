import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DragAndDropService {

  constructor(public http: HttpClient) {
  }

  copy(did: number, cid: number) {
    return new Promise((resolve, reject) => {
      this.http.post('./drag_and_drop/copy', { document_id: did, collection_id: cid }, {
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

}
