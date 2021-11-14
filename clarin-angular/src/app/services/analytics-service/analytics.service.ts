import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  constructor(public http: HttpClient) { }

  find(query = null, projection = null) {
    return new Promise((resolve, reject) => {
      this.http.post('./analytics/find', { q: query, p: projection }, {
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

  aggregate(query) {
    return new Promise((resolve, reject) => {
      this.http.post('./analytics/aggregate', { q: query }, {
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
