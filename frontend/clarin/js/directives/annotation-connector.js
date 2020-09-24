angular.module('clarin-el').directive('annotationConnector', ['TextWidgetAPI', 'RestoreAnnotation', 'OpenDocument', 'Dialog',
  function(TextWidgetAPI, RestoreAnnotation, OpenDocument, Dialog, $timeout) {

    return {
      restrict: 'E',
      replace: true,
      scope: {},
      templateUrl: 'templates/directives/annotation-connector.html',
      controller: function($scope, $timeout) {
        $scope.annotations = [];
        $scope.selectedAnnotation = {};
        $scope.warning_message = "You must select annotations"
        $scope.connected_annotations = [];
        $scope.links = []
        $scope.connectors = [];

        var updateAnnotationList = function() { //function to be called when the document annotations being updated
          $timeout(function() {
            $scope.annotations = TextWidgetAPI.getAnnotations();
          }, 0);
        };

        $scope.setSelectedAnnotation = function($kind) {
          //function to visualize the annotation that the user selected from the annotation list

          var selectedAnnotation
          if ($scope.start_annotation != null && $kind == "start") {
            selectedAnnotation = $scope.start_annotation;
            //console.log("s:"+selectedAnnotation);
          }
          if ($scope.end_annotation != null && $kind == "end") {
            selectedAnnotation = $scope.end_annotation;
            //console.log("e:"+selectedAnnotation)
          }

          //console.log(selectedAnnotation)
          TextWidgetAPI.setSelectedAnnotation(selectedAnnotation);
          TextWidgetAPI.clearOverlappingAreas();
        };

        var SelectLine = function(line, check, index) {

          if (check == true) {
            line.outline = true;
            line.endPlugOutline = true;
            line.setOptions({
              size: 6,
              outlineSize: 0.4,
              path: "straight",
              endPlug: "square",
              startSocket: 'bottom',
              endSocket: 'left'
            })
            line.middleLabel = LeaderLine.captionLabel({
              text: $scope.links[index]["property"],
              color: "green",
              fontWeight: "bold",
              fontSize: "1.2vw"
            });

          } else {
            line.outline = false;
            line.endPlugOutline = false;
            line.size = 4;
            line.middleLabel = "";
          }

        }

        var RedefineLine = function(index) {
          $scope.connectors[index].remove();
          $scope.connectors[index] = null
          var class_terms = $scope.connected_annotations[index].split("_");
          var startpoint = $("[class*='" + class_terms[0] + "']")[0];
          var endpoint = $("[class*='" + class_terms[1] + "']")[0];
          line = new LeaderLine(startpoint, endpoint);
          line.setOptions({
            path: "straight",
            endPlug: "square",
            startSocket: 'bottom',
            endSocket: 'left'
          });
          $scope.connectors[index] = line

        }

        $scope.setSelectedConnection = function(selectedConnection, $index) { //function to visualize the annotation that the user selected from the annotation list
          $scope.selectedIndex = $index;
          //console.log($scope.selectedIndex)
          //$scope.connectors[$scope.selectedIndex].position()

          RedefineLine($scope.selectedIndex)
          SelectLine($scope.connectors[$scope.selectedIndex], true, $scope.selectedIndex)
          var i;
          for (i = 0; i < $scope.connectors.length; i++) {
            if (i != $index) {
              RedefineLine(i)
              //$scope.connectors[i].position()
              SelectLine($scope.connectors[i], false, i)

            }

          }
          //console.log(selectedAnnotation);
          //TextWidgetAPI.setSelectedAnnotation(selectedAnnotation);
          //TextWidgetAPI.clearOverlappingAreas();
        };

        $scope.connectSelectedAnnotations = function() {
          //console.log(document.body);
          var connection_exist = false;
          // check for empty annotations
          if ($scope.start_annotation == null || $scope.end_annotation == null || $scope.property_name == null) {
            $scope.warning_message = "You must select annotations and give a property name"
            $("#empty_warning").show()
          } else {
            //check for self-connection
            if ($scope.start_annotation == $scope.end_annotation) {
              $scope.warning_message = "You cannot connect an annotation with itself"
              $("#empty_warning").show()
            } else {
              var start_id = $scope.start_annotation._id
              var startpoint = $("[class*='" + start_id + "']")[0];
              var end_id = $scope.end_annotation._id
              var endpoint = $("[class*='" + end_id + "']")[0];
              //check if the selected annotations are connected
              for (z = 0; z < $scope.connected_annotations.length; z++) {

                if ($scope.connected_annotations[z].includes(start_id) && $scope.connected_annotations[z].includes(end_id)) {

                  connection_exist = true;
                  break;
                }
              }

              if (connection_exist == true) {
                $scope.warning_message = "These annotations have already been connected";
                $("#empty_warning").show()

              } else {
                // selected annotations are not connected
                line = new LeaderLine(startpoint, endpoint);
                line.setOptions({
                  path: "straight",
                  endPlug: "square",
                  startSocket: 'bottom',
                  endSocket: 'left'
                });
                $scope.connected_annotations.push(start_id + "_" + end_id)
                $scope.links.push({
                  "start_id": start_id,
                  "end_id": end_id,
                  "property": $scope.property_name
                })
                $scope.connectors.push(line)

              }
            }
          }
          //fix annotation conections when scrolling
          var scrollableBox = document.getElementsByClassName("main-content")[0];
          scrollableBox.addEventListener('scroll', AnimEvent.add(function() {

            for (z = 0; z < $scope.connected_annotations.length; z++) {
              $scope.connectors[z].remove();
              $scope.connectors[z] = null
              var class_terms = $scope.connected_annotations[z].split("_");
              var startpoint = $("[class*='" + class_terms[0] + "']")[0];
              var endpoint = $("[class*='" + class_terms[1] + "']")[0];
              line = new LeaderLine(startpoint, endpoint);
              line.setOptions({
                path: "straight",
                endPlug: "square",
                startSocket: 'bottom',
                endSocket: 'left'
              });
              if (z == $scope.selectedIndex) {
                SelectLine(line, true, z)

              }

              $scope.connectors[z] = line
            }

            /*	line.remove()
            	an_lines[0]=null;
            	var class_terms=line_name[0].split("_");
            	startpoints[0]=$("[class*='"+class_terms[0]+"']")[0];
            	endpoints[0]=$("[class*='"+class_terms[1]+"']")[0];
            	line=new LeaderLine(startpoints[0],endpoints[0]);
            	an_lines[0]=line*/

          }), false);

        };

        // Register callbacks for the annotation list and the selected annotation
        TextWidgetAPI.registerAnnotationSchemaCallback(function() {
          TextWidgetAPI.registerAnnotationsCallback(updateAnnotationList);
        });
      }
    };
  }
]);
