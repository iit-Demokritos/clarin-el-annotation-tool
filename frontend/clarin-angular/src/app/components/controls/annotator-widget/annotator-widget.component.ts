import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ConfirmDialogData } from 'src/app/models/dialogs/confirm-dialog';
import { ErrorDialogComponent } from '../../dialogs/error-dialog/error-dialog.component';
import { BaseControlComponent } from '../base-control/base-control.component';

@Component({
  selector: 'annotator-widget',
  templateUrl: './annotator-widget.component.html',
  styleUrls: ['./annotator-widget.component.scss']
})
export class AnnotatorWidgetComponent extends BaseControlComponent implements OnInit {

  @ViewChild("element")element:ElementRef;
  layout = {
    showEditorTabs: false,
  };
  annotatorType;
  annotationSchema;
  annotatorsInnerTemplate = "";

  super() { }

  ngOnInit(): void {
    this.TextWidgetAPI.registerAnnotationSchemaCallback(this.updateAnnotatorTemplate.bind(this));
  }

  updateAnnotatorTemplate() {
    this.annotatorType = this.TextWidgetAPI.getAnnotatorType();
    this.annotationSchema = this.TextWidgetAPI.getAnnotationSchema();

    this.annotatorsTemplateService.getTemplate(this.annotatorType, this.annotationSchema)
      .then((annotatorsTemplate:any)=> {
        this.buttonColorService.clearColorCombinations();
        this.coreferenceColorService.clearColorCombinations();

        if (this.annotatorType=="Button Annotator") {
          var foundInCollectionPosition = annotatorsTemplate.indexOf("<table") + 6;

          annotatorsTemplate = annotatorsTemplate.slice(0, foundInCollectionPosition)
            + " found-in-collection"
            + annotatorsTemplate.slice(foundInCollectionPosition);
        }

        this.annotatorsInnerTemplate = ('<div autoslimscroll scroll-subtraction-height="145">' + annotatorsTemplate + '</div>');
        //TODO:Check dynamic compile $compile(elem.contents())(scope);
        // Does the template include Document Attributes?
        if (annotatorsTemplate.indexOf("group-type=\"document_attributes\"") != -1) {
          this.layout.showEditorTabs = true;
        } else {
          this.layout.showEditorTabs = false;
        }

        this.annotationSchemaService.update(this.annotationSchema, this.annotatorType)
          .then((response:any)=> {
            if (!response.success) {
              this.dialog.open(ErrorDialogComponent, { data: new ConfirmDialogData("Error", "Error during the save annotations. Please refresh the page and try again.") })
            }
          }, (error)=> {
            this.dialog.open(ErrorDialogComponent, { data: new ConfirmDialogData("Error", "Database error. Please refresh the page and try again.") })
          });
      });
  }; 
}
