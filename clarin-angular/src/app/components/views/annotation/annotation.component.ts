import { Component, OnInit } from '@angular/core';
import { ConfirmDialogData } from 'src/app/models/dialogs/confirm-dialog';
import { DetectChangesModalComponent } from '../../dialogs/detect-changes-modal/detect-changes-modal.component';
import { DetectOpenDocModalComponent } from '../../dialogs/detect-open-doc-modal/detect-open-doc-modal.component';
import { ErrorDialogComponent } from '../../dialogs/error-dialog/error-dialog.component';
import { SelectDocumentModalComponent } from '../../dialogs/select-document-modal/select-document-modal.component';
import { MainComponent } from '../main/main.component';
import * as _ from 'lodash';

@Component({
  selector: 'annotation',
  templateUrl: './annotation.component.html',
  styleUrls: ['./annotation.component.scss']
})
export class AnnotationComponent extends MainComponent implements OnInit {

  super() { }

  ngOnInit(): void {
    this.TextWidgetAPI.initializeCallbacks();
    this.detectOpenDocument();
    //CHECL Widgets $ocLazyLoad.load('annotationWidgets')
  }

  autoSaveIndicator;
  documentSelection = true;
  annotatorType = "";
  annotationSchema = {};
  sidebarSelector = "annotator";
  maincontentSelector = "document";
  layout = {
    showEditorTabs: false,
  };
  spinnerVisible;

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



  createDocumentSelectionModal() {            //open the modal in order the user to select a document to annotate
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

          var dialogRef = this.dialog.open(SelectDocumentModalComponent, { data: inputData });

          //this.selectDocumentModalInstance = Dialog.custom('select-document-modal.html', 'selectDocumentModalCtrl', inputData, false, "document-selector"); // animated fadeIn
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


              setTimeout(() => {                           //<<<---using ()=> syntax
                this.documentSelection = false;
              }, 800);
            }
          });
        } else {
          this.TextWidgetAPI.disableIsRunning();
          this.dialog.open(ErrorDialogComponent, { data: new ConfirmDialogData("Error", "Error during the restoring of your documents. Please refresh the page and try again.") })
        }
      });
  };

  detectUnsavedChanges() { //function to detect unsaved changes before leaving the current document
    var currentDocument: any = this.TextWidgetAPI.getCurrentDocument();

    this.openDocumentService.get(currentDocument.id, currentDocument.annotator_id)
      .then((response: any) => {
        if (response.success && response.data.length > 0) {
          var documentFound = _.findWhere(response.data, { opened: 1 });  //search if the user has an open document         

          if (typeof (documentFound) != "undefined" && documentFound.db_interactions > 0) {                //if changes have been done on the document
            if (this.autoSaveIndicator) {                            //auto save functionality enabled
              var AnnotatorTypeId = this.TextWidgetAPI.getAnnotatorTypeId();
              this.restoreAnnotationService.autoSave(currentDocument.collection_id, currentDocument.id, AnnotatorTypeId)
                .then((response: any) => {
                  if (response.success) {
                    this.createDocumentSelectionModal();
                    this.documentSelection = true;
                  } else {
                    this.dialog.open(ErrorDialogComponent, { data: new ConfirmDialogData("Error", "Error during the save annotations. Please refresh the page and try again.") })
                  }
                }, (error) => {
                  this.dialog.open(ErrorDialogComponent, { data: new ConfirmDialogData("Error", "Database error. Please refresh the page and try again.") })
                });
            } else {
              //$ocLazyLoad.load('detectOpenDocModalCtrl').then(function () {
              //var detectOpenDocModalInstance = Dialog.custom('detect-open-doc-modal.html', 'detectOpenDocModalCtrl', currentDocument, true, "");

              let dialogRef = this.dialog.open(DetectOpenDocModalComponent, {data:currentDocument});

              dialogRef.afterClosed().subscribe((response) => {
                if (response.success) {
                  this.createDocumentSelectionModal();
                  this.documentSelection = true;
                } else {
                  this.dialog.open(ErrorDialogComponent, { data: new ConfirmDialogData("Error", "Database error. Please refresh the page and try again.") })
                }

              });
            }
          } else {
            this.createDocumentSelectionModal();
            this.documentSelection = true;
          }
        }
      },(error)=> {
        this.dialog.open(ErrorDialogComponent, { data: new ConfirmDialogData("Error", "Database error. Please refresh the page and try again.") })
      });
  }

  detectOpenDocument() {                                //function to detect if the user has left any document open in the database
    this.openDocumentService.getAll()
      .then((response:any) => {
        if (response.success && response.data.length > 0) {
          var documentFound = _.findWhere(response.data, { opened: 1 });                                //search if the user has an open document 

          if (typeof (documentFound) != "undefined") {                                                    //user has left a document opened
            if (_.where(response.data, { document_id: documentFound.document_id }).length == 1 && (documentFound.db_interactions == 0 || documentFound.confirmed == 1)) {         //document has been opened only from the current user & no db_interactions have occurred    
              this.tempAnnotationService.destroy(documentFound.collection_id, documentFound.document_id, null)
                .then((response)=> {
                  this.createDocumentSelectionModal();
                }, (error)=> {
                  this.dialog.open(ErrorDialogComponent, { data: new ConfirmDialogData("Error", "Database error. Please refresh the page and try again.") })
                });
            } else if (!documentFound.confirmed && documentFound.db_interactions > 0) {                //document not shared and db_interactions > 0, open modal informing users about the work in proggress
              //$ocLazyLoad.load('detectChangesModalCtrl').then(function () {
                //var detectChangesModalInstance = Dialog.custom('detect-changes-modal.html', 'detectChangesModalCtrl', documentFound, true, "");

                var dialogRef = this.dialog.open(DetectChangesModalComponent,{data:documentFound});
                dialogRef.afterClosed().subscribe((response:any)=> {
                  if (response.success) {
                    if (typeof(response.resume) != "undefined" && response.resume)
                      //$timeout(function () { $scope.documentSelection = false; }, 800);
                      setTimeout(()=>{                           //<<<---using ()=> syntax
                        this.documentSelection = false;
                   }, 800);

                    else
                      this.createDocumentSelectionModal();
                  } else {
                    this.dialog.open(ErrorDialogComponent, { data: new ConfirmDialogData("Error", "Error during the restoration of your annotations. Please refresh the page and try again.") })
                  }
                },(error)=> {
                  this.dialog.open(ErrorDialogComponent, { data: new ConfirmDialogData("Error", "Database error. Please refresh the page and try again.") })
                });
              //});
            } else
              this.createDocumentSelectionModal();
          } else                                    //user has a document open
            this.createDocumentSelectionModal();
        } else if (response.success) {
          this.createDocumentSelectionModal();
        } else {
          this.dialog.open(ErrorDialogComponent, { data: new ConfirmDialogData("Error", "Database error. Please refresh the page and try again.") })
        }
      }, (error)=> {
        this.dialog.open(ErrorDialogComponent, { data: new ConfirmDialogData("Error", "Database error. Please refresh the page and try again.") })
      });
  };

  openDocumentSelectionModal () {
    if (this.TextWidgetAPI.checkIsRunning()) {
      alert('running');
      return false;
    }

    this.detectUnsavedChanges();
  };

}
