import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MainComponent } from '@components/views/main/main.component';
import { TextWidgetIsolatedComponent } from '@components/controls/text-widget-isolated/text-widget-isolated.component';
import { Collection } from 'src/app/models/collection';
import { Document }   from 'src/app/models/document';
import { Annotation } from 'src/app/models/annotation';

@Component({
  selector: 'app-visualise-annotation',
  templateUrl: './visualise-annotation.component.html',
  styleUrls: ['./visualise-annotation.component.scss']
})
export class VisualiseAnnotationComponent extends MainComponent implements OnInit, AfterViewInit {

  annotation_id: string;
  @ViewChild(TextWidgetIsolatedComponent)
  private textWidgetComponent!: TextWidgetIsolatedComponent;
  /* Variable for isolated TextWidgetAPI of textWidgetComponent */
  private TWA;

  collection: Collection;
  collectionName: string = "";
  annotationsInEditor = [];
  documentInEditor: Document;
  documentName: string = "";
  selectedAnnotation: Annotation;

  footer_caret_show      = false;
  footer_caret_line      = "";
  footer_caret_column    = "";
  footer_caret_offset    = "";
  footer_caret_selection = "[]";

  super() { }

  ngOnInit(): void {
    /* Have we got any parameters? */
    var id = this.activatedRoute.snapshot.paramMap.get('id');
    this.annotation_id = id;
  }; /* ngOnInit */

  ngAfterViewInit(): void {
    this.TWA = this.textWidgetComponent.TextWidgetAPI;
    this.textWidgetComponent.editor.on("cursorActivity", () => {
      this.getCaret();
    });
    //this.textWidgetComponent.editorRefresh();
    //this.textWidgetComponent.overlayRefresh();

    if (this.annotation_id) {
        this.annotationService.getVisualisationData(this.annotation_id)
        .then((response) => {
          // console.error(response);
          this.collection = response.data.collection;
          this.collectionName = this.collection.name;
          this.documentName = response.data.document.name;
          this.onApply(response.data.document, response.data.annotation);
        }, (error) => {
          console.error(error);
        });
    }
  }; /* ngAfterViewInit */

  getCaret() {
    if (this.textWidgetComponent) {
      let cursor    = this.textWidgetComponent.editor.getCursor();
      let selection = this.textWidgetComponent.getSelectionInfo();
      this.footer_caret_line = cursor.line + 1;
      this.footer_caret_column = cursor.ch;
      this.footer_caret_offset = this.textWidgetComponent.editor.indexFromPos(cursor);
      if (selection.segment) {
        this.footer_caret_selection = "["+selection.startOffset+":"+selection.endOffset+"]";
      } else {
        this.footer_caret_selection = "[]";
      }
      this.footer_caret_show = true;
    }
  }

  onUpdate() {
    if (this.documentInEditor) {
      if (typeof this.documentInEditor.visualisation_options == "string") {
        this.documentInEditor.visualisation_options = JSON.parse(this.documentInEditor.visualisation_options);
      }
      this.textWidgetComponent.initialiseEditor(this.documentInEditor,
                                                this.documentInEditor.visualisation_options);
    } else {
      this.textWidgetComponent.initialiseEditor({type: "text", text: ""}, {});
    }
    setTimeout(() => {
      this.textWidgetComponent.editorRefresh()
      this.textWidgetComponent.overlayRefresh();
    }, 0.1);
    this.clearAnnotations();
    if (this.selectedAnnotation) {
      this.addAnnotation(this.selectedAnnotation);
      this.selectAnnotation(this.selectedAnnotation);
    }
  }; /* onUpdate */

  onApply(doc: Document, ann: Annotation) {
    this.documentInEditor = doc;
    this.selectedAnnotation = ann;
    this.onUpdate();
  }; /* onApply */

  addAnnotation(ann) {
    this.TWA.addAnnotation(ann, false);
    this.annotationsInEditor.push(ann);
    setTimeout(() => {
      this.textWidgetComponent.editorRefresh()
      this.textWidgetComponent.overlayRefresh();
    }, 0.1);
    return ann;
  }; /* addAnnotation */

  selectAnnotation(ann) {
    this.TWA.setSelectedAnnotation(ann);
    setTimeout(() => {
      this.textWidgetComponent.editorRefresh()
      this.textWidgetComponent.overlayRefresh();
    }, 0.1);
    setTimeout(() => {
      this.textWidgetComponent.scrollToAnnotation(ann);
    }, 0.1);
  }; /* selectAnnotation */

  clearAnnotations() {
    this.textWidgetComponent.removeAnnotationsFromEditor(this.annotationsInEditor);
    this.annotationsInEditor = [];
  }; /* clearAnnotations */
}
