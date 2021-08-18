import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CollectionService {

  constructor(
    public http: HttpClient) { }

  getAll() {
    return new Promise((resolve, reject) => {
      this.http.get('./api/collections')
        .subscribe((data) => {
          resolve(data);
        }, (error) => {
          reject(error);
        });

    });
  }

  getData() {
    return new Promise((resolve, reject) => {
      this.http.get('./api/collections_data')
        .subscribe((response) => {
          if (response["success"] && response["data"].length > 0) {
            // initialize the documents tree
            var treeData = [];
            var currentCollectionId = -1;

            for (var i = 0; i < response["data"].length; i++) {
              if (response["data"][i].collection_id !== currentCollectionId) {
                currentCollectionId = response["data"][i].collection_id;

                if (response["data"][i].name) {
                  treeData.push({
                    "id": response["data"][i].collection_id,
                    "name": response["data"][i].collection_name,
                    "document_count": 0,
                    "is_owner": response["data"][i].is_owner,
                    "confirmed": response["data"][i].confirmed,
                    "children": [{
                      "id": response["data"][i].id,
                      "name": response["data"][i].name,
                      "collection_id": response["data"][i].collection_id,
                      "collection_name": response["data"][i].collection_name
                    }]
                  });

                  treeData[treeData.length - 1].document_count++;
                } else {
                  treeData.push({
                    "id": response["data"][i].collection_id,
                    "name": response["data"][i].collection_name,
                    "document_count": 0,
                    "is_owner": response["data"][i].is_owner,
                    "confirmed": response["data"][i].confirmed,
                    "children": {}
                  });
                }
              } else {
                treeData[treeData.length - 1].children.push({
                  "id": response["data"][i].id,
                  "name": response["data"][i].name,
                  "collection_id": response["data"][i].collection_id,
                  "collection_name": response["data"][i].collection_name
                });

                treeData[treeData.length - 1].document_count++;
              }
            }

            //$scope.dataForTheTree = treeData;
            response["data"] = treeData; //angular.copy(treeData); TODO: COPY OBJECT HERE !
          }

          resolve(response);
        }, (error) => {
          reject(error);
        });
    });
  }

  get(collectionId) {
    return new Promise((resolve, reject) => {
      this.http.get('api/collections/' + collectionId)
        .subscribe(function (data) {
          resolve(data);
        }, (error) => {
          reject(error);
        });
    });
  };

  exists(collectionName) {
    return new Promise((resolve, reject) => {
      this.http.get('api/collections/exists/' + collectionName)
        .subscribe(function (data) {
          resolve(data);
        }, (error) => {
          reject(error);
        });
    });
  };

  async collectionExists(name) {
    // return (async () => await this.exists(name) )();
    return await this.exists(name);
  }; /* collectionExists */


  update(collectionData) {
    return new Promise((resolve, reject) => {
      this.http.patch('api/collections/' + collectionData.id, {
        data: collectionData
      },
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/json'
          })
        }).subscribe((data) => {
          resolve(data);
        }, (error) => {
          reject(error);
        });
    })
  }

  save(collectionData): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post('api/collections', { data: collectionData },
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/json'
          })
        }).subscribe((data) => {
          resolve(data);
        }, (error) => {
          reject(error);
        });
    });
  }

  destroy(collectionId) {
    return new Promise((resolve, reject) => {
      this.http.delete('./api/collections/' + collectionId)
        .subscribe(function (data) {
          resolve(data);
        }, (error) => {
          reject(error);
        });

    });
  }
}
