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

  getAnnotatorSchemas(documentIds: number | number[]) {
    return new Promise((resolve, reject) => {
      let annotators = [];
      if (Array.isArray(documentIds) && !documentIds.length) {
	resolve(annotators);
        return;
      }
      let match = {
        document_id:          (Array.isArray(documentIds) ? { $in: documentIds } : documentIds),
        type:                 { $nin:    ["setting annotation"] },
        document_setting:     { $exists: false },
        collection_setting:   { $exists: false },
        document_attribute:   { $exists: false },
        collection_attribute: { $exists: false }
      };

      let group = {
        _id:  "$annotator_id",
        count: {$sum : 1}
      };
      this.aggregate([
        { $match:   match },
        { $group:   group },
        { $sort : { count : -1, _id: 1 } }
      ])
      .then((response) => {
        if (response["success"]) {
          annotators = response['data'].map((obj) => {
            obj['name'] = obj['_id'];
            return obj;
          });
        } else {
          annotators = [];
        }
        resolve(annotators);
      }, (error) => {
        reject(error);
      });
    });
  }
}
