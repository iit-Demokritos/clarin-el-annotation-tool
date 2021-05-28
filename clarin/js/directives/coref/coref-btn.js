angular.module('clarin-el').directive('corefBtn', ['TextWidgetAPI', function(TextWidgetAPI){
	return {
	 	restrict: 'E',
	 	replace: true,
	    scope: {
	      	annotationType: '@',
	      	annotationAttribute: '@',
	      	annotationValue: '@',
	      	compound: '@',
	      	bgColor: '@',
	      	fgColor: '@',
	      	image: '@',
	      	imageSize: '@',
	      	label: '@'
	    },
	    template: '<button type="button" title="{{label}}" class="btn btn-default btn-sm btn-block coref-btn" ng-click="addAttribute(annotationType, annotationAttribute)"></button>',
		link : function(scope, element, attrs) {
			scope.addAttribute = function(annotationType, annotationAttribute) {
				if (!element.hasClass('active')) {
					var elementGroup = element.attr("id").split("_")[0] + "_" + element.attr("id").split("_")[1];
					var pressedButton = $("button[id*='"+ elementGroup +"']").filter(".active");

					if (pressedButton.length > 0) {							//if other button is pressed remove active class and restore bg/fg color
						$(pressedButton[0]).removeClass('active');
						$(pressedButton[0]).css('color', '#333');
						$(pressedButton[0]).css('background', '#fff');
					}

					element.addClass('active');
					element.css('color', attrs.fgColor);
					element.css('background', attrs.bgColor);
				}

				TextWidgetAPI.clearSelection();
			}

			if (!angular.isUndefined(attrs.compound)) {
				if (angular.equals(attrs.compound, "none")) {
					var imagePath = scope.image.replace("/opt/Ellogon/share", "");
					element.html('<img src="images' + imagePath + '" width="' + scope.imageSize + '" height="' + scope.imageSize + '"/>');
				} else {
					/*element.css('color', scope.fgColor);*/
					element.html('<span style="float:' + scope.compound + '">' + 
								 '<i class="fa fa-minus fa-rotate-90" style="float:'+ scope.compound +'; color:' + scope.bgColor+'"></i>' + scope.label + 
								 '</span>');
				}
			} 

			var updateCorefBtn = function () {
		        var selectedAnnotation = TextWidgetAPI.getSelectedAnnotation();

		        if (!angular.equals({}, selectedAnnotation)) { //is selected annotation is not empty 
		        	var selectedAnnotationAttribute = _.where(selectedAnnotation.attributes, {name: attrs.annotationAttribute})[0];

		        	//if element has the specific attribute, it is not active and has the specific annotation value
		        	if (!angular.isUndefined(selectedAnnotationAttribute) && !element.hasClass('active') && 
		        		angular.equals($(element).attr('annotation-value'), selectedAnnotationAttribute.value)) {
		        		element.addClass('active');
		        		element.css('color', attrs.fgColor);
		        		element.css('background', attrs.bgColor);
		        	}
				} else if (angular.equals({}, selectedAnnotation) && element.hasClass('active')) { //if selected annotation not empty and checkbox checked 
						element.removeClass('active');
						element.css('color', '#333');
						element.css('background', '#fff')
				}
	      	}

	      	//register callbacks for the annotation list and the selected annotation
	      	TextWidgetAPI.registerSelectedAnnotationCallback(updateCorefBtn);
		}
	};
}]);