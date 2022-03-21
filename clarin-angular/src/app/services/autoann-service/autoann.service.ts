import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AutoannService {

  constructor(public http: HttpClient) { }

  callAPIEndpoint(endpoint: string, doc) {
    return new Promise((resolve, reject) => {
      this.http.post('./nlp/model/apply/external_endpoint', {
        endpoint: endpoint,
        doc: doc
      }, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      }).subscribe(function (data) {
          resolve(data);
        }, (error) => {
          reject();
        });
    });
  }

}
