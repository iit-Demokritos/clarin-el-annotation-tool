angular.module("clarin-el").directive("textWidget", ["$q", "$ocLazyLoad", "$rootScope", "TextWidgetAPI", "RestoreAnnotation", "TempAnnotation", "Document", "OpenDocument", "ButtonColor", "CoreferenceColor", "Dialog",
  function ($q, $ocLazyLoad, $rootScope, TextWidgetAPI, RestoreAnnotation, TempAnnotation, Document, OpenDocument, ButtonColor, CoreferenceColor, Dialog) {
    function ColorLuminance(col, amt) {
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

    return {
      restrict: "E",
      replace: true,
      template: "<div class='annotation-editor-text-widget-container'><textarea id='annotation-editor-text-widget'></textarea><div id='annotation-editor-text-widget-overlay'></div></div>",
      link: function (scope) {
        var mainContent = document.getElementsByClassName("main-content")[0];
        var textWidget = document.getElementById("annotation-editor-text-widget");
        var textWidgetOverlay = document.getElementById('annotation-editor-text-widget-overlay');
        var skipLineNumber = {};

        var editor = CodeMirror.fromTextArea(textWidget, {
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
        var textWidgetLines = document.getElementsByClassName("CodeMirror-lines")[0];
        var textarea = editor.getWrapperElement();
        var gutter = editor.getGutterElement();

        var graph = new joint.dia.Graph;

        var paper = new joint.dia.Paper({
          el: textWidgetOverlay,
          model: graph,
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
        paper.on('link:pointerup', function (elementView, evt, x, y) {
          evt.stopPropagation();
          // evt.stopImmediatePropagation();
          var currentElement = elementView.model;
          if (!("annotation_id" in currentElement)) return;
          var annotation = TextWidgetAPI.getAnnotationById(currentElement.annotation_id);
          if (angular.isUndefined(annotation)) return;
          // Set this annotation as the selected one
          TextWidgetAPI.setSelectedAnnotation(annotation);
          TextWidgetAPI.clearOverlappingAreas(); // not sure if required...
        });

        var annotationIdToGraphItem = {};

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

        // Variable controlling whether the spinner is visible...
        var spinnerVisible = false;

        // Annotator Type Id (class + values)
        var AnnotatorTypeId = "";

        // Class names to add to annotated text
        var markedTextClass = " annotated-text";

        // List of connected annotation arrows
        var connectedAnnotations = [];

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

        var getSelectionInfo = function () {
          // var start = 0, end = 0;
          var selection = {
            startOffset: -1,
            endOffset: -1,
            segment: ""
          };

          // var totalDocLines        = editor.lineCount();
          var editorSelectionStart = editor.getCursor("from");
          var editorSelectionEnd = editor.getCursor("to");
          // var editorSegment        = editor.getSelection();

          if (!angular.isUndefined(editorSelectionStart) &&
            !angular.isUndefined(editorSelectionEnd)) {
            /* Petasis, 20/03/2021: Used codemirror functions for getting offsets... */
            selection.startOffset = editor.indexFromPos(editorSelectionStart);
            selection.endOffset = editor.indexFromPos(editorSelectionEnd);
            selection.segment = editor.getSelection();
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

        var computeSelectionFromOffsets = function (startOffset, endOffset) {
          return {
            start: editor.posFromIndex(startOffset),
            end: editor.posFromIndex(endOffset)
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

        var mouseDownUpHandler = function (e) {
          if (e.button === 1) { //middle button click
            e.preventDefault();
            return false;
          }
        };

        var mouseUpHandler = function (e) {
          if (e.button === 0) { //left button click
            var selection = getSelectionInfo();
            // console.warn("MOUSE 1:", selection, e);

            if (!angular.equals(selection, {})) {
              TextWidgetAPI.setCurrentSelection(selection, false);
              TextWidgetAPI.clearSelectedAnnotation();

              if (angular.equals(selection.segment, "")) { //point selection
                var annotationId = null;

                // Regular mark selection, use CodeMirror's api
                var editorSelection = computeSelectionFromOffsets(selection.startOffset, selection.startOffset); //transform selection from absolute to cm format
                var availableAnnotationsOnCursor = editor.findMarksAt(editorSelection.start, editorSelection.end); //find available marks at the position of the cursor
                var availableAnnotationsLength = availableAnnotationsOnCursor.length;

                if (availableAnnotationsLength > 0) {
                  // Get first part of the annotation's class name, which should be the ID
                  annotationId = availableAnnotationsOnCursor[availableAnnotationsLength - 1].className;
                  annotationId = annotationId.split(" ")[0].substr(3); // remove "id-" prefix...
                }

                if (!_.isNull(annotationId)) {
                  // Get the selected annotation from its ID and the previous selected annotation
                  var selectedAnnotation = TextWidgetAPI.getAnnotationById(annotationId);
                  var prevAnnotationId = TextWidgetAPI.getSelectedAnnotation()._id;

                  if (!angular.isUndefined(selectedAnnotation) && prevAnnotationId !== selectedAnnotation._id) {
                    TextWidgetAPI.setSelectedAnnotation(selectedAnnotation);
                    TextWidgetAPI.computeOverlappingAreas(selection.startOffset);
                    return false;
                  }
                }
              }
            }
          } else if (e.button === 1) { //middle button click
            e.preventDefault();
            var updatedSelection = {};
            var savedSelection = TextWidgetAPI.getCurrentSelection();

            var editorCursor = editor.getCursor("from");
            var word = editor.findWordAt(editorCursor);
            editor.setSelection(word.anchor, word.head);
            var currentSelection = getSelectionInfo();

            if (angular.isUndefined(savedSelection) || angular.equals(savedSelection, {}) || savedSelection.segment.length === 0) {
              TextWidgetAPI.setCurrentSelection(currentSelection, false);
            } else if (savedSelection.segment.length > 0) {
              if (currentSelection.startOffset < savedSelection.startOffset)
                updatedSelection = computeSelectionFromOffsets(currentSelection.startOffset, savedSelection.endOffset);
              else if (currentSelection.endOffset > savedSelection.endOffset)
                updatedSelection = computeSelectionFromOffsets(savedSelection.startOffset, currentSelection.endOffset);
              else
                updatedSelection = currentSelection;

              if ((!_.has(updatedSelection, "start") || !_.has(updatedSelection, "end")) && TextWidgetAPI.getAnnotatorType() === "Coreference Annotator") {
                updatedSelection = computeSelectionFromOffsets(updatedSelection.startOffset, updatedSelection.endOffset);
              }

              editor.setSelection(updatedSelection.start, updatedSelection.end);
              currentSelection = getSelectionInfo();
              if (!angular.equals(currentSelection.segment, ""))
                TextWidgetAPI.setCurrentSelection(currentSelection, false);
            }
          } else
            TextWidgetAPI.clearSelection();
        };

        /**
         * Bring the text and the annotations when a document changes
         */
        var updateCurrentDocument = function () {
          var newDocument = TextWidgetAPI.getCurrentDocument();
          AnnotatorTypeId = newDocument.annotator_id; //TextWidgetAPI.getAnnotatorTypeId();

          if (!angular.equals({}, newDocument)) { //if new document is not empty
            var documentData = {
              document_id: newDocument.id,
              collection_id: newDocument.collection_id,
              annotator_type: AnnotatorTypeId
            };

            OpenDocument.save(documentData)
              .then(function (response) {
                if (response.success)
                  return Document.get(newDocument.collection_id, newDocument.id); //get document's data
                else
                  return $q.reject();
              })
              .then(function (response) {
                if (!response.success) {
                  TextWidgetAPI.disableIsRunning();
                  var modalOptions = {
                    body: "Error during the restore of your document. Please refresh the page and try again."
                  };
                  Dialog.error(modalOptions);
                } else {
                  spinnerVisible = true;
                  TextWidgetAPI.resetData();
                  editor.setValue("");
                  editor.clearHistory();
                  var options = JSON.parse(response.data.visualisation_options);
                  if (options !== null && "gutter" in options) {
                    skipLineNumber = options["gutter"];
                  } else {
                    skipLineNumber = {};
                  }
                  editor.setValue(response.data.text);
                  graph.clear();
                  annotationIdToGraphItem = {};
                  connectedAnnotations = [];
                  editor.refresh();
                  scope.layout.showLinkRouterSelector = false;
                  visualiseVisualisationOptions(options);

                  if (response.data.is_opened) {
                    RestoreAnnotation.restoreFromTemp(newDocument.collection_id, newDocument.id, AnnotatorTypeId)
                      .then(function (response) {
                        TextWidgetAPI.disableIsRunning();

                        if (!response.success) {
                          var modalOptions = {
                            body: "Error during the restore of your annotations. Please refresh the page and try again."
                          };
                          Dialog.error(modalOptions);
                        } else
                          response.data = migrateOldSpans(response.data);
                        TextWidgetAPI.matchAnnotationsToSchema(response.data, AnnotatorTypeId);
                      });
                  } else {
                    RestoreAnnotation.restoreFromDB(newDocument.collection_id, newDocument.id, AnnotatorTypeId)
                      .then(function (response) {
                        TextWidgetAPI.disableIsRunning();

                        if (!response.success) {
                          var modalOptions = {
                            body: "Error during the restore of your annotations. Please refresh the page and try again."
                          };
                          Dialog.error(modalOptions);
                        } else
                          response.data = migrateOldSpans(response.data);
                        TextWidgetAPI.matchAnnotationsToSchema(response.data, AnnotatorTypeId);
                      });
                  }
                }
              }, function (error) {
                TextWidgetAPI.disableIsRunning();
                var modalOptions = {
                  body: "Database error. Please refresh the page and try again."
                };
                Dialog.error(modalOptions);
              });
          } else
            TextWidgetAPI.disableIsRunning();
        };
        
        var visualiseVisualisationOptions = function (options) {
          if (options == null || (!"marks" in options)) {
            return;
          }
          var marks = options["marks"];
          for (var i = 0; i < marks.length; i++) {
            var item = marks[i];
            editor.markText(item.start, item.end, {
              className: /*"tei-"+*/item.tags
            });
          }
        }; /* visualiseVisualisationOptions */

        var lineNumberFormatter = function(line) {
         console.log("ss")
         //console.log(skipLineNumber)
         return line-1 in skipLineNumber ?
                   skipLineNumber[line-1] : line.toString();
        }; /* lineNumberFormatter */
        //editor.setOption("lineNumberFormatter", lineNumberFormatter);

        var migrateOldSpans = function (anns) {
          var annotations = [];
          for (var i = 0; i < anns.length; i++) {
            var ann = anns[i];
            var modified = false;
            for (var j = 0; j < ann.spans.length; j++) {
              var span = ann.spans[j];
              var selection = computeSelectionFromOffsets(span.start, span.end);
              var fragment = editor.getRange(selection.start, selection.end);
              if (span.segment !== fragment) {
                var cursor = editor.getSearchCursor(span.segment, selection.start);
                var found = cursor.findNext();
                if (!found) {
                  found = cursor.findPrevious();
                }
                if (found) {
                  span.start = editor.indexFromPos(cursor.from());
                  span.end = editor.indexFromPos(cursor.to());
                  ann.spans[j] = span;
                  modified = true;
                }
              }
            }
            if (modified) {
              RestoreAnnotation.updateToTemp(ann);
            }
            annotations.push(ann);
          }
          return annotations;
        }; /* migrateOldSpans */

        var overlayRefresh = function () {
          console.warn("overlayRefresh: gutter width:", gutter.offsetWidth,
                       "editor width:", textWidgetLines.offsetWidth);
          for (const annId in annotationIdToGraphItem) {
            var annotation = TextWidgetAPI.getAnnotationById(annId);
            for (var l = 0; l < annotation.spans.length; l++) {
              var annotationSpan = annotation.spans[l];
              var selection = computeSelectionFromOffsets(
                parseInt(annotationSpan.start), parseInt(annotationSpan.end));
              overlayMarkAdd(l, selection.start, selection.end, {
                "annotation": annotation,
                "selected": false,
                "action": "resize"
              });
            }
          }
          overlayLinksRefresh();
        }; /* overlayRefresh */

        var overlayLinksRefresh = function () {
          _.each(connectedAnnotations, function (annotation) {
            try {
              overlayLinkAdjustVertices(annotation.instance);
            } catch (err) {
              console.error(err);
            }
          });
        }; /* overlayLinksRefresh */

        var overlayAnnotationGetBoundingClientRect = function (annotation) {
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
          var over = textWidgetOverlay.getBoundingClientRect();
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

        var overlayHighlight = function (annotation) {
          var deep = false, selector = 'body', items, colours = {}, colour;
          if (annotation.annotation._id in annotationIdToGraphItem) {
            items = annotationIdToGraphItem[annotation.annotation._id];
          } else {
            // A link...
            var connectedAnnotation = _.find(connectedAnnotations, function (ann) {
              return ann.data._id === annotation.annotation._id;
            });
            if (angular.isUndefined(connectedAnnotation)) {
              return; // Nothing to do...
            }
            items = {
              0: connectedAnnotation.instance,
              1: annotationIdToGraphItem[connectedAnnotation.startId][0],
              2: annotationIdToGraphItem[connectedAnnotation.endId][0]
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
            const elementView = item.findView(paper);
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

        var overlayMarkAdd = function (spanIndex, startPos, endPos, annotation) {
          var item;
          // if (annotation.action != "matches") {
          //   console.warn("++ overlayMarkAdd:", annotation.annotation._id, annotation);
          // }
          if (annotation.annotation._id in annotationIdToGraphItem) {
            if (annotation.action == "select" ||
              annotation.action == "deselect") {
              // This is a request to delete the item, because it will be
              // re-added as selected/deselected. Do not remove it...
              overlayHighlight(annotation);
              return null;
            }
            // Check if item already exists...
            item = annotationIdToGraphItem[annotation.annotation._id][spanIndex];
          } else {
            annotationIdToGraphItem[annotation.annotation._id] = {};
          }
          // This method creates a polygon from codemirror coordinates (line, pos)
          var startCoords = editor.charCoords(startPos, "local"),
            endCoords = editor.charCoords(endPos, "local");
          // console.warn(startCoords, endCoords);
          // Calculate points...
          if (angular.isUndefined(item)) {
            item = new joint.shapes.standard.Polygon();
            item.addTo(graph);
            annotationIdToGraphItem[annotation.annotation._id][spanIndex] = item;
          }
          if (endCoords.top - startCoords.top < 2) {
            // Start & end on the same height, the region is a rectange...
            // https://resources.jointjs.com/tutorial/elements
            // if (angular.isUndefined(item)) {
            //   item = new joint.shapes.standard.Rectangle();
            // }
            // sets the position of the origin of the element (the top-left corner)
            item.position(startCoords.left + gutter.offsetWidth - 4, startCoords.top + 3);
            // sets the dimensions of the element (width, height)
            item.resize(endCoords.right - startCoords.left - 4,
              endCoords.bottom - startCoords.top - 6);
            item.attr('body/refPoints', "0,0 1,0 1,1 0,1");
          } else {
            var points = [];
            // sets the position of the origin of the element (the top-left corner)
            item.position(gutter.offsetWidth + 8, startCoords.top + 3);
            // sets the dimensions of the element (right, height)
            item.resize(textWidgetLines.offsetWidth - 16, endCoords.bottom - startCoords.top - 6);
            points.push('14,' + String(startCoords.bottom + 3));
            points.push(String(startCoords.left) + ',' + String(startCoords.bottom + 3));
            points.push(String(startCoords.left) + ',' + String(startCoords.top + 3));
            points.push(String(textWidgetLines.offsetWidth) + ',' + String(startCoords.top + 3));
            points.push(String(textWidgetLines.offsetWidth) + ',' + String(endCoords.top + 3));
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

        var overlayMarkRemove = function (annotation) {
          // if (annotation.action != "matches") {
          //   console.warn("-- overlayMarkRemove:", annotation.annotation._id, annotation);
          // }
          if (annotation.annotation._id in annotationIdToGraphItem) {
            if (annotation.action == "select" ||
              annotation.action == "deselect") {
              // This is a request to delete the item, because it will be
              // re-added as selected/deselected. Do not remove it...
              overlayHighlight(annotation);
              return false;
            }
            for (const spanIndex in annotationIdToGraphItem[annotation.annotation._id]) {
              var item = annotationIdToGraphItem[annotation.annotation._id][spanIndex];
              graph.disconnectLinks(item);
              const elementView = item.findView(paper);
              joint.highlighters.mask.remove(elementView);
              item.remove();
            }
            delete annotationIdToGraphItem[annotation.annotation._id];
            return true;
          }
          return false;
        }; /* overlayMarkRemove */

        /**
         * Connect two elements with the specified IDs with an arrow using the
         * Joint.js (replacing LeaderLine) library
         */
        var overlayLinkAdd = function (startId, endId, label, annotation) {
          if (startId === endId) {
            return;
          }
          if (!startId in annotationIdToGraphItem) return;
          if (!endId in annotationIdToGraphItem) return;
          if (!scope.layout.showLinkRouterSelector) {
            scope.layout.showLinkRouterSelector = true;
          }
          // Do we have already a line?
          var connectedAnnotation = _.find(connectedAnnotations, function (ann) {
            return ann.data._id === annotation.annotation._id;
          });
          if (!angular.isUndefined(connectedAnnotation)) {
            if (annotation.action == "select" ||
              annotation.action == "deselect") {
              // This is a request to add the item, because it will be
              // re-added as selected/deselected. Do not remove it...
              overlayHighlight(annotation);
              return;
            }
          }
          var router, connector = "rounded";
          switch (scope.layout.routerName) {
            case "direct":
              break;
            case "smooth":
              connector = routerName;
              break;
            default:
              router = routerName;
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
          link.source(annotationIdToGraphItem[startId][0]);
          link.target(annotationIdToGraphItem[endId][0]);
          link.attr('root/pointer-events', 'visiblePainted');
          link.router(router, scope.layout.routerOptions[scope.layout.routerName]);
          link.addTo(graph);
          // Add the annotation id to the link...
          link["annotation_id"] = annotation.annotation._id;
          return link;
        }; /* overlayLinkAdd */

        var overlayLinksRouterSet = function (routername) {
          _.each(connectedAnnotations, function (annotation) {
            try {
              overlayLinkAdjustVertices(annotation.instance);
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
        var overlayLinkAdjustVertices = function(/*graph,*/ cell) {
          // if `cell` is a view, find its model
          cell = cell.model || cell;

          if (cell instanceof joint.dia.Element) {
            // `cell` is an element

            _.chain(graph.getConnectedLinks(cell))
              .groupBy(function (link) {

                // the key of the group is the model id of the link's source or target
                // cell id is omitted
                return _.omit([link.source().id, link.target().id], cell.id)[0];
              })
              .each(function (group, key) {

                // if the member of the group has both source and target model
                // then adjust vertices
                if (key !== 'undefined') overlayLinkAdjustVertices(/*graph,*/ _.first(group));
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
          var siblings = graph.getLinks().filter(function (sibling) {

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
              var sourceCenter = graph.getCell(sourceId).getBBox().center();
              var targetCenter = graph.getCell(targetId).getBBox().center();
              var midPoint = g.Line(sourceCenter, targetCenter).midpoint();

              // find the angle of the link
              var theta = sourceCenter.theta(targetCenter);

              // constant
              // the maximum distance between two sibling links
              var GAP = scope.layout.routerGAP;

              _.each(siblings, function (sibling, index) {

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
                var angle = g.toRad(theta + (sign * reverse * 90));
                var vertex = g.Point.fromPolar(offset, angle, midPoint).toJSON();

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
        var removeConnectedAnnotation = function (annotation) {
          // Find the relation annotation in connectedAnnotations
          var connectedAnnotation = _.find(connectedAnnotations, function (ann) {
            return ann.data._id === annotation.annotation._id;
          });

          if (_.isUndefined(connectedAnnotation)) {
            return;
          }
          if (annotation.action == "select" ||
            annotation.action == "deselect") {
            // This is a request to delete the item, because it will be
            // re-added as selected/deselected. Do not remove it...
            overlayHighlight(annotation);
            return;
          }

          const elementView = connectedAnnotation.instance.findView(paper);
          joint.highlighters.mask.remove(elementView);
          // Remove the LeaderLine instance
          connectedAnnotation.instance.remove();

          // Remove the object from the connectedAnnotations array
          var arrayIndex = connectedAnnotations.indexOf(connectedAnnotation);
          connectedAnnotations.splice(arrayIndex, 1);
        }; /* removeConnectedAnnotation */

        var clearDuplicateAnnotationsFromEditor = function (newAnnotations) {
          var editorMarks = editor.getAllMarks();

          _.each(newAnnotations, function (annotation) {
            if (TextWidgetAPI.belongsToSchemaAsSupportiveAnnotationType(annotation.annotation)) {
              // Remove connected annotation
              removeConnectedAnnotation(annotation);
            } else {
              overlayMarkRemove(annotation);
              // Remove marks of regular annotation
              _.each(editorMarks, function (editorMark) {
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
        var visualizeAnnotations = function (newAnnotations, annotatorType) {
          if (angular.isUndefined(newAnnotations) ||
            newAnnotations.length === 0) return false;

          // if there are any borders around a specific annotation, remove them.
          clearDuplicateAnnotationsFromEditor(newAnnotations);

          // if there are new annotations to be visualised, add them to the editor
          for (var k = 0; k < newAnnotations.length; k++) {
            var currAnnotation = newAnnotations[k];

            if (TextWidgetAPI.isRelationAnnotationType(currAnnotation.annotation)) {
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
              var line = overlayLinkAdd(startId, endId, label, currAnnotation);

              // Add relation annotation to the list
              if (!_.isUndefined(line)) {
                connectedAnnotations.push({
                  instance: line,
                  startId: startId,
                  endId: endId,
                  label: label,
                  data: currAnnotation.annotation
                });
              }
            } else if ("document_attribute" in currAnnotation.annotation) {
              // This is a document Annotation...
              $rootScope.$broadcast('sendDocumentAttribute:' +
                currAnnotation.annotation.document_attribute, currAnnotation.annotation);
            } else {
              // Normal annotation
              // Iterate through annotations spans
              for (var l = 0; l < newAnnotations[k].annotation.spans.length; l++) {
                var colorCombination = {};
                var annotationSpan = currAnnotation.annotation.spans[l];
                var annotationsAttributes = currAnnotation.annotation.attributes;

                // create the selection in the editor and annotate it
                var selection = computeSelectionFromOffsets(
                  parseInt(annotationSpan.start), parseInt(annotationSpan.end));
                var count = 0;
                switch (annotatorType) {
                  case "Button Annotator":
                    // If it is Button Annotator get the required color combination
                    for (var m = 0; m < annotationsAttributes.length; m++) {
                      colorCombination =
                        ButtonColor.getColorCombination(annotationsAttributes[m].value);
                      if (!angular.isUndefined(colorCombination))
                        break;
                    }
                    var markClassName = "id-" +
                      String(currAnnotation.annotation._id).trim() + markedTextClass;

                    if (!angular.isUndefined(currAnnotation.selected) &&
                      currAnnotation.selected) {
                      // Selected marker
                      // var borderColor = ColorLuminance(colorCombination.bg_color, 100);

                      // editor.markText(selection.start, selection.end, {
                      //   className: markClassName,
                      //   css: "color:" + colorCombination.fg_color + "; " +
                      //     "background:" + colorCombination.bg_color + "; " +
                      //     "border: 2px ridge " + borderColor + ";"
                      // });
                      editor.markText(selection.start, selection.end, {
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
                      editor.markText(selection.start, selection.end, {
                        className: markClassName,
                        css: "color:" + colorCombination.colour_font + ";" +
                          "background:" + colorCombination.colour_background + ";" +
                          "border-color:" + colorCombination.colour_border + ";"
                      });
                    }
                    overlayMarkAdd(l, selection.start, selection.end,
                      currAnnotation);

                    break;
                  case "Coreference Annotator":
                    // If it is Coreference Annotator get the required color combination
                    colourCom =
                      CoreferenceColor.getColorCombination(currAnnotation.annotation._id);
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
                      markerId + markedTextClass + colorClass;

                    if (!angular.isUndefined(currAnnotation.selected) &&
                      currAnnotation.selected) {
                      // Selected marker
                      mark = editor.markText(selection.start, selection.end, {
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
                      mark = editor.markText(selection.start, selection.end, {
                        className: markClassName,
                        attributes: markAttributes,
                        css: "color:" + colourCom["font-color"] + ";" +
                          "background:" + colourCom["background-colour"] + ";" +
                          "border-color:" + colourCom["border-color"] + ";"
                      });
                    }
                    overlayMarkAdd(l, selection.start, selection.end,
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

          TextWidgetAPI.clearAnnotationsToBeAdded();
          overlayLinksRefresh();
          //editor.refresh();
        }; /* visualizeAnnotations */

        /**
         * If the annotator type is "Coreference Annotator", add a data-type
         * attribute to each marker with the
         * type of annotation
         */
        var addTypeAttributesToMarkers = function () {
          // editor.refresh();
          if (TextWidgetAPI.getAnnotatorType() === "Coreference Annotator") {
            var marks = editor.getAllMarks();
            _.each(marks, function (mark) {
              var markerSpans = $("span." + mark.markerId);

              _.each(markerSpans, function (span) {
                // Add the data type attribute
                $(span).attr("data-type", mark.typeAttribute);

                // If the marker has > 1 classes that set its type
                // pseudoelement's background-color, we
                // need to keep only the correct one
                var classes = span.className.trim().split(" ");

                classes = _.filter(classes, function (className) {
                  // Keep only classes which start with "mark_color_"
                  return className.indexOf("mark_color_") === 0;
                });

                if (classes.length > 1) {
                  // Find the correct class to keep
                  var correctClass = "mark_color_" +
                    CoreferenceColor.rgb2hex($(span).css("borderTopColor")).toUpperCase();

                  // Keep only the classes we need to remove
                  classes = _.without(classes, correctClass);

                  // Remove the excess classes from the element
                  $(span).removeClass(classes.join(" "));
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
        var addNewAnnotations = function () {
          if (!TextWidgetAPI.isRunning())
            TextWidgetAPI.enableIsRunning();
          else
            return false;

          var newAnnotations = TextWidgetAPI.getAnnotationsToBeAdded();
          var annotatorType = TextWidgetAPI.getAnnotatorType();

          if (!angular.isUndefined(newAnnotations) && newAnnotations.length > 0) {
            visualizeAnnotations(newAnnotations, annotatorType);
          }

          TextWidgetAPI.disableIsRunning();
        };

        /**
         * Remove annotation from the text widget
         * @returns {boolean}
         */
        var deleteAnnotations = function () {
          if (!TextWidgetAPI.isRunning()) //check if running
            TextWidgetAPI.enableIsRunning();
          else
            return false;

          var annotationsToBeDeleted = TextWidgetAPI.getAnnotationsToBeDeleted();
          if (angular.isUndefined(annotationsToBeDeleted) ||
            annotationsToBeDeleted.length === 0) {
            TextWidgetAPI.disableIsRunning();
            return false;
          }

          _.each(annotationsToBeDeleted, function (annotation) {
            if (TextWidgetAPI.belongsToSchemaAsSupportiveAnnotationType(annotation)) {
              // Remove relation annotation
              removeConnectedAnnotation({
                "annotation": annotation,
                "selected": false,
                "action": "delete"
              });
            } else {
              var annotationId = "id-" + String(annotation._id).trim();
              overlayMarkRemove({
                "annotation": annotation,
                "selected": false,
                "action": "delete"
              });
              // Regular annotations, delete their marks
              var editorMarks = editor.getAllMarks();
              _.each(editorMarks, function (mark) {
                if (String(mark.className).trim().indexOf(annotationId) !== -1) {
                  mark.clear();
                }
              });
            }
          });

          // Add (again) the type attributes to the markers
          // addTypeAttributesToMarkers();

          TextWidgetAPI.clearAnnotationsToBeDeleted();
          TextWidgetAPI.disableIsRunning();
        }; /* deleteAnnotations */

        var deleteSelectedAnnotation = function (cm, evt) {
          // if (evt.which != 46)           {return false;} // key, code = "Delete"
          if (TextWidgetAPI.isRunning()) { return false; }
          var annotationToBeDeleted = TextWidgetAPI.getSelectedAnnotation();
          if (angular.equals({}, annotationToBeDeleted)) { return false; }
          TempAnnotation.destroy(annotationToBeDeleted.collection_id, annotationToBeDeleted.document_id, annotationToBeDeleted._id)
            .then(function (response) {
              if (!response.success) {
                var modalOptions = { body: 'Error during the deleting the annotation. Please refresh the page and try again.' };
                Dialog.error(modalOptions);
              } else
                TextWidgetAPI.deleteAnnotation(annotationToBeDeleted._id);
            }, function (error) {
              var modalOptions = { body: 'Error in delete Annotation. Please refresh the page and try again' };
              Dialog.error(modalOptions);
            });
        }; /* deleteSelectedAnnotation */

        var updateCurrentSelection = function () {
          var currentSel = TextWidgetAPI.getCurrentSelection();

          if (angular.isUndefined(currentSel)) {
            return;
          } else if (angular.equals(currentSel, {})) {
            editor.setSelection({
              line: 0,
              ch: 0
            }, {
              line: 0,
              ch: 0
            }, {
              scroll: false
            });
          } else {
            var sel = computeSelectionFromOffsets(parseInt(currentSel.startOffset), parseInt(currentSel.endOffset));
            editor.setSelection(sel.start, sel.end, {
              scroll: false
            });
          }
        };

        var scrollToAnnotation = function () {
          var annotation = TextWidgetAPI.getScrollToAnnotation();
          if (angular.isUndefined(annotation) || angular.equals(annotation, {})) {
            return false;
          }
          if (annotation.spans.length < 1) {
            // Empty spans, like in Document Attribute annotations...
            return false;
          }
          var pos = {
            from: editor.posFromIndex(annotation.spans[0].start),
            to: editor.posFromIndex(annotation.spans[annotation.spans.length - 1].end)
          }
          editor.scrollIntoView(pos);
          //editor.setCursor(annotation.spans[0].start);
          //editor.scrollIntoView(null);
        };

        CodeMirror.on(mainContent, "mouseup", mouseUpHandler);
        CodeMirror.on(mainContent, "mousedown", mouseDownUpHandler);
        editor.setOption("extraKeys", {
          Delete: deleteSelectedAnnotation,
          Space: function () { editor.refresh(); },
        });
        editor.on('refresh', overlayRefresh);
        scope.$watch('maincontentSelector', function (newVal, oldVal) {
          console.warn("maincontentSelector:", newVal);
        });
        scope.updateLinkRouter = function(routerName) {
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
          _.each(connectedAnnotations, function (annotation) {
            if (router) {
              annotation.instance.router(router, scope.layout.routerOptions[routerName]);
            } else {
              annotation.instance.unset("router");
            }
            annotation.instance.set('connector', { name: connector });
          });
        };
        TextWidgetAPI.registerCurrentDocumentCallback(updateCurrentDocument);
        TextWidgetAPI.registerCurrentSelectionCallback(updateCurrentSelection);
        TextWidgetAPI.registerNewAnnotationsCallback(addNewAnnotations);
        TextWidgetAPI.registerDeletedAnnotationsCallback(deleteAnnotations);
        TextWidgetAPI.registerScrollIntoViewCallback(scrollToAnnotation);

        scope.$on("$destroy", function () {
          graph.clear();
          editor.off('refresh', overlayRefresh);
          // CodeMirror.off(mainContent, "mouseup",   mouseUpHandler);
          // CodeMirror.off(mainContent, "mousedown", mouseDownHandler);
          editor.toTextArea();
        });
      }
    }
  }
]);
