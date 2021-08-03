import { Component, OnInit, ViewChild, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { ConfirmDialogData } from 'src/app/models/dialogs/confirm-dialog';
import { DetectChangesModalComponent } from '../../dialogs/detect-changes-modal/detect-changes-modal.component';
import { DetectOpenDocModalComponent } from '../../dialogs/detect-open-doc-modal/detect-open-doc-modal.component';
import { ErrorDialogComponent } from '../../dialogs/error-dialog/error-dialog.component';
import { SelectDocumentModalComponent } from '../../dialogs/select-document-modal/select-document-modal.component';
import { MainComponent } from '../main/main.component';
import { TextWidgetComponent } from '../../controls/text-widget/text-widget.component';
import { ThemePalette } from '@angular/material/core';
import { Setting } from 'src/app/models/services/setting';
import { User } from '@core/authentication/interface';

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

  ngOnInit(): void {
    this.TextWidgetAPI.settingsComplianceFields = ['created_by', 'updated_by'];
    this.TextWidgetAPI.initializeCallbacks();
    this.TextWidgetAPI.resetData();
    this.detectOpenDocument();
    //CHECK Widgets $ocLazyLoad.load('annotationWidgets')
    this.authService.user().subscribe(user => (this.user = user));
    /* WARNING: annotation ids must be created the same way as in
     * components, which inherit BaseControlComponent
     * (app/components/controls/base-control/base-control.component.ts). */
    this.ObjectID = require("bson-objectid");
  }

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
  };
  spinnerVisible;
  broadcastEvent = {};

  owners = new Set();
  updaters = new Set();
  ownersList = [];
  updatersList = [];
  collectionSettings: Setting[] = [
    {name: "Readonly", value: "readonly", type: "checkbox",
     checked: false, allChecked: false, color: "accent"},
    {name: "Annotation Completed", value: "completed", type: "checkbox",
     checked: false, allChecked: false, color: "accent"}
  ];
  documentSettings:   Setting[] = [
    {name: "Readonly", value: "readonly", type: "checkbox",
     checked: false, allChecked: false, color: "accent"},
    {name: "Annotation Completed", value: "completed", type: "checkbox",
     checked: false, allChecked: false, color: "accent"},
    {name: "Show Annotations owned by:", value: "created_by", type: "checkbox",
     checked: false, allChecked: false, color: "accent", subsettings: this.ownersList},
    {name: "Show Annotations updated by:", value: "updated_by", type: "checkbox",
     checked: false, allChecked: false, color: "accent", subsettings: this.updatersList}
  ];
  user: User;
  skipAnnotationsUpdates = false;

  //TODO: CHECK STATE CHANGE EVENT SUBSC.
  /*$on('$stateChangeStart', function (event) {        //close document selection modal instance when user change page
      console.log('closing modal');
      //$scope.documentSelection = true;
      //detectUnsavedChanges();
      //event.preventDefault();

      if (typeof($scope.selectDocumentModalInstance) == "undefined" && this.selectDocumentModalInstance.opened) {
        $scope.selectDocumentModalInstance.close();
        this.TextWidgetAPI.disableIsRunning();
        //detectUnsavedChanges();
      }
    });

    $scope.$on("$destroy", function () {
      if (!angular.isUndefined($scope.selectDocumentModalInstance) && $scope.selectDocumentModalInstance.opened) {
        $scope.selectDocumentModalInstance.close();
        this.TextWidgetAPI.disableIsRunning();
      }
    });
    $scope.$on('selectDocument', function(event) {
      $scope.documentSelection = true;
      createDocumentSelectionModal();
      this.TextWidgetAPI.resetData();
    });*/

  ObjectId() {
    return this.ObjectID();
  }

  //open the modal in order the user to select a document to annotate
  createDocumentSelectionModal() {
     this.documentSelected = false;
    if (!this.TextWidgetAPI.checkIsRunning())
      this.TextWidgetAPI.enableIsRunning();
    else
      return false;

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
              this.TextWidgetAPI.disableIsRunning();
              this.TextWidgetAPI.resetCallbacks();

              this.TextWidgetAPI.setAnnotatorType(result.newAnnotator);
              this.TextWidgetAPI.setAnnotationSchemaOptions(result.newAnnotationSchemaOptions);
              this.TextWidgetAPI.setAnnotationSchema(result.newAnnotationSchema);

              this.annotatorType = result.newAnnotator;

              this.TextWidgetAPI.setCurrentCollection(result.newCollection);
              result.newDocument.annotator_id = this.TextWidgetAPI.getAnnotatorTypeId();
              this.TextWidgetAPI.setCurrentDocument(result.newDocument);
              this.documentSelected = true;
              this.TextWidgetAPI.registerAnnotationsCallback(this.updateAnnotationList.bind(this));

              setTimeout(() => { //<<<---using ()=> syntax
                this.documentSelection = false;
              }, 800);
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

  //function to detect if the user has left any document open in the database
  detectOpenDocument() {
    this.openDocumentService.getAll()
      .then((response: any) => {
        //search if the user has an open document 
        if (response.success && response.data.length > 0) {
          // var documentFound = _.findWhere(response.data, { opened: 1 });
          var documentFound = response.data.find(doc => doc.opened === 1);

          //user has left a document opened
          if (typeof (documentFound) != "undefined") {
            //document has been opened only from the current user & no db_interactions have occurred    
            // if (_.where(response.data, {document_id: documentFound.document_id}).length == 1
            if (response.data.filter(doc => doc.document_id === documentFound.document_id).length == 1
                && (documentFound.db_interactions == 0 || documentFound.confirmed == 1)) {
              this.tempAnnotationService.destroy(documentFound.collection_id, documentFound.document_id, null)
                .then((response) => {
                  this.createDocumentSelectionModal();
                }, (error) => {
                  this.dialog.open(ErrorDialogComponent, {
                    data: new ConfirmDialogData("Error", "Database error. Please refresh the page and try again.")
                  })
                });
            } else if (!documentFound.confirmed && documentFound.db_interactions > 0) {
              //document not shared and db_interactions > 0, open modal informing users about the work in proggress
              //$ocLazyLoad.load('detectChangesModalCtrl').then(function () {
              //var detectChangesModalInstance = Dialog.custom('detect-changes-modal.html', 'detectChangesModalCtrl', documentFound, true, "");

              var dialogRef = this.dialog.open(DetectChangesModalComponent, { data: documentFound, disableClose: true });
              dialogRef.afterClosed().subscribe((response: any) => {
                if (response.success) {
                  if (typeof (response.resume) != "undefined" && response.resume) {
                    this.documentSelected = true;
                    this.TextWidgetAPI.registerAnnotationsCallback(this.updateAnnotationList.bind(this));
                    //$timeout(function () { $scope.documentSelection = false; }, 800);
                    setTimeout(() => { //<<<---using ()=> syntax
                      this.documentSelection = false;
                      this.annotatorType = this.TextWidgetAPI.getAnnotatorType();
                    }, 800);

                  } else {
                    this.createDocumentSelectionModal();
                  }
                } else {
                  this.dialog.open(ErrorDialogComponent, {
                    data: new ConfirmDialogData("Error", "Error during the restoration of your annotations. Please refresh the page and try again.")
                  })
                }
              }, (error) => {
                this.dialog.open(ErrorDialogComponent, {
                  data: new ConfirmDialogData("Error", "Database error. Please refresh the page and try again.")
                })
              });
              //});
            } else
              this.createDocumentSelectionModal();
          } else {
            //user has a document open
            this.createDocumentSelectionModal();
          }
        } else if (response.success) {
          this.createDocumentSelectionModal();
        } else {
          this.dialog.open(ErrorDialogComponent, {
            data: new ConfirmDialogData("Error",
              "Database error. Please refresh the page and try again.")
          })
        }
      }, (error) => {
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
  updateAllChecked(setting:Setting, collectionSetting:boolean = false) {
    // console.error("Clicked on:", setting);
    setting.allChecked = setting.subsettings != null && setting.subsettings.every(t => t.checked);
    this.updateAnnotation(setting, collectionSetting);
  }

  someChecked(setting:Setting, collectionSetting:boolean = false): boolean {
    if (setting.subsettings == null) {
      return false;
    }
    return setting.subsettings.filter(t => t.checked).length > 0 && !setting.allChecked;
  }

  setAll(setting:Setting, checked: boolean, collectionSetting:boolean = false) {
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
  async updateAnnotation(s:Setting, collectionSetting:boolean = false) {
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
              "Error in update Annotation. Please refresh the page and try again") });
        }
      } catch (error) {
        console.error("AnnotationComponent: updateAnnotation():", error);
        this.skipAnnotationsUpdates = false;
        this.dialog.open(ErrorDialogComponent, {
          data: new ConfirmDialogData("Error",
            "Database error. Please refresh the page and try again.") });
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
             "Error during saving your annotation. Please refresh the page and try again.") });
        }
      } catch (error) {
        console.error("AnnotationComponent: updateAnnotation():", error);
        this.skipAnnotationsUpdates = false;
        this.dialog.open(ErrorDialogComponent, {
          data: new ConfirmDialogData("Error",
            "Database error. Please refresh the page and try again.") });
      }
    }
  }; /* updateAnnotation */

  updateAnnotationList() {
    // console.error("updateAnnotationList():", this.TextWidgetAPI.getAnnotations());
    if (this.skipAnnotationsUpdates) {return;}
    var anns = this.TextWidgetAPI.getAnnotations();
    this.owners.clear();
    this.updaters.clear();
    this.ownersList = [];
    this.updatersList = [];
    if (anns.length < 1) {return;}
    // console.error("AUTH: user:", this.user);
    // Identify all annotation owners...
    anns.forEach((ann) => {
      if ("created_by" in ann) {
        this.owners.add(ann['created_by']);
      }
      if ("updated_by" in ann) {
        this.updaters.add(ann['created_by']);
      }
    });
    this.owners.forEach((owner) => {
      this.ownersList.push({name: owner, value: owner, type: "checkbox",
        checked: false, allChecked: false, color: "accent"});
    });
    this.updaters.forEach((updater) => {
      this.updatersList.push({name: updater, value: updater, type: "checkbox",
        checked: false, allChecked: false, color: "accent"});
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

  getSetting(s:Setting) {
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
}
