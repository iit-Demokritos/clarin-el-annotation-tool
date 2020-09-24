angular.module('clarin-el').directive('relationAnnotateBtn', function() {
	return {
		restrict: 'E',
    templateUrl: 'templates/directives/button/annotation-relation-annotate-btn.html',
		scope: {
      annotationWidgetIds: '@',
      textvariable: '@'
		},
		link: function(scope, element, attrs) {
		  scope.showAnnotateBtn = true;
		  
		  scope.addAnnotation = function() {
		    console.log('Add annotation');
		    
		    // Get IDs of annotation comboboxes
		    var ids = scope.annotationWidgetIds.split(' ');
		    console.log(ids);
		  };
		  
		  scope.updateAnnotation = function() {
		    console.log('Update annotation');
		  }
		}
	}
});

