angular.module('clarin-el').directive('annotationButton', function(TextWidgetAPI, TempAnnotation, ButtonColor, Dialog) {
  	return {
	    restrict: 'E',
	    replace: true,
	    scope: {
			annotationType: '@',
			annotationAttribute: '@',
			annotationValue: '@',
			label: '@',
			buttonTooltip: '@',
			bgColor: '@',
			fgColor: '@',
		        colourBackground: '@',
		        colourFont: '@',
		        colourBorder: '@',
		        colourSelectedBackground: '@'
	    },
	    template: '<button type="button" title="{{buttonTooltip}}" class="btn btn-default btn-sm btn-block annotation-btn" ng-click="addAnnotation(annotationType, annotationAttribute, annotationValue)" >'
	             +'<span style="float:left"><i class="fa fa-minus fa-rotate-90" style="float:left; color:{{bgColor}}"></i> {{label}}</span></button>',
	    link: function(scope, element, attrs) {
	      	ButtonColor.addColorCombination({value:attrs.annotationValue, bg_color:attrs.bgColor, fg_color:attrs.fgColor,
			                         colour_background:attrs.colourBackground, colour_font:attrs.colourFont,
			                         colour_border:attrs.colourBorder, colour_selected_background:attrs.colourSelectedBackground});

	      	//if IE add button color
	      	var ua = window.navigator.userAgent;
	      	if (ua.indexOf("MSIE ") > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./))
	        	element.find('i').css('color', scope.bgColor);

	      	var updateSelectedAnnotationButton = function () {
		        var selectedAnnotation = TextWidgetAPI.getSelectedAnnotation();   

		        if (!angular.equals({}, selectedAnnotation)) { //if selected annotation is not empty 
		          	var selectedAnnotationAttribute = _.where(selectedAnnotation.attributes, { name: attrs.annotationAttribute, 
		                                                                                       value: attrs.annotationValue })[0];
		      
		          	var attributeIndex = selectedAnnotation.attributes.indexOf(selectedAnnotationAttribute);
		  
		          	if (attributeIndex > -1 && !element.hasClass('active')) {       //if the element has the same attribute and it is not active 
		            	element.addClass('active'); 
		            	element.css('color', attrs.fgColor);
		            	element.css('background', attrs.bgColor);
		          	} else if (attributeIndex < 0 && element.hasClass('active')) {     //if the element has different attribute and it is active
			            element.removeClass('active');
			            element.css('color', '#333');
			            element.css('background', '#fff'); 
		          	}
		        } else if (angular.equals({}, selectedAnnotation) && element.hasClass('active')) {  //if selected annotation is empty and the specific element is active
		            element.removeClass('active');
		            element.css('color', '#333');
		            element.css('background', '#fff');
		        }
	      	}

	      	//register callbacks for the annotation list and the selected annotation
	      	TextWidgetAPI.registerSelectedAnnotationCallback(updateSelectedAnnotationButton);
	    },
	    controller: function($scope) {
	      	$scope.addAnnotation = function(annotationType, annotationAttribute, annotationValue) { 
	/*        if(TextWidgetAPI.isRunning())
	          return false;*/
	        	var selectedAnnotation = TextWidgetAPI.getSelectedAnnotation();     //if the user has already selected an annotation, update it
	 
	        	if(!angular.equals({}, selectedAnnotation)) {
	        		selectedAnnotation.type = annotationType;
	          
		          	//search for the selected attribute inside the annotation
		          	var selectedAnnotationAttribute = _.where(selectedAnnotation.attributes, { name: annotationAttribute})[0];
		          	var newAttribute = { name : annotationAttribute,
		                               	 value: annotationValue };

		          	if (angular.isUndefined(selectedAnnotationAttribute))     //the specific attribute does not exist in the current annotation, so add it 
		            	selectedAnnotation.attributes.push(newAttribute);
		          	else {                                                    //the specific attribute exists in the current annotation, so update it 
		            	var index = selectedAnnotation.attributes.indexOf(selectedAnnotationAttribute);
		            	selectedAnnotation.attributes[index] = angular.copy(newAttribute);
		          	}

		          	TempAnnotation.update(selectedAnnotation)
		          	.then(function(data){
		              	TextWidgetAPI.updateAnnotation(selectedAnnotation, true);
		          	}, function(error){
		            	var modalOptions = { body: 'Error in update Annotation. Please refresh the page and try again' };
		            	Dialog.error(modalOptions);
		          	});

		          	return false;
		        }

		        //if their is selected text, add new annotation
		        var currentSelection = TextWidgetAPI.getCurrentSelection();

		        if (!angular.isUndefined(currentSelection) && !angular.equals(currentSelection, {}) && currentSelection.segment.length>0) {
		          	var currentDocument = TextWidgetAPI.getCurrentDocument();
		          	var newAnnotation = {
			            _id: new ObjectId().toString(),
			            document_id : currentDocument.id,
			            collection_id : currentDocument.collection_id,
			            type : annotationType,
			            spans : [{
			            	segment : currentSelection.segment,
			            	start : currentSelection.startOffset,
			            	end : currentSelection.endOffset
			          	}],
			            attributes : [{
		            		name : annotationAttribute,
		            		value : annotationValue 
		          		}]
		          	};
		       
		          	//newAnnotation.spans.push(annotationSpan);
		          	//newAnnotation.attributes.push(newAttribute);                        //remove if no need

		          	TempAnnotation.save(currentDocument.collection_id, currentDocument.id, newAnnotation)
		          	.then(function(response){ 
		            	if (response.success) { 
		              		TextWidgetAPI.addAnnotation(newAnnotation, true);
		            	} else {
		              		var modalOptions = { body: 'Error during saving your annotation. Please refresh the page and try again.' };
		              		Dialog.error(modalOptions);
		            	}
		          	}, function(error){
		              	var modalOptions = { body: 'Database error. Please refresh the page and try again.' };
		              	Dialog.error(modalOptions);
		          	});
		        } else {
		          	TextWidgetAPI.clearSelection();
		          	TextWidgetAPI.clearSelectedAnnotation();
		          	console.log("empty");
		        }
		    }
	    }
	};
});
