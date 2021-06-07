import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CLARIN_CONSTANTS } from 'src/app/helpers/constants';
import { AnnotationService } from '../annotation-service/annotation.service';
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
export class ButtonAnnotatorService {

  constructor(public http:HttpClient) {}

  checkForSavedSchema() {
    return new Promise((resolve, reject) => {
      this.http.get('./api/button_annotators', {
        headers: new HttpHeaders({
          'Content-Type': 'application/json; charset=utf-8',
          'Accept': 'application/json; charset=utf-8'
        })
      }).subscribe((data) => {   // Asynchronous Service calling
        resolve(data);
      }, (error) => {
        reject(error);
      });

    });
  };

  updateSchema(annotationSchema) {
    return new Promise((resolve, reject) => {
      this.http.post('./api/button_annotators', { data: annotationSchema }, {
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
      this.http.get(CLARIN_CONSTANTS.ELLOGON_SERVICES + '/annotation_scheme.tcl').subscribe((data: any) => {   // Asynchronous Service calling
        resolve(data);
      }, (error) => {
        reject();
      });

    });
  };

  getAnnotationTypes(language) {
    return new Promise((resolve, reject) => {
      this.http.get(CLARIN_CONSTANTS.ELLOGON_SERVICES
        + '/annotation_scheme.tcl/'
        + encodeURIComponent(language)).subscribe((data) => {   // Asynchronous Service calling
        resolve(data);
      }, (error) => {
        reject();
      });

    });
  };

  getAnnotationAttributes(language, annotationType) {
    return new Promise((resolve, reject) => {
      this.http.get(CLARIN_CONSTANTS.ELLOGON_SERVICES
        + '/annotation_scheme.tcl/'
        + encodeURIComponent(language) + '/'
        + encodeURIComponent(annotationType)).subscribe((data) => {   // Asynchronous Service calling
        resolve(data);
      }, (error) => {
        reject();
      });

    });
  }

  getAttributeAlternatives(language, annotationType, annotationAttribute) {
    return new Promise((resolve, reject) => {
      this.http.get(CLARIN_CONSTANTS.ELLOGON_SERVICES
        + '/annotation_scheme.tcl/'
        + encodeURIComponent(language) + '/'
        + encodeURIComponent(annotationType) + '/'
        + encodeURIComponent(annotationAttribute)).subscribe((data) => {   // Asynchronous Service calling
        resolve(data);
      }, (error) => {
        reject();
      });

    });
  };

  getValues(language, annotationType, annotationAttribute, attributeAlternative) {
    return new Promise((resolve, reject) => {
      this.http.get(CLARIN_CONSTANTS.ELLOGON_SERVICES
        + '/annotation_scheme.tcl/'
        + encodeURIComponent(language) + '/'
        + encodeURIComponent(annotationType) + '/'
        + encodeURIComponent(annotationAttribute) + '/'
        + encodeURIComponent(attributeAlternative)).subscribe((data) => {   // Asynchronous Service calling
        resolve(data);
      }, (error) => {
        reject();
      });

    });
  };

}
