import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import * as CodeMirror from 'codemirror';
import { BaseControlComponent } from '../base-control/base-control.component';
import { cloneDeep, indexOf, has, filter, without, find } from "lodash";
import { ErrorDialogComponent } from '../../dialogs/error-dialog/error-dialog.component';
import { ConfirmDialogData } from 'src/app/models/dialogs/confirm-dialog';
import 'leader-line';
const joint = require('../../../../../node_modules/jointjs/dist/joint.js');
declare let LeaderLine: any;
import * as _ from 'lodash';
import { type } from 'node:os';

@Component({
  selector: 'text-widget',
  templateUrl: './text-widget.component.html',
  styleUrls: ['./text-widget.component.scss']
})
export class TextWidgetComponent extends BaseControlComponent implements OnInit, OnDestroy {

  @ViewChild("element", { static: true }) element: ElementRef<HTMLTextAreaElement>;
  mainContent;
  editor: CodeMirror.EditorFromTextArea;
  textWidgetOverlay:any;
  skipLineNumber = {};
  paper;
  routerName;

  graph = new joint.dia.Graph;

  // Variable controlling whether the spinner is visible...
  spinnerVisible = false;

  // Annotator Type Id (class + values)
  AnnotatorTypeId = "";

  // Class names to add to annotated text
  markedTextClass = " annotated-text";

  // List of connected annotation arrows
  connectedAnnotations = [];
  annotationIdToGraphItem = {};
  showLinkRouterSelector;

  // Get the local coordinates of the first character in the editor...
  textWidgetLines:any;
  textarea;
  gutter;

  initialLoad:boolean = false;

  ngOnInit() {
    this.textarea = this.element.nativeElement;
    this.editor = CodeMirror.fromTextArea(this.element.nativeElement, /* TODO: FIX OPTIONS, CURRENTLY REPLACED WITH OLD ONES{
      lineNumbers: true,
      firstLineNumber: 1,
      dragDrop: false,
      readOnly: true,
      /*theme: "night",*//*
      direction: "ltr",
      lineWrapping: true,
      autofocus: false,
      cursorBlinkRate: -1,
      viewportMargin: Infinity,
      scrollbarStyle: "native",
      extraKeys: {}
    }*/    {lineNumbers: true,
      dragDrop: false,
      readOnly: false,
      theme: "night",
      lineWrapping: true,
      autofocus: false,
      cursorBlinkRate: -1,
      viewportMargin: Infinity,
      scrollbarStyle: "native",
      extraKeys: {}});

    this.gutter = this.editor.getGutterElement();

    this.paper = new joint.dia.Paper({
      el: this.textWidgetOverlay,
      model: this.graph,
      width: "100%",
      height: "100%",
      gridSize: 1,
      restrictTranslate: true,
      snapLabels: true,
      interactive: {
        linkMove: false,
        labelMove: true,
        arrowheadMove: false,
        vertexMove: false,
        vertexAdd: false,
        vertexRemove: false,
        useLinkTools: false
      }
    });

    // Set an event on lines pointer clicks...
    this.paper.on('link:pointerup',(elementView, evt, x, y)=> {
      evt.stopPropagation();
      // evt.stopImmediatePropagation();
      var currentElement = elementView.model;
      if (!("annotation_id" in currentElement)) return;
      var annotation = this.TextWidgetAPI.getAnnotationById(currentElement.annotation_id);
      if (typeof (annotation) != "undefined") return;
      // Set this annotation as the selected one
      this.TextWidgetAPI.setSelectedAnnotation(annotation);
      this.TextWidgetAPI.clearOverlappingAreas(); // not sure if required...
    });

    //TODO:FIX this.editor.setOption("lineNumberFormatter", this.lineNumberFormatter);



    //CodeMirror.on(this.mainContent, "mouseup", () => { this.mouseUpHandler });
    //CodeMirror.on(this.mainContent, "mousedown", () => { this.mouseDownUpHandler });
    
    /*TODO:FIX this.editor.setOption("extraKeys", {
      Delete: this.deleteSelectedAnnotation,
      Space: function () { this.editor.refresh(); },
    });*/
    
    //TODO:FIX this.editor.on('refresh', this.overlayRefresh);

    this.editor.on("dblclick", (e) => {
      this.mouseUpHandler(e);
    });

    this.editor.on("cursorActivity", (e) => {
      this.mouseUpHandler(e);
    });

    this.editor.on("mousedown", (e) => {
      this.mouseDownUpHandler(e);
    });

    /*scope.$watch('maincontentSelector', function (newVal, oldVal) {
      console.warn("maincontentSelector:", newVal);
    });
    scope.updateLinkRouter = function (routerName) {
      var router, connector = "rounded";
      switch (routerName) {
        case "direct":
          break;
        case "smooth":
          connector = routerName;
          break;
        default:
          router = routerName;
          break;
      }
      console.warn("updateLinkRouter:", routerName, router);
      _.each(this.connectedAnnotations, (annotation) => {
        if (router) {
          annotation.instance.router(router, scope.layout.routerOptions[routerName]);
        } else {
          annotation.instance.unset("router");
        }
        annotation.instance.set('connector', { name: connector });
      });
    };*/
    this.TextWidgetAPI.registerCurrentDocumentCallback(this.updateCurrentDocument.bind(this));
    this.TextWidgetAPI.registerCurrentSelectionCallback(this.updateCurrentSelection.bind(this));
    this.TextWidgetAPI.registerNewAnnotationsCallback(this.addNewAnnotations.bind(this));
    this.TextWidgetAPI.registerDeletedAnnotationsCallback(this.deleteAnnotations.bind(this));
    this.TextWidgetAPI.registerScrollIntoViewCallback(this.scrollToAnnotation.bind(this));

    this.textWidgetLines = document.getElementsByClassName("CodeMirror-lines")[0];
    this.textWidgetOverlay = document.getElementById('annotation-editor-text-widget-overlay');
  }

  ngOnDestroy(){}



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

  // Listen to scroll event to scroll annotation relations
  /* Dropped Leader library, so not this is deprecated
  mainContent.addEventListener('scroll', AnimEvent.add(function () {
    _.each(connectedAnnotations, function (annotation) {
      try {
        annotation.instance.position();
      }
      catch (err) {
        // Remove instance of line and redraw it
        annotation.instance.remove();
        annotation.instance = overlayLinkAdd(annotation.startId, annotation.endId, annotation.label, annotation.data);
      }
    });
    $('.leader-line').css('z-index', 1);
  }), false); */

  getSelectionInfo() {
    // var start = 0, end = 0;
    var selection = {
      startOffset: -1,
      endOffset: -1,
      segment: ""
    };

    // var totalDocLines        = editor.lineCount();
    var editorSelectionStart = this.editor.getCursor("from");
    var editorSelectionEnd = this.editor.getCursor("to");
    // var editorSegment        = editor.getSelection();

    if (typeof (editorSelectionStart) != "undefined" &&
      typeof (editorSelectionEnd) != "undefined") {
      /* Petasis, 20/03/2021: Used codemirror functions for getting offsets... */
      selection.startOffset = this.editor.indexFromPos(editorSelectionStart);
      selection.endOffset = this.editor.indexFromPos(editorSelectionEnd);
      selection.segment = this.editor.getSelection();
      /*
      for (var i = 0; i < totalDocLines; i++) {
        var lineLength = editor.getLine(i).length;
        end = start + lineLength;
        if (selection.startOffset === -1 && angular.equals(i, editorSelectionStart.line))
          selection.startOffset = start + editorSelectionStart.ch;
        if (selection.startOffset !== -1 && angular.equals(i, editorSelectionEnd.line)) {
          selection.endOffset = start + editorSelectionEnd.ch;
          selection.segment = editorSegment;
          break;
        }
        start = end;
      }*/
    }

    return selection;
  };

  computeSelectionFromOffsets(startOffset, endOffset) {
    return {
      start: this.editor.posFromIndex(startOffset),
      end: this.editor.posFromIndex(endOffset)
    }
    /* Petasis, 20/03/2021: Use codemirror's conversion from offsets to position
    var start = 0, end = 0;
    var selection = {
      start: {
        line: -1,
        ch: -1
      },
      end: {
        line: -1,
        ch: -1
      }
    };
    var totalDocLines = editor.lineCount();
    for (var i = 0; i < totalDocLines; i++) {
      var lineLength = editor.getLine(i).length;
      end = start + lineLength;
      if (startOffset >= start && startOffset <= end && selection.start.line === -1) {
        selection.start.line = i;
        selection.start.ch = startOffset - start;
      }
      if (endOffset >= start && endOffset <= end && selection.end.line === -1) {
        selection.end.line = i;
        selection.end.ch = endOffset - start;
        break;
      }
      start = end;
    }
    return selection; */
  };

  mouseDownUpHandler(e) {
    if (e.button === 1) { //middle button click
      e.preventDefault();
      return false;
    }
  };

  mouseUpHandler(e) {

    if(!this.initialLoad){
      this.initialLoad = true;
      return;
    }

    if (typeof e.button == "undefined") { //left button click
      var selection = this.getSelectionInfo();
      // console.warn("MOUSE 1:", selection, e);

      if (Object.keys(selection).length > 0) {
        this.TextWidgetAPI.setCurrentSelection(selection, false);
        this.TextWidgetAPI.clearSelectedAnnotation();

        if (selection.segment == "") { //point selection
          var annotationId = null;

          // Regular mark selection, use CodeMirror's api
          var editorSelection = this.computeSelectionFromOffsets(selection.startOffset, selection.startOffset); //transform selection from absolute to cm format
          var availableAnnotationsOnCursor = this.editor.findMarksAt(editorSelection.start/*TODO:FIX, editorSelection.end*/); //find available marks at the position of the cursor
          var availableAnnotationsLength = availableAnnotationsOnCursor.length;

          if (availableAnnotationsLength > 0) {
            // Get first part of the annotation's class name, which should be the ID
            annotationId = availableAnnotationsOnCursor[availableAnnotationsLength - 1].className;
            annotationId = annotationId.split(" ")[0].substr(3); // remove "id-" prefix...
          }

          if (!_.isNull(annotationId)) {
            // Get the selected annotation from its ID and the previous selected annotation
            var selectedAnnotation = this.TextWidgetAPI.getAnnotationById(annotationId);
            var prevAnnotationId = this.TextWidgetAPI.getSelectedAnnotation()["_id"];

            if (typeof (selectedAnnotation) != "undefined" && prevAnnotationId !== selectedAnnotation._id) {
              this.TextWidgetAPI.setSelectedAnnotation(selectedAnnotation);
              this.TextWidgetAPI.computeOverlappingAreas(selection.startOffset);
              return false;
            }
          }
        }
      }
    } else if (e.button === 1) { //middle button click
      e.preventDefault();
      var updatedSelection: any = {};
      var savedSelection: any = this.TextWidgetAPI.getCurrentSelection();

      var editorCursor = this.editor.getCursor("from");
      var word = this.editor.findWordAt(editorCursor);
      this.editor.setSelection(word.anchor, word.head);
      var currentSelection = this.getSelectionInfo();

      if (typeof (savedSelection) == "undefined" || Object.keys(savedSelection).length == 0 || savedSelection.segment.length === 0) {
        this.TextWidgetAPI.setCurrentSelection(currentSelection, false);
      } else if (savedSelection.segment.length > 0) {
        if (currentSelection.startOffset < savedSelection.startOffset)
          updatedSelection = this.computeSelectionFromOffsets(currentSelection.startOffset, savedSelection.endOffset);
        else if (currentSelection.endOffset > savedSelection.endOffset)
          updatedSelection = this.computeSelectionFromOffsets(savedSelection.startOffset, currentSelection.endOffset);
        else
          updatedSelection = currentSelection;

        if ((!_.has(updatedSelection, "start") || !_.has(updatedSelection, "end")) && this.TextWidgetAPI.getAnnotatorType() === "Coreference Annotator") {
          updatedSelection = this.computeSelectionFromOffsets(updatedSelection.startOffset, updatedSelection.endOffset);
        }

        this.editor.setSelection(updatedSelection.start, updatedSelection.end);
        currentSelection = this.getSelectionInfo();
        if (currentSelection.segment != "")
          this.TextWidgetAPI.setCurrentSelection(currentSelection, false);
      }
    } else
      this.TextWidgetAPI.clearSelection();
  };

  /**
   * Bring the text and the annotations when a document changes
   */
  updateCurrentDocument() {
    var newDocument: any = this.TextWidgetAPI.getCurrentDocument();
    this.AnnotatorTypeId = newDocument.annotator_id; //TextWidgetAPI.getAnnotatorTypeId();
    return new Promise((resolve, reject) => {

      if (Object.keys(newDocument).length > 0) { //if new document is not empty
        var documentData = {
          document_id: newDocument.id,
          collection_id: newDocument.collection_id,
          annotator_type: this.AnnotatorTypeId
        };

        this.openDocumentService.save(documentData)
          .then((response: any) => {
            if (response.success)
              return this.documentService.get(newDocument.collection_id, newDocument.id); //get document's data
            else
              return reject();
          })
          .then((response: any) => {
            if (!response.success) {
              this.TextWidgetAPI.disableIsRunning();
              this.dialog.open(ErrorDialogComponent, { data: new ConfirmDialogData("Error", "Error during the restore of your document. Please refresh the page and try again.") })
            } else {
              this.spinnerVisible = true;
              this.TextWidgetAPI.resetData();
              this.editor.setValue("");
              this.editor.clearHistory();
              var options = JSON.parse(response.data.visualisation_options);
              if (options !== null && "gutter" in options) {
                this.skipLineNumber = options["gutter"];
              } else {
                this.skipLineNumber = {};
              }
              this.editor.setValue(response.data.text);
              this.graph.clear();
              this.annotationIdToGraphItem = {};
              this.connectedAnnotations = [];
              this.editor.refresh();
              this.showLinkRouterSelector = false;
              this.visualiseVisualisationOptions(options);

              if (response.data.is_opened) {
                this.restoreAnnotationService.restoreFromTemp(newDocument.collection_id, newDocument.id, this.AnnotatorTypeId)
                  .then((response: any) => {
                    this.TextWidgetAPI.disableIsRunning();

                    if (!response.success) {
                      this.dialog.open(ErrorDialogComponent, { data: new ConfirmDialogData("Error", "Error during the restore of your annotations. Please refresh the page and try again.") })
                    } else
                      response.data = this.migrateOldSpans(response.data);
                    this.TextWidgetAPI.matchAnnotationsToSchema(response.data, this.AnnotatorTypeId);
                  });
              } else {
                this.restoreAnnotationService.restoreFromDB(newDocument.collection_id, newDocument.id, this.AnnotatorTypeId)
                  .then((response: any) => {
                    this.TextWidgetAPI.disableIsRunning();

                    if (!response.success) {
                      this.dialog.open(ErrorDialogComponent, { data: new ConfirmDialogData("Error", "Error during the restore of your annotations. Please refresh the page and try again.") })
                    } else
                      response.data = this.migrateOldSpans(response.data);
                    this.TextWidgetAPI.matchAnnotationsToSchema(response.data, this.AnnotatorTypeId);
                  });
              }
            }
          }, (error) => {
            this.TextWidgetAPI.disableIsRunning();
            this.dialog.open(ErrorDialogComponent, { data: new ConfirmDialogData("Error", "Database error. Please refresh the page and try again.") })
          });
      } else
        this.TextWidgetAPI.disableIsRunning();
    });
  }


  visualiseVisualisationOptions(options) {
    if (options == null /*|| (!"marks" in options)*/) {
      return;
    }
    var marks = options["marks"];
    for (var i = 0; i < marks.length; i++) {
      var item = marks[i];
      this.editor.markText(item.start, item.end, {
        className: /*"tei-"+*/item.tags
      });
    }
  }; /* visualiseVisualisationOptions */

  /*TODO:FIX lineNumberFormatter(line) {
    return line - 1 in this.skipLineNumber ?
      this.skipLineNumber[line - 1] : line.toString();
  }; /* lineNumberFormatter */

  migrateOldSpans(anns) {
    var annotations = [];
    for (var i = 0; i < anns.length; i++) {
      var ann = anns[i];
      var modified = false;
      for (var j = 0; j < ann.spans.length; j++) {
        var span = ann.spans[j];
        var selection = this.computeSelectionFromOffsets(span.start, span.end);
        var fragment = this.editor.getRange(selection.start, selection.end);
        if (span.segment !== fragment) {
          /*TODO:FIX var cursor = this.editor.getSearchCursor(span.segment, selection.start);
          var found = cursor.findNext();
          if (!found) {
            found = cursor.findPrevious();
          }
          if (found) {
            span.start = this.editor.indexFromPos(cursor.from());
            span.end = this.editor.indexFromPos(cursor.to());
            ann.spans[j] = span;
            modified = true;
          }*/
        }
      }
      if (modified) {
        //TODO: Update service
        //this.restoreAnnotationService.updateToTemp(ann);
      }
      annotations.push(ann);
    }
    return annotations;
  }; /* migrateOldSpans */

  overlayRefresh() {
    console.warn("overlayRefresh: gutter width:", this.gutter.offsetWidth,
      "editor width:", this.textWidgetLines["offsetWidth"]);
    for (const annId in this.annotationIdToGraphItem) {
      var annotation = this.TextWidgetAPI.getAnnotationById(annId);
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
    this.overlayLinksRefresh();
  }; /* overlayRefresh */

  overlayLinksRefresh() {
    _.each(this.connectedAnnotations, (annotation) => {
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
    var over = this.textWidgetOverlay.getBoundingClientRect();
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
    var deep = false, selector = 'body', items, colours = {}, colour;
    if (annotation.annotation._id in this.annotationIdToGraphItem) {
      items = this.annotationIdToGraphItem[annotation.annotation._id];
    } else {
      // A link...
      var connectedAnnotation = _.find(this.connectedAnnotations, (ann)=> {
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
    for (const spanIndex in items) {
      var item = items[spanIndex];
      if (spanIndex in colours) {
        colour = colours[spanIndex];
      } else {
        colour = '#4666E5';
      }
      const elementView = item.findView(this.paper);
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
        // console.warn("<<overlayHighlight>>:", annotation.annotation._id);
      } else if (true || annotation.action == "deselect" ||
        annotation.action == "delete") {
        joint.highlighters.mask.remove(elementView);
        // console.warn("  overlayHighlight  :", annotation.annotation._id);
      }
    }
  }; /* overlayHighlight */

  overlayMarkAdd(spanIndex, startPos, endPos, annotation) {
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
    // This method creates a polygon from codemirror coordinates (line, pos)
    var startCoords = this.editor.charCoords(startPos, "local"),
      endCoords = this.editor.charCoords(endPos, "local");
    // console.warn(startCoords, endCoords);
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
    // item.attr('body/stroke', 'green');
    item.attr('root/pointer-events', 'none');
    return item;
  }; /* overlayMarkAdd */

  overlayMarkRemove(annotation) {
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
        item.remove();
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

    /*TODO: FIX
    if (!startId in this.annotationIdToGraphItem) return;
    if (!endId in this.annotationIdToGraphItem) return;
    if (!scope.layout.showLinkRouterSelector) {
      scope.layout.showLinkRouterSelector = true;
    }*/

    // Do we have already a line?
    var connectedAnnotation = _.find(this.connectedAnnotations, (ann)=> {
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
    var router, connector = "rounded";
    switch (this.routerName) {
      case "direct":
        break;
      case "smooth":
        connector = this.routerName;
        break;
      default:
        router = this.routerName;
        break;
    }
    // Create a new line...
    var link = new joint.shapes.standard.Link({
      connector: { name: connector },
      attrs: {
        line: {
          stroke: '#808080',
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

    //TODO: FIX Link router
    //link.router(router, scope.layout.routerOptions[this.routerName]);
    link.addTo(this.graph);
    // Add the annotation id to the link...
    link["annotation_id"] = annotation.annotation._id;
    return link;
  }; /* overlayLinkAdd */

  overlayLinksRouterSet(routername) {
    _.each(this.connectedAnnotations, (annotation) => {
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
        .groupBy((link)=> {

          // the key of the group is the model id of the link's source or target
          // cell id is omitted
          return _.omit([link.source().id, link.target().id], cell.id)[0];
        })
        .each((group, key)=> {

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
        var midPoint = 0;//TODO: FIX g reference ! g.Line(sourceCenter, targetCenter).midpoint();

        // find the angle of the link
        var theta = sourceCenter.theta(targetCenter);

        // constant
        // the maximum distance between two sibling links
        //TODO FIX GAP
        var GAP = 0;//scope.layout.routerGAP;

        _.each(siblings, (sibling, index)=> {

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
          var angle = 0;//TODO: FIX g reference ! g.toRad(theta + (sign * reverse * 90));
          var vertex = 0;//TODO: FIX g reference ! g.Point.fromPolar(offset, angle, midPoint).toJSON();

          // replace vertices array with `vertex`
          sibling.vertices([vertex]);
        });
      }
    }
  }; /* overlayLinkAdjustVertices */

  /**
   * Remove a connection annotation's leader line instance as well as
   * remove it from the connectedAnnotations list
   */
  removeConnectedAnnotation (annotation) {
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
    // Remove the LeaderLine instance
    connectedAnnotation.instance.remove();

    // Remove the object from the connectedAnnotations array
    var arrayIndex = this.connectedAnnotations.indexOf(connectedAnnotation);
    this.connectedAnnotations.splice(arrayIndex, 1);
  }; /* removeConnectedAnnotation */

  clearDuplicateAnnotationsFromEditor(newAnnotations) {
    var editorMarks = this.editor.getAllMarks();

    _.each(newAnnotations,(annotation)=> {
      if (this.TextWidgetAPI.belongsToSchemaAsSupportiveAnnotationType(annotation.annotation)) {
        // Remove connected annotation
        this.removeConnectedAnnotation(annotation);
      } else {
        this.overlayMarkRemove(annotation);
        // Remove marks of regular annotation
        _.each(editorMarks,(editorMark)=> {
          // Get ID of mark
          var editorMarkClass = editorMark.className.split(" ")[0];

          if (("id-" + String(annotation.annotation._id).trim()).indexOf(editorMarkClass) > -1) {
            editorMark.clear();
          }
        });
      }
    });
  }; /* clearDuplicateAnnotationsFromEditor */

  /**
   * Visualize the annotations to the text widget
   * @param newAnnotations
   * @param annotatorType
   * @returns {boolean}
   */
  visualizeAnnotations(newAnnotations, annotatorType) {
    if (typeof (newAnnotations) == "undefined" ||
      newAnnotations.length === 0) return false;

    // if there are any borders around a specific annotation, remove them.
    this.clearDuplicateAnnotationsFromEditor(newAnnotations);

    // if there are new annotations to be visualised, add them to the editor
    for (var k = 0; k < newAnnotations.length; k++) {
      var currAnnotation = newAnnotations[k];

      if (this.TextWidgetAPI.isRelationAnnotationType(currAnnotation.annotation)) {
        // Argument relation, add arrow. Find IDs of start/end annotations
        var startId = _.findWhere(currAnnotation.annotation.attributes, {
          name: 'arg1'
        }).value;
        var endId = _.findWhere(currAnnotation.annotation.attributes, {
          name: 'arg2'
        }).value;

        var label = _.findWhere(currAnnotation.annotation.attributes, {
          name: 'type'
        }).value;

        // Create the line
        var line = this.overlayLinkAdd(startId, endId, label, currAnnotation);

        // Add relation annotation to the list
        if (!_.isUndefined(line)) {
          this.connectedAnnotations.push({
            instance: line,
            startId: startId,
            endId: endId,
            label: label,
            data: currAnnotation.annotation
          });
        }
      } else if ("document_attribute" in currAnnotation.annotation) {
        // This is a document Annotation... TODO:FIX BROADCAST
        //$rootScope.$broadcast('sendDocumentAttribute:' +
        //  currAnnotation.annotation.document_attribute, currAnnotation.annotation);
      } else {
        // Normal annotation
        // Iterate through annotations spans

        if (typeof newAnnotations[k].annotation.spans == "undefined") {
          continue;
        }
        
        for (var l = 0; l < newAnnotations[k].annotation.spans.length; l++) {
          var colorCombination: any = {};
          var annotationSpan = currAnnotation.annotation.spans[l];
          var annotationsAttributes = currAnnotation.annotation.attributes;

          // create the selection in the editor and annotate it
          var selection = this.computeSelectionFromOffsets(
            parseInt(annotationSpan.start), parseInt(annotationSpan.end));
          var count = 0;
          switch (annotatorType) {
            case "Button Annotator":
              // If it is Button Annotator get the required color combination
              for (var m = 0; m < annotationsAttributes.length; m++) {
                colorCombination =
                  this.buttonColorService.getColorCombination(annotationsAttributes[m].value);
                if (typeof (colorCombination) != "undefined")
                  break;
              }
              var markClassName = "id-" +
                String(currAnnotation.annotation._id).trim() + this.markedTextClass;

              if (typeof (currAnnotation.selected) != "undefined" &&
                currAnnotation.selected) {
                // Selected marker
                // var borderColor = ColorLuminance(colorCombination.bg_color, 100);

                // editor.markText(selection.start, selection.end, {
                //   className: markClassName,
                //   css: "color:" + colorCombination.fg_color + "; " +
                //     "background:" + colorCombination.bg_color + "; " +
                //     "border: 2px ridge " + borderColor + ";"
                // });
                this.editor.markText(selection.start, selection.end, {
                  className: markClassName,
                  css: "color:" + colorCombination.colour_font + "; " +
                    "background: " + colorCombination.colour_selected_background + "; " +
                    "border-color:" + colorCombination.colour_border + ";" +
                    "border-top: 4px solid " + colorCombination.colour_border + "; " +
                    "border-bottom: 4px solid " + colorCombination.colour_border + "; "
                });
              } else {
                // Normal marker
                // editor.markText(selection.start, selection.end, {
                //   className: currAnnotation.annotation._id,
                //   css: "color:" + colorCombination.fg_color + ";" +
                //     "background:" + colorCombination.bg_color + ";"
                // });
                this.editor.markText(selection.start, selection.end, {
                  className: markClassName,
                  css: "color:" + colorCombination.colour_font + ";" +
                    "background:" + colorCombination.colour_background + ";" +
                    "border-color:" + colorCombination.colour_border + ";"
                });
              }
              this.overlayMarkAdd(l, selection.start, selection.end,
                currAnnotation);

              break;
            case "Coreference Annotator":
              // If it is Coreference Annotator get the required color combination
              var colourCom =
                this.coreferenceColorService.getColorCombination(currAnnotation.annotation._id);
              var mark = null;
              var markerId = "mrkr_" + Math.floor(Math.random() * 1000000);
              // Find type
              var value = annotationSpan.start + " " + annotationSpan.end;
              var typeAttribute = _.findWhere(annotationsAttributes, {
                value: value
              }).name;
              var markAttributes = {
                markerId: markerId
              }
              markAttributes["data-type"] = typeAttribute

              // Create class for adding background color to the type pseudo-element
              var colorClass = " mark_color_" +
                colourCom["border-color"].replace("#", "").toUpperCase();
              var markClassName = "id-" + String(currAnnotation.annotation._id).trim() + " " +
                markerId + this.markedTextClass + colorClass;

              if (typeof (currAnnotation.selected) != "undefined" &&
                currAnnotation.selected) {
                // Selected marker
                mark = this.editor.markText(selection.start, selection.end, {
                  className: markClassName,
                  attributes: markAttributes,
                  css: "color:" + colourCom["font-color"] + "; " +
                    "background:" + colourCom["selected-background-colour"] + "; " +
                    "border-color:" + colourCom["border-color"] + "; " +
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
                    "border-color:" + colourCom["border-color"] + ";"
                });
              }
              this.overlayMarkAdd(l, selection.start, selection.end,
                currAnnotation);
              // Used only in addTypeAttributesToMarkers
              // mark.markerId = markerId;
              // Never used!
              // mark.annotationId = currAnnotation.annotation._id;
              break;
          }
        }
      }

      // (Re)generate the SPAN elements that show the marker types
      // Petasis, 20/03/2021: non needed anymore! addTypeAttributesToMarkers();
    }

    // Make annotation connection lines appear on top of text
    // $('.leader-line').css('z-index', 123);

    this.TextWidgetAPI.clearAnnotationsToBeAdded();
    this.overlayLinksRefresh();
    //editor.refresh();
  }; /* visualizeAnnotations */

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
          doc.setAttribute("data-type", mark.typeAttribute);

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
  };

  /**
   * Add annotation to the text widget
   * @returns {boolean}
   */
  addNewAnnotations() {
    if (!this.TextWidgetAPI.checkIsRunning())
      this.TextWidgetAPI.enableIsRunning();
    else
      return false;

    var newAnnotations = this.TextWidgetAPI.getAnnotationsToBeAdded();
    var annotatorType = this.TextWidgetAPI.getAnnotatorType();

    if (typeof (newAnnotations) != "undefined" && newAnnotations.length > 0) {
      this.visualizeAnnotations(newAnnotations, annotatorType);
    }

    this.TextWidgetAPI.disableIsRunning();
  };

  /**
   * Remove annotation from the text widget
   * @returns {boolean}
   */
  deleteAnnotations() {
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

    _.each(annotationsToBeDeleted, (annotation)=> {
      if (this.TextWidgetAPI.belongsToSchemaAsSupportiveAnnotationType(annotation)) {
        // Remove relation annotation
        this.removeConnectedAnnotation({
          "annotation": annotation,
          "selected": false,
          "action": "delete"
        });
      } else {
        var annotationId = "id-" + String(annotation._id).trim();
        this.overlayMarkRemove({
          "annotation": annotation,
          "selected": false,
          "action": "delete"
        });
        // Regular annotations, delete their marks
        var editorMarks = this.editor.getAllMarks();
        _.each(editorMarks, (mark)=> {
          if (String(mark.className).trim().indexOf(annotationId) !== -1) {
            mark.clear();
          }
        });
      }
    });

    // Add (again) the type attributes to the markers
    // addTypeAttributesToMarkers();

    this.TextWidgetAPI.clearAnnotationsToBeDeleted();
    this.TextWidgetAPI.disableIsRunning();
  }; /* deleteAnnotations */

  deleteSelectedAnnotation(cm, evt) {
    // if (evt.which != 46)           {return false;} // key, code = "Delete"
    if (this.TextWidgetAPI.checkIsRunning()) { return false; }
    var annotationToBeDeleted: any = this.TextWidgetAPI.getSelectedAnnotation();
    if (Object.keys(annotationToBeDeleted).length == 0) { return false; }
    this.tempAnnotationService.destroy(annotationToBeDeleted.collection_id, annotationToBeDeleted.document_id, annotationToBeDeleted._id)
      .then((response: any) => {
        if (!response.success) {
          this.dialog.open(ErrorDialogComponent, { data: new ConfirmDialogData("Error", "Error during the deleting the annotation. Please refresh the page and try again.") })
        } else
          this.TextWidgetAPI.deleteAnnotation(annotationToBeDeleted._id);
      }, (error) => {
        var modalOptions = { body: 'Error in delete Annotation. Please refresh the page and try again' };
        this.dialog.open(ErrorDialogComponent, { data: new ConfirmDialogData("Error", "Error in delete Annotation. Please refresh the page and try again") })
      });
  }; /* deleteSelectedAnnotation */

  updateCurrentSelection() {
    var currentSel: any = this.TextWidgetAPI.getCurrentSelection();

    if (typeof (currentSel) == "undefined") {
      return;
    } else if (Object.keys(currentSel).length == 0) {
      this.editor.setSelection({
        line: 0,
        ch: 0
      }, {
        line: 0,
        ch: 0
      }, {
        scroll: false
      });
    } else {
      var sel = this.computeSelectionFromOffsets(parseInt(currentSel.startOffset), parseInt(currentSel.endOffset));
      this.editor.setSelection(sel.start, sel.end, {
        scroll: false
      });
    }
  };

  scrollToAnnotation() {
    var annotation: any = this.TextWidgetAPI.getScrollToAnnotation();
    if (typeof (annotation) == "undefined" || Object.keys(annotation).length == 0) {
      return false;
    }
    if (annotation.spans.length < 1) {
      // Empty spans, like in Document Attribute annotations...
      return false;
    }
    var pos = {
      from: this.editor.posFromIndex(annotation.spans[0].start),
      to: this.editor.posFromIndex(annotation.spans[annotation.spans.length - 1].end)
    }
    this.editor.scrollIntoView(pos);
    //editor.setCursor(annotation.spans[0].start);
    //editor.scrollIntoView(null);
  };

}
