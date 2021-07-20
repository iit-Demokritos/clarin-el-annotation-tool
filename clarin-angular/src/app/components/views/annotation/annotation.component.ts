import { Component, OnInit, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { ConfirmDialogData } from 'src/app/models/dialogs/confirm-dialog';
import { DetectChangesModalComponent } from '../../dialogs/detect-changes-modal/detect-changes-modal.component';
import { DetectOpenDocModalComponent } from '../../dialogs/detect-open-doc-modal/detect-open-doc-modal.component';
import { ErrorDialogComponent } from '../../dialogs/error-dialog/error-dialog.component';
import { SelectDocumentModalComponent } from '../../dialogs/select-document-modal/select-document-modal.component';
import { MainComponent } from '../main/main.component';

@Component({
  selector: 'annotation',
  templateUrl: './annotation.component.html',
  styleUrls: ['./annotation.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AnnotationComponent extends MainComponent implements OnInit {

  super() { }

  ngOnInit(): void {
    this.TextWidgetAPI.initializeCallbacks();
    this.TextWidgetAPI.resetData();
    this.detectOpenDocument();
    //CHECL Widgets $ocLazyLoad.load('annotationWidgets')
  }

  autoSaveIndicator;
  documentSelection = true;
  annotatorType = "No Schema";
  annotationSchema = {};
  sidebarSelector = "annotator";
  maincontentSelector = "document";
  layout = {
    showEditorTabs: true,
  };
  spinnerVisible;
  broadcastEvent = {};

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



  //open the modal in order the user to select a document to annotate
  createDocumentSelectionModal() {
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

            if (typeof (result) != "undefined") {
              this.TextWidgetAPI.disableIsRunning();
              this.TextWidgetAPI.resetCallbacks();

              this.TextWidgetAPI.setAnnotatorType(result.newAnnotator);
              this.TextWidgetAPI.setAnnotationSchemaOptions(result.newAnnotationSchemaOptions);
              this.TextWidgetAPI.setAnnotationSchema(result.newAnnotationSchema);

              this.annotatorType = result.newAnnotator;

              this.TextWidgetAPI.setCurrentCollection(result.newCollection);
              result.newDocument.annotator_id = this.TextWidgetAPI.getAnnotatorTypeId();
              this.TextWidgetAPI.setCurrentDocument(result.newDocument);


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
                  if (typeof (response.resume) != "undefined" && response.resume)
                    //$timeout(function () { $scope.documentSelection = false; }, 800);
                    setTimeout(() => { //<<<---using ()=> syntax
                      this.documentSelection = false;
		      this.annotatorType = this.TextWidgetAPI.getAnnotatorType();
                    }, 800);

                  else
                    this.createDocumentSelectionModal();
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
            data: new ConfirmDialogData("Error", "Database error. Please refresh the page and try again.")
          })
        }
      }, (error) => {
        this.dialog.open(ErrorDialogComponent, {
          data: new ConfirmDialogData("Error", "Database error. Please refresh the page and try again.")
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

  /**
   * This method gets called when the text widget child sends an event
   * through EventEmitter.emit().
   */
  getTextWidgetNotification(evt) {
    this.broadcastEvent = evt;
    this.changeDetectorRef.detectChanges(); // forces change detection to run
  }; /* getTextWidgetNotification */
}
