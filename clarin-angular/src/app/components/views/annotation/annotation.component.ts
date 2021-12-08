import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { User } from '@core/authentication/interface';
import { ConfirmDialogData } from 'src/app/models/dialogs/confirm-dialog';
import { Setting } from 'src/app/models/services/setting';
import { TextWidgetComponent } from '../../controls/text-widget/text-widget.component';
import { DetectChangesModalComponent } from '../../dialogs/detect-changes-modal/detect-changes-modal.component';
import { DetectOpenDocModalComponent } from '../../dialogs/detect-open-doc-modal/detect-open-doc-modal.component';
import { ErrorDialogComponent } from '../../dialogs/error-dialog/error-dialog.component';
import { SelectDocumentModalComponent } from '../../dialogs/select-document-modal/select-document-modal.component';
import { MainComponent } from '../main/main.component';
import { NgProgressRef } from 'ngx-progressbar';

/*
 * How Documents are opened:
 *
 * 1) The first step is to call AnnotationComponent.detectOpenDocument().
 * 2) AnnotationComponent.detectOpenDocument() calls this.openDocumentService.getAll().
 *    openDocumentService.getAll() returns a left join of the open documents
 *    table & the shared collection table, thus in the table we have information
 *    about both open documents & collections whose sharing is confirmed.
 *    In result, opened = true if the user id matches the current user.
 * 3) It recognises ? cases:
 *    case 1): Document opened by current user, no db_interactions have occurred and is not shared.
 *    actions 1): a) Temp annotations are deleted; b) Document is closed; c) Proceed to Document Selection.
 *
 *    case 2): Document opened by current user, no db_interactions have occurred and is shared.
 *    actions 2): a) Document is closed; b) Proceed to Document Selection.
 *
 *    case 3): Document opened by current user & (not shared | shared but only opened by current user) & db_interactions > 0
 *    actions 3): a) The user is asked what to do: discard temp annotations, save temp annotations, continue annotation.
 *                b) In case of discard, Temp annotations are deleted; Document is closed (RestoreAnnotationService.discard()); Proceed to Document Selection.
 *                c) In case of save, annotations are deleted, temp annotations are saved as annotations, temp annotations are deleted, document is closed (RestoreAnnotationService.autoSave()); Proceed to Document Selection.
 *                d) In case of continue, the document gets opened for annotation, based on the temp annotations.
 *
 *    case 4): Document opened by current user, which is shared and opened also by other users.
 *    actions 4):
 *
 *
 * ?) The user is reirected to AnnotationComponent.createDocumentSelectionModal(),
 *    to select a Document & an Annotation schema to open.
 *
 */

@Component({
  selector: 'annotation',
  templateUrl: './annotation.component.html',
  styleUrls: ['./annotation.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AnnotationComponent extends MainComponent implements OnInit {

  @ViewChild(TextWidgetComponent)
  private textWidgetComponent!: TextWidgetComponent;

  super() { }

  ObjectID;
  autoSaveIndicator;
  documentSelection = true;
  documentSelected = false;
  annotatorType = "No Schema";
  annotationSchema = {};
  sidebarSelector = "annotator";
  maincontentSelector = "document";
  layout = {
    showEditorTabs: true,
    showDocument: true,
    showDocumentAttributes: true,
    showSettings: true,
    showLinkRouterSelector: false,
    routerName: "direct"
  };
  spinnerVisible;
  broadcastEvent = {};

  owners = new Set();
  updaters = new Set();
  ownersList = [];
  updatersList = [];
  collectionSettings: Setting[] = [
    {
      name: "Readonly", value: "readonly", type: "checkbox",
      checked: false, allChecked: false, color: "accent"
    },
    {
      name: "Annotation Completed", value: "completed", type: "checkbox",
      checked: false, allChecked: false, color: "accent"
    }
  ];
  documentSettings: Setting[] = [
    {
      name: "Readonly", value: "readonly", type: "checkbox",
      checked: false, allChecked: false, color: "accent"
    },
    {
      name: "Annotation Completed", value: "completed", type: "checkbox",
      checked: false, allChecked: false, color: "accent"
    },
    {
      name: "Show Annotations owned by:", value: "created_by", type: "checkbox",
      checked: false, allChecked: false, color: "accent", subsettings: this.ownersList
    },
    {
      name: "Show Annotations updated by:", value: "updated_by", type: "checkbox",
      checked: false, allChecked: false, color: "accent", subsettings: this.updatersList
    }
  ];
  user: User;
  skipAnnotationsUpdates = false;

  dialogWidth:  "550px";
  dialogHeight: "600px";

  ngOnInit(): void {
    this.TextWidgetAPI.settingsComplianceFields = ['created_by', 'updated_by'];
    this.TextWidgetAPI.initializeCallbacks();
    this.TextWidgetAPI.resetData();
    this.TextWidgetAPI.disableIsRunning();
    // Is there a request to annotated a specific document?
    if (this.messageService.requestToAnnotateDocument) {
      this.createDocumentSelectionModal();
    } else {
      this.detectOpenDocument();
    }
    //CHECK Widgets $ocLazyLoad.load('annotationWidgets')
    this.authService.user().subscribe(user => (this.user = user));
    /* WARNING: annotation ids must be created the same way as in
     * components, which inherit BaseControlComponent
     * (app/components/controls/base-control/base-control.component.ts). */
    this.ObjectID = require("bson-objectid");
  }

  ObjectId() {
    return this.ObjectID();
  }

  //open the modal in order the user to select a document to annotate
  createDocumentSelectionModal() {
    this.documentSelected = false;
    if (!this.TextWidgetAPI.checkIsRunning()) {
      this.TextWidgetAPI.enableIsRunning();
    } else {
      return false;
    }

    this.collectionService.getData()
      .then((response) => {
        if (response["success"]) {
          var inputData = {
            annotator: this.annotatorType,
            annotationSchema: this.annotationSchema,
            collectionsData: response["data"],
            parent: this
          };

          var dialogRef = this.dialog.open(SelectDocumentModalComponent, { data: inputData, disableClose: true });
         
          //this.selectDocumentModalInstance = Dialog.custom('select-document-modal.html',
          // 'selectDocumentModalCtrl', inputData, false, "document-selector"); // animated fadeIn
          //this.selectDocumentModalInstance.result.then(function (result) {
          dialogRef.afterClosed().subscribe((result) => {
            if (result === "cancel") {
              this.documentSelected = false;
              setTimeout(() => { //<<<---using ()=> syntax
                this.documentSelection = false;
              }, 800);
            } else if (typeof (result) != "undefined") {
              let progressRef: NgProgressRef = this.messageService.progressRef();
              progressRef.start();

              this.TextWidgetAPI.disableIsRunning();
              this.TextWidgetAPI.resetCallbacks();
              this.TextWidgetAPI.setAnnotatorType(result.newAnnotator);
              this.TextWidgetAPI.setAnnotationSchemaOptions(result.newAnnotationSchemaOptions);
              let promises = this.TextWidgetAPI.setAnnotationSchema(result.newAnnotationSchema);
              Promise.all(promises).then((data) => {
                this.TextWidgetAPI.setCurrentCollection(result.newCollection);
                this.annotatorType = result.newAnnotator;
                result.newDocument.annotator_id = this.TextWidgetAPI.getAnnotatorTypeId();
                this.TextWidgetAPI.registerAnnotationsCallback(this.updateAnnotationList.bind(this));
                // This is where the document loading happens. The text-widget component
                // has registered a callback to react to document changes. When a new Document
                // is set by TextWidgetAPI.setCurrentDocument(), the
                // TextWidgetComponent.updateCurrentDocument() will be called, which will decide
                // to either load Annotations from DB, or TempDB.
                Promise.all(this.TextWidgetAPI.setCurrentDocument(result.newDocument))
                .then((data) => {
                  this.documentSelected = true;
                  progressRef.complete();
                  //this.TextWidgetAPI.registerAnnotationsCallback(this.updateAnnotationList.bind(this));

                  setTimeout(() => { //<<<---using ()=> syntax
                    this.documentSelection = false;
                    this.TextWidgetAPI.disableIsRunning();
                  }, 800);
                });
              });
            }
          });
        } else {
          this.TextWidgetAPI.disableIsRunning();
          this.dialog.open(ErrorDialogComponent, {
            data: new ConfirmDialogData("Error",
              "Error during the restoring of your documents. Please refresh the page and try again.")
          })
        }
      });
  };

  //function to detect unsaved changes before leaving the current document
  detectUnsavedChanges() {
    var currentDocument: any = this.TextWidgetAPI.getCurrentDocument();

    this.openDocumentService.get(currentDocument.id, currentDocument.annotator_id)
      .then((response: any) => {
        //search if the user has an open document         
        if (response.success && response.data.length > 0) {
          // var documentFound = _.findWhere(response.data, { opened: 1 });
          var documentFound = response.data.find(doc => doc.opened === 1);

          //if changes have been done on the document
          if (typeof (documentFound) != "undefined" && documentFound.db_interactions > 0) {
            //auto save functionality enabled
            if (this.autoSaveIndicator) {
              var AnnotatorTypeId = this.TextWidgetAPI.getAnnotatorTypeId();
              this.restoreAnnotationService.autoSave(currentDocument.collection_id, currentDocument.id, AnnotatorTypeId)
                .then((response: any) => {
                  if (response.success) {
                    this.createDocumentSelectionModal();
                    this.documentSelection = true;
                    this.documentSelected = false;
                  } else {
                    this.dialog.open(ErrorDialogComponent, {
                      data: new ConfirmDialogData("Error",
                        "Error during the save annotations. Please refresh the page and try again.")
                    })
                  }
                }, (error) => {
                  this.dialog.open(ErrorDialogComponent, {
                    data: new ConfirmDialogData("Error",
                      "Database error. Please refresh the page and try again.")
                  })
                });
            } else {
              //$ocLazyLoad.load('detectOpenDocModalCtrl').then(function () {
              //var detectOpenDocModalInstance = Dialog.custom('detect-open-doc-modal.html', 'detectOpenDocModalCtrl', currentDocument, true, "");

              let dialogRef = this.dialog.open(DetectOpenDocModalComponent, { data: currentDocument, disableClose: true });

              dialogRef.afterClosed().subscribe((response) => {
                if (response.success) {
                  this.createDocumentSelectionModal();
                  this.documentSelection = true;
                  this.documentSelected = false;
                } else {
                  this.dialog.open(ErrorDialogComponent, {
                    data: new ConfirmDialogData("Error",
                      "Database error. Please refresh the page and try again.")
                  })
                }

              });
            }
          } else {
            this.createDocumentSelectionModal();
            this.documentSelection = true;
            this.documentSelected = false;
          }
        }
      }, (error) => {
        this.dialog.open(ErrorDialogComponent, {
          data: new ConfirmDialogData("Error", "Database error. Please refresh the page and try again.")
        })
      });
  }

  askUserOnOpenedDocument(openedDocument) {
    openedDocument['ui_user'] = this.user;
    const dialogRef = this.dialog.open(DetectChangesModalComponent, {
      data: openedDocument, disableClose: true, width: this.dialogWidth
    });
    return dialogRef.afterClosed()
      .toPromise() // here you have a Promise instead an Observable
      .then(result => {
        return Promise.resolve(result); // will return a Promise here
      });
  }; /* askUserOnOpenedDocument */

  // Function to detect if the user has left any document open in the database
  detectOpenDocument() {
    console.warn("AnnotationComponent: detectOpenDocument():");
    this.openDocumentService.getAll()
      .then(async (response: any) => {
        var showDocumentSelectionModal = 1;
        /* openDocumentService.getAll() returns a left join of the open documents
         * table & the shared collection table, thus in the table we have information
         * about both open documents & collections whose sharing is confirmed.
         * In result, opened = true if the user id matches the current user. */
        console.warn("AnnotationComponent: detectOpenDocument(): OpenDocument.getAll(): (", response.data.length, " items),",  response);
        // Search if the user has an open document 
        if (response.success && response.data.length > 0) {
          var askUser = false;
          var openedDocumentsByUser = response.data.filter(doc => doc.opened == 1);
          console.warn("AnnotationComponent: detectOpenDocument(): Documents opened by user:", openedDocumentsByUser);
          // Iterate over all user's opened Documents, and prompt the user to save changes,
          // discard changes, or continue editing them...
          for (const openedDocument of openedDocumentsByUser) {
            console.warn("AnnotationComponent: detectOpenDocument(): Opened Document:", openedDocument);
            console.warn("  DB interactions for user:", openedDocument.db_interactions);
            console.warn("  Document is shared with other users:", openedDocument.confirmed);
            var openedDocumentByAllUsers = response.data.filter(doc => doc.document_id == openedDocument.document_id);
            console.warn("  Users that have opened this Document: (", openedDocumentByAllUsers.length, ")", openedDocumentByAllUsers);
            openedDocument.enableDiscard = false;
            askUser = false;

            // Document has been opened only from the current user & no db_interactions have occurred    
            if (openedDocumentByAllUsers.length == 1 &&
                openedDocument.db_interactions == 0 &&
                !openedDocument.confirmed) {
              console.warn("  Document opened by current user, no db_interactions have occurred and is not shared");
              console.warn("    -> Erasing Temp annotations for annotator:", openedDocument.annotator_type);
              this.tempAnnotationService.destroy(openedDocument.collection_id, openedDocument.document_id, openedDocument.annotator_type)
                .then((response) => {
                  console.warn("    -> Closing Document for annotator:", openedDocument.annotator_type);
                  this.openDocumentService.destroy(openedDocument.document_id, openedDocument.annotator_type);
                  showDocumentSelectionModal++; // this.createDocumentSelectionModal();
                }, (error) => {
                  this.dialog.open(ErrorDialogComponent, {
                    data: new ConfirmDialogData("Error", "Database error. Please refresh the page and try again.")
                  })
                });
            } else if (openedDocument.db_interactions == 0) {
              console.warn("  Document opened by current user, no db_interactions have occurred and is shared:", openedDocumentByAllUsers);
              console.warn("    -> Closing Document for annotator:", openedDocument.annotator_type);
              this.openDocumentService.destroy(openedDocument.document_id, openedDocument.annotator_type);
              showDocumentSelectionModal++;
            } else if (
              // Document not shared and db_interactions > 0
              (!openedDocument.confirmed && openedDocument.db_interactions > 0) ||
              // Document is shared, but only opened by the current user and db_interactions > 0
              (openedDocument.confirmed == 1 &&
                response.data.filter(doc => doc.document_id === openedDocument.document_id).length == 1 &&
                openedDocument.db_interactions > 0)
            ) {
              // Document not shared and db_interactions > 0, open modal informing users about the work in progress
              console.warn("  Document opened by current user & (not shared | shared but only opened by current user) & db_interactions > 0");
              // Allow the user to discard temp annotations...
              openedDocument.enableDiscard = true;
              // Ask the user what to do...
              askUser = true;
            } else {
              console.warn("  Document opened by current user, which is shared and opened also by other users");
              // Ask the user what to do...
              askUser = true;
            }
            if (askUser) {
              const response = await this.askUserOnOpenedDocument(openedDocument);
              console.warn("    User Response:", response.userSelection, response);
              if (response.success) {
                if (typeof (response.resume) != "undefined" && response.resume) {
                  // The document is already in the annotator!
                  this.documentSelected = true;
                  this.TextWidgetAPI.registerAnnotationsCallback(this.updateAnnotationList.bind(this));
                  setTimeout(() => { //<<<---using ()=> syntax
                    this.documentSelection = false;
                    this.annotatorType = this.TextWidgetAPI.getAnnotatorType();
                  }, 800);
                  showDocumentSelectionModal = 0;
                  break; // The document has been set for editing, break the loop and do not show the document selector.
                } else {
                  showDocumentSelectionModal++; // this.createDocumentSelectionModal();
                }
              } else { // if (response.success)
                this.dialog.open(ErrorDialogComponent, {
                  data: new ConfirmDialogData("Error", "Error during the restoration of your annotations. Please refresh the page and try again.")
                })
              }; // if (response.success)
            }; /* if (askUser) */
          }; // for (const openedDocument of openedDocumentsByUser)
        } else if (response.success) { // else for: if (response.success && response.data.length > 0)
          console.warn("getAll(): response.data.length == 0");
          showDocumentSelectionModal++; // this.createDocumentSelectionModal();
        } else { // else for: if (response.success && response.data.length > 0)
          this.dialog.open(ErrorDialogComponent, {
            data: new ConfirmDialogData("Error",
              "Database error. Please refresh the page and try again.")
          })
        }; // if (response.success && response.data.length > 0)

        if (showDocumentSelectionModal > 0) {
          this.createDocumentSelectionModal();
        }
      }, (error) => { // error handling in then() for this.openDocumentService.getAll()
        this.dialog.open(ErrorDialogComponent, {
          data: new ConfirmDialogData("Error",
            "Database error. Please refresh the page and try again.")
        })
      });
  };

  openDocumentSelectionModal() {
    if (this.TextWidgetAPI.checkIsRunning()) {
      alert('running');
      return false;
    }
    this.detectUnsavedChanges();
  };
  /*
   * ============================================================================
   *  Settings
   * ============================================================================
   */
  updateAllChecked(setting: Setting, collectionSetting: boolean = false) {
    // console.error("Clicked on:", setting);
    setting.allChecked = setting.subsettings != null && setting.subsettings.every(t => t.checked);
    this.updateAnnotation(setting, collectionSetting);
  }

  someChecked(setting: Setting, collectionSetting: boolean = false): boolean {
    if (setting.subsettings == null) {
      return false;
    }
    return setting.subsettings.filter(t => t.checked).length > 0 && !setting.allChecked;
  }

  setAll(setting: Setting, checked: boolean, collectionSetting: boolean = false) {
    // console.error("setAll():", setting);
    setting.allChecked = checked;
    if (setting.subsettings == null) {
      this.updateAnnotation(setting, collectionSetting);
      return;
    }
    setting.subsettings.forEach(t => t.checked = checked);
    this.updateAnnotation(setting, collectionSetting);
  }

  /* Store value as an annotation */
  async updateAnnotation(s: Setting, collectionSetting: boolean = false) {
    var newAttribute = this.getSetting(s);
    // console.error("Setting Update:", newAttribute);
    var ann = this.TextWidgetAPI.getAnnotationForDocumentSetting(s.value, this.user.email);
    if (ann != undefined && Object.keys(ann).length > 0) {
      // Annotation exists, update its value...
      var index = ann.attributes.findIndex(attr => attr.name === s.value);
      if (index === undefined) {
        // The specific attribute does not exist in the annotation, add it.
        ann.attributes.push(newAttribute);
      } else {
        ann.attributes[index] = newAttribute;
      }
      // console.error("AnnotationComponent: updateAnnotation(): existing:", s.value, ann);
      this.skipAnnotationsUpdates = true;
      try {
        var response = await this.tempAnnotationService.update(ann);
        if (response['success']) {
          this.skipAnnotationsUpdates = false;
          this.TextWidgetAPI.updateAnnotation(ann, false);
          this.TextWidgetAPI.setSettings(this.getSettings());
        } else {
          this.skipAnnotationsUpdates = false;
          this.dialog.open(ErrorDialogComponent, {
            data: new ConfirmDialogData("Error",
              "Error in update Annotation. Please refresh the page and try again")
          });
        }
      } catch (error) {
        console.error("AnnotationComponent: updateAnnotation():", error);
        this.skipAnnotationsUpdates = false;
        this.dialog.open(ErrorDialogComponent, {
          data: new ConfirmDialogData("Error",
            "Database error. Please refresh the page and try again.")
        });
      }
    } else {
      // No existing Annotation, we need to create a new one...
      var currentDocument: any = this.TextWidgetAPI.getCurrentDocument();
      var schema = this.TextWidgetAPI.getAnnotationSchema();
      var newAnnotation = {
        _id: this.ObjectId().toString(),
        document_id: currentDocument.id,
        collection_id: currentDocument.collection_id,
        annotator_id: currentDocument.annotator_id,
        type: "setting annotation",
        spans: [],
        attributes: [newAttribute],
        created_by: this.user.email
      };
      if (collectionSetting) {
        newAnnotation['collection_setting'] = s.value;
      } else {
        newAnnotation['document_setting'] = s.value;
      };
      // console.error("AnnotationComponent: updateAnnotation(): new:", s.value, newAnnotation);
      this.skipAnnotationsUpdates = true;
      try {
        var response = await this.tempAnnotationService.save(currentDocument.collection_id,
          currentDocument.id, newAnnotation);
        if (response['success']) {
          this.skipAnnotationsUpdates = false;
          this.TextWidgetAPI.addAnnotation(newAnnotation, false);
          this.TextWidgetAPI.setSettings(this.getSettings());
        } else {
          this.skipAnnotationsUpdates = false;
          this.dialog.open(ErrorDialogComponent, {
            data: new ConfirmDialogData("Error",
              "Error during saving your annotation. Please refresh the page and try again.")
          });
        }
      } catch (error) {
        console.error("AnnotationComponent: updateAnnotation():", error);
        this.skipAnnotationsUpdates = false;
        this.dialog.open(ErrorDialogComponent, {
          data: new ConfirmDialogData("Error",
            "Database error. Please refresh the page and try again.")
        });
      }
    }
  }; /* updateAnnotation */

  updateAnnotationList() {
    // console.error("updateAnnotationList():", this.TextWidgetAPI.getAnnotations());
    if (this.skipAnnotationsUpdates) { return; }
    var anns = this.TextWidgetAPI.getAnnotations();
    this.owners.clear();
    this.updaters.clear();
    this.ownersList = [];
    this.updatersList = [];
    if (anns.length < 1) {
      // console.error("updateAnnotationList(): len=0, returning"); 
      return;
    }
    // console.error("AUTH: user:", this.user);
    // Identify all annotation owners...
    anns.forEach((ann) => {
      if ("created_by" in ann) {
        this.owners.add(ann['created_by']);
      }
      if ("updated_by" in ann) {
        this.updaters.add(ann['created_by']);
      }
      // if (this.TextWidgetAPI.isSettingAnnotation(ann)) {
      //   console.error("Setting Ann:", ann);
      // }
    });
    this.owners.forEach((owner) => {
      this.ownersList.push({
        name: owner, value: owner, type: "checkbox",
        checked: false, allChecked: false, color: "accent"
      });
    });
    this.updaters.forEach((updater) => {
      this.updatersList.push({
        name: updater, value: updater, type: "checkbox",
        checked: false, allChecked: false, color: "accent"
      });
    });
    // Update the values so that the UI can redraw itself...
    this.documentSettings.find(element => element.value === "created_by")['subsettings'] = this.ownersList;
    this.documentSettings.find(element => element.value === "updated_by")['subsettings'] = this.updatersList;
    this.updateSettings();
  }; /* updateAnnotationList */

  updateSettings() {
    // console.error("updateSettings():", this.TextWidgetAPI.getAnnotations().length);
    // Use every instead of forEach, as we want to break from loop
    var all = this.documentSettings.every((s) => {
      var ann = this.TextWidgetAPI.getAnnotationForDocumentSetting(s.value, this.user.email);
      // console.error(s.name, s.value, ann);
      if (ann === undefined) {
        if (s.value == "created_by" || s.value == "updated_by") {
          // The following code will add or update an existing annotation,
          // which will trigger this method to be invoked again.
          // There is no point continuing, so return...
          this.setAll(s, true);
        } else {
          this.setAll(s, false);
        }
        return false;
      } else {
        // Match the annotation
        s.allChecked = ann.attributes[0].value;
        if (s.subsettings != null) {
          var checked = ann.attributes[0].checked;
          s.subsettings.forEach(t => t.checked = checked.includes(t.value));
        }
      }
      return true;
    });
    if (all) {
      // We have created all needed annotations, or needed annotations existed.
      // Generate and store settings...
      this.TextWidgetAPI.setSettings(this.getSettings());
    }
  }; /* updateSettings */

  getSetting(s: Setting) {
    var setting = {
      name: s.value,
      value: s.allChecked,
      checked: []
    };
    if (s.subsettings != null) {
      // Get the list of selected children...
      s.subsettings.filter(t => t.checked).forEach(t => setting.checked.push(t.value));
    }
    return setting;
  }; /* getSetting */

  getSettings() {
    var settings = {};
    this.documentSettings.forEach((s) => {
      var obj = this.getSetting(s);
      settings[obj.name] = obj;
    });
    return settings;
  }; /* getSetting */

  /**
   * This method gets called when the text widget child sends an event
   * through EventEmitter.emit().
   */
  getTextWidgetNotification(evt) {
    if (evt.event == "showLinkRouterSelector") {
      this.layout.showLinkRouterSelector = evt.value;
    }
    this.broadcastEvent = evt;
    this.changeDetectorRef.detectChanges(); // forces change detection to run
  }; /* getTextWidgetNotification */

  handleToolbarEvent(evt) {
    switch (evt) {
      case 'change.collection':
        this.openDocumentSelectionModal();
        break;
      case 'export.document.pdf':
        this.textWidgetComponent.exportPDF();
        break;
      default:
        break;
    }
  }

  showTab(tab) {
    if (tab == 'document') {
      this.textWidgetComponent.editorRefresh();
    }
  }; /* showTab */

  updateLinkRouter(routerName) {
    this.textWidgetComponent.updateLinkRouter(routerName)
  }; /* updateLinkRouter */
}
