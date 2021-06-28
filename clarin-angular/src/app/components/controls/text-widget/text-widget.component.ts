import { Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import * as CodeMirror from 'codemirror';
import { BaseControlComponent } from '../base-control/base-control.component';
import { cloneDeep, indexOf, has, filter, without, find } from "lodash";
import { ErrorDialogComponent } from '../../dialogs/error-dialog/error-dialog.component';
import { ConfirmDialogData } from 'src/app/models/dialogs/confirm-dialog';
import 'leader-line';
declare let LeaderLine: any;

@Component({
  selector: 'text-widget',
  templateUrl: './text-widget.component.html',
  styleUrls: ['./text-widget.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TextWidgetComponent extends BaseControlComponent implements OnInit, OnDestroy {
  ngOnDestroy() {
    this.editor.toTextArea();
    //TODO:Unsub. cm events
    //CodeMirror.off(this.mainContent, "mouseup", this.mouseUpHandler);
    //CodeMirror.off(this.mainContent, "mousedown", this.mouseDownHandler);

    // Destroy leader lines
    this.connectedAnnotations.forEach((annotation) => {
      // Remove instance of line
      annotation.instance.remove();
    });
  }

  @ViewChild("element", { static: true }) element: ElementRef<HTMLTextAreaElement>;
  mainContent;
  editor: CodeMirror.EditorFromTextArea;
  initialLoad: boolean = false;

  // Variable controlling whether the spinner is visible...
  spinnerVisible = false;

  // Annotator Type Id (class + values)
  AnnotatorTypeId = "";

  // Class names to add to annotated text
  markedTextClass = " annotated-text";

  // List of connected annotation arrows
  connectedAnnotations: any[] = [];

  super() { }

  ngOnInit(): void {
    this.mainContent = document.getElementsByClassName("main-content")[0];
    this.textWidget = document.getElementById("annotation-editor-text-widget");
    this.textWidgetOverlay = document.getElementById('annotation-editor-text-widget-overlay');
    this.skipLineNumber = {};

    this.editor = CodeMirror.fromTextArea(this.textWidget /*this.element.nativeElement */, {
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

    // Get the local coordinates of the first character in the editor...
    this.textWidgetLines = document.getElementsByClassName("CodeMirror-lines")[0];
    this.textarea = this.editor.getWrapperElement();
    this.gutter = this.editor.getGutterElement();

    //TODO: Resize event impl.
    // When the editor is resized (by dragging the ui-layout-container line) refresh the editor
    // so that text selection works normally.
    /*scope.$on('ui.layout.resize', function (e, beforeContainer, afterContainer) {
      editor.refresh();
    });*/

    // Listen to scroll event to scroll annotation relations
    /*TODO: Scroll anim. impl.
    this.mainContent.addEventListener('scroll', AnimEvent.add(function () {
      _.each(connectedAnnotations, function (annotation) {
        // Remove instance of line and redraw it
        annotation.instance.remove();
        annotation.instance = makeLeaderLine(annotation.startId, annotation.endId, annotation.label, annotation.data);
      });

      $('.leader-line').css('z-index', 123);
    }), false);*/

    //TODO: Sub. cm. events
    this.editor.on("dblclick", (e) => {
      this.mouseUpHandler(e);
    });

    this.editor.on("cursorActivity", (e) => {
      this.mouseUpHandler(e);
    });

    this.editor.on("mousedown", (e) => {
      this.mouseDownUpHandler(e);
    });
    CodeMirror.on(this.mainContent, "mouseup", () => { this.mouseUpHandler });
    CodeMirror.on(this.mainContent, "mousedown", () => { this.mouseDownUpHandler });
    this.element.nativeElement.addEventListener("mouseup", this.mouseUpHandler);
    //CodeMirror.on(this.mainContent, "mousedown", this.mouseDownUpHandler);
    this.TextWidgetAPI.registerCurrentDocumentCallback(this.updateCurrentDocument.bind(this));
    this.TextWidgetAPI.registerCurrentSelectionCallback(this.updateCurrentSelection.bind(this));
    this.TextWidgetAPI.registerNewAnnotationsCallback(this.addNewAnnotations.bind(this));
    this.TextWidgetAPI.registerDeletedAnnotationsCallback(this.deleteAnnotations.bind(this));
    this.TextWidgetAPI.registerScrollIntoViewCallback(this.scrollToAnnotation.bind(this));

  }

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

    if (typeof (editorSelectionStart) != "undefined" && typeof (editorSelectionEnd) != "undefined") {
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

  ColorLuminance(col, amt) {
    var usePound = true;

    if (col[0] == "#") {
      col = col.slice(1);
      usePound = true;
    }

    var num = parseInt(col, 16);
    var r = (num >> 16) + amt;
    if (r > 255) r = 255;
    else if (r < 0) r = 0;

    var b = ((num >> 8) & 0x00FF) + amt;
    if (b > 255) b = 255;
    else if (b < 0) b = 0;

    var g = (num & 0x0000FF) + amt;
    if (g > 255) g = 255;
    else if (g < 0) g = 0;

    return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);
  }

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

  mouseUpHandler(e): any {
    
    if(!this.initialLoad){
      this.initialLoad = true;
      return;
    }

    if (typeof e.button == "undefined") { //left button click
      var selection = this.getSelectionInfo();

      if (Object.keys(selection).length > 0) {
        this.TextWidgetAPI.setCurrentSelection(selection, false);
        this.TextWidgetAPI.clearSelectedAnnotation();

        if (selection.segment == "") { //point selection
          var annotationId = null;

          // Regular mark selection, use CodeMirror's api
          var editorSelection = this.computeSelectionFromOffsets(selection.startOffset, selection.startOffset); //transform selection from absolute to cm format
          var availableAnnotationsOnCursor = this.editor.findMarksAt(editorSelection.start);//TODO: Get CodeMirror.Position //find available marks at the position of the cursor
          var availableAnnotationsLength = availableAnnotationsOnCursor.length;

          if (availableAnnotationsLength > 0) {
            // Get first part of the annotation's class name, which should be the ID
            annotationId = availableAnnotationsOnCursor[availableAnnotationsLength - 1].className;
            annotationId = annotationId.split(" ")[0];
          }

          if (annotationId) {
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
    } else if (e.button === 1) {
      //middle button click
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

        if ((!has(updatedSelection, "start") || !has(updatedSelection, "end")) && this.TextWidgetAPI.getAnnotatorType() === "Coreference Annotator") {
          updatedSelection = this.computeSelectionFromOffsets(updatedSelection.startOffset, updatedSelection.endOffset);
        }

        this.editor.setSelection(updatedSelection.start, updatedSelection.end);
        currentSelection = this.getSelectionInfo();
        if (currentSelection.segment == "")
          this.TextWidgetAPI.setCurrentSelection(currentSelection, false);
      }
    } else
      this.TextWidgetAPI.clearSelection();
  };

  /**
   * Bring the text and the annotations when a document changes
   */
  updateCurrentDocument() {
    return new Promise((resolve, reject) => {
      var newDocument: any = this.TextWidgetAPI.getCurrentDocument();
      this.AnnotatorTypeId = newDocument.annotator_id; //TextWidgetAPI.getAnnotatorTypeId();

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
              // editor.refresh();
              this.editor.setValue("");
              this.editor.clearHistory();
              this.editor.setValue(response.data.text);
              this.editor.refresh();

              if (response.data.is_opened) {
                this.restoreAnnotationService.restoreFromTemp(newDocument.collection_id, newDocument.id, this.AnnotatorTypeId)
                  .then((response: any) => {
                    this.TextWidgetAPI.disableIsRunning();

                    if (!response.success) {
                      this.dialog.open(ErrorDialogComponent, { data: new ConfirmDialogData("Error", "Error during the restore of your annotations. Please refresh the page and try again.") })
                    } else
                      this.TextWidgetAPI.matchAnnotationsToSchema(response.data, this.AnnotatorTypeId);
                  });
              } else {
                this.restoreAnnotationService.restoreFromDB(newDocument.collection_id, newDocument.id, this.AnnotatorTypeId)
                  .then((response: any) => {
                    this.TextWidgetAPI.disableIsRunning();

                    if (!response.success) {
                      this.dialog.open(ErrorDialogComponent, { data: new ConfirmDialogData("Error", "Error during the restore of your annotations. Please refresh the page and try again.") })
                    } else
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


  clearDuplicateAnnotationsFromEditor(newAnnotations) {
    var editorMarks = this.editor.getAllMarks();

    newAnnotations.forEach(annotation => {
      if (annotation.annotation.type === 'argument_relation') {
        // Remove connected annotation
        this.removeConnectedAnnotation(annotation.annotation._id);
      } else {
        // Remove marks of regular annotation

        editorMarks.forEach(editorMark => {
          // Get ID of mark
          var editorMarkClass = editorMark.className.split(" ")[0];

          if (String(annotation.annotation._id).indexOf(editorMarkClass) > -1) {
            editorMark.clear();
          }
        });
      }
    });
  };

  /**
   * Connect two elements with the specified IDs with an arrow using the LeaderLine library
   */
  makeLeaderLine(startId, endId, label, annotation) {
    if (startId === endId) {
      return;
    }

    // Find elements to add arrow between
    var startElem = document.querySelector('.' + startId)[0];
    var endElem = document.querySelector('.' + endId)[0];

    // Create line and return its instance
    var line = new LeaderLine(startElem, endElem, {
      middleLabel: label,
      path: 'fluid'
    });

    document.querySelectorAll('.leader-line')[document.querySelectorAll('.leader-line').length - 1].addEventListener("click", () => { this.makeLineCF(annotation) });

    return line;
  };

  makeLineCF(annotation) {
    // Set this annotation as the selected one
    this.TextWidgetAPI.setSelectedAnnotation(annotation);
    this.TextWidgetAPI.clearOverlappingAreas(); // not sure if required...
  }

  /**
   * Visualize the annotations to the text widget
   * @param newAnnotations
   * @param annotatorType
   * @returns {boolean}
   */
  visualizeAnnotations(newAnnotations, annotatorType) {
    if (typeof (newAnnotations) == "undefined" || newAnnotations.length === 0) return false;

    this.clearDuplicateAnnotationsFromEditor(newAnnotations); // if there are any borders around a specific annotation, remove them.

    for (var k = 0; k < newAnnotations.length; k++) { // if there are new annotations to be visualised, add them to the editor
      var currAnnotation = newAnnotations[k];

      if (currAnnotation.annotation.type === 'argument_relation') {
        // Argument relation, add arrow. Find IDs of start/end annotations
        var startId = find(currAnnotation.annotation.attributes, {
          name: 'arg1'
        }).value;
        var endId = find(currAnnotation.annotation.attributes, {
          name: 'arg2'
        }).value;

        var label = find(currAnnotation.annotation.attributes, {
          name: 'type'
        }).value;

        // Create the line
        var line = this.makeLeaderLine(startId, endId, label, currAnnotation.annotation);

        // Add relation annotation to the list
        if (!(line)) {
          this.connectedAnnotations.push({
            instance: line,
            startId: startId,
            endId: endId,
            label: label,
            data: currAnnotation.annotation
          });
        }
      } else if ("document_attribute" in currAnnotation.annotation) {
        // This is a document Annotation...
        //TODO:Implement broadcast $rootScope.$broadcast('sendDocumentAttribute:' + currAnnotation.annotation.document_attribute, currAnnotation.annotation);
      } else {
        // Normal annotation
        if (typeof newAnnotations[k].annotation.spans == "undefined") {
          continue;
        }
        for (var l = 0; l < newAnnotations[k].annotation.spans.length; l++) { // Iterate through annotations spans
          var colorCombination: any = {};
          var annotationSpan = currAnnotation.annotation.spans[l];
          var annotationsAttributes = currAnnotation.annotation.attributes;

          // create the selection in the editor and annotate it
          var selection = this.computeSelectionFromOffsets(parseInt(annotationSpan.start), parseInt(annotationSpan.end));
          var count = 0;
          switch (annotatorType) {
            case "Button Annotator": // If it is Button Annotator get the required color combination
              for (var m = 0; m < annotationsAttributes.length; m++) {
                colorCombination = this.buttonColorService.getColorCombination(annotationsAttributes[m].value);
                if (typeof (colorCombination) != "undefined")
                  break;
              }
              var markClassName = currAnnotation.annotation._id + " " + this.markedTextClass;

              if (typeof (currAnnotation.selected) != "undefined" && currAnnotation.selected) {
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
                    "background:" + colorCombination.colour_selected_background + "; " +
                    "border-color:" + colorCombination.colour_border + ";" +
                    "border-top:" + "4px solid " + colorCombination.colour_border + "; " +
                    "border-bottom:" + "4px solid " + colorCombination.colour_border + "; "
                });
              } else {
                // Normal marker
                // editor.markText(selection.start, selection.end, {
                //   className: currAnnotation.annotation._id,
                //   css: "color:" + colorCombination.fg_color + ";" +
                //     "background:" + colorCombination.bg_color + ";"
                // });
                let res = this.editor.getDoc().markText(selection.start, selection.end, {
                  className: markClassName,
                  css: "color:" + colorCombination.colour_font + ";" +
                    "background:" + colorCombination.colour_background + ";" +
                    "border-color:" + colorCombination.colour_border + ";"
                });

                
              }

              break;
            case "Coreference Annotator": // If it is Coreference Annotator get the required color combination
              colorCombination = this.coreferenceColorService.getColorCombination(currAnnotation.annotation._id);
              var mark = null;
              var markerId = "mrkr_" + Math.floor(Math.random() * 1000000);
              // Find type
              var value = annotationSpan.start + " " + annotationSpan.end;
              var typeAttribute = find(annotationsAttributes, {
                value: value
              }).name;
              var markAttributes = {
                markerId: markerId
              }
              markAttributes["data-type"] = typeAttribute

              // Create class for adding background color to the type pseudo-element
              var colorClass = " mark_color_" + colorCombination["border-color"].replace("#", "").toUpperCase();
              var markClassName = currAnnotation.annotation._id + " " + markerId + this.markedTextClass + colorClass;

              if (typeof (currAnnotation.selected) != "undefined" && currAnnotation.selected) {
                // Selected marker
                mark = this.editor.markText(selection.start, selection.end, {
                  className: markClassName,
                  attributes: markAttributes,
                  css: "color:" + colorCombination["font-color"] + "; " +
                    "background:" + colorCombination["selected-background-colour"] + "; " +
                    "border-color:" + colorCombination["border-color"] + "; " +
                    "border-top:" + "4px solid " + colorCombination["border-color"] + "; " +
                    "border-bottom:" + "4px solid " + colorCombination["border-color"] + "; "
                });
              } else {
                // Normal marker
                mark = this.editor.markText(selection.start, selection.end, {
                  className: markClassName,
                  attributes: markAttributes,
                  css: "color:" + colorCombination["font-color"] + ";" +
                    "background:" + colorCombination["background-colour"] + ";" +
                    "border-color:" + colorCombination["border-color"] + ";"
                });
              }


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
    if (document.querySelector('.leader-line') != null) {
      document.querySelector('.leader-line').setAttribute("style", "z-index:123");
    }

    this.TextWidgetAPI.clearAnnotationsToBeAdded();
    //editor.refresh();
  };

  /**
   * If the annotator type is "Coreference Annotator", add a data-type attribute to each marker with the
   * type of annotation
   */
  addTypeAttributesToMarkers() {
    // editor.refresh();
    if (this.TextWidgetAPI.getAnnotatorType() === "Coreference Annotator") {
      var marks = this.editor.getAllMarks();
      marks.forEach((mark: any) => {
        var markerSpans = document.getElementsByClassName("span." + mark.markerId) as HTMLCollectionOf<HTMLElement>;

        for (var i = 0; i < markerSpans.length; i++) {
          markerSpans[i].setAttribute("data-type", mark.typeAttribute);

          // If the marker has > 1 classes that set its type pseudoelement's background-color, we
          // need to keep only the correct one
          var classes = markerSpans[i].className.trim().split(" ");

          classes = filter(classes, function (className) {
            // Keep only classes which start with "mark_color_"
            return className.indexOf("mark_color_") === 0;
          });

          if (classes.length > 1) {
            // Find the correct class to keep
            var correctClass = "mark_color_" +
              this.coreferenceColorService.rgb2hex(markerSpans[i].style.borderTopColor).toUpperCase();

            // Keep only the classes we need to remove
            classes = without(classes, correctClass);

            // Remove the excess classes from the element
            markerSpans[i].classList.remove(classes.join(" "));
          }
        }
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

    if (typeof (newAnnotations) != "undefined" && newAnnotations.length > 0)
      this.visualizeAnnotations(newAnnotations, annotatorType);

    this.TextWidgetAPI.disableIsRunning();
  };

  /**
   * Remove a connection annotation's leader line instance as well as remove it from the connectedAnnotations list
   */
  removeConnectedAnnotation(annotationId) {
    // Find the relation annotation in connectedAnnotations
    var connectedAnnotation = find(this.connectedAnnotations, function (ann) {
      return ann.data._id === annotationId;
    });

    if (typeof (connectedAnnotation) == "undefined") {
      return;
    }

    // Remove the LeaderLine instance
    connectedAnnotation.instance.remove();

    // Remove the object from the connectedAnnotations array
    var arrayIndex = this.connectedAnnotations.indexOf(connectedAnnotation);
    this.connectedAnnotations.splice(arrayIndex, 1);
  };

  /**
   * Remove annotation from the text widget
   * @returns {boolean}
   */
  deleteAnnotations() {
    if (this.TextWidgetAPI.checkIsRunning()) //check if running
      this.TextWidgetAPI.enableIsRunning();
    else
      return false;

    var annotationsToBeDeleted = this.TextWidgetAPI.getAnnotationsToBeDeleted();
    if (typeof (annotationsToBeDeleted) == "undefined" || annotationsToBeDeleted.length === 0) {
      this.TextWidgetAPI.disableIsRunning();
      return false;
    }

    annotationsToBeDeleted.forEach((annotation) => {
      var annotationId = String(annotation._id).trim();

      if (annotation.type === 'argument_relation') {
        // Remove relation annotation
        this.removeConnectedAnnotation(annotationId);
      } else {
        // Regular annotations, delete their marks
        var editorMarks = this.editor.getAllMarks();
        editorMarks.forEach((mark) => {
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
  };

  updateCurrentSelection() {
    var currentSel: any = this.TextWidgetAPI.getCurrentSelection();

    if (typeof (currentSel) == "undefined") {
      return;
    } else if (Object.keys(currentSel).length > 0) {
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
