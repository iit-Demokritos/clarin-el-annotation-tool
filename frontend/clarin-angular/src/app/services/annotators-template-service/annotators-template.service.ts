import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CLARIN_CONSTANTS } from 'src/app/helpers/constants';
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
export class AnnotatorsTemplateService {

  constructor(public http:HttpClient) {}

  getTemplate(annotatorType, annotationSchema) {

    if (annotatorType == "Coreference Annotator") {			//Coreference Annotator

      return new Promise((resolve, reject) => {
        this.http.get(CLARIN_CONSTANTS.ELLOGON_SERVICES
          + '/annotation_scheme_multi_ui.tcl?'
          + 'language=' + encodeURIComponent(annotationSchema.language)
          + '&annotation=' + encodeURIComponent(annotationSchema.annotation_type)
          + '&alternative=' + encodeURIComponent(annotationSchema.alternative)
        ).subscribe((data) => {
          resolve(data);
        }, (error) => {
          reject();
        });

      });
    } else if (annotatorType == "Button Annotator") {		//Button Annotator
      return new Promise((resolve, reject) => {
        this.http.get(CLARIN_CONSTANTS.ELLOGON_SERVICES
          + '/annotation_scheme_ui.tcl?'
          + 'language=' + encodeURIComponent(annotationSchema.language)
          + '&annotation=' + encodeURIComponent(annotationSchema.annotation_type)
          + '&attribute=' + encodeURIComponent(annotationSchema.attribute)
          + '&alternative=' + encodeURIComponent(annotationSchema.alternative), {
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
  }
}
