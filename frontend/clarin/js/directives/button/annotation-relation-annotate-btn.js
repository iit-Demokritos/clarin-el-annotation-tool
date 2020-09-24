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
		    // Get IDs of annotation comboboxes
		    var ids = scope.annotationWidgetIds.split(' ');
		    
		    _.each(ids, function(id) {
		       // Get element from its id
		       var elem = $('#' + id)[0];
		       
		       console.log(elem);
		    });
		  };
		  
		  scope.updateAnnotation = function() {
		    console.log('Update annotation');
		  }
		}
	}
});

