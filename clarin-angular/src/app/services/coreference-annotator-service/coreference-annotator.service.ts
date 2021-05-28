import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CLARIN_CONSTANTS } from 'src/app/helpers/constants';
import { AnnotationService } from '../annotation-service/annotation.service';
import { ButtonAnnotatorService } from '../button-annotator-service/button-annotator.service';
import { CollectionService } from '../collection-service/collection-service.service';
import { CoreferenceColorDataService } from '../coreference-color-data-service/coreference-color-data.service';
import { MainService } from '../main/main.service';
import { OpenDocumentService } from '../open-document/open-document.service';
import { TempAnnotationService } from '../temp-annotation-service/temp-annotation.service';
import { TextWidgetAPI } from '../text-widget/text-widget.service';

@Injectable({
  providedIn: 'root'
})
export class CoreferenceAnnotatorService {

  constructor(public http:HttpClient) {}

  checkForSavedSchema() {
    return new Promise((resolve, reject) => {
      this.http.get('./api/coreference_annotators', {
        headers: new HttpHeaders({
          'Content-Type': 'application/json; charset=utf-8',
          'Accept': 'application/json; charset=utf-8'
        })
      }).subscribe((data) => {   // Asynchronous Service calling
        resolve(data);
      }, (error) => {
        reject();
      });

    });
  };

  updateSchema(annotationSchema) {
    return new Promise((resolve, reject) => {
      this.http.post('./api/coreference_annotators', { data: annotationSchema }, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      }).subscribe((data) => {
        resolve(data);
      }, (error) => {
        reject();
      });

    });
  };

  getLanguages() {
    return new Promise((resolve, reject) => {
      this.http.get(CLARIN_CONSTANTS.ELLOGON_SERVICES + '/annotation_scheme_multi.tcl', {
        headers: new HttpHeaders({
          'Content-Type': 'application/json; charset=utf-8',
          'Accept': 'application/json; charset=utf-8'
        })
      }).subscribe((data) => {   // Asynchronous Service calling
        resolve(data);
      }, (error) => {
        reject();
      });

    });
  };

  getAnnotationTypes(language) {
    return new Promise((resolve, reject) => {
      this.http.get(CLARIN_CONSTANTS.ELLOGON_SERVICES
        + '/annotation_scheme_multi.tcl/'
        + encodeURIComponent(language), {
        headers: new HttpHeaders({
          'Content-Type': 'application/json; charset=utf-8',
          'Accept': 'application/json; charset=utf-8'
        })
      }).subscribe((data) => {   // Asynchronous Service calling
        resolve(data);
      }, (error) => {
        reject();
      });

    });
  };

  getAttributeAlternatives(language, annotationType) {
    return new Promise((resolve, reject) => {
      this.http.get(CLARIN_CONSTANTS.ELLOGON_SERVICES
        + '/annotation_scheme_multi.tcl/'
        + encodeURIComponent(language) + '/'
        + encodeURIComponent(annotationType), {
        headers: new HttpHeaders({
          'Content-Type': 'application/json; charset=utf-8',
          'Accept': 'application/json; charset=utf-8'
        })
      }).subscribe(function (data) {   // Asynchronous Service calling
        resolve(data);
      }, (error) => {
        reject();
      });

    });
  };

  getValues(language, annotationType, attributeAlternative) {
    return new Promise((resolve, reject) => {
      this.http.get(CLARIN_CONSTANTS.ELLOGON_SERVICES
        + '/annotation_scheme_multi.tcl/'
        + encodeURIComponent(language) + '/'
        + encodeURIComponent(annotationType) + '/'
        + encodeURIComponent(attributeAlternative), {
        headers: new HttpHeaders({
          'Content-Type': 'application/json; charset=utf-8',
          'Accept': 'application/json; charset=utf-8'
        })
      }).subscribe((data) => {   // Asynchronous Service calling
        resolve(data);
      }, (error) => {
        reject();
      });

    });
  };
}
