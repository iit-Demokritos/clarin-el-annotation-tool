import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AnnotationService } from '../annotation-service/annotation.service';
import { ButtonAnnotatorService } from '../button-annotator-service/button-annotator.service';
import { CoreferenceAnnotatorService } from '../coreference-annotator-service/coreference-annotator.service';
import { CoreferenceColorDataService } from '../coreference-color-data-service/coreference-color-data.service';
import { MainService } from '../main/main.service';
import { OpenDocumentService } from '../open-document/open-document.service';
import { TempAnnotationService } from '../temp-annotation-service/temp-annotation.service';
import { TextWidgetAPI } from '../text-widget/text-widget.service';

@Injectable({
  providedIn: 'root'
})
export class CollectionService{

  constructor(public http:HttpClient) {}

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

  save(collectionData):Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post('api/collections', {data:collectionData},
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

  readFile(documentFile) {
    return new Promise((resolve, reject) => {
      var reader = new FileReader();
      // source: https://stackoverflow.com/a/26322343
      reader.onloadend = function () {
        // Encode as base64 
        let dataToBeSent = reader.result.toString().split("base64,")[1]; //TODO: CHECK SPLIT !

        resolve(dataToBeSent);
      };

      reader.readAsDataURL(documentFile);
    });
  }

  importFiles(collectionName, documents) {
    return new Promise((resolve, reject) => {
      // Create promises to read files
      var promises = [];

      documents.forEach(element => {
        promises.push(this.readFile(element));
      });

      // Read the files
      Promise.all(promises)
        .then((files) => {
          // Send files to the import route
          this.http.post('api/collections/import', {
            name: collectionName,
            files: files
          }).subscribe((data)=> {
              resolve(data);
            }, (error) => {
              reject(error);
            });
        });
    });
  }

  destroy(collectionId) {
    return new Promise((resolve, reject) => {
      this.http.delete('./api/collections/' + collectionId)
        .subscribe(function (data) {
          resolve(data);
        },(error)=> {
          reject(error);
        });

    });
  }
}
