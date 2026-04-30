'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">The Ellogon Annotation Platform documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                        <li class="link">
                            <a href="overview.html" data-type="chapter-link">
                                <span class="icon ion-ios-keypad"></span>Overview
                            </a>
                        </li>
                        <li class="link">
                            <a href="index.html" data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>README
                            </a>
                        </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Properties
                                    </a>
                                </li>
                    </ul>
                </li>
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-bs-toggle="collapse" ${ isNormalMode ?
                                'data-bs-target="#modules-links"' : 'data-bs-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse " ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/AppModule.html" data-type="entity-link" >AppModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-AppModule-9891045d452b54504b54eb121ff116a2e27a31d57e77e629a41d3d5a2238b68654d2fc4e956f3b42d14b824f9f6e7bfbaec7438c30db33fa82a47bcc911b3ca3"' : 'data-bs-target="#xs-components-links-module-AppModule-9891045d452b54504b54eb121ff116a2e27a31d57e77e629a41d3d5a2238b68654d2fc4e956f3b42d14b824f9f6e7bfbaec7438c30db33fa82a47bcc911b3ca3"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-AppModule-9891045d452b54504b54eb121ff116a2e27a31d57e77e629a41d3d5a2238b68654d2fc4e956f3b42d14b824f9f6e7bfbaec7438c30db33fa82a47bcc911b3ca3"' :
                                            'id="xs-components-links-module-AppModule-9891045d452b54504b54eb121ff116a2e27a31d57e77e629a41d3d5a2238b68654d2fc4e956f3b42d14b824f9f6e7bfbaec7438c30db33fa82a47bcc911b3ca3"' }>
                                            <li class="link">
                                                <a href="components/AddCollectionComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AddCollectionComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AddCustomValueModalComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AddCustomValueModalComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AddDocumentsDialogComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AddDocumentsDialogComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AnalyticsAnnotationValuesComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AnalyticsAnnotationValuesComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AnnotationButtonComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AnnotationButtonComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AnnotationButtonCustomValueAddComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AnnotationButtonCustomValueAddComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AnnotationComboboxComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AnnotationComboboxComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AnnotationComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AnnotationComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AnnotationDateentryComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AnnotationDateentryComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AnnotationDetailComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AnnotationDetailComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AnnotationEntryComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AnnotationEntryComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AnnotationIndicatorComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AnnotationIndicatorComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AnnotationRelationAnnotateBtnComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AnnotationRelationAnnotateBtnComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AnnotationRelationClearBtnComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AnnotationRelationClearBtnComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AnnotationRelationComboboxComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AnnotationRelationComboboxComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AnnotationRelationComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AnnotationRelationComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AnnotationRelationDelBtnComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AnnotationRelationDelBtnComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AnnotationRelationImportBtnComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AnnotationRelationImportBtnComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AnnotationRelationSetBtnComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AnnotationRelationSetBtnComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AnnotationSetComparatorComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AnnotationSetComparatorComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AnnotationSetFilterComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AnnotationSetFilterComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AnnotationSetInspectorComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AnnotationSetInspectorComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AnnotationTextComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AnnotationTextComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AnnotationTextLabelComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AnnotationTextLabelComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AnnotationTextTextComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AnnotationTextTextComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AnnotationVisualizerComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AnnotationVisualizerComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AnnotatorWidgetComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AnnotatorWidgetComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AnnotatorWidgetValuesSchwartzComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AnnotatorWidgetValuesSchwartzComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AppComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AppComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AuthLayoutModComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuthLayoutModComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AutomaticAnnotatorComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AutomaticAnnotatorComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/BaseControlComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >BaseControlComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CompareAnnotationsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CompareAnnotationsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CompareCollectionsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CompareCollectionsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CompareDocumentsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CompareDocumentsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ConfirmDialogComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ConfirmDialogComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CorefAddBtnComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CorefAddBtnComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CorefAnnotateBtnComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CorefAnnotateBtnComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CorefBtnComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CorefBtnComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CorefCheckboxComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CorefCheckboxComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CorefClearBtnComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CorefClearBtnComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CorefComboboxComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CorefComboboxComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CorefDelBtnComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CorefDelBtnComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CorefEntryComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CorefEntryComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CorefImportBtnComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CorefImportBtnComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CorefMultiEntryComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CorefMultiEntryComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CorefSegmentEntryComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CorefSegmentEntryComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CorefSpanEndComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CorefSpanEndComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CorefSpanStartComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CorefSpanStartComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DetectChangesModalComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DetectChangesModalComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DetectOpenDocModalComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DetectOpenDocModalComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ErrorDialogComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ErrorDialogComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/EuropeanaSearchComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EuropeanaSearchComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ImportCollectionsModalComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ImportCollectionsModalComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ImportDocumentsFromExportModalComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ImportDocumentsFromExportModalComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ImportModalComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ImportModalComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/InspectDocumentComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >InspectDocumentComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/LoginComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >LoginComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MainComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MainComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MainDialogComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MainDialogComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ManageCollectionsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ManageCollectionsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MediaGalleryComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MediaGalleryComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/NavbarComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >NavbarComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/OverlappingAreasComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >OverlappingAreasComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ProfileComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ProfileComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/RegisterComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >RegisterComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/RenameCollectionModalComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >RenameCollectionModalComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/RenameDocumentModalComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >RenameDocumentModalComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ResetPasswordComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ResetPasswordComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SelectDocumentModalComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SelectDocumentModalComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ShareCollectionModalComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ShareCollectionModalComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SharedCollectionsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SharedCollectionsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TextWidgetComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TextWidgetComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TextWidgetIsolatedComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TextWidgetIsolatedComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ToolbarSelectAnnotatorComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ToolbarSelectAnnotatorComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ToolbarSelectDocumentComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ToolbarSelectDocumentComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ToolbarWidgetComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ToolbarWidgetComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/UploaderComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UploaderComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/VisualiseAnnotationComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >VisualiseAnnotationComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/VisualiseLayoutComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >VisualiseLayoutComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/WavesurferAudioComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >WavesurferAudioComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/WavesurferVideoComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >WavesurferVideoComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/WelcomeComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >WelcomeComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#directives-links-module-AppModule-9891045d452b54504b54eb121ff116a2e27a31d57e77e629a41d3d5a2238b68654d2fc4e956f3b42d14b824f9f6e7bfbaec7438c30db33fa82a47bcc911b3ca3"' : 'data-bs-target="#xs-directives-links-module-AppModule-9891045d452b54504b54eb121ff116a2e27a31d57e77e629a41d3d5a2238b68654d2fc4e956f3b42d14b824f9f6e7bfbaec7438c30db33fa82a47bcc911b3ca3"' }>
                                        <span class="icon ion-md-code-working"></span>
                                        <span>Directives</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="directives-links-module-AppModule-9891045d452b54504b54eb121ff116a2e27a31d57e77e629a41d3d5a2238b68654d2fc4e956f3b42d14b824f9f6e7bfbaec7438c30db33fa82a47bcc911b3ca3"' :
                                        'id="xs-directives-links-module-AppModule-9891045d452b54504b54eb121ff116a2e27a31d57e77e629a41d3d5a2238b68654d2fc4e956f3b42d14b824f9f6e7bfbaec7438c30db33fa82a47bcc911b3ca3"' }>
                                        <li class="link">
                                            <a href="directives/AutoannTokenClassifierDirective.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AutoannTokenClassifierDirective</a>
                                        </li>
                                        <li class="link">
                                            <a href="directives/CorefAnnotatorValueListDirective.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CorefAnnotatorValueListDirective</a>
                                        </li>
                                        <li class="link">
                                            <a href="directives/DocumentAttributesDirective.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DocumentAttributesDirective</a>
                                        </li>
                                        <li class="link">
                                            <a href="directives/FoundInCollectionDirective.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FoundInCollectionDirective</a>
                                        </li>
                                    </ul>
                                </li>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#pipes-links-module-AppModule-9891045d452b54504b54eb121ff116a2e27a31d57e77e629a41d3d5a2238b68654d2fc4e956f3b42d14b824f9f6e7bfbaec7438c30db33fa82a47bcc911b3ca3"' : 'data-bs-target="#xs-pipes-links-module-AppModule-9891045d452b54504b54eb121ff116a2e27a31d57e77e629a41d3d5a2238b68654d2fc4e956f3b42d14b824f9f6e7bfbaec7438c30db33fa82a47bcc911b3ca3"' }>
                                            <span class="icon ion-md-add"></span>
                                            <span>Pipes</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="pipes-links-module-AppModule-9891045d452b54504b54eb121ff116a2e27a31d57e77e629a41d3d5a2238b68654d2fc4e956f3b42d14b824f9f6e7bfbaec7438c30db33fa82a47bcc911b3ca3"' :
                                            'id="xs-pipes-links-module-AppModule-9891045d452b54504b54eb121ff116a2e27a31d57e77e629a41d3d5a2238b68654d2fc4e956f3b42d14b824f9f6e7bfbaec7438c30db33fa82a47bcc911b3ca3"' }>
                                            <li class="link">
                                                <a href="pipes/AnnotationSpansPipe.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AnnotationSpansPipe</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/AppRoutingModule.html" data-type="entity-link" >AppRoutingModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/CoreModule.html" data-type="entity-link" >CoreModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/FlashMessagesModule.html" data-type="entity-link" >FlashMessagesModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-FlashMessagesModule-b12f88d3dd626fa31cb2726da2e1099b3f4d94ab80c7e217947a16fe9815891c422304e7932774aadb989e0757c59618d8658d41dd196e91e1583ffa52604af2"' : 'data-bs-target="#xs-components-links-module-FlashMessagesModule-b12f88d3dd626fa31cb2726da2e1099b3f4d94ab80c7e217947a16fe9815891c422304e7932774aadb989e0757c59618d8658d41dd196e91e1583ffa52604af2"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-FlashMessagesModule-b12f88d3dd626fa31cb2726da2e1099b3f4d94ab80c7e217947a16fe9815891c422304e7932774aadb989e0757c59618d8658d41dd196e91e1583ffa52604af2"' :
                                            'id="xs-components-links-module-FlashMessagesModule-b12f88d3dd626fa31cb2726da2e1099b3f4d94ab80c7e217947a16fe9815891c422304e7932774aadb989e0757c59618d8658d41dd196e91e1583ffa52604af2"' }>
                                            <li class="link">
                                                <a href="components/FlashMessagesComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FlashMessagesComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/FormlyConfigModule.html" data-type="entity-link" >FormlyConfigModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-FormlyConfigModule-7f8e7d668d58575949972fde4b5315bffed825e13fcf710402591e474f638e4276a03fbc82b14bd3e401abf6fa7ccd75012734f86043a879f3bc879573463c31"' : 'data-bs-target="#xs-components-links-module-FormlyConfigModule-7f8e7d668d58575949972fde4b5315bffed825e13fcf710402591e474f638e4276a03fbc82b14bd3e401abf6fa7ccd75012734f86043a879f3bc879573463c31"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-FormlyConfigModule-7f8e7d668d58575949972fde4b5315bffed825e13fcf710402591e474f638e4276a03fbc82b14bd3e401abf6fa7ccd75012734f86043a879f3bc879573463c31"' :
                                            'id="xs-components-links-module-FormlyConfigModule-7f8e7d668d58575949972fde4b5315bffed825e13fcf710402591e474f638e4276a03fbc82b14bd3e401abf6fa7ccd75012734f86043a879f3bc879573463c31"' }>
                                            <li class="link">
                                                <a href="components/FormlyFieldComboboxComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FormlyFieldComboboxComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/FormlyWrapperCardComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FormlyWrapperCardComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/FormlyWrapperDivComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FormlyWrapperDivComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-FormlyConfigModule-7f8e7d668d58575949972fde4b5315bffed825e13fcf710402591e474f638e4276a03fbc82b14bd3e401abf6fa7ccd75012734f86043a879f3bc879573463c31"' : 'data-bs-target="#xs-injectables-links-module-FormlyConfigModule-7f8e7d668d58575949972fde4b5315bffed825e13fcf710402591e474f638e4276a03fbc82b14bd3e401abf6fa7ccd75012734f86043a879f3bc879573463c31"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-FormlyConfigModule-7f8e7d668d58575949972fde4b5315bffed825e13fcf710402591e474f638e4276a03fbc82b14bd3e401abf6fa7ccd75012734f86043a879f3bc879573463c31"' :
                                        'id="xs-injectables-links-module-FormlyConfigModule-7f8e7d668d58575949972fde4b5315bffed825e13fcf710402591e474f638e4276a03fbc82b14bd3e401abf6fa7ccd75012734f86043a879f3bc879573463c31"' }>
                                        <li class="link">
                                            <a href="injectables/FormlyValidations.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FormlyValidations</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/MaterialExtensionsModule.html" data-type="entity-link" >MaterialExtensionsModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/MaterialModule.html" data-type="entity-link" >MaterialModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/ProfileModule.html" data-type="entity-link" >ProfileModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/ProfileRoutingModule.html" data-type="entity-link" >ProfileRoutingModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/RoutesModule.html" data-type="entity-link" >RoutesModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/RoutesRoutingModule.html" data-type="entity-link" >RoutesRoutingModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/SessionsModule.html" data-type="entity-link" >SessionsModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/SessionsRoutingModule.html" data-type="entity-link" >SessionsRoutingModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/SharedModule.html" data-type="entity-link" >SharedModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#directives-links-module-SharedModule-befc38818386cedefb7fef54bc1ac7bbbc380b9baa91b5360b60b4f246676883e600626264924e00046cc8cc5dde0dbf94b40e243b93b4d4213384b5fbed7998"' : 'data-bs-target="#xs-directives-links-module-SharedModule-befc38818386cedefb7fef54bc1ac7bbbc380b9baa91b5360b60b4f246676883e600626264924e00046cc8cc5dde0dbf94b40e243b93b4d4213384b5fbed7998"' }>
                                        <span class="icon ion-md-code-working"></span>
                                        <span>Directives</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="directives-links-module-SharedModule-befc38818386cedefb7fef54bc1ac7bbbc380b9baa91b5360b60b4f246676883e600626264924e00046cc8cc5dde0dbf94b40e243b93b4d4213384b5fbed7998"' :
                                        'id="xs-directives-links-module-SharedModule-befc38818386cedefb7fef54bc1ac7bbbc380b9baa91b5360b60b4f246676883e600626264924e00046cc8cc5dde0dbf94b40e243b93b4d4213384b5fbed7998"' }>
                                        <li class="link">
                                            <a href="directives/DisableControlDirective.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DisableControlDirective</a>
                                        </li>
                                    </ul>
                                </li>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#pipes-links-module-SharedModule-befc38818386cedefb7fef54bc1ac7bbbc380b9baa91b5360b60b4f246676883e600626264924e00046cc8cc5dde0dbf94b40e243b93b4d4213384b5fbed7998"' : 'data-bs-target="#xs-pipes-links-module-SharedModule-befc38818386cedefb7fef54bc1ac7bbbc380b9baa91b5360b60b4f246676883e600626264924e00046cc8cc5dde0dbf94b40e243b93b4d4213384b5fbed7998"' }>
                                            <span class="icon ion-md-add"></span>
                                            <span>Pipes</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="pipes-links-module-SharedModule-befc38818386cedefb7fef54bc1ac7bbbc380b9baa91b5360b60b4f246676883e600626264924e00046cc8cc5dde0dbf94b40e243b93b4d4213384b5fbed7998"' :
                                            'id="xs-pipes-links-module-SharedModule-befc38818386cedefb7fef54bc1ac7bbbc380b9baa91b5360b60b4f246676883e600626264924e00046cc8cc5dde0dbf94b40e243b93b4d4213384b5fbed7998"' }>
                                            <li class="link">
                                                <a href="pipes/SafeUrlPipe.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SafeUrlPipe</a>
                                            </li>
                                            <li class="link">
                                                <a href="pipes/ToObservablePipe.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ToObservablePipe</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/ThemeModule.html" data-type="entity-link" >ThemeModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-ThemeModule-c8db6527509eeba3cd920477b800e9dd78b08da6d1ac42c37df4f33ab8aaedf4a5371075ef8c55198e996fbdb827481d29fd02e2194a52f2ce4341a649103fdb"' : 'data-bs-target="#xs-components-links-module-ThemeModule-c8db6527509eeba3cd920477b800e9dd78b08da6d1ac42c37df4f33ab8aaedf4a5371075ef8c55198e996fbdb827481d29fd02e2194a52f2ce4341a649103fdb"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-ThemeModule-c8db6527509eeba3cd920477b800e9dd78b08da6d1ac42c37df4f33ab8aaedf4a5371075ef8c55198e996fbdb827481d29fd02e2194a52f2ce4341a649103fdb"' :
                                            'id="xs-components-links-module-ThemeModule-c8db6527509eeba3cd920477b800e9dd78b08da6d1ac42c37df4f33ab8aaedf4a5371075ef8c55198e996fbdb827481d29fd02e2194a52f2ce4341a649103fdb"' }>
                                            <li class="link">
                                                <a href="components/AdminLayoutComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AdminLayoutComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AuthLayoutComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuthLayoutComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/BrandingComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >BrandingComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CustomizerComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CustomizerComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/GithubButtonComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >GithubButtonComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/HeaderComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >HeaderComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/NotificationComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >NotificationComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SidebarComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SidebarComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SidebarNoticeComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SidebarNoticeComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SidemenuComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SidemenuComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TopmenuComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TopmenuComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TopmenuPanelComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TopmenuPanelComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TranslateComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TranslateComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/UserComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UserComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/UserPanelComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UserPanelComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#directives-links-module-ThemeModule-c8db6527509eeba3cd920477b800e9dd78b08da6d1ac42c37df4f33ab8aaedf4a5371075ef8c55198e996fbdb827481d29fd02e2194a52f2ce4341a649103fdb"' : 'data-bs-target="#xs-directives-links-module-ThemeModule-c8db6527509eeba3cd920477b800e9dd78b08da6d1ac42c37df4f33ab8aaedf4a5371075ef8c55198e996fbdb827481d29fd02e2194a52f2ce4341a649103fdb"' }>
                                        <span class="icon ion-md-code-working"></span>
                                        <span>Directives</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="directives-links-module-ThemeModule-c8db6527509eeba3cd920477b800e9dd78b08da6d1ac42c37df4f33ab8aaedf4a5371075ef8c55198e996fbdb827481d29fd02e2194a52f2ce4341a649103fdb"' :
                                        'id="xs-directives-links-module-ThemeModule-c8db6527509eeba3cd920477b800e9dd78b08da6d1ac42c37df4f33ab8aaedf4a5371075ef8c55198e996fbdb827481d29fd02e2194a52f2ce4341a649103fdb"' }>
                                        <li class="link">
                                            <a href="directives/NavAccordionDirective.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >NavAccordionDirective</a>
                                        </li>
                                        <li class="link">
                                            <a href="directives/NavAccordionItemDirective.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >NavAccordionItemDirective</a>
                                        </li>
                                        <li class="link">
                                            <a href="directives/NavAccordionToggleDirective.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >NavAccordionToggleDirective</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                </ul>
                </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#components-links"' :
                            'data-bs-target="#xs-components-links"' }>
                            <span class="icon ion-md-cog"></span>
                            <span>Components</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="components-links"' : 'id="xs-components-links"' }>
                            <li class="link">
                                <a href="components/BreadcrumbComponent.html" data-type="entity-link" >BreadcrumbComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/DashboardComponent.html" data-type="entity-link" >DashboardComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/Error403Component.html" data-type="entity-link" >Error403Component</a>
                            </li>
                            <li class="link">
                                <a href="components/Error404Component.html" data-type="entity-link" >Error404Component</a>
                            </li>
                            <li class="link">
                                <a href="components/Error500Component.html" data-type="entity-link" >Error500Component</a>
                            </li>
                            <li class="link">
                                <a href="components/ErrorCodeComponent.html" data-type="entity-link" >ErrorCodeComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/LoginComponent-1.html" data-type="entity-link" >LoginComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/LoginSocialComponent.html" data-type="entity-link" >LoginSocialComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PageHeaderComponent.html" data-type="entity-link" >PageHeaderComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ProfileLayoutComponent.html" data-type="entity-link" >ProfileLayoutComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ProfileOverviewComponent.html" data-type="entity-link" >ProfileOverviewComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ProfileSettingsComponent.html" data-type="entity-link" >ProfileSettingsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/RegisterComponent-1.html" data-type="entity-link" >RegisterComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/RenameDocumentModalComponent.html" data-type="entity-link" >RenameDocumentModalComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ValueAccessorComponent.html" data-type="entity-link" >ValueAccessorComponent</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#directives-links"' :
                                'data-bs-target="#xs-directives-links"' }>
                                <span class="icon ion-md-code-working"></span>
                                <span>Directives</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="directives-links"' : 'id="xs-directives-links"' }>
                                <li class="link">
                                    <a href="directives/ButtonAnnotatorValueListDirective.html" data-type="entity-link" >ButtonAnnotatorValueListDirective</a>
                                </li>
                                <li class="link">
                                    <a href="directives/DomHelpersDirective.html" data-type="entity-link" >DomHelpersDirective</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#classes-links"' :
                            'data-bs-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Classes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/Base64.html" data-type="entity-link" >Base64</a>
                            </li>
                            <li class="link">
                                <a href="classes/BaseToken.html" data-type="entity-link" >BaseToken</a>
                            </li>
                            <li class="link">
                                <a href="classes/CLARIN_CONSTANTS.html" data-type="entity-link" >CLARIN_CONSTANTS</a>
                            </li>
                            <li class="link">
                                <a href="classes/ConfirmDialogData.html" data-type="entity-link" >ConfirmDialogData</a>
                            </li>
                            <li class="link">
                                <a href="classes/ErrorDialogData.html" data-type="entity-link" >ErrorDialogData</a>
                            </li>
                            <li class="link">
                                <a href="classes/FlashMessage.html" data-type="entity-link" >FlashMessage</a>
                            </li>
                            <li class="link">
                                <a href="classes/Guid.html" data-type="entity-link" >Guid</a>
                            </li>
                            <li class="link">
                                <a href="classes/JWT.html" data-type="entity-link" >JWT</a>
                            </li>
                            <li class="link">
                                <a href="classes/JwtToken.html" data-type="entity-link" >JwtToken</a>
                            </li>
                            <li class="link">
                                <a href="classes/MemoryStorageService.html" data-type="entity-link" >MemoryStorageService</a>
                            </li>
                            <li class="link">
                                <a href="classes/MyErrorStateMatcher.html" data-type="entity-link" >MyErrorStateMatcher</a>
                            </li>
                            <li class="link">
                                <a href="classes/RenameDialogData.html" data-type="entity-link" >RenameDialogData</a>
                            </li>
                            <li class="link">
                                <a href="classes/ShapeBControl.html" data-type="entity-link" >ShapeBControl</a>
                            </li>
                            <li class="link">
                                <a href="classes/ShapeLBControl.html" data-type="entity-link" >ShapeLBControl</a>
                            </li>
                            <li class="link">
                                <a href="classes/ShapeLControl.html" data-type="entity-link" >ShapeLControl</a>
                            </li>
                            <li class="link">
                                <a href="classes/ShapeLTControl.html" data-type="entity-link" >ShapeLTControl</a>
                            </li>
                            <li class="link">
                                <a href="classes/ShapeRBControl.html" data-type="entity-link" >ShapeRBControl</a>
                            </li>
                            <li class="link">
                                <a href="classes/ShapeRControl.html" data-type="entity-link" >ShapeRControl</a>
                            </li>
                            <li class="link">
                                <a href="classes/ShapeRotateControl.html" data-type="entity-link" >ShapeRotateControl</a>
                            </li>
                            <li class="link">
                                <a href="classes/ShapeRTControl.html" data-type="entity-link" >ShapeRTControl</a>
                            </li>
                            <li class="link">
                                <a href="classes/ShapeTControl.html" data-type="entity-link" >ShapeTControl</a>
                            </li>
                            <li class="link">
                                <a href="classes/SimpleToken.html" data-type="entity-link" >SimpleToken</a>
                            </li>
                            <li class="link">
                                <a href="classes/SkipDetailRowsExporter.html" data-type="entity-link" >SkipDetailRowsExporter</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#injectables-links"' :
                                'data-bs-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/AnalyticsService.html" data-type="entity-link" >AnalyticsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AnnotationSchemaService.html" data-type="entity-link" >AnnotationSchemaService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AnnotationService.html" data-type="entity-link" >AnnotationService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AnnotatorsTemplateService.html" data-type="entity-link" >AnnotatorsTemplateService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AppDirectionality.html" data-type="entity-link" >AppDirectionality</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AuthService.html" data-type="entity-link" >AuthService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AutoannService.html" data-type="entity-link" >AutoannService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ButtonAnnotatorService.html" data-type="entity-link" >ButtonAnnotatorService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ButtonColorService.html" data-type="entity-link" >ButtonColorService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CollectionImportService.html" data-type="entity-link" >CollectionImportService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CollectionService.html" data-type="entity-link" >CollectionService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CoreferenceAnnotatorService.html" data-type="entity-link" >CoreferenceAnnotatorService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CoreferenceColorDataService.html" data-type="entity-link" >CoreferenceColorDataService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CoreferenceColorService.html" data-type="entity-link" >CoreferenceColorService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/DashboardService.html" data-type="entity-link" >DashboardService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/DialogService.html" data-type="entity-link" >DialogService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/DocumentService.html" data-type="entity-link" >DocumentService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/DragAndDropService.html" data-type="entity-link" >DragAndDropService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/EuropeanaService.html" data-type="entity-link" >EuropeanaService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FlashMessagesService.html" data-type="entity-link" >FlashMessagesService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/InMemDataService.html" data-type="entity-link" >InMemDataService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/LocalStorageService.html" data-type="entity-link" >LocalStorageService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/LoginService.html" data-type="entity-link" >LoginService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MainService.html" data-type="entity-link" >MainService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MenuService.html" data-type="entity-link" >MenuService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MessageService.html" data-type="entity-link" >MessageService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MessageService-1.html" data-type="entity-link" >MessageService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ObjectIdService.html" data-type="entity-link" >ObjectIdService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/OpenDocumentService.html" data-type="entity-link" >OpenDocumentService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PaginatorI18nService.html" data-type="entity-link" >PaginatorI18nService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PreloaderService.html" data-type="entity-link" >PreloaderService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/RestoreAnnotationService.html" data-type="entity-link" >RestoreAnnotationService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SanctumService.html" data-type="entity-link" >SanctumService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SettingsService.html" data-type="entity-link" >SettingsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SharedCollectionService.html" data-type="entity-link" >SharedCollectionService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SharedCollectionsService.html" data-type="entity-link" >SharedCollectionsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SseService.html" data-type="entity-link" >SseService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/StartupService.html" data-type="entity-link" >StartupService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/TempAnnotationService.html" data-type="entity-link" >TempAnnotationService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/TextWidgetAPI.html" data-type="entity-link" >TextWidgetAPI</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/TokenFactory.html" data-type="entity-link" >TokenFactory</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/TokenService.html" data-type="entity-link" >TokenService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/TranslateLangService.html" data-type="entity-link" >TranslateLangService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UserService.html" data-type="entity-link" >UserService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/VAST_OauthService.html" data-type="entity-link" >VAST_OauthService</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#interceptors-links"' :
                            'data-bs-target="#xs-interceptors-links"' }>
                            <span class="icon ion-ios-swap"></span>
                            <span>Interceptors</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="interceptors-links"' : 'id="xs-interceptors-links"' }>
                            <li class="link">
                                <a href="interceptors/BaseUrlInterceptor.html" data-type="entity-link" >BaseUrlInterceptor</a>
                            </li>
                            <li class="link">
                                <a href="interceptors/DefaultInterceptor.html" data-type="entity-link" >DefaultInterceptor</a>
                            </li>
                            <li class="link">
                                <a href="interceptors/ErrorInterceptor.html" data-type="entity-link" >ErrorInterceptor</a>
                            </li>
                            <li class="link">
                                <a href="interceptors/LoggingInterceptor.html" data-type="entity-link" >LoggingInterceptor</a>
                            </li>
                            <li class="link">
                                <a href="interceptors/NoopInterceptor.html" data-type="entity-link" >NoopInterceptor</a>
                            </li>
                            <li class="link">
                                <a href="interceptors/SanctumInterceptor.html" data-type="entity-link" >SanctumInterceptor</a>
                            </li>
                            <li class="link">
                                <a href="interceptors/SettingsInterceptor.html" data-type="entity-link" >SettingsInterceptor</a>
                            </li>
                            <li class="link">
                                <a href="interceptors/TokenInterceptor.html" data-type="entity-link" >TokenInterceptor</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#interfaces-links"' :
                            'data-bs-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/Annotation.html" data-type="entity-link" >Annotation</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AnnotationRelationComboboxStatus.html" data-type="entity-link" >AnnotationRelationComboboxStatus</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AnnotationRelationComboboxStatusEntry.html" data-type="entity-link" >AnnotationRelationComboboxStatusEntry</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AnnotationSpansIndexer.html" data-type="entity-link" >AnnotationSpansIndexer</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AppSettings.html" data-type="entity-link" >AppSettings</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Attribute.html" data-type="entity-link" >Attribute</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AttributeValueMemory.html" data-type="entity-link" >AttributeValueMemory</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AttributeValueMemoryValue.html" data-type="entity-link" >AttributeValueMemoryValue</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BackendResult.html" data-type="entity-link" >BackendResult</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BackendResultAnnotatioVisualisationData.html" data-type="entity-link" >BackendResultAnnotatioVisualisationData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BackendResultArray.html" data-type="entity-link" >BackendResultArray</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BackendResultSharedCollectionsInformation.html" data-type="entity-link" >BackendResultSharedCollectionsInformation</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BackendUser.html" data-type="entity-link" >BackendUser</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Collection.html" data-type="entity-link" >Collection</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DcCreatorLangAware.html" data-type="entity-link" >DcCreatorLangAware</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DcCreatorLangAwareOrDcDescriptionLangAware.html" data-type="entity-link" >DcCreatorLangAwareOrDcDescriptionLangAware</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DcTitleLangAware.html" data-type="entity-link" >DcTitleLangAware</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DialogData.html" data-type="entity-link" >DialogData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/diffAnnotationSetsOptions.html" data-type="entity-link" >diffAnnotationSetsOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Document.html" data-type="entity-link" >Document</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DocumentGroup.html" data-type="entity-link" >DocumentGroup</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DocumentInformation.html" data-type="entity-link" >DocumentInformation</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EuropeanaSearchParameters.html" data-type="entity-link" >EuropeanaSearchParameters</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EuropeanaSearchResults.html" data-type="entity-link" >EuropeanaSearchResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ExampleFlatNode.html" data-type="entity-link" >ExampleFlatNode</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FlashMessageInterface.html" data-type="entity-link" >FlashMessageInterface</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IProfile.html" data-type="entity-link" >IProfile</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ItemsEntity.html" data-type="entity-link" >ItemsEntity</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/LoginData.html" data-type="entity-link" >LoginData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Menu.html" data-type="entity-link" >Menu</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MenuChildrenItem.html" data-type="entity-link" >MenuChildrenItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MenuPermissions.html" data-type="entity-link" >MenuPermissions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MenuTag.html" data-type="entity-link" >MenuTag</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Message.html" data-type="entity-link" >Message</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Params.html" data-type="entity-link" >Params</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ScrollStatus.html" data-type="entity-link" >ScrollStatus</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Selection.html" data-type="entity-link" >Selection</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Setting.html" data-type="entity-link" >Setting</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SharedCollectionInformation.html" data-type="entity-link" >SharedCollectionInformation</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SharedCollectionsInformation.html" data-type="entity-link" >SharedCollectionsInformation</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Span.html" data-type="entity-link" >Span</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Token.html" data-type="entity-link" >Token</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TopmenuState.html" data-type="entity-link" >TopmenuState</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/User.html" data-type="entity-link" >User</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#miscellaneous-links"'
                            : 'data-bs-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/enumerations.html" data-type="entity-link">Enums</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/typealiases.html" data-type="entity-link">Type aliases</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <a data-type="chapter-link" href="routes.html"><span class="icon ion-ios-git-branch"></span>Routes</a>
                        </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank" rel="noopener noreferrer">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});