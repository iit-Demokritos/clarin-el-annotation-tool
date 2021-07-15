import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CLARIN_CONSTANTS } from 'src/app/helpers/constants';

@Injectable({
  providedIn: 'root'
})
export class AnnotatorsTemplateService {

  constructor(public http:HttpClient) {}

  getTemplate(annotatorType:string, annotationSchema:any) {
    if (annotatorType.startsWith("Button_Annotator_")) {
      annotatorType = "Button Annotator";
    } else if (annotatorType.startsWith("Coreference_Annotator_")) {
      annotatorType = "Coreference Annotator";
    };

    if (annotatorType == "Coreference Annotator") {
      //Coreference Annotator
      return new Promise((resolve, reject) => {
        this.http.get(CLARIN_CONSTANTS.ELLOGON_SERVICES
          + '/annotation_scheme_multi_ui.tcl?'
          + 'language=' + encodeURIComponent(annotationSchema.language)
          + '&annotation=' + encodeURIComponent(annotationSchema.annotation_type)
          + '&alternative=' + encodeURIComponent(annotationSchema.alternative)
          + '&framework=angular'
        ).subscribe((data) => {
          resolve(data);
        }, (error) => {
          reject();
        });

      });
    } else if (annotatorType == "Button Annotator") {
      //Button Annotator
      return new Promise((resolve, reject) => {
        this.http.get(CLARIN_CONSTANTS.ELLOGON_SERVICES
          + '/annotation_scheme_ui.tcl?'
          + 'language=' + encodeURIComponent(annotationSchema.language)
          + '&annotation=' + encodeURIComponent(annotationSchema.annotation_type)
          + '&attribute=' + encodeURIComponent(annotationSchema.attribute)
          + '&alternative=' + encodeURIComponent(annotationSchema.alternative)
          + '&framework=angular', {
          headers: new HttpHeaders({
            'Accept': 'text/html'
          })
        }).subscribe((data) => {
          resolve(data);
        }, (error) => {
          //reject();
          resolve(error.error.text);
        });
      });
    }
    return Promise.reject("unknown annotatorType: \""+annotatorType+"\"");
  }; /* getTemplate */
}
