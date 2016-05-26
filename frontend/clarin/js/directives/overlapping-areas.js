angular.module('clarin-el').directive('overlappingAreas', ['TextWidgetAPI', '$timeout', function(TextWidgetAPI, $timeout) {
  	return {
	    restrict: 'E',
	    replace: true,
	    scope: {},
	    template: '<div class="overlapping-areas-widget">'
	                  + '<div class="left">Overlapping Areas ({{overlaps.length}})&nbsp;:&nbsp;'
	                      + '<select class="form-control right" '
	                      + 'ng-model="selectedOverlappingAnnotation" '
	                      + 'ng-change="updateSelectedAnnotation(selectedOverlappingAnnotation)" '
	                      + 'ng-options="overlap as (overlap._id + \' : \' + overlap.spans[0].segment) for overlap in overlaps">'
	                          + '<option value="">Please select overlapping area...</option>'
	                      + '</select>'
	                  + '</div>'
	            + '<div/>',
	    controller: function($scope, $element, $document) {
	        $scope.overlaps = [];

	        //function to be called when the overlapping areas update
	        var updateOverlappingAreasList = function(){
	          	$timeout(function(){ 
	            	$scope.overlaps = TextWidgetAPI.getOverlappingAreas();
	            	$scope.selectedOverlappingAnnotation = null;
	          	}, 0);
	        };

	        //function to be called when the user select annotation from the dropdown
	        $scope.updateSelectedAnnotation = function(selectedAnnotation){ 
	          	if(selectedAnnotation)
	            	TextWidgetAPI.setSelectedAnnotation(selectedAnnotation);
	        };

	        TextWidgetAPI.registerOverlappingAreasCallback(updateOverlappingAreasList);
	    }    
  	}
}]);