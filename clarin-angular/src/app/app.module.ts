import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HttpClient } from '@angular/common/http';

import { AppComponent } from './app.component';

import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MainComponent } from './components/views/main/main.component';
import { WelcomeComponent } from './components/views/welcome/welcome.component';
import { FormsModule } from '@angular/forms';
//import { FlashMessagesModule } from 'flash-messages-angular';
import { FlashMessagesModule } from '@components/controls/flash-messages';
import { ProfileComponent } from './components/views/profile/profile.component';
import { NavbarComponent } from './components/views/navbar/navbar.component';
import { ManageCollectionsComponent } from './components/views/manage-collections/manage-collections.component';
import { SharedCollectionsComponent } from './components/views/shared-collections/shared-collections.component';
import { MatDialogModule} from '@angular/material/dialog';
import { ConfirmDialogComponent } from './components/dialogs/confirm-dialog/confirm-dialog.component';
import { MainDialogComponent } from './components/dialogs/main-dialog/main-dialog.component';
import { AddDocumentsDialogComponent } from './components/dialogs/add-documents-dialog/add-documents-dialog.component';
import { ImportModalComponent } from './components/dialogs/import-modal/import-modal.component';
import { ImportCollectionsModalComponent } from './components/dialogs/import-collections-modal/import-collections-modal.component';
import { ImportDocumentsFromExportModalComponent } from './components/dialogs/import-documents-from-export-modal/import-documents-from-export-modal.component';
import { RenameCollectionModalComponent } from './components/dialogs/rename-collection-modal/rename-collection-modal.component';
import { RenameDocumentModalComponent } from '@components/dialogs/rename-document-modal/rename-document-modal.component';
import { ShareCollectionModalComponent } from './components/dialogs/share-collection-modal/share-collection-modal.component';
import { AddCollectionComponent } from './components/views/add-collection/add-collection.component';

import { NgxFlowModule, FlowInjectionToken } from '@flowjs/ngx-flow';
import * as Flow from '@flowjs/flow.js';
import { AnnotationComponent } from './components/views/annotation/annotation.component';
import { ErrorDialogComponent } from './components/dialogs/error-dialog/error-dialog.component';
import { UploaderComponent } from './components/controls/uploader/uploader.component';
import { SelectDocumentModalComponent } from './components/dialogs/select-document-modal/select-document-modal.component';
import { DetectOpenDocModalComponent } from './components/dialogs/detect-open-doc-modal/detect-open-doc-modal.component';
import { DetectChangesModalComponent } from './components/dialogs/detect-changes-modal/detect-changes-modal.component';
import { AddCustomValueModalComponent } from './components/dialogs/add-custom-value-modal/add-custom-value-modal.component';
import { ToolbarWidgetComponent } from './components/controls/toolbar-widget/toolbar-widget.component';
import { AnnotationVisualizerComponent } from './components/controls/annotation-visualizer/annotation-visualizer.component';
import { BaseControlComponent } from './components/controls/base-control/base-control.component';
import { OverlappingAreasComponent } from './components/controls/overlapping-areas/overlapping-areas.component';
import { AnnotationButtonComponent } from './components/controls/button/annotation-button/annotation-button.component';
import { AnnotationButtonCustomValueAddComponent } from './components/controls/button/annotation-button-custom-value-add/annotation-button-custom-value-add.component';
import { AnnotationComboboxComponent } from './components/controls/button/annotation-combobox/annotation-combobox.component';
import { AnnotationDateentryComponent } from './components/controls/button/annotation-dateentry/annotation-dateentry.component';
import { AnnotationEntryComponent } from './components/controls/button/annotation-entry/annotation-entry.component';
import { AnnotationIndicatorComponent } from './components/controls/button/annotation-indicator/annotation-indicator.component';
import { AnnotationRelationAnnotateBtnComponent } from './components/controls/button/annotation-relation-annotate-btn/annotation-relation-annotate-btn.component';
import { AnnotationRelationClearBtnComponent } from './components/controls/button/annotation-relation-clear-btn/annotation-relation-clear-btn.component';
import { AnnotationRelationComboboxComponent } from './components/controls/button/annotation-relation-combobox/annotation-relation-combobox.component';
import { AnnotationRelationDelBtnComponent } from './components/controls/button/annotation-relation-del-btn/annotation-relation-del-btn.component';
import { AnnotationRelationImportBtnComponent } from './components/controls/button/annotation-relation-import-btn/annotation-relation-import-btn.component';
import { AnnotationRelationSetBtnComponent } from './components/controls/button/annotation-relation-set-btn/annotation-relation-set-btn.component';
import { AnnotationRelationComponent } from './components/controls/button/annotation-relation/annotation-relation.component';
import { CorefAddBtnComponent } from './components/controls/coref/coref-add-btn/coref-add-btn.component';
import { CorefAnnotateBtnComponent } from './components/controls/coref/coref-annotate-btn/coref-annotate-btn.component';
import { CorefAnnotatorValueListDirective } from './directives/coref-annotator-value-list/coref-annotator-value-list.directive';
import { CorefBtnComponent } from './components/controls/coref/coref-btn/coref-btn.component';
import { CorefCheckboxComponent } from './components/controls/coref/coref-checkbox/coref-checkbox.component';
import { CorefClearBtnComponent } from './components/controls/coref/coref-clear-btn/coref-clear-btn.component';
import { CorefComboboxComponent } from './components/controls/coref/coref-combobox/coref-combobox.component';
import { CorefDelBtnComponent } from './components/controls/coref/coref-del-btn/coref-del-btn.component';
import { CorefEntryComponent } from './components/controls/coref/coref-entry/coref-entry.component';
import { CorefImportBtnComponent } from './components/controls/coref/coref-import-btn/coref-import-btn.component';
import { CorefMultiEntryComponent } from './components/controls/coref/coref-multi-entry/coref-multi-entry.component';
import { CorefSegmentEntryComponent } from './components/controls/coref/coref-segment-entry/coref-segment-entry.component';
import { CorefSpanEndComponent } from './components/controls/coref/coref-span-end/coref-span-end.component';
import { CorefSpanStartComponent } from './components/controls/coref/coref-span-start/coref-span-start.component';
import { FoundInCollectionDirective } from './directives/found-in-collection/found-in-collection.directive';
import { TextWidgetComponent } from './components/controls/text-widget/text-widget.component';
import { TextWidgetIsolatedComponent } from './components/controls/text-widget-isolated/text-widget-isolated.component';
// import { DomHelpersDirective } from './directives/dom-helpers/dom-helpers.directive';
import { DocumentAttributesDirective } from './directives/document-attributes/document-attributes.directive';
import { AnnotatorWidgetComponent } from './components/controls/annotator-widget/annotator-widget.component';
import { AnnotationTextLabelComponent } from './components/controls/document/annotation-text-label/annotation-text-label.component';
import { AnnotationTextTextComponent } from './components/controls/document/annotation-text-text/annotation-text-text.component';
import { AnnotationTextComponent } from './components/controls/document/annotation-text/annotation-text.component';
import { MatTree, MatTreeModule } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
// import { TreeviewModule } from 'ngx-treeview';
import { MatButtonModule} from '@angular/material/button';
import { ValueAccessorComponent } from './components/controls/value-accessor/value-accessor.component';
import { MatSelectModule } from '@angular/material/select';
// UNUSED: import { ButtonAnnotatorValueListDirective } from './directives/button-annotator-value-list/button-annotator-value-list.directive';
// import { NgScrollbarModule } from 'ngx-scrollbar';

/* Petasis, 17/6 */
//import { MatMenuModule } from '@angular/material/menu';
import { MAT_CARD_CONFIG, MatCardModule } from '@angular/material/card';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
//import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
/* Petasis, 18/06/21: ng-matero template */
import { CoreModule } from './ng-matero/core/core.module';
import { ThemeModule } from './ng-matero/theme/theme.module';
import { RoutesModule } from './ng-matero/routes/routes.module';
import { SharedModule } from './ng-matero/shared/shared.module';
import { FormlyConfigModule } from './ng-matero/formly-config.module';
import { ToastrModule } from 'ngx-toastr';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader }    from '@ngx-translate/http-loader';
import { NgxPermissionsModule }   from 'ngx-permissions';
import { AuthLayoutModComponent } from './components/views/auth-layout-mod/auth-layout-mod.component';
import { VisualiseLayoutComponent } from './components/layouts/visualise-layout/visualise-layout.component';
import { LoginComponent }         from './components/views/login/login.component';
import { LoginSocialComponent }   from './components/views/login-social/login-social.component';
import { RegisterComponent }      from './components/views/register/register.component';
import { ResetPasswordComponent } from './components/views/reset-password/reset-password.component';

import { environment } from '@env/environment';
import { BASE_URL } from '@core/interceptors/base-url-interceptor';
import { httpInterceptorProviders } from '@core/interceptors';
import { appInitializerProviders } from '@core/initializers';
/* Petasis, 20/06/2021 */
import { AngularSplitModule } from 'angular-split';
import { InspectDocumentComponent } from './components/views/inspect-document/inspect-document.component';
import { CompareAnnotationsComponent } from './components/views/compare-annotations/compare-annotations.component';
import { CompareDocumentsComponent } from './components/views/compare-documents/compare-documents.component';
import { CompareCollectionsComponent } from './components/views/compare-collections/compare-collections.component';
import { ToolbarSelectDocumentComponent } from './components/controls/toolbar-select-document/toolbar-select-document.component';
import { ToolbarSelectAnnotatorComponent } from './components/controls/toolbar-select-annotator/toolbar-select-annotator.component';
import { AnalyticsAnnotationValuesComponent } from './components/views/analytics-annotation-values/analytics-annotation-values.component';
import { AnnotationSetInspectorComponent } from './components/controls/annotation-set-inspector/annotation-set-inspector.component';
import { AnnotationSetFilterComponent } from './components/controls/annotation-set-filter/annotation-set-filter.component';
import { HighchartsChartModule } from 'highcharts-angular';
import { MatTableExporterModule } from 'mat-table-exporter';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { QueryBuilderModule } from "angular2-query-builder";
import { AnnotationSpansPipe } from './pipes/annotation-spans.pipe';
import { AnnotationDetailComponent } from './components/controls/annotation-detail/annotation-detail.component';
import { AnnotationSetComparatorComponent } from './components/controls/annotation-set-comparator/annotation-set-comparator.component';
import { AutoannTokenClassifierDirective } from './directives/autoann-token-classifier/autoann-token-classifier.directive';
import { AutomaticAnnotatorComponent } from './components/controls/automatic-annotator/automatic-annotator.component';
import { WavesurferAudioComponent } from './components/controls/wavesurfer-audio/wavesurfer-audio.component';
import { WavesurferVideoComponent } from './components/controls/wavesurfer-video/wavesurfer-video.component';
import { VisualiseAnnotationComponent } from './components/views/visualise-annotation/visualise-annotation.component';
import { AnnotatorWidgetValuesSchwartzComponent } from './components/controls/annotator-widget-values-schwartz/annotator-widget-values-schwartz.component';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { FileSaverModule } from 'ngx-filesaver';

// Required for AOT compilation
export function TranslateHttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

/*
 * This seems unneeded.
// From: https://github.com/flowjs/ngx-flow/issues/24
export function MyFlowFactory() {
  return Flow;
}
*/

/*
 * FontAwesome icons!
 */
import { faFile,
         faFileExcel,
         faFileCsv,
         faFileCode,
         faFileLines
} from '@fortawesome/free-solid-svg-icons';
import { MediaGalleryComponent } from './components/controls/media-gallery/media-gallery.component';
import { EuropeanaSearchComponent } from './components/controls/europeana-search/europeana-search.component';

@NgModule({
  declarations: [
    // ButtonAnnotatorValueListDirective,
    AppComponent,
    MainComponent,
    WelcomeComponent,
    ProfileComponent,
    NavbarComponent,
    ManageCollectionsComponent,
    SharedCollectionsComponent,
    ConfirmDialogComponent,
    MainDialogComponent,
    AddDocumentsDialogComponent,
    ImportModalComponent,
    ImportCollectionsModalComponent,
    ImportDocumentsFromExportModalComponent,
    RenameCollectionModalComponent,
    RenameDocumentModalComponent,
    ShareCollectionModalComponent,
    AddCollectionComponent,
    AnnotationComponent,
    ErrorDialogComponent,
    UploaderComponent,
    SelectDocumentModalComponent,
    DetectOpenDocModalComponent,
    DetectChangesModalComponent,
    AddCustomValueModalComponent,
    ToolbarWidgetComponent,
    AnnotationVisualizerComponent,
    BaseControlComponent,
    OverlappingAreasComponent,
    AnnotationButtonComponent,
    AnnotationButtonCustomValueAddComponent,
    AnnotationComboboxComponent,
    AnnotationDateentryComponent,
    AnnotationEntryComponent,
    AnnotationIndicatorComponent,
    AnnotationRelationAnnotateBtnComponent,
    AnnotationRelationClearBtnComponent,
    AnnotationRelationComboboxComponent,
    AnnotationRelationDelBtnComponent,
    AnnotationRelationImportBtnComponent,
    AnnotationRelationSetBtnComponent,
    AnnotationRelationComponent,
    CorefAddBtnComponent,
    CorefAnnotateBtnComponent,
    CorefAnnotatorValueListDirective,
    CorefBtnComponent,
    CorefCheckboxComponent,
    CorefClearBtnComponent,
    CorefComboboxComponent,
    CorefDelBtnComponent,
    CorefEntryComponent,
    CorefImportBtnComponent,
    CorefMultiEntryComponent,
    CorefSegmentEntryComponent,
    CorefSpanEndComponent,
    CorefSpanStartComponent,
    FoundInCollectionDirective,
    TextWidgetComponent,
    TextWidgetIsolatedComponent,
    // DomHelpersDirective,
    DocumentAttributesDirective,
    AnnotatorWidgetComponent,
    AnnotationTextLabelComponent,
    AnnotationTextTextComponent,
    AnnotationTextComponent,
    AuthLayoutModComponent,
    VisualiseLayoutComponent,
    LoginComponent,
    RegisterComponent,
    ResetPasswordComponent,
    InspectDocumentComponent,
    CompareAnnotationsComponent,
    CompareDocumentsComponent,
    CompareCollectionsComponent,
    AnalyticsAnnotationValuesComponent,
    ToolbarSelectDocumentComponent,
    ToolbarSelectAnnotatorComponent,
    AnnotationSetInspectorComponent,
    AnnotationSetFilterComponent,
    AnnotationDetailComponent,
    AnnotationSpansPipe,
    AnnotationSetComparatorComponent,
    AutoannTokenClassifierDirective,
    AutomaticAnnotatorComponent,
    WavesurferAudioComponent,
    WavesurferVideoComponent,
    VisualiseAnnotationComponent,
    AnnotatorWidgetValuesSchwartzComponent,
    MediaGalleryComponent,
    EuropeanaSearchComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    FlashMessagesModule.forRoot(),
    MatDialogModule,
    NgxFlowModule,
    MatTreeModule,
    MatIconModule,
    // TreeviewModule.forRoot(),
    MatButtonModule,
    MatSelectModule,
    //NgScrollbarModule,

    //MatMenuModule,
    MatCardModule,
    MatSidenavModule,
    MatInputModule,
    MatTooltipModule,
    MatToolbarModule,
    NgbModule,
    //FontAwesomeModule,
    CoreModule,
    ThemeModule,
    RoutesModule,
    SharedModule,
    NgxPermissionsModule.forRoot(),
    FormlyConfigModule.forRoot(),
    ToastrModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: TranslateHttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    AngularSplitModule,
    HighchartsChartModule, // HighCharts
    MatTableExporterModule,
    DragDropModule,
    QueryBuilderModule,
    FontAwesomeModule,
    FileSaverModule
  ],
  exports:[
    // ButtonAnnotatorValueListDirective,
    AppComponent,
    MainComponent,
    WelcomeComponent,
    ProfileComponent,
    NavbarComponent,
    ManageCollectionsComponent,
    SharedCollectionsComponent,
    ConfirmDialogComponent,
    MainDialogComponent,
    AddDocumentsDialogComponent,
    ImportModalComponent,
    ImportCollectionsModalComponent,
    ImportDocumentsFromExportModalComponent,
    RenameCollectionModalComponent,
    RenameDocumentModalComponent,
    ShareCollectionModalComponent,
    AddCollectionComponent,
    AnnotationComponent,
    ErrorDialogComponent,
    UploaderComponent,
    SelectDocumentModalComponent,
    DetectOpenDocModalComponent,
    DetectChangesModalComponent,
    AddCustomValueModalComponent,
    ToolbarWidgetComponent,
    AnnotationVisualizerComponent,
    BaseControlComponent,
    OverlappingAreasComponent,
    AnnotationButtonComponent,
    AnnotationButtonCustomValueAddComponent,
    AnnotationComboboxComponent,
    AnnotationDateentryComponent,
    AnnotationEntryComponent,
    AnnotationIndicatorComponent,
    AnnotationRelationAnnotateBtnComponent,
    AnnotationRelationClearBtnComponent,
    AnnotationRelationComboboxComponent,
    AnnotationRelationDelBtnComponent,
    AnnotationRelationImportBtnComponent,
    AnnotationRelationSetBtnComponent,
    AnnotationRelationComponent,
    CorefAddBtnComponent,
    CorefAnnotateBtnComponent,
    CorefAnnotatorValueListDirective,
    CorefBtnComponent,
    CorefCheckboxComponent,
    CorefClearBtnComponent,
    CorefComboboxComponent,
    CorefDelBtnComponent,
    CorefEntryComponent,
    CorefImportBtnComponent,
    CorefMultiEntryComponent,
    CorefSegmentEntryComponent,
    CorefSpanEndComponent,
    CorefSpanStartComponent,
    FoundInCollectionDirective,
    TextWidgetComponent,
    // DomHelpersDirective,
    DocumentAttributesDirective,
    AnnotatorWidgetComponent,
    AnnotationTextLabelComponent,
    AnnotationTextTextComponent,
    AnnotationTextComponent,
    AutoannTokenClassifierDirective,
    AnnotatorWidgetValuesSchwartzComponent,
  ],
  providers: [
    /* Petasis, 12/12/2021: It does not work with the following enabled...*/
    {
      provide: FlowInjectionToken,
      // useFactory: MyFlowFactory,
      useValue: Flow
    },
    /* ng-matero */
    { provide: BASE_URL, useValue: environment.baseUrl },
    httpInterceptorProviders,
    appInitializerProviders,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(library: FaIconLibrary) {
    // Add an icon to the library for convenient access in other components
    library.addIcons(
        faFile,
        faFileExcel,
        faFileCsv,
        faFileCode,
        faFileLines
    );
  }
}
