import {
  Component, ViewChild, ElementRef, EventEmitter,
  OnDestroy, OnInit, AfterViewInit, Output, ViewEncapsulation
} from '@angular/core';
import * as CodeMirror from 'codemirror';
import * as joint from 'jointjs';
import * as _ from 'lodash';
import { ConfirmDialogData } from 'src/app/models/dialogs/confirm-dialog';
import { ErrorDialogComponent } from '../../dialogs/error-dialog/error-dialog.component';
import { BaseControlComponent } from '../base-control/base-control.component';
import * as ShapeControl from 'src/app/helpers/jointjsControls';
//import 'codemirror/addon/display/panel.js';
//import { addPanel } from 'codemirror/addon/display/panel' // <- Does not work!
// var blobStream = require('blob-stream');
//
/*
 * Annotation Mode...
 */
enum AnnotationMode {
  UNKNOWN,
  TEXT,
  IMAGE
};

@Component({
  selector: 'text-widget',
  templateUrl: './text-widget.component.html',
  styleUrls: ['./text-widget.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TextWidgetComponent extends BaseControlComponent
  implements OnInit, OnDestroy, AfterViewInit {

  /* References to DOM elements... */
  @ViewChild("annotationeditortextwidgetcontainer")
  mainContent: ElementRef;
  @ViewChild("annotationeditortextwidget")
  textWidget: ElementRef;
  @ViewChild("annotationeditortextwidgetoverlay")
  textWidgetOverlay: ElementRef;
  @ViewChild("annotationeditorimagewidget")
  imageWidget: ElementRef;


  /* @ViewChild("annotationeditortextwidget", { static: true }) */
  @Output() textWidgetEvent: EventEmitter<any> = new EventEmitter();
  editor: CodeMirror.EditorFromTextArea;
  skipLineNumber = {};
  paper;

  routerName = "direct";
  connector  = "rounded";
  routerOptions = {
    direct: { step: 20 },
    smooth: { step: 20 },
    manhattan: {
      step: 20,
      //excludeTypes: ['joint.shapes.standard.Polygon'],
      startDirections: ['top'],
      endDirections: ['bottom']
    },
    metro: {
      step: 20,
      //excludeTypes: ['joint.shapes.standard.Polygon'],
      startDirections: ['top'],
      endDirections: ['bottom']
    }
  };
  routerGAP = 60;

  graph = new joint.dia.Graph;

  // Variable controlling whether the spinner is visible...
  //spinnerVisible = false;

  // Annotator Type Id (class + values)
  AnnotatorTypeId = "";

  // Class names to add to annotated text
  markedTextClass = " annotated-text";

  // List of connected annotation arrows
  connectedAnnotations = [];
  annotationIdToGraphItem = {};
  showLinkRouterSelector = false;
  linkVisibility = 'visible';

  // Get the local coordinates of the first character in the editor...
  textWidgetLines: any;
  textarea;
  gutter;

  // Resize observer for refreshing overlay when codemirror changes...
  resizeObserver: any;

  // Keeps the list of panels in the editor...
  // panels    = {};
  // numPanels = 0;

  // initialLoad: boolean = false;

  // Settings
  settings: any[] = [];

  eAnnotationMode = AnnotationMode; // Make AnnotationMode enum available in the HTML template
  annotationMode: AnnotationMode = AnnotationMode.UNKNOWN;
  annotationImageURL: string = null;

  ngOnInit() {

  }

  ngAfterViewInit() {
    //comment this
    //this.textarea = this.element.nativeElement;

    // this.mainContent = document.getElementsByClassName("main-content")[0];
    // this.textWidget = document.getElementById("annotation-editor-text-widget");
    // this.textWidgetOverlay =
    //  document.getElementById('annotation-editor-text-widget-overlay');
    // this.editor = CodeMirror.fromTextArea(this.element.nativeElement, {
    this.editor = CodeMirror.fromTextArea(this.textWidget.nativeElement, {
      lineNumbers: true,
      firstLineNumber: 1,
      dragDrop: false,
      readOnly: true,
      /*theme: "night",*/
      direction: "ltr",
      lineWrapping: true,
      autofocus: false,
      cursorBlinkRate: -1,
      viewportMargin: Infinity,
      scrollbarStyle: "native",
      extraKeys: {}
    });

    this.textarea = this.editor.getWrapperElement();
    this.gutter = this.editor.getGutterElement();
    //this.textWidgetLines = document.getElementsByClassName("CodeMirror-lines")[0];
    this.textWidgetLines = this.textarea.getElementsByClassName("CodeMirror-lines")[0];

    this.paper = new joint.dia.Paper({
      el: this.textWidgetOverlay.nativeElement,
      model: this.graph,
      width: "100%",
      height: "100%",
      gridSize: 1,
      restrictTranslate: true,
      snapLabels: true,
      interactive: (view) => {
        return {
          linkMove: false,
          labelMove: true,
          arrowheadMove: false,
          vertexMove: false,
          vertexAdd: false,
          vertexRemove: false,
          useLinkTools: false,
          elementMove: view.model.get('elementMove'),
          // stopDelegation: view.model.get('stopDelegation')
        };
      }
    });
    // Set an event on lines pointer clicks...
    this.paper.on('link:pointerup', (elementView, evt, x, y) => {
      evt.stopPropagation();
      // evt.stopImmediatePropagation();
      var currentElement = elementView.model;
      if (!("annotation_id" in currentElement)) return;
      var annotation = this.TextWidgetAPI.getAnnotationById(currentElement.annotation_id);
      if (typeof (annotation) == "undefined") return;
      // Set this annotation as the selected one
      this.TextWidgetAPI.setSelectedAnnotation(annotation);
      this.TextWidgetAPI.clearOverlappingAreas(); // not sure if required...
    });

    // Allow mouse to create a selection rectangle...
    this.paper.on({
      'blank:pointerdown':    (evt, x, y)              => this.imageOverlayPointerDown(evt, x, y),
      'blank:pointermove':    (evt, x, y)              => this.imageOverlayPointerMove(evt, x, y),
      'blank:pointerup':      (evt, x, y)              => this.imageOverlayPointerUp(evt, x, y),
      'element:pointerclick': (elementView, evt, x, y) => this.imageOverlayElementPointerClick(elementView, evt, x, y),
      'element:mouseenter':   (elementView)            => this.imageOverlayElementMouseEnter(elementView),
      'element:mouseleave':   (elementView)            => this.imageOverlayCellMouseLeave(elementView)
    });

    /* this segment exist in text-widget.js- transformation needed
     * TODO: FIX
        // When the editor is resized (by dragging the ui-layout-container line)
        // refresh the editor so that text selection works normally.
        scope.$on('ui.layout.resize', function (e, beforeContainer, afterContainer) {
          console.warn("text-widget: ui.layout.resize");
          editor.refresh();
          // overlayRefresh();
        });

        scope.$on('ui.layout.loaded', function (evt, id) {
          console.warn("text-widget: ui.layout.loaded", id);
        });

    */

    // console.error("TextWidgetComponent: ngOnInit(): Setting CodeMirror mouse events on:", this.mainContent);
    CodeMirror.on(this.mainContent.nativeElement, "mouseup", (...e) => { this.mouseUpHandler(e) });
    CodeMirror.on(this.mainContent.nativeElement, "mousedown", (...e) => { this.mouseDownUpHandler(e) });
    // console.error("TextWidgetComponent: ngOnInit(): Setting CodeMirror extra keys on:", this.editor);
    this.editor.setOption("extraKeys", {
      Delete: (...e) => { this.deleteSelectedAnnotation(e); },
      Space:  (...e) => { this.editor.refresh(); },
    });
    this.editor.on("refresh", () => {
      this.overlayRefresh();
    });
    // create an Observer instance
    this.resizeObserver = new ResizeObserver((entries) => {
      this.overlayRefresh();
      // const height = entries[0].target.clientHeight;
      // console.error("div.CodeMirror.CodeMirror-wrap height changed:", height);
    });
    this.TextWidgetAPI.registerCurrentDocumentCallback(this.updateCurrentDocument.bind(this));
    this.TextWidgetAPI.registerCurrentSelectionCallback(this.updateCurrentSelection.bind(this));
    this.TextWidgetAPI.registerNewAnnotationsCallback(this.addNewAnnotations.bind(this));
    this.TextWidgetAPI.registerDeletedAnnotationsCallback(this.deleteAnnotations.bind(this));
    this.TextWidgetAPI.registerScrollIntoViewCallback(this.scrollToAnnotation.bind(this));
    this.TextWidgetAPI.registerSettingsCallback(this.updateSettings.bind(this));
    // var codeMirror = document.querySelector("div.CodeMirror.CodeMirror-wrap");
    this.resizeObserver.observe(this.textarea);
  }; /* ngAfterViewInit */

  ngOnDestroy() {
    this.resizeObserver.disconnect();
    // instead of scope.$on("$destroy",function(){})-new lines
    this.graph.clear()
    this.editor.off('refresh', this.overlayRefresh);
    this.editor.toTextArea()
  } /* ngOnDestroy */

  /* Codemirror panels unused...
  makePanel(where) {
    var node = document.createElement("div");
    var id = ++this.numPanels;
    var widget, close, label;

    node.id = "panel-" + id;
    node.className = "panel " + where;
    close = node.appendChild(document.createElement("a"));
    close.setAttribute("title", "Remove me!");
    close.setAttribute("class", "remove-panel");
    close.textContent = "✖";
    CodeMirror.on(close, "mousedown", (e) => {
      e.preventDefault()
      this.panels[node.id].clear();
    });
    label = node.appendChild(document.createElement("span"));
    label.textContent = "Panel n° " + id;
    return node;
  }

  addPanel(where) {
    var node = this.makePanel(where);
    this.panels[node.id] = this.editor.addPanel(node, {position: where, stable: true});
  }

  initPanels() {
    // Add a panel...
    this.addPanel("bottom");
  }; /* initPanels */

  editorRefresh() {
    this.editor.refresh();
  }; /* editorRefresh */


  // When the editor is resized (by dragging the ui-layout-container line)
  // refresh the editor so that text selection works normally.
  //scope.$on('ui.layout.resize', function (e, beforeContainer, afterContainer) {
  //  console.warn("text-widget: ui.layout.resize");
  //  editor.refresh();
  // overlayRefresh();
  //});

  //scope.$on('ui.layout.loaded', function (evt, id) {
  //  console.warn("text-widget: ui.layout.loaded", id);
  //});
  //}

  getSelectionInfo() {
    // var start = 0, end = 0;
    var selection = {
      type: "",
      // Field used for text annotation...
      startOffset: -1,
      endOffset: -1,
      segment: "",
      // Fields used for image annotation (bbox)...
      x: -1,
      y: -1,
      width: -1,
      height: -1,
      rotation: 0,
    };

    switch (this.annotationMode) {
      case AnnotationMode.TEXT:
        // var totalDocLines     = editor.lineCount();
        var editorSelectionStart = this.editor.getCursor("from");
        var editorSelectionEnd   = this.editor.getCursor("to");
        // var editorSegment     = editor.getSelection();

        if (typeof (editorSelectionStart) != "undefined" &&
            typeof (editorSelectionEnd)   != "undefined") {
          /* Petasis, 20/03/2021: Used codemirror functions for getting offsets... */
          selection.startOffset = this.editor.indexFromPos(editorSelectionStart);
          selection.endOffset   = this.editor.indexFromPos(editorSelectionEnd);
          selection.segment     = this.editor.getSelection();
        }
        break;
      case AnnotationMode.IMAGE:
        // Do we have a selection?
        if (this.imageAnnotator.selection !== undefined) {
          const { width, height } = this.imageAnnotator.selection.size();
          const { x, y }          = this.imageAnnotator.selection.position();
          const angle             = this.imageAnnotator.selection.angle();
          selection.type          = "rect";
          selection.x             = x;
          selection.y             = y;
          selection.width         = width;
          selection.height        = height;
          selection.rotation      = ((angle) ? angle : 0);
        }
        break;
    }
    return selection;
  }; /* getSelectionInfo */

  computeSelectionFromOffsets(startOffset, endOffset) {
    return {
      start: this.editor.posFromIndex(startOffset),
      end: this.editor.posFromIndex(endOffset)
    }
  }; /* computeSelectionFromOffsets */

  /**
   * Given a codemirror mark, it returns the associated annotation.
   */
  getAnnotationFromMark(mark) {
    var annotationId = mark.className;
    annotationId = annotationId.split(" ")[0].substr(3); // remove "id-" prefix...
    // console.error("TextWidgetComponent: getAnnotationFromMark():", mark, annotationId, this.TextWidgetAPI.getAnnotationById(annotationId));
    // Get the selected annotation from its ID
    return this.TextWidgetAPI.getAnnotationById(annotationId);
  }; /* getAnnotationFromMark */

  mouseDownUpHandler(args) {
    if (this.annotationMode != AnnotationMode.TEXT) {
      return;
    }
    var e = args[0];
    if (e.button === 1) { // middle button click
      e.preventDefault();
      return false;
    }
  }; /* mouseDownUpHandler */

  mouseUpHandler(args) {
    var e = args[0];
    // console.error("TextWidgetComponent: mouseUpHandler:", e);
    if (this.annotationMode != AnnotationMode.TEXT) {
      // When annotation images, selection is handled in methods imageOverlayPointerDown(),
      // imageOverlayPointerMove(), imageOverlayPointerUp()...
      return;
    }

    // if (!this.initialLoad) {
    //   this.initialLoad = true;
    // }

    // left button click
    if (e.button === 0) {
      var selection = this.getSelectionInfo();
      // console.error("TextWidgetComponent: mouseUpHandler(): MOUSE 1:", selection, e);

      if (Object.keys(selection).length > 0) {
        this.TextWidgetAPI.setCurrentSelection(selection, false);
        this.TextWidgetAPI.clearSelectedAnnotation();

        if (selection.segment == "") { //point selection
          var annotationId = null;

          // Regular mark selection, use CodeMirror's api,
          // transform selection from absolute to cm format
          var editorSelection = this.computeSelectionFromOffsets(
            selection.startOffset, selection.startOffset);
          // find available marks at the position of the cursor
          var availableMarksOnCursor = this.editor.findMarksAt(
            editorSelection.start);
          var availableAnnotationsLength = availableMarksOnCursor.length;
          if (availableAnnotationsLength > 0) {
            // Petasis, 14/07/2021: Find the annotation with the smallest segment...
            var availableAnnotationsOnCursor = availableMarksOnCursor.map((a) => this.getAnnotationFromMark(a));
            // Petasis, 05/05/2022: Make sure that marks not related to annotations
            // (i.e. marks for formatting) are filtered out...
            availableAnnotationsOnCursor = availableAnnotationsOnCursor.filter((element) => {
              return element !== undefined;
            });
            if (availableAnnotationsOnCursor.length) {
              var smallestAnn = availableAnnotationsOnCursor.reduce((a, b) =>
                a.spans[0].segment.length <= b.spans[0].segment.length ? a : b
              );
              // console.error("small:", smallestAnn);
              if (smallestAnn) {annotationId = smallestAnn['_id'];}
              // // Get first part of the annotation's class name, which should be the ID
              // annotationId =
              //   availableMarksOnCursor[availableAnnotationsLength - 1].className;
              // annotationId = annotationId.split(" ")[0].substr(3); // remove "id-" prefix...
            }
          }
          // console.error("TextWidgetComponent: mouseUpHandler(): availableMarksOnCursor:",
          //               availableAnnotationsLength, availableMarksOnCursor, annotationId);

          if (annotationId != null) {
            // Get the selected annotation from its ID and the previous selected annotation
            var selectedAnnotation = this.TextWidgetAPI.getAnnotationById(annotationId);
            var prevAnnotationId = this.TextWidgetAPI.getSelectedAnnotation()["_id"];
            if (typeof (selectedAnnotation) != "undefined" &&
              prevAnnotationId !== selectedAnnotation._id) {
              this.TextWidgetAPI.setSelectedAnnotation(selectedAnnotation);
              this.TextWidgetAPI.computeOverlappingAreas(selection.startOffset);
              return false;
            }
          }
        }
      }
    } else if (e.button === 1) {
      //middle button click
      e.preventDefault();
      // Added on 10/12/2021; Request by N. Pittaras.
      this.TextWidgetAPI.clearSelectedAnnotation();
      var updatedSelection: any = {};
      var savedSelection: any = this.TextWidgetAPI.getCurrentSelection();

      var editorCursor = this.editor.getCursor("from");
      var word = this.editor.findWordAt(editorCursor);
      this.editor.setSelection(word.anchor, word.head);
      var currentSelection = this.getSelectionInfo();

      if (typeof (savedSelection) == "undefined" ||
        Object.keys(savedSelection).length == 0 ||
        savedSelection.segment.length === 0) {
        this.TextWidgetAPI.setCurrentSelection(currentSelection, false);
      } else if (savedSelection.segment.length > 0) {
        if (currentSelection.startOffset < savedSelection.startOffset) {
          updatedSelection = this.computeSelectionFromOffsets(currentSelection.startOffset,
            savedSelection.endOffset);
        } else if (currentSelection.endOffset > savedSelection.endOffset) {
          updatedSelection = this.computeSelectionFromOffsets(savedSelection.startOffset,
            currentSelection.endOffset);
        } else {
          updatedSelection = currentSelection;
        }

        if ((!_.has(updatedSelection, "start") ||
          !_.has(updatedSelection, "end")) &&
          this.TextWidgetAPI.getAnnotatorType() === "Coreference Annotator") {
          updatedSelection = this.computeSelectionFromOffsets(updatedSelection.startOffset,
            updatedSelection.endOffset);
        }

        this.editor.setSelection(updatedSelection.start, updatedSelection.end);
        currentSelection = this.getSelectionInfo();
        if (currentSelection.segment != "")
          this.TextWidgetAPI.setCurrentSelection(currentSelection, false);
      }
    } else {
      this.TextWidgetAPI.clearSelection();
    }
  }; /* mouseUpHandler */

  /**
   * Bring the text and the annotations when a document changes
   */
  updateCurrentDocument() {
    var newDocument: any = this.TextWidgetAPI.getCurrentDocument();
    this.AnnotatorTypeId = newDocument.annotator_id;
    // console.error("TextWidgetComponent: updateCurrentDocument: newDoc:", newDocument,
    //               "annotator:", this.AnnotatorTypeId);
    return new Promise((resolve, reject) => {

      if (Object.keys(newDocument).length > 0) { //if new document is not empty
        var documentData = {
          document_id: newDocument.id,
          collection_id: newDocument.collection_id,
          annotator_type: this.AnnotatorTypeId
        };

        this.openDocumentService.save(documentData)
          .then((response: any) => {
            if (response.success) {
              // get document's data
              return this.documentService.get(newDocument.collection_id, newDocument.id);
            } else {
              return reject(response);
            }
          })
          .then((response: any) => {
            if (!response.success) {
              this.TextWidgetAPI.disableIsRunning();
              this.dialog.open(ErrorDialogComponent, {
                data: new ConfirmDialogData("Error",
                  "Error during the restore of your document. Please refresh the page and try again.")
              });
              return reject(response);
            } else {
              // this.spinnerVisible = true;
              var options = JSON.parse(response.data.visualisation_options);
              this.initialiseEditor(response.data, options);
              if (response.data.is_opened) {
                this.restoreAnnotationService.restoreFromTemp(newDocument.collection_id,
                  newDocument.id, this.AnnotatorTypeId)
                  .then((response: any) => {
                    this.TextWidgetAPI.disableIsRunning();

                    if (!response.success) {
                      this.dialog.open(ErrorDialogComponent, {
                        data: new ConfirmDialogData("Error",
                          "Error during the restore of your annotations. Please refresh the page and try again.")
                      });
                      return reject(response);
                    } else {
                      response.data = this.migrateOldSpans(response.data);
                    }
                    // console.error("TextWidgetComponent: updateCurrentDocument(): origin: TempAnnotations");
                    resolve(this.TextWidgetAPI.matchAnnotationsToSchema(response.data,
                            this.AnnotatorTypeId));
                  });
              } else {
                this.restoreAnnotationService.restoreFromDB(newDocument.collection_id,
                  newDocument.id, this.AnnotatorTypeId)
                  .then((response: any) => {
                    this.TextWidgetAPI.disableIsRunning();

                    if (!response.success) {
                      this.dialog.open(ErrorDialogComponent, {
                        data: new ConfirmDialogData("Error",
                          "Error during the restore of your annotations. Please refresh the page and try again.")
                      });
                      return reject(response);
                    } else {
                      response.data = this.migrateOldSpans(response.data);
                    }
                    // console.error("TextWidgetComponent: updateCurrentDocument(): origin: Annotations");
                    resolve(this.TextWidgetAPI.matchAnnotationsToSchema(response.data,
                            this.AnnotatorTypeId));
                  });
              }
            }
          }, (error) => {
            this.TextWidgetAPI.disableIsRunning();
            this.dialog.open(ErrorDialogComponent, {
              data: new ConfirmDialogData("Error",
                "Database error. Please refresh the page and try again.")
            });
            return reject(error);
          });
      } else {
        this.TextWidgetAPI.disableIsRunning();
        return reject("The Document is empty!");
      }
    });
  } /* updateCurrentDocument */

  initialiseEditor(doc, visualisationOptions: any) {
    // console.error("TextWidgetComponent: initialiseEditor(): visualisationOptions:", typeof visualisationOptions, visualisationOptions);
    this.TextWidgetAPI.resetData();
    this.TextWidgetAPI.registerAnnotationCanBeDeletedCallback(this.annotationCanBeDeleted.bind(this));
    this.editor.setValue("");
    this.editor.clearHistory();
    if (visualisationOptions !== null && "gutter" in visualisationOptions) {
      this.skipLineNumber = visualisationOptions["gutter"];
    } else {
      this.skipLineNumber = {};
    }

    /* Are we annotating text or an image? */
    switch (doc.type.toLowerCase()) {
      case "png":
      case "jpeg":
      case "gif":
      case "tiff":
      case "webp":
        this.annotationMode = AnnotationMode.IMAGE;
        this.annotationImageURL = doc.data_image;
        this.textWidgetOverlay.nativeElement.style.pointerEvents = "all";
        this.textWidgetOverlay.nativeElement.style.width  = "100%";
        this.textWidgetOverlay.nativeElement.style.height = "100%";
        break;
      case "text":
      default:
        this.textWidgetOverlay.nativeElement.style.pointerEvents = "none";
        this.textWidgetOverlay.nativeElement.style.width  = "100%";
        this.annotationMode = AnnotationMode.TEXT;
        this.editor.setValue(doc.text);
        break;
    }

    // this.initPanels();

    this.graph.clear();
    this.annotationIdToGraphItem = {};
    this.connectedAnnotations = [];
    if (this.annotationMode == AnnotationMode.TEXT) {
      this.editor.refresh();
      this.showLinkRouterSelector = false;
      this.textWidgetEvent.emit({
        event: "showLinkRouterSelector",
        value: this.showLinkRouterSelector
      });
      this.visualiseVisualisationOptions(visualisationOptions);
      this.editor.refresh();
    }
    if (this.annotationMode == AnnotationMode.IMAGE) {
      this.resizeOverlay();
    }
    // console.error("TextWidgetComponent: CM size:", this.editor.getScrollInfo());
    // console.error("TextWidgetComponent: OVERLAY:", this.textWidgetOverlay.nativeElement.style.height);
  }; /* initialiseEditor */

  resizeOverlay() {
    // console.error("TextWidgetComponent: resizeOverlay()");
    if (this.annotationMode == AnnotationMode.TEXT) {
      this.textWidgetOverlay.nativeElement.style.width  = "100%";
      this.textWidgetOverlay.nativeElement.style.height = (this.editor.getScrollInfo().height + 2).toString()+'px';
    }
    if (this.annotationMode == AnnotationMode.IMAGE) {
      // console.error((this.imageWidget.nativeElement as HTMLImageElement).naturalWidth);
      // console.error((this.imageWidget.nativeElement as HTMLImageElement).naturalHeight);
      this.textWidgetOverlay.nativeElement.style.width  = this.imageWidget.nativeElement.scrollWidth.toString()+'px';
      this.textWidgetOverlay.nativeElement.style.height = this.imageWidget.nativeElement.scrollHeight.toString()+'px';
    }
  }; /* resizeOverlay */

  visualiseVisualisationOptions(options) {
    if (options == null || (!("marks" in options))) {
      return;
    }
    var marks = options["marks"];
    // console.error("TextWidgetComponent: visualiseVisualisationOptions(): marks:", marks.length);

    this.editor.operation(() => {
      marks.forEach((item) => {
        this.editor.markText(item.start, item.end, {
          className: /*"tei-"+*/item.tags
        });
      });}
    );
  }; /* visualiseVisualisationOptions */

  migrateOldSpans(anns) {
    if (this.annotationMode != AnnotationMode.TEXT) {
      // No point in migration...
      return anns;
    }
    var annotations = [];
    for (var i = 0; i < anns.length; i++) {
      var ann = anns[i];
      var modified = false;
      for (var j = 0; j < ann.spans.length; j++) {
        var span = ann.spans[j];
        var selection = this.computeSelectionFromOffsets(span.start, span.end);
        var fragment = this.editor.getRange(selection.start, selection.end);
        if (span.segment !== fragment) {
          var span_attribute = span.start + " " + span.end;
          var startp, endp, startn, endn, start, end;
          var cursor = this.editor.getSearchCursor(span.segment, selection.start);
          var foundp  = cursor.findPrevious();
          if (foundp) {
            startp = this.editor.indexFromPos(cursor.from());
            endp   = this.editor.indexFromPos(cursor.to());
          }
          var foundn  = cursor.findNext();
          if (foundn) {
            startn = this.editor.indexFromPos(cursor.from());
            endn   = this.editor.indexFromPos(cursor.to());
          }
          // Identify which segment is closest...
          if (foundn && foundp) {
            if (Math.abs(startn - span.start) < Math.abs(startp - span.start)) {
              start = startn; end = endn;
            } else {
              start = startp; end = endp;
            }
          } else if (foundp) {
            start = startp; end = endp;
          } else {
            start = startn; end = endn;
          }
          if (foundn || foundp) {
            span.start   = start;
            span.end     = end;
            ann.spans[j] = span;
            modified = true;
            // Modify also attributes that may be a span...
            ann.attributes = ann.attributes.map(attr => {
              if (attr.value === span_attribute) {attr.value = start + " " + end;}
              return attr;
            });
          }
        }
      }
      if (modified) {
        this.restoreAnnotationService.updateToTemp(ann);
      }
      annotations.push(ann);
    }
    return annotations;
  }; /* migrateOldSpans */

  overlayRefresh() {
    // console.warn("overlayRefresh: gutter width:", this.gutter.offsetWidth,
    //   "editor width:", this.textWidgetLines["offsetWidth"]);
    this.resizeOverlay();
    switch (this.annotationMode) {
      case AnnotationMode.TEXT:
        for (const annId in this.annotationIdToGraphItem) {
          var annotation = this.TextWidgetAPI.getAnnotationById(annId);
          if (!annotation) {continue;}
          for (var l = 0; l < annotation.spans.length; l++) {
            var annotationSpan = annotation.spans[l];
            var selection = this.computeSelectionFromOffsets(
              parseInt(annotationSpan.start), parseInt(annotationSpan.end));
            this.overlayMarkAdd(l, selection.start, selection.end, {
              "annotation": annotation,
              "selected": false,
              "action": "resize"
            });
          }
        }
        break;
    }
    this.overlayLinksRefresh();
  }; /* overlayRefresh */

  overlayLinksRefresh() {
    // console.error("TextWidgetComponent: overlayLinksRefresh()");
    this.connectedAnnotations.forEach((annotation) => {
      try {
        this.overlayLinkAdjustVertices(annotation.instance);
      } catch (err) {
        console.error(err);
      }
    });
  }; /* overlayLinksRefresh */

  overlayAnnotationGetBoundingClientRect(annotation) {
    var elems = document.querySelectorAll(".id-" + String(annotation._id).trim());
    if (!elems || !elems.length) return null;
    var w = 0;
    var elem;
    for (var i = 0; i < elems.length; i++) {
      if (elems[i].getBoundingClientRect().right > w) {
        elem = elems[i];
        w = elem.getBoundingClientRect().right;
      }
    }
    var mark = elem.getBoundingClientRect();
    var over = this.textWidgetOverlay.nativeElement.getBoundingClientRect();
    return {
      x: mark.x - over.x,
      y: mark.y - over.y,
      top: mark.top - over.top,
      bottom: mark.bottom - over.top,
      left: mark.left   /*- over.left*/,
      right: mark.right  /*- over.left*/,
      height: mark.height,
      width: mark.width
    };
  }; /* overlayAnnotationGetBoundingClientRect */

  overlayHighlight(annotation) {
    // console.error("TextWidgetComponent: overlayHighlight():", annotation);
    var deep = false, selector = 'body', items, colours = {}, colour;
    if (annotation.annotation._id in this.annotationIdToGraphItem) {
      items = this.annotationIdToGraphItem[annotation.annotation._id];
    } else {
      // A link...
      var connectedAnnotation = _.find(this.connectedAnnotations, (ann) => {
        return ann.data._id === annotation.annotation._id;
      });
      if (typeof (connectedAnnotation) == "undefined") {
        return; // Nothing to do...
      }
      items = {
        0: connectedAnnotation.instance,
        1: this.annotationIdToGraphItem[connectedAnnotation.startId][0],
        2: this.annotationIdToGraphItem[connectedAnnotation.endId][0]
      };
      colours = { 0: '#4666E5', 1: "purple", 2: "orange" };
      deep = true; selector = 'root';
    }
    switch (this.annotationMode) {
      case AnnotationMode.IMAGE:
        selector = 'root';
        break;
    }

    // console.error("TextWidgetComponent: overlayHighlight(): items:", items);
    for (const spanIndex in items) {
      var item = items[spanIndex];
      if (spanIndex in colours) {
        colour = colours[spanIndex];
      } else {
        colour = '#4666E5';
      }
      const elementView = item.findView(this.paper);
      // console.error("TextWidgetComponent: overlayHighlight(): span:", spanIndex, "elementView:", elementView);
      if (annotation.action == "select") {
        joint.highlighters.mask.remove(elementView);
        joint.highlighters.mask.add(elementView, { selector: selector },
          'my-element-highlight', {
          deep: deep,
          padding: 4,
          attrs: {
            'stroke': colour,
            'stroke-width': 3,
            'stroke-linejoin': 'round'
          }
        });
        // console.error("TextWidgetComponent: overlayHighlight(): span:", spanIndex, "mask add:", colour, selector);
        // console.warn("<<overlayHighlight>>:", annotation.annotation._id);
      } else if (true || annotation.action == "deselect" ||
        annotation.action == "delete") {
        joint.highlighters.mask.remove(elementView);
        // console.error("TextWidgetComponent: overlayHighlight(): span:", spanIndex, "mask REMOVE");
        // console.warn("  overlayHighlight  :", annotation.annotation._id);
      }
    }
  }; /* overlayHighlight */

  overlayMarkAdd(spanIndex, startPos, endPos, annotation) {
    // console.error("TextWidgetComponent: overlayMarkAdd():", spanIndex, startPos, endPos, annotation);
    var item;
    // if (annotation.action != "matches") {
    //   console.warn("++ overlayMarkAdd:", annotation.annotation._id, annotation);
    // }
    if (annotation.annotation._id in this.annotationIdToGraphItem) {
      if (annotation.action == "select" ||
          annotation.action == "deselect") {
        // This is a request to delete the item, because it will be
        // re-added as selected/deselected. Do not remove it...
        this.overlayHighlight(annotation);
        return null;
      }
      // Check if item already exists...
      item = this.annotationIdToGraphItem[annotation.annotation._id][spanIndex];
    } else {
      this.annotationIdToGraphItem[annotation.annotation._id] = {};
    }
    if (this.annotationMode != AnnotationMode.TEXT) {
      return null;
    }

    // This method creates a polygon from codemirror coordinates (line, pos)
    var startCoords = this.editor.charCoords(startPos, "local"),
        endCoords   = this.editor.charCoords(endPos, "local");
    // console.error("TextWidgetComponent: overlayMarkAdd():", startCoords, endCoords);
    // Calculate points...
    if (typeof (item) == "undefined") {
      item = new joint.shapes.standard.Polygon();
      item.addTo(this.graph);
      this.annotationIdToGraphItem[annotation.annotation._id][spanIndex] = item;
    }
    if (endCoords.top - startCoords.top < 2) {
      // Start & end on the same height, the region is a rectange...
      // https://resources.jointjs.com/tutorial/elements
      // if (angular.isUndefined(item)) {
      //   item = new joint.shapes.standard.Rectangle();
      // }
      // sets the position of the origin of the element (the top-left corner)
      item.position(startCoords.left + this.gutter.offsetWidth - 4, startCoords.top + 3);
      // sets the dimensions of the element (width, height)
      item.resize(endCoords.right - startCoords.left - 4,
        endCoords.bottom - startCoords.top - 6);
      item.attr('body/refPoints', "0,0 1,0 1,1 0,1");
    } else {
      var points = [];
      // sets the position of the origin of the element (the top-left corner)
      item.position(this.gutter.offsetWidth + 8, startCoords.top + 3);
      // sets the dimensions of the element (right, height)
      item.resize(this.textWidgetLines.offsetWidth - 16, endCoords.bottom - startCoords.top - 6);
      points.push('14,' + String(startCoords.bottom + 3));
      points.push(String(startCoords.left) + ',' + String(startCoords.bottom + 3));
      points.push(String(startCoords.left) + ',' + String(startCoords.top + 3));
      points.push(String(this.textWidgetLines.offsetWidth) + ',' + String(startCoords.top + 3));
      points.push(String(this.textWidgetLines.offsetWidth) + ',' + String(endCoords.top + 3));
      points.push(String(endCoords.right) + ',' + String(endCoords.top + 3));
      points.push(String(endCoords.right) + ',' + String(endCoords.bottom - 4));
      points.push('14,' + String(endCoords.bottom - 4));
      item.attr('body/refPoints', points.join(' '));
    }
    // item.attr('label/text', annotation.annotation._id);
    item.attr('body/fill', "transparent");
    item.attr('body/stroke', 'none' /*'#7c68fc'*/);
    /* DEBUG: Uncomment the following line to make boxes drawn on overlay visible */
    // item.attr('body/stroke', 'green');
    item.attr('root/pointer-events', 'none');
    // console.error("TextWidgetComponent: overlayMarkAdd():", item);
    return item;
  }; /* overlayMarkAdd */

  overlayMarkRemove(annotation) {
    // console.error("TextWidgetComponent: overlayMarkRemove():", annotation);
    // if (annotation.action != "matches") {
    //   console.warn("-- overlayMarkRemove:", annotation.annotation._id, annotation);
    // }
    if (annotation.annotation._id in this.annotationIdToGraphItem) {
      if (annotation.action == "select" ||
          annotation.action == "deselect") {
        // This is a request to delete the item, because it will be
        // re-added as selected/deselected. Do not remove it...
        this.overlayHighlight(annotation);
        return false;
      }
      for (const spanIndex in this.annotationIdToGraphItem[annotation.annotation._id]) {
        var item = this.annotationIdToGraphItem[annotation.annotation._id][spanIndex];
        this.graph.disconnectLinks(item);
        const elementView = item.findView(this.paper);
        joint.highlighters.mask.remove(elementView);
        // console.error("TextWidgetComponent: overlayMarkRemove(): mask REMOVE");
        item.remove();
        // console.error("TextWidgetComponent: overlayMarkRemove(): removed item:", item);
      }
      delete this.annotationIdToGraphItem[annotation.annotation._id];
      return true;
    }
    return false;
  }; /* overlayMarkRemove */

  /**
   * Connect two elements with the specified IDs with an arrow using the
   * Joint.js (replacing LeaderLine) library
   */
  overlayLinkAdd(startId, endId, label, annotation) {
    if (startId === endId) {
      return;
    }

    if (!(startId in this.annotationIdToGraphItem)) return;
    if (!(endId in this.annotationIdToGraphItem)) return;
    if (!this.showLinkRouterSelector) {
      this.showLinkRouterSelector = true;
      this.textWidgetEvent.emit({
        event: "showLinkRouterSelector",
        value: this.showLinkRouterSelector
      });
    }

    // Do we have already a line?
    var connectedAnnotation = _.find(this.connectedAnnotations, (ann) => {
      return ann.data._id === annotation.annotation._id;
    });
    if (typeof (connectedAnnotation) != "undefined") {
      if (annotation.action == "select" ||
          annotation.action == "deselect") {
        // This is a request to add the item, because it will be
        // re-added as selected/deselected. Do not remove it...
        this.overlayHighlight(annotation);
        return;
      }
    }
    var valid = this.TextWidgetAPI.isValidRelationAnnotation(annotation.annotation);
    var colour;
    if (valid) {
      colour = '#808080';
    } else {
      colour = "red";
    }

    var router;
    this.connector = "rounded";
    switch (this.routerName) {
      case "direct":
        break;
      case "smooth":
        this.connector = "smooth";
        break;
      default:
        router = this.routerName;
        break;
    }
    // Create a new line...
    var link = new joint.shapes.standard.Link({
      connector: { name: this.connector },
      attrs: {
        line: {
          stroke: colour /*'#808080'*/,
          strokeWidth: 2
        }
      },
      labels: [{
        markup: [
          {
            tagName: 'rect',
            selector: 'labelBody'
          }, {
            tagName: 'text',
            selector: 'labelText'
          }
        ],
        attrs: {
          labelText: {
            text: label,
            fill: 'gray',
            fontSize: 14,
            fontFamily: 'sans-serif',
            textAnchor: 'middle',
            textVerticalAnchor: 'middle',
          },
          labelBody: {
            ref: 'text',
            fill: '#ffffff',
            stroke: 'gray',
            strokeWidth: 2,
            rx: 3,
            ry: 3,
            refWidth: '100%',
            refHeight: '100%',
            refWidth2: 8,
            refHeight2: 8,
            refX: -4,
            refY: -4,
          }
        },
      }]
    });
    link.source(this.annotationIdToGraphItem[startId][0]);
    link.target(this.annotationIdToGraphItem[endId][0]);
    link.attr('root/pointer-events', 'visiblePainted');
    link.attr('./visibility', this.linkVisibility);
    link.router(router, this.routerOptions[this.routerName]);
    link.addTo(this.graph);
    // Add the annotation id to the link...
    link["annotation_id"] = annotation.annotation._id;
    return link;
  }; /* overlayLinkAdd */

  overlayLinksRouterSet(routername) {
    this.connectedAnnotations.forEach((annotation) => {
      try {
        this.overlayLinkAdjustVertices(annotation.instance);
      } catch (err) {
        console.error(err);
      }
    });
  }; /* overlayLinksRouterSet */

  /**
    * Find if a link has sibllings, and add vertices so as sibling links
    * are not drawn overlaping each other.
    * Code from Joint.js tutorial:
    * https://resources.jointjs.com/tutorial/multiple-links-between-elements
    */
  overlayLinkAdjustVertices(/*graph,*/ cell) {
    // if `cell` is a view, find its model
    cell = cell.model || cell;

    if (cell instanceof joint.dia.Element) {
      // `cell` is an element

      _.chain(this.graph.getConnectedLinks(cell))
        .groupBy((link) => {

          // the key of the group is the model id of the link's source or target
          // cell id is omitted
          return _.omit([link.source().id, link.target().id], cell.id)[0];
        })
        .each((group, key) => {

          // if the member of the group has both source and target model
          // then adjust vertices
          if (key !== 'undefined') this.overlayLinkAdjustVertices(/*graph,*/ _.first(group));
        })
        .value();

      return;
    }

    // `cell` is a link
    // get its source and target model IDs
    var sourceId = cell.get('source').id || cell.previous('source').id;
    var targetId = cell.get('target').id || cell.previous('target').id;

    // if one of the ends is not a model
    // (if the link is pinned to paper at a point)
    // the link is interpreted as having no siblings
    if (!sourceId || !targetId) {
      // no vertices needed
      cell.unset('vertices');
      return;
    }

    // identify link siblings
    var siblings = this.graph.getLinks().filter((sibling) => {

      var siblingSourceId = sibling.source().id;
      var siblingTargetId = sibling.target().id;

      // if source and target are the same
      // or if source and target are reversed
      return ((siblingSourceId === sourceId) && (siblingTargetId === targetId))
        || ((siblingSourceId === targetId) && (siblingTargetId === sourceId));
    });

    var numSiblings = siblings.length;
    switch (numSiblings) {

      case 0: {
        // the link has no siblings
        break;
      }
      default: {

        if (numSiblings === 1) {
          // there is only one link
          // no vertices needed
          cell.unset('vertices');
        }

        // there are multiple siblings
        // we need to create vertices

        // find the middle point of the link
        var sourceCenter = this.graph.getCell(sourceId).getBBox().center();
        var targetCenter = this.graph.getCell(targetId).getBBox().center();
        var midPoint = (new joint.g.Line(sourceCenter, targetCenter)).midpoint();
        // find the angle of the link
        var theta = sourceCenter.theta(targetCenter);

        // constant
        // the maximum distance between two sibling links
        var GAP = this.routerGAP;

        _.each(siblings, (sibling, index) => {

          // we want offset values to be calculated as 0, 20, 20, 40, 40, 60, 60 ...
          var offset = GAP * Math.ceil(index / 2);

          // place the vertices at points which are `offset` pixels perpendicularly away
          // from the first link
          //
          // as index goes up, alternate left and right
          //
          //  ^  odd indices
          //  |
          //  |---->  index 0 sibling - centerline (between source and target centers)
          //  |
          //  v  even indices
          var sign = ((index % 2) ? 1 : -1);

          // to assure symmetry, if there is an even number of siblings
          // shift all vertices leftward perpendicularly away from the centerline
          if ((numSiblings % 2) === 0) {
            offset -= ((GAP / 2) * sign);
          }

          // make reverse links count the same as non-reverse
          var reverse = ((theta < 180) ? 1 : -1);

          // we found the vertex
          var angle =  joint.g.toRad(theta + (sign * reverse * 90));
          var vertex = joint.g.Point.fromPolar(offset, angle, midPoint).toJSON();

          // replace vertices array with `vertex`
          sibling.vertices([vertex]);
        });
      }
    }
  }; /* overlayLinkAdjustVertices */

  updateLinkRouter(routerName) {
    this.routerName = routerName;
    this.connector  = "rounded";
    var router;
    switch (this.routerName) {
      case "direct":
        break;
      case "smooth":
        this.connector = "smooth";
        break;
      default:
        router = routerName;
        break;
    }
    // console.error("TextWidgetComponent: updateLinkRouter:", routerName, router);
    this.connectedAnnotations.forEach((annotation) => {
      if (router) {
        // annotation.instance.set("router", { name: router });
        annotation.instance.router(router, this.routerOptions[routerName]);
      } else {
        annotation.instance.unset("router");
      }
      //annotation.instance.set('connector', { name: connector });
      annotation.instance.connector(this.connector);
    });
  }; /* updateLinkRouter */

  updateLinkVisibility(hide) {
    this.linkVisibility = (hide ? 'hidden' : 'visible');
    this.connectedAnnotations.forEach((annotation) => {
      annotation.instance.attr('./visibility', this.linkVisibility);
    });
  }; /* updateLinkVisibility */

  /**
   * Remove a connection annotation's leader line instance as well as
   * remove it from the connectedAnnotations list
   */
  removeConnectedAnnotation(annotation) {
    // Find the relation annotation in connectedAnnotations
    var connectedAnnotation = _.find(this.connectedAnnotations, (ann) => {
      return ann.data._id === annotation.annotation._id;
    });

    if (_.isUndefined(connectedAnnotation)) {
      return;
    }
    if (annotation.action == "select" ||
      annotation.action == "deselect") {
      // This is a request to delete the item, because it will be
      // re-added as selected/deselected. Do not remove it...
      this.overlayHighlight(annotation);
      return;
    }

    const elementView = connectedAnnotation.instance.findView(this.paper);
    joint.highlighters.mask.remove(elementView);
    // console.error("TextWidgetComponent: removeConnectedAnnotation(): mask REMOVE:", elementView);
    // Remove the LeaderLine instance
    connectedAnnotation.instance.remove();

    // Remove the object from the connectedAnnotations array
    var arrayIndex = this.connectedAnnotations.indexOf(connectedAnnotation);
    this.connectedAnnotations.splice(arrayIndex, 1);
  }; /* removeConnectedAnnotation */

  clearDuplicateAnnotationsFromEditor(newAnnotations) {
    var editorMarks = this.editor.getAllMarks();

    this.editor.operation(() => {
      newAnnotations.forEach((annotation) => {
        if (this.TextWidgetAPI.belongsToSchemaAsSupportiveAnnotationType(annotation.annotation)) {
          // Remove connected annotation
          this.removeConnectedAnnotation(annotation);
        } else if (this.TextWidgetAPI.isSettingAnnotation(annotation.annotation)) {
          // Do nothing on setting Annotations...
        } else {
          this.overlayMarkRemove(annotation);
          // Remove marks of regular annotation
          editorMarks.forEach((editorMark) => {
            // Get ID of mark
            var editorMarkClass = editorMark.className.split(" ")[0];

            if (("id-" + String(annotation.annotation._id).trim()).indexOf(editorMarkClass) > -1) {
              editorMark.clear();
            }
          });
          // Remove image annotations...
          switch (this.annotationMode) {
            case AnnotationMode.IMAGE:
              for (const spanIndex in this.annotationIdToGraphItem[annotation.annotation._id]) {
                var item = this.annotationIdToGraphItem[annotation.annotation._id][spanIndex];
                this.graph.disconnectLinks(item);
                const elementView = item.findView(this.paper);
                joint.highlighters.mask.remove(elementView);
                // console.error("TextWidgetComponent: clearDuplicateAnnotationsFromEditor(): mask REMOVE:", elementView);
                item.remove();
                // console.error("TextWidgetComponent: clearDuplicateAnnotationsFromEditor(): removed item:", item);
              }
              delete this.annotationIdToGraphItem[annotation.annotation._id];
              break;
          }
        }
      });
    });
  }; /* clearDuplicateAnnotationsFromEditor */

  getLinksForAnnotation(annotation) {
    return this.connectedAnnotations.filter((link) =>
      annotation._id == link['startId'] || annotation._id == link['endId']
    );
  }; /* getLinksForAnnotation */

  getSourceLinksForAnnotation(annotation) {
    return this.connectedAnnotations.filter((link) =>
      annotation._id == link['startId']
    );
  }; /* getSourceLinksForAnnotation */

  getTargetLinksForAnnotation(annotation) {
    return this.connectedAnnotations.filter((link) =>
      annotation._id == link['endId']
    );
  }; /* getTargetLinksForAnnotation */

  addVisualsForRelationAnnotation(annotation, annotatorType=undefined) {
    // Argument relation, add arrow. Find IDs of start/end annotations
    var startId = annotation.annotation.attributes.find(attr =>
      attr.name === 'arg1'
    ).value;
    var endId = annotation.annotation.attributes.find(attr =>
      attr.name === 'arg2'
    ).value;

    var label = annotation.annotation.attributes.find(attr =>
      attr.name === 'type'
    ).value;

    // Create the line
    var line = this.overlayLinkAdd(startId, endId, label, annotation);

    // Add relation annotation to the list
    if (!_.isUndefined(line)) {
      this.connectedAnnotations.push({
        instance: line,
        startId: startId,
        endId: endId,
        label: label,
        data: annotation.annotation
      });
      return true;
    }
    return false;
  }; /* addVisualsForRelationAnnotation */

  addVisualsForPlainAnnotation(visAnnotation, annotatorType=undefined) {
    if (typeof visAnnotation.annotation.spans == "undefined") {
      return false;
    }
    // If annotatorType is undefined, get one from annotation...
    if (!annotatorType && 'annotator_id' in visAnnotation.annotation) {
      annotatorType = this.TextWidgetAPI.getAnnotatorTypeFromAnnotatorTypeId(visAnnotation.annotation['annotator_id']);
    }
    // console.error("TextWidgetComponent: addVisualsForPlainAnnotation(): Annotation:", visAnnotation, visAnnotation.annotation.spans[0]);

    var annotationAttributes = visAnnotation.annotation.attributes;
    // Iterate through annotations spans
    for (var l = 0; l < visAnnotation.annotation.spans.length; l++) {
      var colorCombination: any = {};
      var annotationSpan = visAnnotation.annotation.spans[l];

      // create the selection in the editor and annotate it
      var selection;
      if (this.annotationMode == AnnotationMode.TEXT) {
        selection = this.computeSelectionFromOffsets(
          parseInt(annotationSpan.start), parseInt(annotationSpan.end));
      }

      var selected = false;
      if (typeof (visAnnotation.selected) != "undefined" &&
                  visAnnotation.selected) {
        selected = true;
      }

      var count = 0;
      switch (annotatorType) {
        case "Button Annotator":
          // If it is Button Annotator get the required color combination
          for (var m = 0; m < annotationAttributes.length; m++) {
            colorCombination =
              this.buttonColorService.getColorCombination(annotationAttributes[m].value);
            // console.error("colorCombination:", annotationAttributes[m].value, colorCombination);
            if (typeof (colorCombination) != "undefined")
              break;
          }
          var markClassName = "id-" +
            String(visAnnotation.annotation._id).trim() + this.markedTextClass;

          switch (this.annotationMode) {
            case AnnotationMode.TEXT:
              if (selected) {
                // Selected marker
                this.editor.markText(selection.start, selection.end, {
                  className: markClassName,
                  css: "color:" + colorCombination.colour_font + "; " +
                    "background: " + colorCombination.colour_selected_background + "; " +
                    "--border-color:" + colorCombination.colour_border + ";" +
                    "border-top: 4px solid " + colorCombination.colour_border + "; " +
                    "border-bottom: 4px solid " + colorCombination.colour_border + "; ",
                  attributes: {dataType: annotationAttributes[m].value}
                });
              } else {
                // Normal marker
                this.editor.markText(selection.start, selection.end, {
                  className: markClassName,
                  css: "color:" + colorCombination.colour_font + ";" +
                    "background:" + colorCombination.colour_background + ";" +
                    "--border-color:" + colorCombination.colour_border + ";",
                  attributes: {dataType: annotationAttributes[m].value}
                });
              }
              this.overlayMarkAdd(l, selection.start, selection.end,
                visAnnotation);
              break;
            case AnnotationMode.IMAGE:
              var cell;
              var markup = { markup: [{ className: markClassName }]};
              switch (annotationSpan.type) {
                case "rect":
                default:
                  cell = new joint.shapes.standard.Rectangle();
              }
              cell.position(annotationSpan.x, annotationSpan.y);
              cell.resize(annotationSpan.width, annotationSpan.height);
              cell.rotate(annotationSpan.rotation);
              cell.attr('body/cursor', 'pointer');
              cell.attr('body/stroke', colorCombination.colour_border);
              cell.attr('body/stroke-width', selected ? 4 : 1);
              cell.attr('body/fill', selected ? colorCombination.colour_selected_background : colorCombination.colour_background);
              cell.attr('body/fill-opacity', '0.3');
              cell.attr('body/stroke-opacity', '0.8');
              cell.set('elementMove', false);
              cell.set('annotation', visAnnotation.annotation);
              // console.error("TextWidgetComponent: addVisualsForPlainAnnotation() =>", cell.get('annotation'));
              cell.addTo(this.graph);
              if (!(visAnnotation.annotation._id in this.annotationIdToGraphItem)) {
                this.annotationIdToGraphItem[visAnnotation.annotation._id] = {};
              }
              this.annotationIdToGraphItem[visAnnotation.annotation._id][l] = cell;
              // No need to call overlayMarkAdd(), as we have already call the overlay.
              // However, we need to highlight it if needed (a check done inside overlayMarkAdd()).
              this.overlayMarkAdd(-1, -1, -1, visAnnotation);
              break;
          }

          break;
        case "Coreference Annotator":
          var value = annotationSpan.start + " " + annotationSpan.end;
          var attribute = annotationAttributes.find(attr => attr.value === value);
          if (typeof attribute == "undefined") {
            continue;
          }
          // If it is Coreference Annotator get the required color combination
          var colourCom =
            this.coreferenceColorService.getColorCombination(visAnnotation.annotation._id);
          var mark = null;
          var markerId = "mrkr_" + Math.floor(Math.random() * 1000000);
          var markAttributes = {
            markerId: markerId
          }
          markAttributes["dataType"] = attribute.name;

          // Create class for adding background color to the type pseudo-element
          var colorClass = " mark_color_" +
            colourCom["border-color"].replace("#", "").toUpperCase();
          var markClassName = "id-" + String(visAnnotation.annotation._id).trim() + " " +
            markerId + this.markedTextClass + colorClass;

          if (selected) {
            // Selected marker
            mark = this.editor.markText(selection.start, selection.end, {
              className: markClassName,
              attributes: markAttributes,
              css: "color:" + colourCom["font-color"] + "; " +
                "background:" + colourCom["selected-background-colour"] + "; " +
                "--border-color:" + colourCom["border-color"] + "; " +
                "border-top:" + "4px solid " + colourCom["border-color"] + "; " +
                "border-bottom:" + "4px solid " + colourCom["border-color"] + "; "
            });
          } else {
            // Normal marker
            mark = this.editor.markText(selection.start, selection.end, {
              className: markClassName,
              attributes: markAttributes,
              css: "color:" + colourCom["font-color"] + ";" +
                "background:" + colourCom["background-colour"] + ";" +
                "--border-color:" + colourCom["border-color"] + ";"
            });
          }
          this.overlayMarkAdd(l, selection.start, selection.end, visAnnotation);
          // Used only in addTypeAttributesToMarkers
          // mark.markerId = markerId;
          // Never used!
          // mark.annotationId = visAnnotation.annotation._id;
          break;
      }
    }
    // Get links that involve this annotation...
    this.getLinksForAnnotation(visAnnotation.annotation).forEach((link) => {
      if (visAnnotation.annotation._id == link["startId"]) {
        link.instance.source(this.annotationIdToGraphItem[link["startId"]][0]);
      }
      if (visAnnotation.annotation._id == link["endId"]) {
        link.instance.target(this.annotationIdToGraphItem[link["endId"]][0]);
      }
      var valid = this.TextWidgetAPI.isValidRelationAnnotation(link.data);
      link.instance.attr('line/stroke', (valid ? '#808080' : "red"));
    });
    // (Re)generate the SPAN elements that show the marker types
    // Petasis, 20/03/2021: not needed anymore! addTypeAttributesToMarkers();
    return true;
  }; /* addVisualsForPlainAnnotation */

  addVisualsForAnnotation(visAnnotation, annotatorType=undefined) {
    if (this.TextWidgetAPI.isRelationAnnotationType(visAnnotation.annotation)) {
      return this.addVisualsForRelationAnnotation(visAnnotation, annotatorType);
    } else if ("document_attribute" in visAnnotation.annotation) {
      // This is a document Annotation...
    } else if ("collection_setting" in visAnnotation.annotation) {
      // This is a collection setting Annotation...
    } else if ("document_setting" in visAnnotation.annotation) {
      // This is a collection setting Annotation...
    } else {
      // Normal annotation
      return this.addVisualsForPlainAnnotation(visAnnotation, annotatorType);
    }
    return false;
  }; /* addVisualsForAnnotation */

  /**
   * Visualize the annotations to the text widget
   * @param newAnnotations
   * @param annotatorType
   * @returns {boolean}
   */
  visualiseAnnotations(newAnnotations, annotatorType) {
    // console.error("TextWidgetComponent: visualiseAnnotations():",
    //               newAnnotations.length, newAnnotations, this.settings);
    if (typeof (newAnnotations) == "undefined" ||
      newAnnotations.length === 0) {
      return false;
    }
    // if (newAnnotations.length == 1) {
    //   console.error("TextWidgetComponent: visualiseAnnotations():",
    //                 newAnnotations[0]['selected'], newAnnotations[0]['action']);
    // }

    // if there are any borders around a specific annotation, remove them.
    this.clearDuplicateAnnotationsFromEditor(newAnnotations);

    let added = 0;
    // if there are new annotations to be visualised, add them to the editor
    this.editor.operation(() => {
      newAnnotations.forEach((currAnnotation) => {
        if (!('annotation' in currAnnotation)) {
          // This object does not contain an annotation...
          return; // continue;
        }
        if (this.TextWidgetAPI.isSettingAnnotation(currAnnotation.annotation) ||
          (!this.TextWidgetAPI.isSettingsCompliantAnnotation(currAnnotation.annotation))) {
          // If settings omit this annotation, skip it...
          return; // continue;
        }
        // console.error("TextWidgetComponent: survived:", currAnnotation.annotation);

        if (this.TextWidgetAPI.isRelationAnnotationType(currAnnotation.annotation)) {
          if (this.addVisualsForRelationAnnotation(currAnnotation, annotatorType)) {
            added++;
          }
        } else if ("document_attribute" in currAnnotation.annotation) {
          // This is a document Annotation...
          // Broadcast an event to our parent that a Document Attribute was found.
          this.textWidgetEvent.emit({
            event: "sendDocumentAttribute",
            attributeName: currAnnotation.annotation.document_attribute,
            annotation: currAnnotation.annotation
          });
          //$rootScope.$broadcast('sendDocumentAttribute:' +
          //  currAnnotation.annotation.document_attribute, currAnnotation.annotation);
        } else if ("collection_setting" in currAnnotation.annotation) {
          // This is a collection setting Annotation...
          // Broadcast an event to our parent that a Document Attribute was found.
          this.textWidgetEvent.emit({
            event: "sendCollectionSetting",
            attributeName: currAnnotation.annotation.collection_setting,
            annotation: currAnnotation.annotation
          });
        } else if ("document_setting" in currAnnotation.annotation) {
          // This is a collection setting Annotation...
          // Broadcast an event to our parent that a Document Attribute was found.
          this.textWidgetEvent.emit({
            event: "sendDocumentSetting",
            attributeName: currAnnotation.annotation.document_setting,
            annotation: currAnnotation.annotation
          });
        } else {
          // Normal annotation
          if (this.addVisualsForPlainAnnotation(currAnnotation, annotatorType)) {
            added++;
          }
        }
      });
    });

    this.TextWidgetAPI.clearAnnotationsToBeAdded();
    // if (added) {
    //   // console.error("TextWidgetComponent: visualiseAnnotations() -> overlayLinksRefresh()");
    //   this.overlayLinksRefresh();
    // }
    this.overlayRefresh();
    //editor.refresh();
  }; /* visualiseAnnotations */

  /**
   * If the annotator type is "Coreference Annotator", add a data-type
   * attribute to each marker with the
   * type of annotation
   */
  addTypeAttributesToMarkers() {
    // editor.refresh();
    if (this.TextWidgetAPI.getAnnotatorType() === "Coreference Annotator") {
      var marks = this.editor.getAllMarks();
      _.each(marks, (mark) => {
        var markerSpans = document.querySelectorAll("span." + mark.markerId);

        _.each(markerSpans, (span) => {
          // Add the data type attribute
          var doc = document.querySelector(span) as Element;
          doc.setAttribute("dataType", mark.typeAttribute);

          // If the marker has > 1 classes that set its type
          // pseudoelement's background-color, we
          // need to keep only the correct one
          var classes = span.className.trim().split(" ");

          classes = _.filter(classes, (className) => {
            // Keep only classes which start with "mark_color_"
            return className.indexOf("mark_color_") === 0;
          });

          if (classes.length > 1) {
            // Find the correct class to keep
            var correctClass = "mark_color_" +
              this.coreferenceColorService.rgb2hex(doc.getAttribute("borderTopColor")).toUpperCase();

            // Keep only the classes we need to remove
            classes = _.without(classes, correctClass);

            // Remove the excess classes from the element
            //$(span).removeClass(classes.join(" "));
            doc.classList.remove(classes);
          }
        });
      });
    }
    // editor.refresh();
  }; /* addTypeAttributesToMarkers */

  /**
   * Add annotation to the text widget
   * @returns {boolean}
   */
  addNewAnnotations() {
    // console.error("TextWidgetComponent: addNewAnnotations()");
    if (!this.TextWidgetAPI.checkIsRunning()) {
      this.TextWidgetAPI.enableIsRunning();
    } else {
      return false;
    }

    var newAnnotations = this.TextWidgetAPI.getAnnotationsToBeAdded();
    var annotatorType  = this.TextWidgetAPI.getAnnotatorType();
    // console.error("TextWidgetComponent: addNewAnnotations():", annotatorType, newAnnotations);


    if (typeof (newAnnotations) != "undefined" && newAnnotations.length > 0) {
      this.visualiseAnnotations(newAnnotations, annotatorType);
    }

    this.TextWidgetAPI.disableIsRunning();
  }; /* addNewAnnotations */

  /**
   * Remove annotation from the text widget
   * @returns {boolean}
   */
  deleteAnnotations() {
    // console.error("TextWidgetComponent: deleteAnnotations()");
    if (!this.TextWidgetAPI.checkIsRunning()) //check if running
      this.TextWidgetAPI.enableIsRunning();
    else
      return false;

    var annotationsToBeDeleted = this.TextWidgetAPI.getAnnotationsToBeDeleted();
    if (typeof (annotationsToBeDeleted) == "undefined" ||
      annotationsToBeDeleted.length === 0) {
      this.TextWidgetAPI.disableIsRunning();
      return false;
    }

    this.removeAnnotationsFromEditor(annotationsToBeDeleted);

    // Add (again) the type attributes to the markers
    // addTypeAttributesToMarkers();

    this.TextWidgetAPI.clearAnnotationsToBeDeleted();
    this.TextWidgetAPI.disableIsRunning();
  }; /* deleteAnnotations */

  removeAnnotationsFromEditor(annotationsToBeDeleted) {
    this.editor.operation(() => {
      annotationsToBeDeleted.forEach((annotation) => {
        if (this.TextWidgetAPI.belongsToSchemaAsSupportiveAnnotationType(annotation)) {
          // Remove relation annotation
          this.removeConnectedAnnotation({
            "annotation": annotation,
            "selected": false,
            "action": "delete"
          });
        } else if (this.TextWidgetAPI.isSettingAnnotation(annotation)) {
          // Do nothing on setting Annotations...
        } else {
          var annotationId = "id-" + String(annotation._id).trim();
          this.overlayMarkRemove({
            "annotation": annotation,
            "selected": false,
            "action": "delete"
          });
          // Regular annotations, delete their marks
          var editorMarks = this.editor.getAllMarks();
          editorMarks.forEach((mark) => {
            if (String(mark.className).trim().indexOf(annotationId) !== -1) {
              mark.clear();
            }
          });
        }
      });
    });
  }; /* removeAnnotationsFromEditor */

  deleteSelectedAnnotation(...e) {
    // if (evt.which != 46)           {return false;} // key, code = "Delete"
    // console.error("TextWidgetComponent: deleteSelectedAnnotation():", e);
    if (this.TextWidgetAPI.checkIsRunning()) { return false; }
    var annotationToBeDeleted: any = this.TextWidgetAPI.getSelectedAnnotation();
    if (Object.keys(annotationToBeDeleted).length == 0) { return false; }
    if (!this.TextWidgetAPI.annotationCanBeDeleted(annotationToBeDeleted)) {
      this.toastrService.error(this.TextWidgetAPI.annotationCanBeDeletedMessage);
      // console.error("TextWidgetComponent: deleteSelectedAnnotation(): Annotation cannot be deleted:", this.TextWidgetAPI.annotationCanBeDeletedMessage, annotationToBeDeleted);
      return false;
    }
    this.TextWidgetAPI.clearSelectedAnnotation();
    this.tempAnnotationService.destroy(annotationToBeDeleted.collection_id,
      annotationToBeDeleted.document_id, annotationToBeDeleted._id)
      .then((response: any) => {
        if (!response.success) {
          this.dialog.open(ErrorDialogComponent, {
            data: new ConfirmDialogData("Error",
              "Error during the deleting the annotation. Please refresh the page and try again.")
          })
        } else {
          this.TextWidgetAPI.deleteAnnotation(annotationToBeDeleted._id);
        }
      }, (error) => {
        this.dialog.open(ErrorDialogComponent, {
          data: new ConfirmDialogData("Error",
            "Error in delete Annotation. Please refresh the page and try again")
        })
      });
  }; /* deleteSelectedAnnotation */

  updateCurrentSelection() {
    var currentSel: any = this.TextWidgetAPI.getCurrentSelection();
    // console.error("TextWidgetComponent: updateCurrentSelection():", currentSel);

    if (typeof (currentSel) == "undefined") {
      return;
    } else if (Object.keys(currentSel).length == 0) {
      switch (this.annotationMode) {
        case AnnotationMode.TEXT:
          this.editor.setSelection({
            line: 0,
            ch: 0
          }, {
            line: 0,
            ch: 0
          }, {
            scroll: false
          });
          break;
        case AnnotationMode.IMAGE:
          if (this.imageAnnotator.selection) {
            // If there is a selection, deselect it...
            this.imageAnnotator.selection.remove();
           }
           this.imageAnnotator.selection = undefined;
           break;
      }
    } else {
      var sel = this.computeSelectionFromOffsets(parseInt(currentSel.startOffset),
        parseInt(currentSel.endOffset));
      this.editor.setSelection(sel.start, sel.end, {
        scroll: false
      });
    }
  }; /* updateCurrentSelection */

  scrollToAnnotation(annotation=undefined) {
    // console.error("TextWidgetComponent: scrollToAnnotation():", annotation);
    if (!annotation) {
      annotation = this.TextWidgetAPI.getScrollToAnnotation();
    }
    if (typeof (annotation) == "undefined" || Object.keys(annotation).length == 0) {
      return false;
    }
    if (annotation.spans.length < 1) {
      // Empty spans, like in Document Attribute annotations...
      return false;
    }
    var pos = {
      from: this.editor.posFromIndex(annotation.spans[0].start),
      to:   this.editor.posFromIndex(annotation.spans[annotation.spans.length - 1].end)
    }
    this.editor.scrollIntoView(pos);
    //editor.setCursor(annotation.spans[0].start);
    //editor.scrollIntoView(null);
  }; /* scrollToAnnotation */

  exportPDF() {
    var codeMirror = document.getElementsByClassName("CodeMirror-scroll")[0];
    // console.error("export PDF:", codeMirror);

    //Create a new PDF canvas context.
    // var ctx = new canvas2pdf.Context(blobStream());

    // html2canvas((codeMirror as HTMLElement), { canvas: ctx}).then(function(canvas) {
    //   console.error("canvas:", canvas);
    // });

    // //convert your PDF to a Blob and save to file
    // ctx.stream.on('finish', () =>  {
    //   var blob = ctx.stream.toBlob('application/pdf');
    //   saveAs(blob, 'example.pdf', true);
    // });
    // ctx.end();

    // let doc = new jsPDF('p', 'mm', 'a4');
    // doc.html((codeMirror as HTMLElement) /*, {
    //   callback: (doc) => {
    //     doc.output("dataurlnewwindow");
    //   }
    // }*/);
    // doc.save('export-pdf.pdf');
  }; /* exportPDF */

  /* This function will be called when settings are updated. */
  updateSettings() {
    // console.error("TextWidgetComponent: updateSettings()");
    this.settings = this.TextWidgetAPI.getSettings();
    if (!this.TextWidgetAPI.checkIsRunning()) {
      this.TextWidgetAPI.enableIsRunning();
    } else {
      return false;
    }
    var annotatorType = this.TextWidgetAPI.getAnnotatorType();
    // We have annotations in editor. Get all annotations, and
    // re-visualise them!
    var annotations = this.TextWidgetAPI.getAnnotations()
      .map((ann) => {
        return {
          "annotation": ann,
          "selected": false,
          "action": "matches"
        };
      });
    if (annotations != undefined && annotations.length) {
      this.visualiseAnnotations(annotations, annotatorType);
    }
    this.TextWidgetAPI.disableIsRunning();
  }; /* updateSettings */

  annotationCanBeDeleted(ann) {
    this.TextWidgetAPI.annotationCanBeDeletedMessage = 'Annotation cannot be deleted, as it is a relation source/target!';
    // Make sure that the annotation to be deleted is not a relation argument...
    return this.connectedAnnotations.every((item) => ann._id != item.startId && ann._id != item.endId );
  }; /* annotationCanBeDeleted */

  /*
   * Image Annotation
   */
  imageAnnotator = {
    selection: undefined
  };

  imageOverlayPointerDown(evt, x, y) {
    // console.error("TextWidgetComponent: imageOverlayPointerDown:", evt, x, y);
    // From: https://github.com/clientIO/joint/blob/master/demo/rough/src/rough.js
    if (this.imageAnnotator.selection) {
      // If there is a selection, deselect it...
      this.imageAnnotator.selection.remove();
    }
    this.imageAnnotator.selection = undefined;
    this.TextWidgetAPI.clearSelection();
    evt.data = {};
    evt.data["x"] = x;
    evt.data["y"] = y;
  }; /* imageOverlayPointerDown */

  imageOverlayPointerMove(evt, x, y) {
    // console.error("TextWidgetComponent: imageOverlayPointerMove:", evt, x, y, evt.data);
    var data = evt.data;
    var cell;
    // If we do not have a selection, create one...
    if (this.imageAnnotator.selection === undefined) {
      data = evt.data = {};
      cell = new joint.shapes.standard.Rectangle({attrs: {
        body: {
          stroke: "red",
          fill: "red"
        }
      }});
      cell.attr('body/fill-opacity',   '0.5');
      cell.attr('body/stroke-opacity', '0.8');
      cell.position(x, y);
      cell.set('elementMove', true);
      cell.set('annotation',  null);
      data["x"] = x;
      data["y"] = y;
      cell.addTo(this.graph);
      cell.on('change', this.imageOverlayElementChange.bind(this));
      this.imageAnnotator.selection = cell;
    } else {
      cell = this.imageAnnotator.selection;
      if (cell.isLink()) {
          cell.target({ x: x, y: y });
      } else {
          var bbox = new joint.g.Rect(data.x, data.y, x - data.x, y - data.y);
          bbox.normalize();
          cell.set({
              position: { x: bbox.x, y: bbox.y },
              size: { width: Math.max(bbox.width, 1), height: Math.max(bbox.height, 1) }
          });
      }
    }
  }; /* imageOverlayPointerMove */

  imageOverlayPointerUp(evt, x, y) {
    // console.error("TextWidgetComponent: imageOverlayPointerUp:", evt, x, y);
    var selection = this.getSelectionInfo();
    if (Object.keys(selection).length > 0) {
      this.TextWidgetAPI.setCurrentSelection(selection, false);
      this.TextWidgetAPI.clearSelectedAnnotation();
    }
  }; /* imageOverlayPointerUp */

  imageOverlayElementChange(element, opt) {
    var selection = this.getSelectionInfo();
    if (Object.keys(selection).length > 0) {
      this.TextWidgetAPI.setCurrentSelection(selection, false);
      this.TextWidgetAPI.clearSelectedAnnotation();
    }
  }; /* imageOverlayElementChange */

  imageOverlayElementPointerClick(elementView, evt, x, y) {
    // console.error("TextWidgetComponent: imageOverlayElementPointerClick():", elementView, elementView.model.annotation);
    // Deselect everything...
    this.imageOverlayPointerDown(evt, x, y);
    var annotation = elementView.model.get("annotation");
    if (annotation != null) {
      var selectedAnnotation = this.TextWidgetAPI.getAnnotationById(annotation._id);
      var prevAnnotationId   = this.TextWidgetAPI.getSelectedAnnotation()["_id"];
      if (typeof (selectedAnnotation) != "undefined" &&
          prevAnnotationId !== selectedAnnotation._id) {
        this.TextWidgetAPI.setSelectedAnnotation(selectedAnnotation);
      }
    }
  }; /* imageOverlayElementPointerClick */

  imageOverlayElementMouseEnter(elementView) {
    var selection = this.imageAnnotator.selection && this.imageAnnotator.selection.findView(this.paper) == elementView;
    if (!selection) return;
    var model = elementView.model;
    var bbox  = model.getBBox();

    elementView.addTools(new joint.dia.ToolsView({
      tools: [
        new joint.elementTools.Remove({
          useModelGeometry: true,
          y: '50%',
          x: '50%',
          offset: { x: 0, y: 0 }
        }),
        new joint.elementTools.Boundary({
          focusOpacity: 0.6,
          padding: 6,
          useModelGeometry: true
        }),
        new ShapeControl.ShapeLControl({  handleAttributes: { fill: 'orange', cursor: 'w-resize'  }}),
        new ShapeControl.ShapeRControl({  handleAttributes: { fill: 'orange', cursor: 'e-resize'  }}),
        new ShapeControl.ShapeTControl({  handleAttributes: { fill: 'orange', cursor: 'n-resize'  }}),
        new ShapeControl.ShapeBControl({  handleAttributes: { fill: 'orange', cursor: 's-resize'  }}),
        new ShapeControl.ShapeLTControl({ handleAttributes: { fill: 'orange', cursor: 'nw-resize' }}),
        new ShapeControl.ShapeLBControl({ handleAttributes: { fill: 'orange', cursor: 'sw-resize' }}),
        new ShapeControl.ShapeRTControl({ handleAttributes: { fill: 'orange', cursor: 'ne-resize' }}),
        new ShapeControl.ShapeRBControl({ handleAttributes: { fill: 'orange', cursor: 'se-resize' }}),
        new ShapeControl.ShapeRotateControl({ handleAttributes: { fill: 'blue', cursor: 'move' }})
      ]
    }));
  }; /* imageOverlayElementMouseEnter */

  imageOverlayCellMouseLeave(elementView) {
    var selection = this.imageAnnotator.selection && this.imageAnnotator.selection.findView(this.paper) == elementView;
    if (!selection) return;
    elementView.removeTools();
  }; /* imageOverlayCellMouseLeave */

}
