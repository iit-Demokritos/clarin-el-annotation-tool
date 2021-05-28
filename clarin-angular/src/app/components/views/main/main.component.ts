import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FlashMessagesService } from 'flash-messages-angular';
import { CollectionService } from 'src/app/services/collection-service/collection-service.service';
import { DocumentService } from 'src/app/services/document-service/document.service';
import { UserService } from 'src/app/services/user-service/user.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import {MatDialogModule} from '@angular/material/dialog';
import { ErrorDialogComponent } from '../../dialogs/error-dialog/error-dialog.component';
import { ConfirmDialogData } from 'src/app/models/dialogs/confirm-dialog';
import { TextWidgetAPI } from 'src/app/services/text-widget/text-widget.service';
import { OpenDocumentService } from 'src/app/services/open-document/open-document.service';
import { RestoreAnnotationService } from 'src/app/services/restore-annotation-service/restore-annotation.service';
import { AnnotationService } from 'src/app/services/annotation-service/annotation.service';
import { TempAnnotationService } from 'src/app/services/temp-annotation-service/temp-annotation.service';
import { SseService } from 'src/app/services/sse-service/sse.service';
import { ButtonColorService } from 'src/app/services/button-color-service/button-color.service';
import { CoreferenceAnnotatorService } from 'src/app/services/coreference-annotator-service/coreference-annotator.service';
import { CoreferenceColorService } from 'src/app/services/coreference-color-service/coreference-color.service';
import { AnnotatorsTemplateService } from 'src/app/services/annotators-template-service/annotators-template.service';

@Component({
  selector: 'main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  public userFiles: any = [];

  constructor(public userService: UserService, 
    public flashMessage: FlashMessagesService, 
    public router: Router, 
    public collectionService: CollectionService, 
    public documentService: DocumentService, 
    public dialog: MatDialog,
    public TextWidgetAPI:TextWidgetAPI,
    public openDocumentService:OpenDocumentService,
    public restoreAnnotationService:RestoreAnnotationService,
    public annotationService:AnnotationService,
    public tempAnnotationService:TempAnnotationService,
    public sseService:SseService,
    public buttonColorService:ButtonColorService,
    public coreferenceAnnotatorService:CoreferenceAnnotatorService,
    public coreferenceColorService:CoreferenceColorService,
    public annotatorsTemplateService:AnnotatorsTemplateService) { }

  ngOnInit(): void {
  }

  handleFileInput(obj: any) {
    this.userFiles = obj["files"];

    if(obj["message"].length > 0){
      this.dialog.open(ErrorDialogComponent,{data:new ConfirmDialogData("Error",obj["message"])});
    }
  }

}
