import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  defaultProjection = {
    // You cannot change a property to '0', the property has to
    // be commented out!
    _id:                1,
    collection_id:      1,
    document_id:        1,
    owner_id:           1,
    annotator_id:       1,
    document_attribute: 1,
    type:               1,
    spans:              1,
    attributes:         1,
    created_at:         1,
    created_by:         1,
    updated_at:         1,
    updated_by:         1,
    deleted_at:         1,
    deleted_by:         1,
    collection_setting: 1,
    document_setting:   1
  }

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

  getAnnotationProperty(documentIds: number | number[], property) {
    return new Promise((resolve, reject) => {
      let values = [];
      if (Array.isArray(documentIds) && !documentIds.length) {
        resolve(values);
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
        _id:    property,
        count: {$sum : 1}
      };
      this.aggregate([
        { $match:   match },
        { $group:   group },
        { $sort : { count : -1, _id: 1 } }
      ])
      .then((response) => {
        if (response["success"]) {
          values = response['data'].map((obj) => {
            obj['name'] = obj['_id'];
            return obj;
          });
        } else {
          values = [];
        }
        resolve(values);
      }, (error) => {
        reject(error);
      });
    });
  }; /* getAnnotationProperty */

  getAnnotationAttributeProperty(documentIds: number | number[], property) {
    return new Promise((resolve, reject) => {
      let values = [];
      if (Array.isArray(documentIds) && !documentIds.length) {
        resolve(values);
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
        _id:    property,
        count: {$sum : 1}
      };
      this.aggregate([
        { $match:   match },
        { $unwind: "$attributes" },
        { $group:   group },
        { $sort : { count : -1, _id: 1 } }
      ])
      .then((response) => {
        if (response["success"]) {
          values = response['data'].map((obj) => {
            obj['name'] = obj['_id'];
            return obj;
          });
        } else {
          values = [];
        }
        resolve(values);
      }, (error) => {
        reject(error);
      });
    });
  }; /* getAnnotationAttributeProperty */

  getDocumentProperty(documentIds: number | number[], property) {
    return new Promise((resolve, reject) => {
      let values = [];
      if (Array.isArray(documentIds) && !documentIds.length) {
        resolve(values);
        return;
      }
      let match = {
        document_id:          (Array.isArray(documentIds) ? { $in: documentIds } : documentIds),
        type:                 { $nin:    ["setting annotation"] },
        document_setting:     { $exists: false },
        collection_setting:   { $exists: false },
        document_attribute:   { $exists: true  },
        collection_attribute: { $exists: false }
      };

      let group = {
        _id:    property,
        count: {$sum : 1}
      };
      this.aggregate([
        { $match:   match },
        { $group:   group },
        { $sort : { count : -1, _id: 1 } }
      ])
      .then((response) => {
        if (response["success"]) {
          values = response['data'].map((obj) => {
            obj['name'] = obj['_id'];
            return obj;
          });
        } else {
          values = [];
        }
        resolve(values);
      }, (error) => {
        reject(error);
      });
    });
  }; /* getDocumentProperty */

  getDocumentAttributeProperty(documentIds: number | number[], property) {
    return new Promise((resolve, reject) => {
      let values = [];
      if (Array.isArray(documentIds) && !documentIds.length) {
        resolve(values);
        return;
      }
      let match = {
        document_id:          (Array.isArray(documentIds) ? { $in: documentIds } : documentIds),
        type:                 { $nin:    ["setting annotation"] },
        document_setting:     { $exists: false },
        collection_setting:   { $exists: false },
        document_attribute:   { $exists: true  },
        collection_attribute: { $exists: false }
      };

      let group = {
        _id:    property,
        count: {$sum : 1}
      };
      this.aggregate([
        { $match:   match },
        { $unwind: "$attributes" },
        { $group:   group },
        { $sort : { count : -1, _id: 1 } }
      ])
      .then((response) => {
        if (response["success"]) {
          values = response['data'].map((obj) => {
            obj['name'] = obj['_id'];
            return obj;
          });
        } else {
          values = [];
        }
        resolve(values);
      }, (error) => {
        reject(error);
      });
    });
  }; /* getDocumentAttributeProperty */

  getAnnotatorSchemas(documentIds: number | number[]) {
    return this.getAnnotationProperty(documentIds, "$annotator_id");
  }; /* getAnnotatorSchemas */

  getAnnotationTypes(documentIds: number | number[]) {
    return this.getAnnotationProperty(documentIds, "$type");
  }; /* getAnnotationTypes */

  getAnnotationAttributes(documentIds: number | number[]) {
    return this.getAnnotationAttributeProperty(documentIds, "$attributes.name");
  }; /* getAnnotationAttributes */

  getAnnotationAttributeValues(documentIds: number | number[]) {
    return this.getAnnotationAttributeProperty(documentIds, "$attributes.value");
  }; /* getAnnotationAttributeValues */

  getDocumentAttributes(documentIds: number | number[]) {
    return this.getDocumentProperty(documentIds, "$document_attribute");
  }; /* getDocumentAttributes */

  getDocumentAttributeAttributes(documentIds: number | number[]) {
    return this.getDocumentAttributeProperty(documentIds, "$attributes.name");
  }; /* getDocumentAttributeAttributes */

  getDocumentAttributeAttributeValues(documentIds: number | number[]) {
    return this.getDocumentAttributeProperty(documentIds, "$attributes.value");
  }; /* getDocumentAttributeAttributeValues */

  getAnnotationCreators(documentIds: number | number[]) {
    return this.getAnnotationProperty(documentIds, "$created_by");
  }; /* getAnnotationCreators */

  getAnnotationUpdaters(documentIds: number | number[]) {
    return this.getAnnotationProperty(documentIds, "$updated_by");
  }; /* getAnnotationUpdaters */

}
