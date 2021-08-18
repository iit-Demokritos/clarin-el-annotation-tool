import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CLARIN_CONSTANTS } from 'src/app/helpers/constants';

@Injectable({
  providedIn: 'root'
})
export class CoreferenceAnnotatorService {

  constructor(public http: HttpClient) { }

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
      this.http.get(CLARIN_CONSTANTS.ELLOGON_SERVICES + '/annotation_scheme_multi.tcl').subscribe((data) => {   // Asynchronous Service calling
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
        + encodeURIComponent(language)).subscribe((data) => {   // Asynchronous Service calling
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
        + encodeURIComponent(annotationType)).subscribe(function (data) {   // Asynchronous Service calling
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
        + encodeURIComponent(attributeAlternative)).subscribe((data) => {   // Asynchronous Service calling
          resolve(data);
        }, (error) => {
          reject();
        });

    });
  };
}
