import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { OpenDocumentService } from '../open-document/open-document.service';
import { TextWidgetAPI } from '../text-widget/text-widget.service';
import { AnnotationService } from '../annotation-service/annotation.service';
import { TempAnnotationService } from '../temp-annotation-service/temp-annotation.service';
import { ButtonAnnotatorService } from '../button-annotator-service/button-annotator.service';
import { CoreferenceAnnotatorService } from '../coreference-annotator-service/coreference-annotator.service';
import { CollectionService } from '../collection-service/collection-service.service';
import { CoreferenceColorDataService } from '../coreference-color-data-service/coreference-color-data.service';

@Injectable({
  providedIn: 'root'
})
export abstract class MainService {

  constructor(public http:HttpClient, public dialog:MatDialog, public openDocumentService:OpenDocumentService, public TextWidgetAPI: TextWidgetAPI, public annotationService:AnnotationService, public tempAnnotationService:TempAnnotationService, public buttonAnnotator:ButtonAnnotatorService, public coreferenceAnnotatorService:CoreferenceAnnotatorService,
    public collectionService:CollectionService,
    public zone:NgZone,
    public coreferenceColorDataService:CoreferenceColorDataService) {}
}
