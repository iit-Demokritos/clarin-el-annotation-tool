import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AnnotationService } from '../annotation-service/annotation.service';
import { ButtonAnnotatorService } from '../button-annotator-service/button-annotator.service';
import { CollectionService } from '../collection-service/collection-service.service';
import { CoreferenceAnnotatorService } from '../coreference-annotator-service/coreference-annotator.service';
import { CoreferenceColorDataService } from '../coreference-color-data-service/coreference-color-data.service';
import { MainService } from '../main/main.service';
import { TempAnnotationService } from '../temp-annotation-service/temp-annotation.service';
import { TextWidgetAPI } from '../text-widget/text-widget.service';

@Injectable({
  providedIn: 'root'
})
export class OpenDocumentService {

  constructor(public http:HttpClient) {}

  getAll() {

    return new Promise((resolve, reject) => {
      this.http.get('./api/open_documents')
        .subscribe((data) => {
          resolve(data);
        }, (error) => {
          reject(error);
        });

    });
  }

  get(documentId, annotatorId) {

    return new Promise((resolve, reject) => {
      this.http.get('./api/open_documents/' + documentId + '/' + annotatorId)
        .subscribe((data) => {
          resolve(data);
        }, (error) => {
          reject(error);
        });
    });
  }

  save(documentData) {
    return new Promise((resolve, reject) => {
      this.http.post('./api/open_documents', { data: documentData }, {
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

  destroy(documentId, annotatorId) {
    return new Promise((resolve, reject) => {

      this.http.delete('./api/open_documents/' + documentId + '/' + annotatorId)
        .subscribe((data) => {
          resolve(data);
        }, (error) => {
          reject(error);
        });

    });
  }
}
