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
		       // Get div of combobox component from its id (the first child node is the div)
		       var elem = $('#' + id + '').children().first()[0];
		       
		       // Get angular scope from the element
		       var elemScope = angular.element(elem).scope();
		       
		       var annotationAttribute = elemScope.annotationAttribute;
		       var annotationType = elemScope.annotationType;
		       console.log('elemScope', annotationAttribute, annotationType);
		       
		       // todo: get selected annotation ID
		    });
		  };
		  
		  scope.updateAnnotation = function() {
		    console.log('Update annotation');
		  }
		}
	}
});

