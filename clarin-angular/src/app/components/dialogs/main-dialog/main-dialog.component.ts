import { Component, Inject, Injector, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FlashMessagesService } from 'flash-messages-angular';
import { AnnotationSchemaService } from 'src/app/services/annotation-schema-service/annotation-schema.service';
import { ButtonAnnotatorService } from 'src/app/services/button-annotator-service/button-annotator.service';
import { CollectionService } from 'src/app/services/collection-service/collection-service.service';
import { CoreferenceAnnotatorService } from 'src/app/services/coreference-annotator-service/coreference-annotator.service';
import { DialogService } from 'src/app/services/dialog-service/dialog.service';
import { OpenDocumentService } from 'src/app/services/open-document/open-document.service';
import { DocumentService } from 'src/app/services/document-service/document.service';
import { RestoreAnnotationService } from 'src/app/services/restore-annotation-service/restore-annotation.service';
import { SharedCollectionService } from 'src/app/services/shared-collection/shared-collection.service';
import { TextWidgetAPI } from 'src/app/services/text-widget/text-widget.service';
import { AnnotationService } from 'src/app/services/annotation-service/annotation.service';
import { TempAnnotationService } from 'src/app/services/temp-annotation-service/temp-annotation.service';
import { MessageService } from 'src/app/services/message-service/message.service';

@Component({
  selector: 'main-dialog',
  templateUrl: './main-dialog.component.html',
  styleUrls: ['./main-dialog.component.scss']
})
export class MainDialogComponent implements OnInit {

  constructor(public injector: Injector,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<MainDialogComponent>,
    public collectionService: CollectionService,
    public flashMessage: FlashMessagesService,
    public sharedCollectionService: SharedCollectionService,
    public documentService: DocumentService,
    public openDocumentService: OpenDocumentService,
    public dialogService: DialogService,
    public annotationSchemaService: AnnotationSchemaService,
    public buttonAnnotatorService: ButtonAnnotatorService,
    public coreferenceAnnotatorService: CoreferenceAnnotatorService,
    public TextWidgetAPI: TextWidgetAPI,
    public restoreAnnotationService: RestoreAnnotationService,
    public annotationService: AnnotationService,
    public tempAnnotationService: TempAnnotationService,
    public messageService: MessageService,
    public formBuilder: FormBuilder) {
  }

  flash: any = "";

  ngOnInit(): void {
  }

}
