angular.module('clarin-el').directive('annotationVisualizer', ['CLARIN_CONSTANTS', 'TextWidgetAPI', 'RestoreAnnotation', 'OpenDocument','Dialog',
	function(CLARIN_CONSTANTS, TextWidgetAPI, RestoreAnnotation, OpenDocument, Dialog, $timeout) {

  	return {
	    restrict: 'E',
	    replace: true,
	    scope: {},
	    templateUrl: 'templates/directives/annotation-visualizer.html',
	    controller: function($scope, $timeout) { 
	      	$scope.annotations = [];
	      	$scope.selectedAnnotation = {};

			$scope.$on('$destroy', function() {		//listen when scope is destroying
				if(!angular.isUndefined($scope.es)){ $scope.es.close(); }	//delete previous open connections when leaving
			});

	  
	      	var updateAnnotationList = function () {  //function to be called when the document annotations being updated
	        	$timeout(function(){ $scope.annotations = TextWidgetAPI.getAnnotations(); }, 0);
	      	};

	      	var updateSelectedAnnotationDetails = function () {		//function to be called when the selected annotation being updated
	        	$timeout(function(){ 
	          		$scope.selectedAnnotation = TextWidgetAPI.getSelectedAnnotation();

	          		if (angular.equals($scope.selectedAnnotation, {}))
	            		$scope.selectedIndex = -1;
	          		else {
	            		for (var j=0; j<$scope.annotations.length; j++) {
	              			if (angular.equals($scope.selectedAnnotation._id, $scope.annotations[j]._id)) {
	                			$scope.selectedIndex = j;
	                			break;  
	              			}
            			} 
	          		}
	        	}, 0);
	      	};

	      	$scope.setSelectedAnnotation = function (selectedAnnotation, $index) { 		      //function to visualize the annotation that the user selected from the annotation list
	        	$scope.selectedIndex = $index;     
	        	//console.log(selectedAnnotation);
	        	TextWidgetAPI.setSelectedAnnotation(selectedAnnotation);
	        	TextWidgetAPI.clearOverlappingAreas();
	      	};

	      	var liveUpdateDocument = function () {
	      		var currentDocument = TextWidgetAPI.getCurrentDocument();

	      		if(!angular.isUndefined($scope.es)){ $scope.es.close(); }	//delete previous open connections

	      		$scope.es = new EventSource(CLARIN_CONSTANTS.BASE_URL + "/clarin/api/collections/" 
																	  + currentDocument.collection_id 
																	  + "/documents/" 
																	  + currentDocument.id 
																	  + "/live");
	      		$scope.es.addEventListener("message", function(e) {
	                var serviceResponse = JSON.parse(e.data);

					if( typeof serviceResponse === 'string' ) {		//if share is not enabled revoke access
						e.target.close();							//close live connection
						TextWidgetAPI.resetData();
						RestoreAnnotation.save(currentDocument.collection_id, currentDocument.id);
						OpenDocument.destroy(currentDocument.id);

						var modalOptions = { body: serviceResponse };
        				var modalInstance = Dialog.error(modalOptions);
        				modalInstance.result.then(function(response){ 
        					$timeout(function(){
        						$scope.$emit('selectDocument');
        					}, 500);        					
        				});

						return;
					}

			        var currentSelection = TextWidgetAPI.getCurrentSelection();
	                
	                for (var i=0; i<serviceResponse.length; i++) {	//if (!serviceResponse[i].modified_by==1) return;
	                	if (!TextWidgetAPI.belongsToSchema(serviceResponse[i]))
	                		continue;

						var oldAnnotation = TextWidgetAPI.getAnnotationById(serviceResponse[i]._id);
						var currentSelectedAnnotation = angular.copy(TextWidgetAPI.getSelectedAnnotation());
						TextWidgetAPI.clearSelectedAnnotation();

						if (angular.isUndefined(oldAnnotation)) {										//annotation does not exist
							if (angular.isUndefined(serviceResponse[i].deleted_at))
								TextWidgetAPI.addAnnotation(serviceResponse[i], false);
						} else {																		//annotation exists	
							if (!angular.isUndefined(serviceResponse[i].deleted_at))	{				//if deleted_at field is defined delete annotation
								TextWidgetAPI.deleteAnnotation(serviceResponse[i]._id)
							} else if (!angular.equals(oldAnnotation, serviceResponse[i])) {
								TextWidgetAPI.deleteAnnotation(serviceResponse[i]._id)
								TextWidgetAPI.addAnnotation(serviceResponse[i], false);
							}
						}

						TextWidgetAPI.setSelectedAnnotationById(currentSelectedAnnotation._id);
	                }
					
	                TextWidgetAPI.setCurrentSelection(currentSelection, true);
	      		}, false);

				$scope.es.onerror = function (event) {  
				  	var txt;
				    switch( event.target.readyState ){ 
				        case EventSource.CONNECTING:  				        // if reconnecting
				            txt = 'Reconnecting...';
				            break;
				        case EventSource.CLOSED: 				        	// if error was fatal
				        	//liveUpdateDocument();
				            txt = 'Connection failed. Will not retry.';
				            break;
				    }
				};
	      	};

	      	var annotationSchemaUpdate = function () {
	      		TextWidgetAPI.registerCurrentDocumentCallback(liveUpdateDocument);
	      		TextWidgetAPI.registerAnnotationsCallback(updateAnnotationList);
	      		TextWidgetAPI.registerSelectedAnnotationCallback(updateSelectedAnnotationDetails); 
	      	};

	      	//register callbacks for the annotation list and the selected annotation
	      	TextWidgetAPI.registerAnnotationSchemaCallback(annotationSchemaUpdate);
	    }
  	};
}]);
