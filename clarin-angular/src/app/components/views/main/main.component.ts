import { ChangeDetectorRef, Compiler, Component, Injector, NgModuleRef, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '@core/authentication/auth.service';
import { TranslateService } from '@ngx-translate/core';
//import { FlashMessagesService } from 'flash-messages-angular';
import { FlashMessagesService } from '@components/controls/flash-messages';
import { ConfirmDialogData } from 'src/app/models/dialogs/confirm-dialog';
import { AnnotationSchemaService } from 'src/app/services/annotation-schema-service/annotation-schema.service';
import { AnnotationService } from 'src/app/services/annotation-service/annotation.service';
import { AnnotatorsTemplateService } from 'src/app/services/annotators-template-service/annotators-template.service';
import { ButtonAnnotatorService } from 'src/app/services/button-annotator-service/button-annotator.service';
import { ButtonColorService } from 'src/app/services/button-color-service/button-color.service';
import { CollectionService } from 'src/app/services/collection-service/collection-service.service';
import { CoreferenceAnnotatorService } from 'src/app/services/coreference-annotator-service/coreference-annotator.service';
import { CoreferenceColorService } from 'src/app/services/coreference-color-service/coreference-color.service';
import { DocumentService } from 'src/app/services/document-service/document.service';
import { OpenDocumentService } from 'src/app/services/open-document/open-document.service';
import { RestoreAnnotationService } from 'src/app/services/restore-annotation-service/restore-annotation.service';
import { SseService } from 'src/app/services/sse-service/sse.service';
import { TempAnnotationService } from 'src/app/services/temp-annotation-service/temp-annotation.service';
import { TextWidgetAPI } from 'src/app/services/text-widget/text-widget.service';
import { UserService } from 'src/app/services/user-service/user.service';
import { ErrorDialogComponent } from '../../dialogs/error-dialog/error-dialog.component';
import { AnalyticsService } from 'src/app/services/analytics-service/analytics.service';
import { MessageService } from 'src/app/services/message-service/message.service';
import { DragAndDropService } from 'src/app/services/drag-and-drop-service/drag-and-drop.service';
import { ToastrService } from 'ngx-toastr';
import { LocalStorageService } from '@shared/services/storage.service';
import { AutoannService } from '@services/autoann-service/autoann.service';
import { Location } from '@angular/common'; 
import { FileSaverService } from 'ngx-filesaver';

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
    public routerLocation: Location,
    public activatedRoute: ActivatedRoute,
    public collectionService: CollectionService,
    public documentService: DocumentService,
    public dialog: MatDialog,
    public TextWidgetAPI: TextWidgetAPI,
    public openDocumentService: OpenDocumentService,
    public restoreAnnotationService: RestoreAnnotationService,
    public annotationService: AnnotationService,
    public tempAnnotationService: TempAnnotationService,
    public sseService: SseService,
    public buttonAnnotatorService: ButtonAnnotatorService,
    public buttonColorService: ButtonColorService,
    public coreferenceAnnotatorService: CoreferenceAnnotatorService,
    public coreferenceColorService: CoreferenceColorService,
    public annotatorsTemplateService: AnnotatorsTemplateService,
    public annotationSchemaService: AnnotationSchemaService,
    public compiler: Compiler,
    public injector: Injector,
    public _m: NgModuleRef<any>,
    public changeDetectorRef: ChangeDetectorRef,
    public translate: TranslateService,
    public formBuilder: UntypedFormBuilder,
    public authService: AuthService,
    public analyticsService: AnalyticsService,
    public dragAndDropService: DragAndDropService,
    public messageService: MessageService,
    public toastrService: ToastrService,
    public localStorageService: LocalStorageService,
    public autoannService: AutoannService,
    public fileSaverService: FileSaverService) { }

  ngOnInit(): void {
  }

  handleFileInput(obj: any) {
    this.userFiles = obj["files"];

    if (obj["message"].length > 0) {
      this.dialog.open(ErrorDialogComponent, { data: new ConfirmDialogData("Error", obj["message"]) });
    }
  }

}
