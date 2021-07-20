import { Component, Inject, Injector, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { FlashMessagesService } from 'flash-messages-angular';
import { ConfirmDialogData } from 'src/app/models/dialogs/confirm-dialog';
import { AnnotationSchemaService } from 'src/app/services/annotation-schema-service/annotation-schema.service';
import { ButtonAnnotatorService } from 'src/app/services/button-annotator-service/button-annotator.service';
import { CollectionService } from 'src/app/services/collection-service/collection-service.service';
import { CoreferenceAnnotatorService } from 'src/app/services/coreference-annotator-service/coreference-annotator.service';
import { DialogService } from 'src/app/services/dialog-service/dialog.service';
import { DocumentService } from 'src/app/services/document-service/document.service';
import { RestoreAnnotationService } from 'src/app/services/restore-annotation-service/restore-annotation.service';
import { SharedCollectionService } from 'src/app/services/shared-collection/shared-collection.service';
import { TextWidgetAPI } from 'src/app/services/text-widget/text-widget.service';
import { UserService } from 'src/app/services/user-service/user.service';
import { MainComponent } from '../../views/main/main.component';
import { ErrorDialogComponent } from '../error-dialog/error-dialog.component';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'main-dialog',
  templateUrl: './main-dialog.component.html',
  styleUrls: ['./main-dialog.component.scss']
})
export class MainDialogComponent implements OnInit {

  constructor(public injector:Injector, @Inject(MAT_DIALOG_DATA) public data: any, public dialogRef:MatDialogRef<MainDialogComponent>, public collectionService:CollectionService, public flashMessage:FlashMessagesService,public sharedCollectionService:SharedCollectionService, public documentService:DocumentService, public dialogService:DialogService,
  public annotationSchemaService:AnnotationSchemaService,
  public buttonAnnotatorService:ButtonAnnotatorService,
  public coreferenceAnnotatorService:CoreferenceAnnotatorService,
  public TextWidgetAPI:TextWidgetAPI,
  public restoreAnnotationService:RestoreAnnotationService,
  public formBuilder:FormBuilder) {
  }

  flash:any="";

  ngOnInit(): void {
  }

}
