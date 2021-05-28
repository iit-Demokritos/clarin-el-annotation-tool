import { Component, Input, OnInit } from '@angular/core';
import { ConfirmDialogData } from 'src/app/models/dialogs/confirm-dialog';
import { TextWidgetAPI } from 'src/app/services/text-widget/text-widget.service';
import { DetectChangesModalComponent } from '../../dialogs/detect-changes-modal/detect-changes-modal.component';
import { DetectOpenDocModalComponent } from '../../dialogs/detect-open-doc-modal/detect-open-doc-modal.component';
import { ErrorDialogComponent } from '../../dialogs/error-dialog/error-dialog.component';
import { MainComponent } from '../../views/main/main.component';
import { cloneDeep, findWhere, indexOf, where, contains } from "lodash";
import { BaseControlComponent } from '../base-control/base-control.component';
import { AnnotationComponent } from '../../views/annotation/annotation.component';

@Component({
  selector: 'toolbar-widget',
  templateUrl: './toolbar-widget.component.html',
  styleUrls: ['./toolbar-widget.component.scss']
})
export class ToolbarWidgetComponent extends BaseControlComponent implements OnInit {

  super() { }

  ngOnInit(): void {
    this.TextWidgetAPI.registerCurrentCollectionCallback(this.updateCurrentCollection);
    this.TextWidgetAPI.registerCurrentDocumentCallback(this.updateCurrentDocument);
  }

  @Input() parent:AnnotationComponent;

  selectedDocument = {};
  autoSaveIndicator = false;
  selectedCollectionDocuments;
  selectedCollection;
  selectedCollectionName;

  detectUnsavedChanges(newDocument) {
    var currentDocument: any = this.TextWidgetAPI.getCurrentDocument();

    this.openDocumentService.get(currentDocument.id, currentDocument.annotator_id)
      .then((response: any) => {
        if (response.success && response.data.length > 0) {
          var documentFound = findWhere(response.data, { opened: 1 }); // search if the user has an open document

          if (typeof (documentFound) != "undefined" && documentFound.db_interactions > 0) {
            if (this.autoSaveIndicator) { // auto save functionality enabled
              var AnnotatorTypeId = this.TextWidgetAPI.getAnnotatorTypeId();
              this.restoreAnnotationService.autoSave(currentDocument.collection_id, currentDocument.id, AnnotatorTypeId)
                .then((response: any) => {
                  if (response.success) {
                    newDocument.annotator_id = AnnotatorTypeId;
                    this.TextWidgetAPI.setCurrentDocument(newDocument);
                  } else {
                    this.dialog.open(ErrorDialogComponent, { data: new ConfirmDialogData("Error", "Error during the save annotations. Please refresh the page and try again.") })
                  }
                }, function (error) {
                  this.dialog.open(ErrorDialogComponent, { data: new ConfirmDialogData("Error", "Database error. Please refresh the page and try again.") })
                });
            } else {
              currentDocument.confirmed = documentFound.confirmed;

              //$ocLazyLoad.load('detectOpenDocModalCtrl').then(function () {
              //var detectOpenDocModalInstance = Dialog.custom('detect-open-doc-modal.html', 'detectOpenDocModalCtrl', currentDocument, true, "");
              let dialogRef = this.dialog.open(DetectOpenDocModalComponent, currentDocument);
              dialogRef.afterClosed().subscribe((response) => {
                if (response.success) {
                  newDocument.annotator_id = this.TextWidgetAPI.getAnnotatorTypeId();
                  this.TextWidgetAPI.setCurrentDocument(newDocument);
                } else {
                  this.dialog.open(ErrorDialogComponent, { data: new ConfirmDialogData("Error", "Error during the save annotations. Please refresh the page and try again.") })
                  return false;
                }
              });
            }
          } else {
            newDocument.annotator_id = this.TextWidgetAPI.getAnnotatorTypeId();
            this.TextWidgetAPI.setCurrentDocument(newDocument);
          }
        }
      }, function (error) {
        this.dialog.open(ErrorDialogComponent, { data: new ConfirmDialogData("Error", "Database error. Please refresh the page and try again.") })
      });
  };

  nextDocument = function () {
    if (this.TextWidgetAPI.checkIsRunning())
      return false;

    var index = indexOf(this.selectedCollectionDocuments, this.selectedDocument);
    if (index < this.selectedCollectionDocuments.length - 1)
      this.detectUnsavedChanges(this.selectedCollectionDocuments[index + 1])
  }

  prevDocument() {
    if (this.TextWidgetAPI.checkIsRunning())
      return false;

    var index = this.selectedCollectionDocuments.indexOf(this.selectedDocument);
    if (index > 0)
      this.detectUnsavedChanges(this.selectedCollectionDocuments[index - 1]);
  };

  updateDocumentDropdown(newDocument) {
    this.detectUnsavedChanges(newDocument);
  };


  deleteAnnotation = function () {
    if (this.TextWidgetAPI.checkIsRunning())
      return false;

    var annotationToBeDeleted = this.TextWidgetAPI.getSelectedAnnotation();

    if (Object.keys(annotationToBeDeleted).length > 0 && !this.deleteAnnotationModalInstance) {   //no annotation has been selected open error modal

      let dialogRef = this.dialog.open(ErrorDialogComponent, { data: new ConfirmDialogData("Error", "No annotation has been selected.") })

      dialogRef.afterClosed().subscribe((modalResult) => {
        this.deleteAnnotationModalInstance = null;
      });

      return false;
    } else if (this.deleteAnnotationModalInstance) {         //modal already open, return false
      return false;
    }

    this.tempAnnotationService.destroy(annotationToBeDeleted.collection_id, annotationToBeDeleted.document_id, annotationToBeDeleted._id)
      .then((response: any) => {
        if (!response.success) {
          this.dialog.open(ErrorDialogComponent, { data: new ConfirmDialogData("Error", "Error during the deleting the annotation. Please refresh the page and try again.") })
        } else
          this.TextWidgetAPI.deleteAnnotation(annotationToBeDeleted._id);
      }, (error) => {
        this.dialog.open(ErrorDialogComponent, { data: new ConfirmDialogData("Error", "Error in delete Annotation. Please refresh the page and try again") })
      });
  };

  saveAnnotations() {
    var currentDocument: any = this.TextWidgetAPI.getCurrentDocument();
    var AnnotatorTypeId = this.TextWidgetAPI.getAnnotatorTypeId();

    this.restoreAnnotationService.save(currentDocument.collection_id, currentDocument.id, AnnotatorTypeId)
      .then((response: any) => {
        if (!response.success) {
          this.dialog.open(ErrorDialogComponent, { data: new ConfirmDialogData("Error", "Error during the save annotations. Please refresh the page and try again.") })
        }
      }, (error) => {
        this.dialog.open(ErrorDialogComponent, { data: new ConfirmDialogData("Error", "Database error. Please refresh the page and try again.") })
      });
  };

  deleteTempAnnotations() {
    var currentDocument: any = this.TextWidgetAPI.getCurrentDocument();
    var AnnotatorTypeId = this.TextWidgetAPI.getAnnotatorTypeId();

    this.restoreAnnotationService.discard(currentDocument.collection_id, currentDocument.id, AnnotatorTypeId)     //delete the old annotations of the document*/
      .then((response: any) => {
        if (!response.success) {
          this.dialog.open(ErrorDialogComponent, { data: new ConfirmDialogData("Error", "Error during the saving of your document\'s annotations. Please refresh the page and try again.") })
        }
      }, (error) => {
        this.dialog.open(ErrorDialogComponent, { data: new ConfirmDialogData("Error", "Database error. Please refresh the page and try again.") })
      });
  };

  updateCurrentCollection() {
    var newCollection: any = this.TextWidgetAPI.getCurrentCollection();
    if (Object.keys(newCollection).length > 0) {
      this.selectedCollection = cloneDeep(newCollection);
      this.selectedCollectionName = cloneDeep(newCollection.name);
      this.selectedCollectionDocuments = cloneDeep(newCollection.children);
    }
  };

  updateCurrentDocument() {
    var newDocument:any = this.TextWidgetAPI.getCurrentDocument();

    if (Object.keys(newDocument).length > 0)
      this.selectedDocument = where(this.selectedCollectionDocuments, { id: newDocument.id })[0];
  };

  /*TODO: Check those event handlers


link: function (scope, elem, attrs) {
var keyUpHandler = function (e) {
  if (e.which == 46)
    scope.deleteAnnotation();
};

$(document).on('keyup', keyUpHandler); // register keyup listener
scope.$on('$destroy', function () { $(document).off('keyup', keyUpHandler); }); // delete keyup listener
}*/

}
