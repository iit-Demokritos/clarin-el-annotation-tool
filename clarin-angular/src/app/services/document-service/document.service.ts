import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AnnotationService } from '../annotation-service/annotation.service';
import { ButtonAnnotatorService } from '../button-annotator-service/button-annotator.service';
import { CollectionService } from '../collection-service/collection-service.service';
import { CoreferenceAnnotatorService } from '../coreference-annotator-service/coreference-annotator.service';
import { CoreferenceColorDataService } from '../coreference-color-data-service/coreference-color-data.service';
import { MainService } from '../main/main.service';
import { OpenDocumentService } from '../open-document/open-document.service';
import { TempAnnotationService } from '../temp-annotation-service/temp-annotation.service';
import { TextWidgetAPI } from '../text-widget/text-widget.service';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {

  constructor(public http:HttpClient) {}

  readDocument(collection_id, documentFile) {
    return new Promise((resolve, reject) => {
      var docData = {};
      var reader = new FileReader();

      reader.onload = function (e) {
        docData["name"] = documentFile.name;
        docData["type"] = documentFile.type;
        docData["text"] = reader.result;
        docData["collection_id"] = collection_id;
        docData["external_name"] = documentFile.name;
        docData["encoding"]      = documentFile.encoding;
        docData["handler"]       = documentFile.handler;

        resolve(docData);
      }

      reader.readAsText(documentFile.file);
    });
  }

  getAll(collectionId) {
    return new Promise((resolve, reject) => {
      this.http.get('./api/collections/' + collectionId + '/documents')
        .subscribe((data) => {
          resolve(data);
        }, error => {
          reject(error);
        });
    });
  }


  get(collectionId, documentId) {
    return new Promise((resolve, reject) => {
      this.http.get('./api/collections/' + collectionId + '/documents/' + documentId)
        .subscribe(function (data) {
          resolve(data);
        }, error => {
          reject(error);
        });
    });
  };

  save(collectionId, documents) {   //read and save multiple documents

    var promises: any = [];
    // console.error("Documents:", documents);

    documents.forEach(element => {
      promises.push(new Promise<any>((resolve, reject) => {
        this.readDocument(collectionId, element)
          .then((readData) => {
            this.http.post('./api/collections/' + collectionId + '/documents', { data: readData }, {
              headers: new HttpHeaders({
                'Content-Type': 'application/json'
              })
            }).subscribe(function (data) {
              resolve(data);
            }, error => {
              reject(error);
            });
          });
      })
      )
    });


    return Promise.all(promises);

  }

  destroy(collectionId, documentId) {
    return new Promise((resolve, reject) => {
      this.http.delete('./api/collections/' + collectionId + '/documents/' + documentId)
        .subscribe(function (data) {
          resolve(data);
        }, (error) => {
          reject(error);
        });

    });
  }
}
