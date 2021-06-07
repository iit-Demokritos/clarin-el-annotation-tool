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
export class SharedCollectionService {

  constructor(public http:HttpClient) {}

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
